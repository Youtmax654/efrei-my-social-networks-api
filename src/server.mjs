import express from "express";

import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import config from "./config.mjs";
import verifyJWT from "./middlewares/verify-jwt.mjs";
import openapi from "./openapi.mjs";
import apiV1Router from "./routes/index.mjs";
import unless from "./utils/unless.mjs";

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development
  }

  async dbConnect() {
    console.log("Connecting to the database...");

    const host = this.config.mongodb;
    this.connect = mongoose.connection;

    this.connect.on("connected", () => {
      console.log("Database connection established successfully.");
    });

    this.connect.on("error", (err) => {
      console.error("Database connection error:", err.message);
    });

    this.connect.on("disconnected", () => {
      console.warn("Database connection lost. Driver is attempting to reconnect...");
    });

    const gracefulExit = async () => {
      try {
        await this.connect.close();
        console.log("Database connection closed successfully.");
        process.exit(0);
      } catch (err) {
        console.error("Error while closing the database connection:", err);
        process.exit(1);
      }
    };

    process.once("SIGINT", gracefulExit);
    process.once("SIGTERM", gracefulExit);

    try {
      await mongoose.connect(host);
    } catch (e) {
      console.error("Error while connecting to the database on startup:", e.message);
      throw e;
    }
  }

  middleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi));
    this.app.use(unless(verifyJWT, [
      "/api/v1/auth/register",
      "/api/v1/auth/login",
      "/api/v1/events/*/tickets/purchase",
    ]));
  }

  routes() {
    this.app.use("/api/v1", apiV1Router);
    this.app.use((req, res) => {
      res.status(404).json({ message: "Not found" });
    });
  }

  async run() {
    try {
      this.middleware();
      this.routes();
      await this.dbConnect();
      this.app.listen(this.config.port);
    } catch (e) {
      console.error("Error while starting the server: ", e);
    }
  }
};

export default Server;