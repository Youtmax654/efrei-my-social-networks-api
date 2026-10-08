import express from "express";

import * as https from "https";

import initRoutes from "./controllers/routes.mjs";

const Server = class Server {
  constructor() {
    this.app = express();
  }

  middleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  routes() {
    initRoutes(this.app, this.connect);
    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: "Not found"
      });
    })
  }

  run() {
    try {
      this.middleware();
      this.routes();

      https.createServer(options, this.app).listen(this.config.port, () => {
        console.log(`Server running on port ${this.config.port}`);
      });
    } catch (e) {
      console.error("Error while starting the server: ", e);
    }
  }
};

export default Server;