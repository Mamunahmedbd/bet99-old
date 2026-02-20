import { Request, Response } from "express";
import { redisReplica } from "../../database/redis";
import api from "../../utils/api";

class OddsController {
  public static async getSports(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      let competitionsData = [];
      const data = await redisReplica.get(`getSportList`);
      if (data) competitionsData = JSON.parse(data);

      // From api
      if (!data) {
        const res = await api.get(`/get-sports`);
        competitionsData = res.data.sports;
      }

      return res.json({
        sports: competitionsData,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }
  public static getOdds = async (req: Request, res: Response): Promise<any> => {
    try {
      let { MarketID, marketId } = req.query;
      if (marketId) MarketID = marketId;
      if (!MarketID) throw Error("marketId is required field");

      let response: any = await redisReplica.get(`odds-market-${MarketID}`);
      response = response ? { data: JSON.parse(response) } : { data: [] };

      if (response.data && response.data.error) {
        return res.json({
          error: response.data.error,
        });
      }

      if (response.data && Object.keys(response.data).length > 0) {
        return res.json({
          sports: [response.data],
        });
      } else {
        return res.json({
          sports: [],
        });
      }
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  };

  public static getMakerOddsSingle = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { marketId } = req.query;
      if (!marketId) throw Error("marketId is required field");

      let response: any = await redisReplica.get(`odds-market-${marketId}`);
      response = response ? { data: JSON.parse(response) } : { data: [] };

      if (response.data && response.data.error) {
        return res.json({
          error: response.data.error,
        });
      }

      if (response.data) {
        return res.json({
          sports: response.data,
        });
      }
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  };

  public static async getSingleSessionMarket(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { MatchID, SelectionId }: any = req.query;
      if (!MatchID) throw Error("MatchID is required field");

      if (!SelectionId) throw Error("SelectionId is required field");

      let response: any = await redisReplica.get(`fancy-${MatchID}`);

      response = response ? { data: JSON.parse(response) } : { data: [] };
      const market = response.data
        .filter((m: any) => m.SelectionId == SelectionId)
        .filter((m: any) => m.gtype === "session" || m.gtype === "fancy1");

      return res.json({
        sports: market,
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }

  public static async getSeries(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { EventTypeID } = req.query;
      if (!EventTypeID) throw Error("EventTypeID is required field");

      let competitionsData = [];
      const data = await redisReplica.get(`getCompetitions-${EventTypeID}`);
      if (data) competitionsData = JSON.parse(data);

      // From api
      if (!data) {
        const res = await api.get(`/get-series?EventTypeID=${EventTypeID}`);
        competitionsData = res.data.sports;
      }

      return res.json({
        sports: competitionsData,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getMatchList(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { EventTypeID, CompetitionID } = req.query;
      if (!EventTypeID) throw Error("EventTypeID is required field");
      if (!CompetitionID) throw Error("CompetitionID is required field");

      let matchList = [];

      const data = await redisReplica.get(
        `getMatchList-${EventTypeID}-${CompetitionID}`
      );
      if (data) matchList = JSON.parse(data);

      if (!data) {
        const res = await api.get(
          `/get-matches?EventTypeID=${EventTypeID}&CompetitionID=${CompetitionID}`
        );
        matchList = res.data.sports;
      }

      return res.json({
        sports: matchList,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getMatchListT10(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      let matchList: any = [];
      return res.json({
        sports: matchList,
      });

      // const data = await redisReplica.get(`getMatchList-T10`);
      // if (data) matchList = JSON.parse(data);

      // if (!data) {
      //   const res = await api.get(`/get-matches-t10`);
      //   matchList = res.data.sports;
      // }

      // return res.json({
      //   sports: matchList,
      // });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getMarketList(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { EventID, sportId } = req.query;
      if (!EventID) throw Error("EventID is required field");
      if (!sportId) throw Error("sportId is required field");

      let matchList = [];
      if (req.originalUrl.includes("get-marketes-t10")) {
        const data = await redisReplica.get(`getMarketList-bm-${EventID}`);
        if (data) matchList = JSON.parse(data);
        if (!data) {
          const res = await api.get(
            `/get-marketes-t10?sportId=${sportId}&EventID=${EventID}`
          );
          matchList = res.data.sports;
        }
      } else if (req.originalUrl.includes("get-marketes")) {
        const data = await redisReplica.get(`getMarketList-${EventID}`);
        if (data) matchList = JSON.parse(data);
        if (!data) {
          const res = await api.get(
            `/get-marketes?sportId=${sportId}&EventID=${EventID}`
          );
          matchList = res.data.sports;
        }
      } else if (req.originalUrl.includes("get-bookmaker-marketes")) {
        const data = await redisReplica.get(`getMarketList-bm-${EventID}`);
        if (data) matchList = JSON.parse(data);
        if (!data) {
          const res = await api.get(
            `/get-bookmaker-marketes?sportId=${sportId}&EventID=${EventID}`
          );
          matchList = res.data.sports;
        }
      }

      return res.json({
        sports: matchList,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async getSessions(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { MatchID } = req.query;
      if (!MatchID) throw Error("MatchID is required field");

      let matchList = [];
      const data = await redisReplica.get(`fancy-${MatchID}`);
      if (data) matchList = JSON.parse(data);
      if (req.originalUrl.includes("get-sessions-t10") && !data) {
        const res = await api.get(`/get-sessions-t10?MatchID=${MatchID}`);
        matchList = res.data.sports;
      } else if (req.originalUrl.includes("get-sessions") && !data) {
        const res = await api.get(`/get-sessions?MatchID=${MatchID}`);
        matchList = res.data.sports;
      }

      return res.json({
        sports: matchList,
      });
    } catch (e: any) {
      return res.json({
        sports: [],
        error: e.message,
      });
    }
  }

  public static async fancyData(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { MatchID }: any = req.query;
      if (!MatchID) throw Error("MatchID is required field");

      let response: any = await redisReplica.get(`fancy-${MatchID}`);
      response = response ? { data: JSON.parse(response) } : { data: [] };

      return res.json({
        ...response,
        error: "",
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }

  public static getSeriesListRedis = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { sportsId } = req.params;
    try {
      const seriesList: any = await redisReplica.get(
        `complete-match-list-${sportsId}`
      );
      return res.json({
        message: "Series Updated Successfully",
        data: JSON.parse(seriesList),
      });
    } catch (e: any) {
      return res.json({
        sports: [],
      });
    }
  };

  public static async getResults(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { MarketID } = req.query;

    try {
      if (!MarketID) throw Error("MarketID is required field");

      const getDataFromBetFair = await api.get(
        `https://ero.betfair.com/www/sports/exchange/readonly/v1/bymarket?_ak=nzIFcwyWhrlwYMrh&alt=json&currencyCode=USD&locale=en_GB&marketIds=${MarketID}&rollupLimit=1&rollupModel=STAKE&types=MARKET_STATE,MARKET_RATES,MARKET_DESCRIPTION,EVENT,RUNNER_DESCRIPTION,RUNNER_STATE,RUNNER_EXCHANGE_PRICES_BEST,RUNNER_METADATA,MARKET_LICENCE,MARKET_LINE_RANGE_INFO,RUNNER_PRICE_TREND`
      );

      const data = getDataFromBetFair.data.eventTypes.map((events: any) => {
        return events.eventNodes
          .map((event: any) => {
            const marketData = event.marketNodes;
            return marketData.reduce((acc: any, market: any) => {
              const runners = market.runners.map((runner: any) => {
                return {
                  selectionId: runner.selectionId,
                  runner: runner.description.runnerName,
                  status: runner.state.status,
                  lastPriceTraded: 0,
                  ex: {
                    availableToBack: [],
                    availableToLay: [],
                  },
                  back: [],
                  lay: [],
                };
              });
              if (market.state.status === "CLOSED")
                acc.push({
                  eventid: event.eventId,
                  marketId: market.marketId,
                  market: market.description.marketName,
                  updateTime: market.description.marketTime,
                  status: market.state.status,
                  inplay: market.state.inplay,
                  totalMatched: 0,
                  active: true,
                  markettype: "ODDS",
                  runners,
                });

              return acc;
            }, []);
          })
          .flat();
      });

      return res.json({
        sports: data.flat(),
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }

  public static async getOddsByRedis(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { marketIds }: any = req.query;
      if (!marketIds) throw Error("marketIds is required field");

      const markets = marketIds.split(",");

      const marketResponses = markets.map(async (marketId: string) => {
        let response: any = await redisReplica.get(`odds-market-${marketId}`);
        return response ? JSON.parse(response) : null;
      });

      return Promise.all(marketResponses).then((odds) => {
        return res.json({
          odds,
        });
      });
    } catch (e: any) {
      return res.json({
        error: e.message,
      });
    }
  }
}
export default OddsController;
