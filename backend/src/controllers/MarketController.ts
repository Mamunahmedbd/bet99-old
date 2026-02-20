import { Request, Response } from 'express'
import { IMarket, IMarketModel, Market } from '../models/Market'
import { ApiController } from './ApiController'

export class MarketController extends ApiController {
  activeMarkets = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId } = req.query
      if (!matchId) return this.fail(res, 'matchId is required field')
      const match = await Market.find({ matchId, skipPreHook: true })
      return this.success(res, match)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  marketActiveInactive = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { marketId, isActive, matchId } = req.query
      if (!marketId) return this.fail(res, 'marketId is required field')
      const market: any = await Market.findOne({ marketId, matchId })
      if (market) {
        market.isActive = !market.isActive
        market.save()
      }
      return this.success(res, market)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  marketDelete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { marketId, isDelete, matchId } = req.query
      if (!marketId) return this.fail(res, 'marketId is required field')
      const market: any = await Market.findOne({ marketId, matchId })
      if (market) {
        market.isDelete = !market.isDelete
        market.save()
      }
      return this.success(res, market)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
