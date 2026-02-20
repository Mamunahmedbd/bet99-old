import { Request, Response } from "express";
import { IFancy } from "../../interfaces/FancyModel";
import { IMarketType } from "../../interfaces/MarketModel";
import Websocket from "../../sockets/Socket";
import api from "../../utils/api";

class MatchController {
  public static async addMatchAndMarket(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { matches }: any = req.body;

      if (
        matches &&
        matches.length > 0 &&
        !matches[0].matchId &&
        !matches[0].sportId
      ) {
        return res
          .status(401)
          .json({ message: "Please send matchId and sportId", error: true });
      }
      const matchIds = matches.map(({ matchId }: any) => matchId.toString());

      api
        .post(`save-match`, {
          matches: matches.map((match: any) => ({
            ...match,
            matchId: match.matchId.toString(),
            sportId: match.sportId.toString(),
          })),
        })
        .then((res) => console.log("res"))
        .catch((e: any) => {
          console.log("err", e.response, e.config);
        });

      return res.json({ success: true, message: "matches added" });
    } catch (e: Error | any) {
      return res.json(e.stack);
    }
  }

  public static createFancyDataAsMarket(data: IFancy) {
    const layPriceKeys = Object.keys(data).filter((key) =>
      key.startsWith("BackPrice")
    );
    const runners = [];
    for (let i = 1; i <= layPriceKeys.length; i++) {
      let back = {};
      let lay = {};
      if (data[`LayPrice${i}`] != undefined) {
        lay = { price: data[`LayPrice${i}`], size: data[`LaySize${i}`] };
      }
      if (data[`BackPrice${i}`] != undefined) {
        back = { price: data[`BackPrice${i}`], size: data[`BackSize${i}`] };
      }
      //Todo: I added only one runner if need 3 then will it to 3 with condition
      if (i == 1)
        runners.push({
          lay,
          back,
          selectionId: data.SelectionId,
          runnerName: "",
          status: data.GameStatus,
          sortPriority: i,
        });
    }

    return {
      marketId: data.matchId + "-" + data.SelectionId,
      marketName: data.RunnerName,
      runners,
      oddsType: IMarketType.F,
      min: data.min,
      max: data.max,
      rem: data.rem,
      sortPriority: data.sr_no,
      fancyType: data.gtype,
    };
  }

  public static testingSocketEvents(
    req: Request,
    res: Response | any
  ): Promise<Response> {
    try {
      const { data } = req.body;
      const io = Websocket.getInstance();
      io.emit(data.event, data.data);
      return res.json({ success: true, message: "matches added" });
    } catch (e: Error | any) {
      return res.json(e.stack);
    }
  }
}

export default MatchController;
