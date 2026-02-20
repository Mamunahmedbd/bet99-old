import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { createServer, Server } from "http";
import "./database/redis";
import router from "./routes";
import "./sockets/super-node";
import Websocket from "./sockets/Socket";
import { Socket } from "socket.io";
import OddSocket from "./sockets/OddSocket";
import { SuperNodeSocket } from "./sockets/super-node";
import { initCasinoSocket } from "./sockets/casino-node";
import { redisReplica } from "./database/redis";
const requestIp = require("request-ip");

class App {
  app: Express;
  port: string | undefined;
  server: Server | undefined;
  allowedOrigin = [
    "https://metaversesolutions.com",
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3025",
    "http://localhost:3001",
    "http://localhost:3010",
    "103.48.56.67",
    "103.220.81.189",
    "139.84.216.135",
     "http://localhost:3025",
  ];

  allowedIps = [
    "127.0.0.1",
    "139.84.216.135",
    "35.177.21.254", //sap
    "172.31.29.22", //sap
    "103.220.81.189",
    "::ffff:127.0.0.1",
    "::ffff:103.48.56.67",
     "::ffff:103.220.81.189",
     "::ffff:139.84.216.135",
     "http://localhost:3025/",
     "http://localhost:3025",
  ];

  constructor() {
    this.app = express();
    this.port = process.env.PORT || "3525";
  }

  loadServer = async () => {
    this.server = createServer(this.app);

    const options: cors.CorsOptions = {
      origin: "*",
    };
    this.app.use(cors(options));
    this.app.use(this.whitelistOrigin);

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use("/api/", router);

    const io = Websocket.getInstance(this.server);
    io.on("connection", (socket: Socket) => {
      const origin = socket.handshake.headers.origin;
      const isWhitelisted = this.allowedOrigin.some((allowedOrigin) =>
        allowedOrigin.includes(origin!)
      );

      // if (origin && !isWhitelisted) {
      //   // Reject the connection from an unauthorized origin
      //   socket.emit("You are not authorized");
      //   console.log(`Unauthorized connection rejected from: ${origin}`);
      //   socket.disconnect();
      //   return;
      // }
      console.log(`New connection: ${socket.id}`);
      //socket.join("getMarkets");
      new OddSocket(socket);
    });

    SuperNodeSocket();
    initCasinoSocket();

    this.server.listen(this.port, () => {
      console.log(
        `⚡️[server]: Server is running at http://localhost:${this.port}`
      );
    });
  };

  whitelistOrigin = (req: Request, res: Response, next: NextFunction) => {
    // const origin = req.headers.host!;
    const origin = req.get("origin");

    const isWhitelisted = this.allowedOrigin.some((allowedOrigin) =>
      allowedOrigin.includes(origin!)
    );
    const clientIp = requestIp.getClientIp(req);
    if (!origin) {
      console.log(clientIp);
    }
    console.log(clientIp, "clientIpclientIpclientIp");
    console.log(origin, "originoriginoriginorigin");

    const isWhiteListedIp = this.allowedIps.some((allowedIps) =>
      allowedIps.includes(clientIp!)
    );
    ///if (origin !== "marketapi.store") console.log(origin, isWhitelisted);

    if (isWhitelisted || isWhiteListedIp) {
      // Allow the request if the origin is in the whitelist
      // res.setHeader("Access-Control-Allow-Origin", origin);
      next();
    } else {
      // Deny the request if the origin is not in the whitelist
      res.status(403).send("Forbidden");
    //   res.status(403).send(origin);
    }
  };
}
export default new App();
