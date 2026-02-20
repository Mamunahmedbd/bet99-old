import { Request, Response } from 'express'
import { UserBetStake } from '../models/UserBetStake'
import { ApiController } from './ApiController'

export class UserStakeController extends ApiController {
  getStake = async (req: Request, res: Response) => {
    const user: any = req.user
    const userStake = await UserBetStake.findOne({ userId: user?._id })
    this.success(res, { userStake })
  }

  saveStake = async (req: Request, res: Response) => {
    const userStake = req.body
    const user: any = req.user

    userStake.userId = user._id
    const userStakes = await UserBetStake.findOneAndUpdate({ userId: user._id }, userStake, {
      new: true,
      upsert: true,
    })
    this.success(res, { userStakes })
  }
}
