import { Request, Response } from 'express'
import { Match } from '../models/Match'
import { ApiController } from './ApiController'
import { Market, OddsType } from '../models/Market'
import axios from 'axios'

export class MatchController extends ApiController {
  activeMatches = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sportId, type, page, search } = req.query
      const options = {
        page: page ? parseInt(`${page}`) : 1,
        limit: 10,
        sort: { createdAt: -1 },
      }
      let query: any = {}
      switch (type) {
        case '1':
          query = {
            active: false,
            isDelete: { $ne: true },
          }
          break
        case '2':
          query = { isDelete: true }
          break
        default:
          query = {
            // $or: [{ result: { $eq: null } }, { result: { $eq: '' } }],
            active: true,
            isDelete: { $ne: true },
          }
          break
      }
      if (search) {
        query = { ...query, name: new RegExp(search as string, 'i') }
      }
      const match = await Match.paginate(
        {
          sportId,
          ...query,
        },
        options,
      )
      return this.success(res, match)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  matchActiveInactive = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId, isActive } = req.query
      if (!matchId) return this.fail(res, 'matchId is required field')
      const match: any = await Match.findOne({ matchId })
      if (match) {
        match.active = !match.active
        match.save()
      }
      return this.success(res, match)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  matchDelete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId } = req.query
      if (!matchId) return this.fail(res, 'matchId is required field')
      const match: any = await Match.findOne({ matchId })
      if (match) {
        match.isDelete = !match.isDelete
        match.save()
      }
      return this.success(res, match)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getMatchListSuggestion = async (req: Request, res: Response) => {
    try {
      const { name } = req.body
      const regex = new RegExp(name, 'i')

      const matches = await Match.find({
        name: { $regex: regex },
        active: true,
      })
        .select({
          matchId: 1,
          name: 1,
        })
        .limit(10)
      return this.success(res, matches)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  setResultApi = async (req: Request, res: Response) => {
    try {
      const sport = await Market.aggregate([
        {
          $match: {
            isActive: true,
            oddsType: OddsType.B,
            marketId: { $not: /VT/ },
            //marketStartTime: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$sportId',
            marketIds: { $addToSet: '$marketId' },
          },
        },
      ])

      if (sport.length > 0) {
        sport.map(({ marketIds }: any) => {
          const chunkSize = 5
          for (let i = 0; i < marketIds.length; i += chunkSize) {
            const chunk = marketIds.slice(i, i + chunkSize)
            console.log(`${process.env.SUPER_NODE_URL}api/get-odds-result?MarketID=${chunk.join(',')}`)
            axios
              .get(`${process.env.SUPER_NODE_URL}api/get-odds-result?MarketID=${chunk.join(',')}`)
              .then((response) => {
                if (response.data.sports) {
                  response.data.sports.map(async (market: any) => {
                    axios
                      .post(`http://localhost:${process.env.PORT}/api/deactivate-markets`, {
                        market,
                      })
                      .then((res: any) => {
                        console.log(res.data)
                      })
                      .catch((e) => console.log(e.response.data))
                  })
                }
              })
              .catch((e) => {
                console.log(e.message)
              })
          }
        })
      }
      return this.success(res, { sport })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
