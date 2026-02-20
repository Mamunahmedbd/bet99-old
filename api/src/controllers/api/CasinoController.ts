import { Request, Response } from "express";
import { ApiController } from "./ApiController";
import { redisReplica } from "../../database/redis";
import { eventJson, types } from "../../utils/casino-types";
import { marketFormatter } from "../../utils/helper";

export default class CasinoController extends ApiController {
  getCasinoMarket = async (req: Request, res: Response) => {
    let { type, selectionId } = req.params;
    try {
      if (!type) this.fail(res, "type is required field");

      //let casinoType: any = new DynamicClass(type, {});

      if (type === "AAA") type = "aaa";

      //   const data: any = await CasinoRedisController.casinoGameFetch(
      //     types[type] as any
      //   );
      let data: any = await redisReplica.get(types[type]);
      data = data ? { data: JSON.parse(data) } : { data: [] };

      let markets: any = [];
      let results: any = [];
      let t1: any = {};
      let t3: any = null;
      let t4: any = null;
      let scoreCards: any = undefined;
      let tv: string = "";
      if (data?.data?.t2) markets = [...data?.data?.t2];
      if (data?.data?.t3) {
        markets = [...markets, ...data?.data?.t3];
        t3 = data?.data?.t3;
      }
      if (data?.data?.t4) {
        markets = [...markets, ...data?.data?.t4];
        t4 = data?.data?.t4;
      }
      if (data?.data?.bf) markets = [...data?.data?.bf];
      if (data?.data?.results) results = [...data?.data?.results];
      if (data?.data?.t1) t1 = data?.data?.t1?.[0];
      if (data?.data?.tv) tv = data?.data?.tv;
      return eventJson[type]()
        .then(async (jsonData: any) => {
          const cloneJsonData = JSON.parse(JSON.stringify(jsonData.default));
          if (type != "testtp") {
            // Todo: For score
            if (type === "fivewicket") {
              const scoreData = await redisReplica.hGetAll(
                `fivewicket-t1-${t1.mid}`
              );
              if (scoreData) {
                const { scoreCard } = scoreData;
                if (scoreCard) scoreCards = JSON.parse(scoreCard);
              }
            }
            if (type === "Superover") {
              const scoreData = await redisReplica.hGetAll(
                `Superover-t1-${t1.mid}`
              );
              if (scoreData) {
                const { scoreCards: scoreCard } = scoreData;
                scoreCards = JSON.parse(scoreCard).scoreCard;
              }
            }
            const marketData = marketFormatter(markets, cloneJsonData);

            let eventData = {
              ...cloneJsonData,
              ...t1,
              match_id: t1.mid,
              results,
              tv,
              defaultMarkets: cloneJsonData.event_data.market,
              scoreCard: scoreCards,
            };
            if (type === "Tp1Day" && data?.data?.bf) {
              const {
                C1: C1A,
                C2: C2A,
                C3: C3A,
                marketId: mid,
                min,
                max,
              } = data.data.bf[0];
              const { C1: C1B, C2: C2B, C3: C3B } = data.data.bf[1];
              eventData = {
                ...eventData,
                C1A,
                C2A,
                C3A,
                C1B,
                C2B,
                C3B,
                mid,
                match_id: mid,
                min,
                max,
              };
            }
            eventData.event_data.market = marketData;

            // console.log(data?.data, marketData);
            return this.success(res, { ...eventData, t3, t4 });
          } else {
            const eventData = {
              ...cloneJsonData,
              ...t1,
              match_id: t1.mid,
              results,
              tv,
              defaultMarkets: cloneJsonData.event_data.market,
              t3,
              t4,
            };
            eventData.event_data.market = markets;
            return this.success(res, { ...eventData });
          }
        })
        .catch((e: any) => {
          return this.fail(res, e.stack);
        });
    } catch (e: any) {
      return this.fail(res, "");
    }
  };

  getSingleMarket = async (req: Request, res: Response) => {
    let { type, selectionId } = req.params;
    try {
      if (!type) this.fail(res, "type is required field");
      if (!selectionId) this.fail(res, "selectionId is required field");

      //let casinoType: any = new DynamicClass(type, {});

      if (type === "AAA") type = "aaa";

      let data: any = await redisReplica.get(types[type]);
      data = data ? { data: JSON.parse(data) } : { data: [] };

      let markets: any = [];
      let singleMarket = {};
      if (data?.data?.t2) markets = [...markets, ...data?.data?.t2];
      if (data?.data?.t3) markets = [...markets, ...data?.data?.t3];
      if (data?.data?.t4) markets = [...markets, ...data?.data?.t4];
      if (data?.data?.bf) markets = [...data?.data?.bf];

      if (markets.length > 0 && selectionId) {
        let sidStr = "sid";
        switch (type.toLowerCase()) {
          case "testtp":
            sidStr = "tsection";
            break;
          case "tp1day":
            sidStr = "sectionId";
            break;
        }

        const matchedRecord = markets.filter(
          (market: any) => market[sidStr] == selectionId
        );

        if (matchedRecord.length > 0) {
          singleMarket = matchedRecord[0];
        }
      }

      if (
        data?.data?.t1 &&
        data?.data?.t1.length > 0 &&
        data?.data?.t1[0].min
      ) {
        const min =
          data?.data?.t1 && data?.data?.t1.length > 0
            ? data?.data?.t1[0].min
            : 0;
        const max =
          data?.data?.t1 && data?.data?.t1.length > 0
            ? data?.data?.t1[0].max
            : 0;
        singleMarket = { ...singleMarket, min, max };
      }

      return this.success(res, { ...singleMarket });
    } catch (e: any) {
      return this.fail(res, e.stack);
    }
  };
}
