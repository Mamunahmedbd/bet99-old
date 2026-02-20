import { io } from "socket.io-client";
import axios from "axios";
import Websocket from "./Socket";
import MatchController from "../controllers/api/MatchController";
import { redisReplicaSub } from "../database/redis";
import OddSocket from "./OddSocket";
import { IMarket } from "../interfaces/MarketModel";
const socket = io(process.env.SUPER_NODE_URL!, {
  transports: ["websocket"],
});

export function SuperNodeSocket() {
  let clientIo = Websocket.getInstance();

  socket.on("connect", () => {
    console.log("connected super-node");
    socket.emit("joinMarketRoom-Super", "fancyEvents");
  });

  socket.on("newFancyAdded", (fancy) => {
    clientIo.emit("newFancyAdded", fancy);
  });

  socket.on("getMarketData-Super", (market) => {});

  socket.on("getFancyData", (fancy) => {
    const fancyData = MatchController.createFancyDataAsMarket(fancy);
    clientIo.to(fancy.matchId).emit("getFancyData", fancyData);
  });

  socket.on("deactivateFancy-Super", (fancy) => {
    if (Object.keys(fancy).length > 0) {
      Object.keys(fancy).map((matchId) => {
        fancy[matchId].map(async (marketId: any) => {
          // remove fancy here
        });
      });

      clientIo.emit("deactivateFancy", fancy);
    }
  });

  socket.on("deactivateMarket-Super", async (marketData) => {
    try {
      if (marketData.type == "t10") {
        console.log("t10 matches", marketData);
      } else {
        axios
          .post(`${process.env.SITE_URL}/api/delete-market`, {
            ...marketData,
          })
          .catch((e) => {
            console.log(e);
          });
      }
      clientIo.emit("deactivateMarket", marketData);
    } catch (e: Error | any) {
      console.log("deactivateMarket-super", e.message);
    }
  });

  redisReplicaSub.subscribe("getMarketData", (m: any) => {
    const market = JSON.parse(m);

    const marketData = OddSocket.convertDataToMarket(market as IMarket);

    clientIo.to(market.marketId).emit("getMarketData", {
      ...market,
      runners: marketData,
    });

    clientIo.to(market.marketId).emit("getMarketData", {
      ...market,
      runners: marketData,
    });
  });
}
export default socket;
