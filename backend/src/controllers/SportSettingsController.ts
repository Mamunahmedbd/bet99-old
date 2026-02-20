import { Request, Response } from 'express'
import { Match } from '../models/Match'
import { ApiController } from './ApiController'

export class SportSettingsController extends ApiController {
  saveSportSettings = async (req: Request, res: Response) => {
    try {
      await Match.findOneAndUpdate(
        { matchId: req.body.matchId },
        { ...req.body },
        {
          new: true,
          upsert: true,
        },
      )
      return this.success(res, {}, 'Setting saved successfully')
    } catch (e: any) {
      return this.success(res, e.message)
    }
  }
}
