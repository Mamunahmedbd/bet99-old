import { Request, Response } from 'express'
import { AccoutStatement, ChipsType, IAccoutStatement } from '../models/AccountStatement'
import { Balance } from '../models/Balance'
import { RoleType } from '../models/Role'
import {
  User,
  IUser,
  GameType,
  IUserBetInfo,
  PartnershipType,
  PartnershipAllRatioType,
  IUserModel,
} from '../models/User'
import { UserBetStake, defaultStack } from '../models/UserBetStake'
import { TxnType } from '../models/UserChip'
import { Database } from '../providers/Database'
import { paginationPipeLine } from '../util/aggregation-pipeline-pagination'
import { ApiController } from './ApiController'
import bcrypt from 'bcrypt-nodejs'
import { Types, ObjectId } from 'mongoose'
import { FancyController } from './FancyController'
import UserSocket from '../sockets/user-socket'

export class DealersController extends ApiController {
  constructor() {
    super()
    this.signUp = this.signUp.bind(this)
    this.getUserList = this.getUserList.bind(this)
    this.getUserDetail = this.getUserDetail.bind(this)
    this.getParentUserDetail = this.getParentUserDetail.bind(this)
    this.saveUserDepositFC = this.saveUserDepositFC.bind(this)
    this.updateUser = this.updateUser.bind(this)
    this.updateUserStatus = this.updateUserStatus.bind(this)
    this.updateUserWallet = this.updateUserWallet.bind(this)
  }

  async signUp(req: Request, res: Response): Promise<Response> {
    const session = await Database.getInstance().startSession()
    try {
      session.startTransaction()
      const {
        password,
        username,
        parent,
        partnership,
        role,
        fullname,
        city,
        phone,
        creditRefrences,
        exposerLimit,
        userSetting,
        transactionPassword,
      } = req.body
      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      return await currentUserData
        .compareTxnPassword(transactionPassword)
        .then(async (isMatch: any) => {
          if (!isMatch) {
            return this.fail(res, 'Transaction Password not matched')
          }

          const user = await User.findOne({ username })
          if (user) {
            return this.fail(res, 'User already exixts!')
          }

          const parentUser: any = await User.findOne({ username: parent })

          if (!parentUser) {
            return this.fail(res, 'Parent User not exixts!')
          }
          let updatedUserSetting = {}
          if (role !== RoleType.user) {
            let errorMsg = this.validatePartnership(
              JSON.parse(JSON.stringify(parentUser)),
              partnership,
            )

            if (errorMsg) {
              return this.fail(
                res,
                `${errorMsg.game} Partnership should be less then or equal ${errorMsg.parentRatio}`,
              )
            }
            updatedUserSetting = this.getUserSetting(userSetting, parentUser.userSetting)
          }

          if (role === RoleType.user) {
            if (!exposerLimit) this.fail(res, 'Exposer Limit is reuired field')
          }

          const newUserParentStr: string[] = parentUser?.parentStr
            ? [...parentUser?.parentStr, parentUser._id]
            : [parentUser._id]

          // User Setting

          const userData: IUser = {
            username,
            password,
            role: role,
            level: parentUser.level + 1,
            isLogin: true,
            betLock: true,
            parentId: parentUser._id,
            parentStr: newUserParentStr,
            fullName: fullname,
            city: city,
            phone: phone,
            creditRefrences,
            exposerLimit,
            userSetting: updatedUserSetting,
          }

          const newUser = new User(userData)
          await newUser.save({ session })

          if (newUser._id !== undefined && newUser._id !== null) {
            await Balance.findOneAndUpdate(
              { userId: newUser._id },
              { balance: 0, exposer: 0, profitLoss: -creditRefrences, mainBalance: 0 },
              { new: true, upsert: true, session },
            )
            if (role === RoleType.user) {
              // const parentStack: any = await UserBetStake.findOne({
              //   userId: parentUser._id,
              // }).lean()

              // delete parentStack._id
              // delete parentStack.userId

              await UserBetStake.findOneAndUpdate(
                { userId: newUser._id },
                { ...defaultStack },
                { new: true, upsert: true, session },
              )
            }
          }

          if (newUser._id !== undefined && newUser._id !== null && role !== RoleType.user) {
            const partnershipData = this.partnership(
              partnership,
              parentUser.partnership!,
              newUser._id,
            )
            await User.findOneAndUpdate(
              { _id: newUser._id },
              { partnership: partnershipData },
              { session },
            )
          }
          await session.commitTransaction()
          session.endSession()
          return this.success(res, {}, 'New User Added')
        })
    } catch (e: any) {
      await session.abortTransaction()
      session.endSession()
      return this.fail(res, e.stack)
    }
  }

  /* this function return this type of object
  "partnership":{
    "exchange":{
        "ownRatio":100,
        "allRatio":[
            {
                "parent":null,
                "ratio":100
            }
        ]
    }
  }
  */
  partnership(
    partnership: { [key: string]: number },
    parentPartnership: PartnershipType,
    parentId: string,
  ): PartnershipType {
    let partnershipData: PartnershipType = {}

    for (let gameType in GameType) {
      const game = GameType[gameType as keyof typeof GameType]
      let lastParentPopped: PartnershipAllRatioType = this.getLastUserInPartnership(
        parentPartnership,
        game,
      )

      let parentRatio = [
        ...parentPartnership[game].allRatio,
        {
          parent: lastParentPopped.parent,
          ratio: lastParentPopped.ratio - partnership[game],
        },
        {
          parent: parentId,
          ratio: parseInt(partnership[game].toString()),
        },
      ]

      partnershipData[game] = {
        ownRatio: partnership[game],
        allRatio: parentRatio,
      }
    }
    return partnershipData
  }

  getLastUserInPartnership(parentPartnership: PartnershipType, game: string) {
    return parentPartnership[game].allRatio.pop()!
  }

  validatePartnership(parentUser: IUser, partnership: { [key: string]: number }) {
    for (let gameType in GameType) {
      const game = GameType[gameType as keyof typeof GameType]
      const checkPartnership = this.getLastUserInPartnership(parentUser.partnership!, game)
      if (checkPartnership.ratio - partnership[game] < 0) {
        return { game, parentRatio: checkPartnership.ratio }
      }
    }
    return null
  }

  async getUserList(req: Request, res: Response): Promise<Response> {
    const { username, page, search, type, status } = req.query
    const pageNo = page ? (page as string) : '1'
    const pageLimit = 20

    const currentUser: any = req.user

    const select = {
      _id: 1,
      username: 1,
      parentId: 1,
      role: 1,
      creditRefrences: 1,
      exposerLimit: 1,
      isLogin: 1,
      betLock: 1,
      partnership: 1,
      parentStr: 1,
      'balance.balance': 1,
      'balance.exposer': 1,
      'balance.profitLoss': 1,
      'balance.mainBalance': 1,
      'balance.casinoexposer': 1,
    }

    const aggregateFilter = [
      {
        $lookup: {
          from: 'balances',
          localField: '_id',
          foreignField: 'userId',
          as: 'balance',
        },
      },
      {
        $unwind: '$balance',
      },
      {
        $project: select,
      },
    ]
    let filters: any = []

    if (username && search !== 'true') {
      const user: IUserModel | null = await this.getUser(username)
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              parentId: user?._id,
              parentStr: { $elemMatch: { $eq: new Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else if (search === 'true' && type) {
      //if (username) const user: IUserModel | null = await this.getUser(username)
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              role: type,
              parentStr: { $elemMatch: { $eq: new Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else if (username && search === 'true') {
      filters = paginationPipeLine(
        pageNo,
        [
          {
            $match: {
              username: new RegExp(username as string, 'i'),
              parentStr: { $elemMatch: { $eq: new Types.ObjectId(currentUser._id) } },
            },
          },
          ...aggregateFilter,
        ],
        pageLimit,
      )
    } else {
      const { _id, role }: any = req?.user
      if (status) {
        filters = paginationPipeLine(
          pageNo,
          [
            {
              $match: {
                parentId: new Types.ObjectId(_id),
                isLogin: status === 'true',
              },
            },
            ...aggregateFilter,
          ],
          pageLimit,
        )
      } else {
        if (role !== 'admin') {
          filters = paginationPipeLine(
            pageNo,
            [{ $match: { parentId: new Types.ObjectId(_id) } }, ...aggregateFilter],
            pageLimit,
          )
        } else {
          console.log(_id)
          filters = paginationPipeLine(
            pageNo,
            [{ $match: { _id: new Types.ObjectId(_id) } }, ...aggregateFilter],
            pageLimit,
          )
        }
      }
    }
    const users = await User.aggregate(filters)
    return this.success(res, { ...users[0] })
  }

  async getUser(username: any) {
    const user = await User.findOne({ username: username })
    return user
  }

  async getUserDetail(req: Request, res: Response): Promise<Response> {
    const { username }: any = req.query
    const user = await User.findOne({ username: username })
    return this.success(res, user)
  }

  async getParentUserDetail(req: Request, res: Response): Promise<Response> {
    const { username }: any = req.query
    const { role }: any = req?.user

    let user: any

    if (username === 'superadmin' && role == 'admin') {
      user = await this.getUserDetailAndBalance(req)
    } else {
      user = await this.getParentDetailAndBalance(req)
    }

    return this.success(res, user)
  }

  async getUserDetailAndBalance(req: Request) {
    const { username }: any = req.query

    const select = {
      _id: 1,
      username: 1,
      parentId: 1,
      role: 1,
      creditRefrences: 1,
      exposerLimit: 1,
      isLogin: 1,
      betLock: 1,
      'balance.balance': 1,
      'balance.mainBalance': 1,
      parent: 1,
      'parentBalance.balance': 1,
      userSetting: 1,
    }

    return await User.aggregate([
      {
        $match: { username },
      },
      {
        $lookup: {
          from: 'balances',
          localField: '_id',
          foreignField: 'userId',
          as: 'balance',
        },
      },
      {
        $unwind: '$balance',
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          pipeline: [{ $project: select }],
          as: 'parent',
        },
      },
      {
        $unwind: '$parent',
      },
      {
        $lookup: {
          from: 'balances',
          localField: 'parent._id',
          foreignField: 'userId',
          as: 'parentBalance',
        },
      },
      {
        $unwind: '$parentBalance',
      },
      {
        $project: select,
      },
    ])
  }

  async getParentDetailAndBalance(req: Request) {
    const { username }: any = req.query

    const select = {
      _id: 1,
      username: 1,
      parentId: 1,
      role: 1,
      creditRefrences: 1,
      exposerLimit: 1,
      isLogin: 1,
      betLock: 1,
      'balance.balance': 1,
      'balance.mainBalance': 1,
      parent: 1,
      'parentBalance.balance': 1,
      userSetting: 1,
    }

    return await User.aggregate([
      {
        $match: { username },
      },
      {
        $lookup: {
          from: 'balances',
          localField: '_id',
          foreignField: 'userId',
          as: 'balance',
        },
      },
      {
        $unwind: '$balance',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'parentId',
          foreignField: '_id',
          pipeline: [{ $project: select }],
          as: 'parent',
        },
      },
      {
        $unwind: '$parent',
      },
      {
        $lookup: {
          from: 'balances',
          localField: 'parent._id',
          foreignField: 'userId',
          as: 'parentBalance',
        },
      },
      {
        $unwind: '$parentBalance',
      },
      {
        $project: select,
      },
    ])
  }

  getUserSetting(userSettings: any, parentSettings: any) {
    let userSettingData: IUserBetInfo = {}

    for (let setting in userSettings) {
      const { minBet, maxBet, delay } = userSettings[setting]
      userSettingData[setting] = {
        minBet: minBet !== '0' || !minBet ? minBet : parentSettings[setting].minBet,
        maxBet: maxBet !== '0' || !maxBet ? maxBet : parentSettings[setting].maxBet,
        delay: delay !== '0' || !delay ? delay : parentSettings[setting].delay,
      }
    }
    return userSettingData
  }

  async saveUserDepositFC(req: Request, res: Response): Promise<Response> {
    try {
      const { amount, narration } = req.body

      const { _id, role }: any = req?.user

      if (role === 'admin') {
        const getAccStmt = await AccoutStatement.findOne({ userId: _id })

        const getOpenBal = getAccStmt?.closeBal ? getAccStmt.closeBal : 0

        const accountData: IAccoutStatement = {
          userId: _id,
          narration,
          amount,
          type: ChipsType.fc,
          txnType: TxnType.cr,
          openBal: getOpenBal,
          closeBal: getOpenBal + +amount,
        }

        const newAccStmt = new AccoutStatement(accountData)
        await newAccStmt.save()

        if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
          await Balance.findOneAndUpdate(
            { userId: _id },
            { balance: newAccStmt.closeBal },
            { new: true, upsert: true },
          )
        }
      }

      return this.success(res, {}, 'Amount deposited to user')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, confirmPassword, transactionPassword } = req.body
      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      return await currentUserData
        .compareTxnPassword(transactionPassword)
        .then(async (isMatch: any) => {
          if (!isMatch) {
            return this.fail(res, 'Transaction Password not matched')
          }

          const user = await User.findOne({ username })
          if (user) {
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)

            let setData: any = { password: hash }
            if (user.role !== RoleType.admin) setData = { ...setData, changePassAndTxn: false }

            await User.findOneAndUpdate({ _id: user._id }, { $set: setData })

            UserSocket.logout({
              role: user.role,
              sessionId: '123',
              _id: user._id,
            })

            return this.success(res, {}, 'User password updated')
          } else {
            return this.fail(res, 'User does not exist!')
          }
        })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { username, isUserActive, isUserBetActive, transactionPassword, single } = req.body
      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      if (!single) {
        const isMatch = await currentUserData.compareTxnPassword(transactionPassword)
        if (!isMatch) {
          return this.fail(res, 'Transaction Password not matched')
        }
      }
      const user = await User.findOne({ username })
      if (user) {
        await User.updateMany(
          {
            $or: [
              { _id: user._id },
              { parentStr: { $elemMatch: { $eq: new Types.ObjectId(user._id) } } },
            ],
          },
          {
            isLogin: isUserActive,
            betLock: isUserBetActive,
          },
        )

        return this.success(res, {}, 'User status updated')
      } else {
        return this.fail(res, 'User does not exist!')
      }
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async updateUserWallet(req: Request, res: Response): Promise<Response> {
    try {
      const { username, amount, walletUpdateType, transactionPassword } = req.body

      const currentUser: any = req.user
      const currentUserData: any = await User.findOne({ _id: currentUser._id })
      return await currentUserData
        .compareTxnPassword(transactionPassword)
        .then(async (isMatch: any) => {
          if (!isMatch) {
            return this.fail(res, 'Transaction Password not matched')
          }

          const user = await User.findOne({ username })
          let succesMsg
          if (user) {
            if (walletUpdateType === 'EXP') {
              await User.findOneAndUpdate(
                { _id: user._id },
                {
                  exposerLimit: amount,
                },
              )
              succesMsg = 'User exposure limit updated'
            } else if (walletUpdateType === 'CRD') {
              await User.findOneAndUpdate(
                { _id: user._id },
                {
                  creditRefrences: amount,
                },
              )

              const fancyObj = new FancyController()
              await fancyObj.updateUserAccountStatement([user._id], user.parentStr)
              succesMsg = 'User credit refrence updated'
            }

            return this.success(res, {}, succesMsg)
          } else {
            return this.fail(res, 'User does not exist!')
          }
        })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getUserListSuggestion = async (req: Request, res: Response) => {
    try {
      const { username } = req.body
      const regex = new RegExp(username, 'i')
      const currentUser: any = req.user

      const users = await User.find({
        username: { $regex: regex },
        parentStr: { $elemMatch: { $eq: new Types.ObjectId(currentUser._id) } },
      })
        .select({
          _id: 1,
          username: 1,
          role: 1,
        })
        .limit(10)
      return this.success(res, users)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  saveGeneralSettings = async (req: Request, res: Response) => {
    try {
      const { transactionPassword, userId, userSetting } = req.body

      const { _id, role }: any = req?.user
      const currentUserData: any = await User.findOne({ _id })
      return await currentUserData
        .compareTxnPassword(transactionPassword)
        .then(async (isMatch: any) => {
          if (!isMatch) {
            return this.fail(res, 'Transaction Password not matched')
          }

          await User.updateMany(
            {
              $or: [
                { parentStr: { $elemMatch: { $eq: new Types.ObjectId(_id) } } },
                { _id: new Types.ObjectId(userId) },
              ],
            },
            { $set: { userSetting } },
          )

          return this.success(res, {}, 'Settings Saved')
        })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  resetTransactionPassword = async (req: Request, res: Response) => {
    try {
      const { transactionPassword, userId } = req.body
      const { _id, role }: any = req?.user
      const currentUserData: any = await User.findOne({ _id })
      return await currentUserData
        .compareTxnPassword(transactionPassword)
        .then(async (isMatch: any) => {
          if (!isMatch) {
            return this.fail(res, 'Transaction Password not matched')
          }

          await User.updateOne(
            { _id:new Types.ObjectId(userId) },
            { $set: { changePassAndTxn: false } },
          )

          return this.success(res, {}, 'Settings Saved')
        })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
