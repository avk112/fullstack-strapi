/**
 * task service
 */

import { factories } from "@strapi/strapi";

const { createCoreService } = factories;

export default createCoreService("api::task.task", ({ strapi }) => ({
  async findAll(userId: number) {
    const user_id = isNaN(userId) ? 0 : userId;

    const arr = await strapi.db.query("api::task.task").findMany({
      where: {
        user_id: user_id,
      },
    });

    function recursiveFind(arr: any[], parent_id: number = null) {
      const result = [];
      for (let item of arr) {
        if (item.parent_id === parent_id) {
          const shortedArr = arr.filter((unit) => unit.id !== item.id);
          const children = recursiveFind(shortedArr, item.id);

          if (children.length) {
            item.children = children;
          }

          result.push(item);
        }
      }
      return result;
    }

    const recursiveSortData = (data: any[]) => {
      const result: any[] = [];
      const sortedData = data.sort((a: any, b: any) => a.order - b.order);
      result.push(...sortedData);

      for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].children) {
          const sortedChildren = recursiveSortData(sortedData[i].children);
          result[i].children = sortedChildren;
        }
      }

      return result;
    };

    const foundData = recursiveFind(arr);
    return recursiveSortData(foundData);
  },

  async create(ctx) {
    const { text, parent_id } = ctx.request.body;
    const userId = ctx?.state?.user?.id || 0;
    const user_id = parseInt(userId, 10);

    if (isNaN(user_id)) {
      return ctx.badRequest("Invalid user ID");
    }
    // Find tasks at the same level

    const sameLevelTasks = await strapi.db.query("api::task.task").findMany({
      select: ["order"],
      where: { parent_id: Number(parent_id), user_id: user_id },
    });

    const maxOrder = sameLevelTasks.length
      ? Math.max(...sameLevelTasks.map((item) => item.order))
      : 0;

    // Create new task
    await strapi.db.query("api::task.task").create({
      data: {
        text,
        parent_id,
        order: maxOrder + 1,
        user_id: user_id,
      },
    });

    return ctx.send({ message: "success" });
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { text } = ctx.request.body;
    const userId = ctx.state.user?.id;
    const user_id = parseInt(userId, 10);

    if (isNaN(user_id)) {
      return ctx.badRequest("Invalid user ID");
    }

    const existingTask = await strapi.db.query("api::task.task").findOne({
      where: { id: +id, user_id: user_id },
    });

    if (!existingTask) {
      throw new Error("No such task!");
    }

    const updatedTask = await strapi.db.query("api::task.task").update({
      where: { id: +id },
      data: { text: text },
    });

    return ctx.send({ message: "success" });
  },

  async delete(ctx) {
    const { id: idToDel } = ctx.params;
    const userId = ctx.state.user?.id;
    const user_id = parseInt(userId, 10);

    if (isNaN(user_id)) {
      return ctx.badRequest("Invalid user ID");
    }

    const recursiveFindChildren = async (id: number) => {
      const result = [];
      const parent = await strapi.db.query("api::task.task").findOne({
        where: {
          id: +id,
          user_id: user_id,
        },
      });

      if (parent) {
        const children = await strapi.db.query("api::task.task").findMany({
          where: { parent_id: +id, user_id: user_id },
        });

        if (children.length) {
          for (let item of children) {
            const child = await recursiveFindChildren(item.id);
            result.push(child);
          }
        }
        result.push(parent);
      }
      return result.flat();
    };

    const tasksToDel = await recursiveFindChildren(+idToDel);
    if (tasksToDel.length === 0) {
      throw new Error("This task doesn't exist!");
    }

    // Extract IDs of tasks to delete
    const idsToDel = tasksToDel.map((task) => task.id);

    // Perform the deletion
    await strapi.db.query("api::task.task").deleteMany({
      where: { id: { $in: idsToDel } },
    });

    return { message: "Tasks deleted successfully" };
  },

  async changeParent(ctx) {
    const { id } = ctx.params;
    const { future_parent_id: targetTaskId } = ctx.request.body;
    const userId = ctx.state.user?.id;
    const user_id = parseInt(userId, 10);

    if (targetTaskId !== id) {
      const existingTask = await strapi.db.query("api::task.task").findOne({
        where: { id: +id, user_id: user_id },
      });
      if (!existingTask) {
        throw new Error("No such task!");
      }

      if (targetTaskId !== null) {
        const targetTask = await strapi.db.query("api::task.task").findOne({
          where: { id: +targetTaskId, user_id: user_id },
        });
        if (!targetTask) {
          throw new Error("No such task!");
        }

        const recursiveFindParents = async (newParentId) => {
          const result = [];
          const newParent = await strapi.db.query("api::task.task").findOne({
            where: { id: +newParentId, user_id: user_id },
          });
          if (newParent) {
            if (newParent.parent_id !== null) {
              const grandParent = await recursiveFindParents(
                newParent.parent_id
              );
              grandParent && result.push(grandParent);
            }
            result.push(newParent.id);
          }
          return result.flat();
        };

        const arr = await recursiveFindParents(targetTask.id);

        if (arr.includes(existingTask.id)) {
          const sameLevelTasks = await strapi.db
            .query("api::task.task")
            .findMany({
              select: ["order", "id"],
              where: {
                parent_id:
                  existingTask.parent_id === null
                    ? { $null: true }
                    : existingTask.parent_id,
                user_id: user_id,
              },
              orderBy: { order: "ASC" },
            });

          const maxOrder = sameLevelTasks.length
            ? Math.max(...sameLevelTasks.map((item) => item.order))
            : 0;

          const allChildrenTasks = await strapi.db
            .query("api::task.task")
            .findMany({
              select: ["id"],
              where: {
                parent_id: +id,
                user_id: user_id,
              },
              orderBy: { order: "ASC" },
            });

          for (let i = 1; i <= allChildrenTasks.length; i++) {
            await strapi.db.query("api::task.task").update({
              where: { id: allChildrenTasks[i - 1].id, user_id: user_id },
              data: { parent_id: existingTask.parent_id, order: maxOrder + i },
            });
          }
        }
      }

      const sameLevelTasks = await strapi.db.query("api::task.task").findMany({
        select: ["order"],
        where: {
          parent_id: targetTaskId === null ? { $null: true } : +targetTaskId,
          user_id: user_id,
        },
      });

      const maxOrder = sameLevelTasks.length
        ? Math.max(...sameLevelTasks.map((item) => item.order))
        : 0;

      return await strapi.db.query("api::task.task").update({
        where: { id: existingTask.id },
        data: { parent_id: +targetTaskId, order: maxOrder + 1 },
      });
    }
  },

  async changeOrder(ctx) {
    const { id } = ctx.params;
    const { up_in_list } = ctx.request.body;
    const userId = ctx.state.user?.id;
    const user_id = parseInt(userId, 10);

    if (isNaN(user_id)) {
      return ctx.badRequest("Invalid user ID");
    }

    const taskToUpdate = await strapi.db.query("api::task.task").findOne({
      where: { id: +id, user_id: user_id },
    });

    if (!taskToUpdate) {
      return ctx.badRequest("No such task to change order!");
    }

    const currentOrder = taskToUpdate.order;
    const sameLevelTasks = await strapi.db.query("api::task.task").findMany({
      select: ["order", "id"],
      where: {
        parent_id:
          taskToUpdate.parent_id === null
            ? { $null: true }
            : taskToUpdate.parent_id,
        user_id: user_id,
      },
      orderBy: { order: "ASC" },
    });

    if (sameLevelTasks.length > 1) {
      let taskToExchange;
      for (let i = 0; i < sameLevelTasks.length; i++) {
        if (sameLevelTasks[i].id === +id) {
          const prevOrNext = up_in_list ? i - 1 : i + 1;
          if (sameLevelTasks[prevOrNext]) {
            taskToExchange = {
              id: sameLevelTasks[prevOrNext].id,
              order: sameLevelTasks[prevOrNext].order,
              user_id: user_id,
            };
          }
          break;
        }
      }

      if (taskToExchange) {
        await strapi.db.query("api::task.task").update({
          where: { id: +id },
          data: { order: taskToExchange.order },
        });

        await strapi.db.query("api::task.task").update({
          where: { id: taskToExchange.id },
          data: { order: currentOrder },
        });
        console.log("Order changed successfully");
        return ctx.send({ message: "Order changed successfully" });
      }
    }

    return ctx.send({ message: "Your task is a single in a list" });
  },
}));
