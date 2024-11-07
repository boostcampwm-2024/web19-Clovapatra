require('dotenv').config();

module.exports = {
  port: process.env.APP_PORT || 9001,
  cors: {
    origin: "*",
    methods: "*",
    allowedHeaders: ["*"],
    credentials: true
  }
};