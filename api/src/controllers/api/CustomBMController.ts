import { Request, Response } from "express";
import { redisSuperNode } from "../../database/redis";

class CustomBMController {
  public static async saveBM(req: Request, res: Response): Promise<Response> {
    try {
      const obj = { ...req.body };
      await redisSuperNode.set(
        `odds-market-${obj.marketId}`,
        JSON.stringify(obj),
        {
          EX: 14400, // save for 4 hour
        }
      );
      await redisSuperNode.publish("getMarketData", JSON.stringify({ ...obj }));

      return res.json({ success: true, message: "Saved BM" });
    } catch (e: Error | any) {
      return res.json(e.stack);
    }
  }
}
export default CustomBMController;
