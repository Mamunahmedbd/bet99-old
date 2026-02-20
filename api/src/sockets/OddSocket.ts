import { Socket } from "socket.io";
import { redisReplica } from "../database/redis";
import { IMarket, IRunnerType } from "../interfaces/MarketModel";
import Websocket from "./Socket";
const checkOddsLength = 3;
class OddSocket {
  io: any;
  constructor(private socket: Socket) {
    this.io = Websocket.getInstance();
    this.onMessage();
  }

  onMessage() {
    this.socket.on("joinServerRoom", async (room: string) => {
      this.socket.join(room);
    });
    this.socket.on("joinRoom", async (matchId: string) => {
      matchId = matchId.toString();
      this.socket.join(matchId);

      this.socket.join(matchId);

      const markets: any = await redisReplica.json.get("matchesMarket", {
        path: matchId,
      });

      if (markets && markets.length > 0) {
        markets.map(async (market: any) => {
          const redisMarket: any = await redisReplica.get(
            `odds-market-${market.marketId}`
          );

          if (redisMarket) {
            const mData = JSON.parse(redisMarket);
            market = { ...market, ...mData };
          }
          const marketData = OddSocket.convertDataToMarket(market as IMarket);
          this.io.to("getMarkets").emit("getMarketData", {
            ...market,
            runners: marketData,
          });

          this.socket.emit("getMarketData", {
            ...market,
            runners: marketData,
          });
        });
      }
      //const fancyData = MatchController.createFancyDataAsMarket(fancy);
    });

    this.socket.on("joinMarketRoom", async (room) => {
      this.socket.join(room);
      const redisMarket: any = await redisReplica.get(`odds-market-${room}`);

      if (redisMarket) {
        const mData = JSON.parse(redisMarket);
        const marketData = OddSocket.convertDataToMarket(mData as IMarket);

        this.io.to(mData.marketId).emit("getMarketData", {
          ...mData,
          runners: marketData,
        });
      }
    });

    this.socket.on("leaveRoom", async (matchId: string) => {
      this.socket.leave(matchId.toString());
    });
  }

  public static convertDataToMarket(marketData: IMarket) {
    if (!marketData || !marketData.runners) return [];

    return marketData?.runners?.map(
      ({ selectionId, ex, status, ...restRunner }: IRunnerType) => {
        const backLength =
          checkOddsLength - (ex?.availableToBack?.length! ?? 0);
        if (backLength) {
          for (let k = 0; k < backLength; k++) {
            ex?.availableToBack.push({ price: "-", size: "-" });
          }
        }

        const layLength = checkOddsLength - (ex?.availableToLay?.length! ?? 0);
        if (layLength) {
          for (let k = 0; k < layLength; k++) {
            ex?.availableToLay.push({ price: "-", size: "-" });
          }
        }
        ex?.availableToBack.reverse();
        return {
          ...restRunner,
          selectionId,
          runnerName: restRunner.runner || restRunner.runnerName,
          status,
          back: ex?.availableToBack,
          lay: ex?.availableToLay,
          ex,
        };
      }
    );
  }
}
export default OddSocket;
