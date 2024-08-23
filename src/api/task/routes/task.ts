/**
 * task router
 */
const jwt = require("jsonwebtoken");

export default {
  routes: [
    {
      method: "GET",
      path: "/task",
      handler: "task.findAll",
      config: {
        policies: [],
        middlewares: [
          async (ctx, next) => {
            const { authorization } = ctx.request.headers;
            if (authorization && authorization.startsWith("Bearer ")) {
              const token = authorization.split(" ")[1];
              try {
                const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET ||
                    strapi.config.get("server.jwtSecret")
                );

                ctx.state.user = decoded;
              } catch (err) {
                ctx.unauthorized("Invalid token.");
                throw new Error("Invalid token");
              }
            }

            await next();
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/task",
      handler: "task.create",
      config: {
        policies: [],
        middlewares: [
          async (ctx, next) => {
            const { authorization } = ctx.request.headers;
            if (authorization && authorization.startsWith("Bearer ")) {
              const token = authorization.split(" ")[1];
              try {
                const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET ||
                    strapi.config.get("server.jwtSecret")
                );

                ctx.state.user = decoded;
              } catch (err) {
                ctx.unauthorized("Invalid token.");
                throw new Error("Invalid token");
              }
            }

            await next();
          },
        ],
      },
    },
    {
      method: "PATCH",
      path: "/task/:id/change-parent",
      handler: "task.changeParent",
      config: {
        policies: [],
        middlewares: [
          async (ctx, next) => {
            const { authorization } = ctx.request.headers;
            if (authorization && authorization.startsWith("Bearer ")) {
              const token = authorization.split(" ")[1];
              try {
                const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET ||
                    strapi.config.get("server.jwtSecret")
                );

                ctx.state.user = decoded;
              } catch (err) {
                ctx.unauthorized("Invalid token.");
                throw new Error("Invalid token");
              }
            }

            await next();
          },
        ],
      },
    },
    {
      method: "PATCH",
      path: "/task/:id/change-order",
      handler: "task.changeOrder",
      config: {
        policies: [],
        middlewares: [
          async (ctx, next) => {
            console.log("here");

            const { authorization } = ctx.request.headers;
            if (authorization && authorization.startsWith("Bearer ")) {
              const token = authorization.split(" ")[1];
              try {
                const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET ||
                    strapi.config.get("server.jwtSecret")
                );

                ctx.state.user = decoded;
              } catch (err) {
                ctx.unauthorized("Invalid token.");
                throw new Error("Invalid token");
              }
            }

            await next();
          },
        ],
      },
    },
    {
      method: "PATCH",
      path: "/task/:id",
      handler: "task.update",
      config: {
        policies: [],
        middlewares: [
          async (ctx, next) => {
            const { authorization } = ctx.request.headers;
            if (authorization && authorization.startsWith("Bearer ")) {
              const token = authorization.split(" ")[1];
              try {
                const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET ||
                    strapi.config.get("server.jwtSecret")
                );

                ctx.state.user = decoded;
              } catch (err) {
                ctx.unauthorized("Invalid token.");
                throw new Error("Invalid token");
              }
            }

            await next();
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/task/:id",
      handler: "task.delete",
      config: {
        policies: [],
        middlewares: [
          async (ctx, next) => {
            const { authorization } = ctx.request.headers;
            if (authorization && authorization.startsWith("Bearer ")) {
              const token = authorization.split(" ")[1];
              try {
                const decoded = jwt.verify(
                  token,
                  process.env.JWT_SECRET ||
                    strapi.config.get("server.jwtSecret")
                );

                ctx.state.user = decoded;
              } catch (err) {
                ctx.unauthorized("Invalid token.");
                throw new Error("Invalid token");
              }
            }

            await next();
          },
        ],
      },
    },

    // Ensure default CRUD routes are not overridden
    {
      method: "GET",
      path: "/tasks",
      handler: "task.find",
    },
    {
      method: "GET",
      path: "/tasks/:id",
      handler: "task.findOne",
    },
    {
      method: "POST",
      path: "/tasks",
      handler: "task.create",
    },
    {
      method: "PUT",
      path: "/tasks/:id",
      handler: "task.update",
    },
    {
      method: "DELETE",
      path: "/tasks/:id",
      handler: "task.delete",
    },
  ],
};
