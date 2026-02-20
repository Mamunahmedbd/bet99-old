import axios from 'axios'
import { Request, Response } from 'express'
import { Fancy, IFancy } from '../models/Fancy'
import { ApiController } from './ApiController'

export class T10ResultController extends ApiController {
  fancyOverRunResult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { result, matchId, over, type } = req.query
      if (!type) return this.fail(res, 'type is required field')
      if (!over) return this.fail(res, 'over is required field')
      if (!result) return this.fail(res, 'result is required field')
      if (!matchId) return this.fail(res, 'matchId is required field')
      switch (type) {
        case 'run':
        case 'only-run':
          {
            const orConditions = []
            const orCondition = type == 'run' ? `^${over} over run` : `^Only ${over} over run`
            orConditions.push({ fancyName: { $regex: orCondition } })
            if (over == '1') {
              orConditions.push({ fancyName: { $regex: `^Match 1st over run` } })
            }
            const fancies: IFancy[] = await Fancy.find({
              matchId: matchId,
              result: null,
              $or: orConditions,
            }).lean()
            if (fancies.length > 0) {
              this.callResultApi(fancies, matchId as string, result as string)
              return this.success(res, {}, 'Result Set')
            }
          }
          break
        case 'wkt':
          {
            const fancies: IFancy[] = await Fancy.find({
              matchId: matchId,
              result: null,
              $or: [{ fancyName: { $regex: `^Fall of ${over}` } }],
            }).lean()
            if (fancies.length > 0) {
              this.callResultApi(fancies, matchId as string, result as string)
              return this.success(res, {}, 'Result Set')
            }
          }
          break
      }

      return this.success(res, {}, 'No result to set')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  callResultApi = (fancies: IFancy[], matchId: string, result: string) => {
    fancies.map(async (fancy: IFancy) => {
      await axios
        .get(
          `http://localhost:${process.env.PORT}/api/result-fancy-no-token?matchId=${matchId}&marketId=${fancy.marketId}&result=${result}`,
        )
        .catch((e) => console.log(e.stack))
    })
  }
}
