import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { BetLock } from '../models/BetLock'
import { Match } from '../models/Match'
import { RoleType } from '../models/Role'
import { User } from '../models/User'
import { ApiController } from './ApiController'

export class BetLockController extends ApiController {
  betLock = async (req: Request, res: Response) => {
    try {
      const { match, type, status, userId } = req.body
      const user: any = req.user
      const types: any = { M: 'betFair', B: 'book', F: 'fancy' }
      const isMatch = await Match.findOne({ matchId: match.matchId }).count()
      if (isMatch && !userId) {
        const updateField = types[type]
        const updateQuery = {
          [updateField]: status,
          matchId: match.matchId,
          parentId: new Types.ObjectId(user?._id), // Use 'new' to instantiate ObjectId
          sportId: match.sportId,
        }
        await BetLock.findOneAndUpdate(
          { matchId: match.matchId, parentId: new Types.ObjectId(user?._id) }, // Use 'new' here as well
          { $set: updateQuery },
          { upsert: true, new: true },
        )

        return this.success(res, req.body)
      } else if (isMatch && userId) {
        const updateField = types[type]
        const updateQuery = {
          [updateField]: status,
          matchId: match.matchId,
          parentId: new Types.ObjectId(user?._id), // Use 'new' here as well
          sportId: match.sportId,
          userId: new Types.ObjectId(userId), // And here
        }
        await BetLock.findOneAndUpdate(
          {
            matchId: match.matchId,
            parentId: new Types.ObjectId(user?._id), // Use 'new' here as well
            userId: new Types.ObjectId(userId), // And here
          },
          { $set: updateQuery },
          { upsert: true, new: true },
        )

        return this.success(res, req.body)
      }
      return this.fail(res, 'Match not found')
    } catch (e) {
      const err = e as Error
      return this.fail(res, err.message)
    }
  }

  getChildUserList = async (req: Request, res: Response) => {
    try {
      const currentUser: any = req.user
      const { username, matchId }: any = req.query
      const regex = username ? new RegExp(username, 'i') : ''
      const users = await User.paginate(
        {
          username: { $regex: regex },
          parentStr: { $elemMatch: { $eq: new Types.ObjectId(currentUser._id) } }, // Use 'new' here as well
          role: RoleType.user,
        },
        { select: { _id: 1, username: 1 }, lean: true },
      )
      const searchUsers = users.docs.map((user) => {
        return new Types.ObjectId(user._id) // Use 'new' here as well
      })

      const betLockUsers = await BetLock.find({
        userId: { $in: searchUsers },
        parentId: new Types.ObjectId(currentUser._id), // Use 'new' here as well
        matchId,
      }).lean()

      const usersWithBetLock: any = users.docs.map((user) => {
        const lockUser: any = betLockUsers.find((u: any) => u.userId.equals(user._id))
        if (lockUser && lockUser._id) delete lockUser._id
        return { ...user, ...lockUser }
      })
      users.docs = usersWithBetLock

      return this.success(res, users)
    } catch (e) {
      const err = e as Error
      return this.fail(res, err.message)
    }
  }

  usersLock = async (req: Request, res: Response) => {
    try {
      const { ids, lock, type } = req.body
      const user: any = req.user
      switch (type) {
        case 'betLock':
          await User.updateMany(
            {
              _id: { $in: ids },
              parentStr: { $elemMatch: { $eq: new Types.ObjectId(user._id) } }, // Use 'new' here as well
              role: { $ne: RoleType.admin },
            },
            { $set: { betLock: lock } },
          )
          break
        case 'loginLock':
          await User.updateMany(
            {
              _id: { $in: ids },
              parentStr: { $elemMatch: { $eq: new Types.ObjectId(user._id) } }, // Use 'new' here as well
              role: { $ne: RoleType.admin },
            },
            { $set: { isLogin: lock } },
          )
          break
      }
      this.success(res, { success: true }, 'Actions succesfully saved')
    } catch (e: unknown) {
      const err = e as Error
      this.fail(res, err.message)
    }
  }
}

