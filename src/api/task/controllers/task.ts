/**
 * task controller
 */

import { factories } from "@strapi/strapi";

const { createCoreController } = factories;

export default createCoreController("api::task.task", ({ strapi }) => ({
  // Default methods
  // async find(ctx) {
  //   return super.find(ctx);
  // },
  // async findOne(ctx) {
  //   return super.findOne(ctx);
  // },
  // async create(ctx) {
  //   return super.create(ctx);
  // },
  // async update(ctx) {
  //   return super.update(ctx);
  // },
  // async delete(ctx) {
  //   return super.delete(ctx);
  // },

  // Custom method
  async findAll(ctx) {
    const userId = ctx?.state?.user?.id || 0;

    const user_id = parseInt(userId, 10);

    if (isNaN(user_id)) {
      return ctx.badRequest("Invalid user ID");
    }

    const sortedData = await strapi.service("api::task.task").findAll(user_id);
    ctx.send(sortedData);
  },

  async create(ctx) {
    await strapi.service("api::task.task").create(ctx);

    return ctx.send({ message: "success" });
  },

  async changeParent(ctx) {
    await strapi.service("api::task.task").changeParent(ctx);

    return ctx.send({ message: "success" });
  },

  async changeOrder(ctx) {
    await strapi.service("api::task.task").changeOrder(ctx);

    return ctx.send({ message: "success" });
  },

  async update(ctx) {
    await strapi.service("api::task.task").update(ctx);

    return ctx.send({ message: "success" });
  },

  async delete(ctx) {
    await strapi.service("api::task.task").delete(ctx);

    return ctx.send({ message: "success" });
  },
}));
