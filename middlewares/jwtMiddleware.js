const jwt = require("jsonwebtoken");

module.exports = async (ctx, next) => {
  const { authorization } = ctx.request.headers;
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || strapi.config.get("server.jwtSecret")
      );

      ctx.state.user = decoded;
    } catch (err) {
      ctx.unauthorized("Invalid token.");
      throw new Error("Invalid token");
    }
  }

  await next();
};
