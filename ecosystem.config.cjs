module.exports = {
  apps: [
    {
      name: "whamo-app",
      script: "./dist/index.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 3006,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
      }
    }
  ]
};
