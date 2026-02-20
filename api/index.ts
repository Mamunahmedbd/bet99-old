import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env",
});
import App from "./src/App";
import cluster from "cluster";
import { cpus } from "os";
import { redisReplica } from "./src/database/redis";
import Websocket from "./src/sockets/Socket";

if (cluster.isMaster) {
  const CPUS: any = cpus();

  CPUS.forEach(() => cluster.fork());

  cluster.on("disconnect", (worker) => {
    console.log("worker disconnected");
    worker.kill();
  });

  cluster.on("exit", (worker) => {
    console.log("worker exited");
    worker.kill();
  });

  cluster.on("exit", (worker: any, code: any, signal: any) => {
    cluster.fork();
  });

  const io = Websocket.getInstance();

  redisReplica.subscribe("getMarketData", (m: any) => {
    const market = JSON.parse(m);

    io.to(market.matchId).emit("getMarketData", {
      ...market,
    });

    io.to(market.marketId).emit("getMarketData", {
      ...market,
    });
  });

  redisReplica.subscribe("getFancyData", (m: any) => {
    const market = JSON.parse(m);

    io.to(market.matchId).emit("getFancyData", {
      ...market,
    });

    io.to(market.matchId).emit("getFancyData-new", {
      ...market,
    });
  });
} else {
  App.loadServer();
  process.on("unhandledRejection", (e) => {});
  process.on("uncaughtException", (e) => {
    console.log(e.message);
  });
}
