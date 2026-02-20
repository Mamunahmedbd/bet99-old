import { Request, Response } from 'express'
import { Types } from 'mongoose'
import {
  AccoutStatement,
  ChipsType,
  IAccoutStatement,
  IAccoutStatementModel,
} from '../models/AccountStatement'
import { Balance } from '../models/Balance'
import { TxnType } from '../models/UserChip'
import { ApiController } from './ApiController'
import { paginationPipeLine } from '../util/aggregation-pipeline-pagination'
import { IUserModel, User } from '../models/User'
import { RoleType } from '../models/Role'
import UserSocket from '../sockets/user-socket'
import { PipelineStage } from 'mongoose';

export class AccountController extends ApiController {
  constructor() {
    super()
    this.saveUserDepositFC = this.saveUserDepositFC.bind(this)
  }

  async saveUserDepositFC(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, parentUserId, amount, narration, balanceUpdateType, transactionPassword } =
        req.body
      const { _id, role }: any = req?.user

      const parentBal: any = await Balance.findOne({ userId: new Types.ObjectId(parentUserId) })
      // const userData = await User.findOne({
      //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
      //   _id: Types.ObjectId(userId),
      // })
      const select = {
        _id: 1,
        username: 1,
        parent: 1,
      }
      let userData: any = await User.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(userId),
            parentStr: { $elemMatch: { $eq: new Types.ObjectId(parentUserId) } },
          },
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
          $project: select,
        },
      ])

      userData = userData.length > 0 ? userData[0] : { _id: null }

      if (!userData?._id && role !== RoleType.admin) {
        return this.fail(res, 'Not a valid parent')
      }

      if (
        balanceUpdateType === 'D' &&
        parentBal.balance - parentBal.exposer < amount &&
        role !== RoleType.admin
      ) {
        return this.fail(res, 'Insufficient amount')
      }

      const currentUserData: any = await User.findOne({ _id })
      return await currentUserData
        .compareTxnPassword(transactionPassword)
        .then(async (isMatch: any) => {
          if (!isMatch) {
            return this.fail(res, 'Transaction Password not matched')
          }

          let userAccBal
          let successMsg

          if (role === 'admin' && userId == _id) {
            if (balanceUpdateType === 'D') {
              userAccBal = await this.depositAdminAccountBalance(req, userData)
              successMsg = 'Amount deposited to user'
            } else if (balanceUpdateType === 'W') {
              userAccBal = await this.withdrawAdminAccountBalance(req, userData)
              successMsg = 'Successfully withdrawl of amount'
            }
          } else {
            if (balanceUpdateType === 'D') {
              userAccBal = await this.depositAccountBalance(req, userData)
              successMsg = 'Amount deposited to user'
            } else if (balanceUpdateType === 'W') {
              const { userId, amount } = req.body
              const getBalWithExp: any = await Balance.findOne({ userId })
              if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
                return this.fail(res, 'Insufficient amount to withdrawl')
              }
              userAccBal = await this.withdrawAccountBalance(req, userData)
              successMsg = 'Successfully withdrawl of amount'
            }
          }
          UserSocket.setExposer({
            balance: userAccBal,
            userId: userId,
          })
          const pnlData: any = await this.calculatepnl(userId, balanceUpdateType)
          return this.success(res, { balance: userAccBal, profitLoss: pnlData }, successMsg)
        })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  async depositAdminAccountBalance(req: Request, userData: any) {
    const { _id, username }: any = req?.user
    let userAccBal

    const { amount, narration } = req.body

    const getAccStmt = await AccoutStatement.findOne({ userId: _id }, null, {
      sort: { createdAt: -1 },
    })

    const getOpenBal = getAccStmt?.closeBal ? getAccStmt.closeBal : 0

    const accountData: IAccoutStatement = {
      userId: _id,
      narration,
      amount,
      type: ChipsType.fc,
      txnType: TxnType.cr,
      openBal: getOpenBal,
      closeBal: getOpenBal + +amount,
      txnBy: `${username}/${userData.username}`,
    }

    const newAccStmt = new AccoutStatement(accountData)
    await newAccStmt.save()

    if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
      const mbal = await this.getUserDepWithBalance(_id)

      await Balance.findOneAndUpdate(
        { userId: _id },
        { balance: newAccStmt.closeBal, mainBalance: mbal },
        { new: true, upsert: true },
      )

      userAccBal = newAccStmt.closeBal
    }
    return userAccBal
  }

  async getUserBalance(userId: string) {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0
    return Balance_
  }

  async getUserDepWithBalance(userId: string) {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: new Types.ObjectId(userId), type: ChipsType.fc } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0
    return Balance_
  }

  async depositAccountBalance(req: Request, userData: any) {
    const { userId, parentUserId, amount, narration } = req.body
    const { _id, username }: any = req.user

    let userAccBal

    // const getAccStmt = await AccoutStatement.findOne({ userId: userId }, null, {
    //   sort: { createdAt: -1 },
    // })

    const getParentAccStmt = await AccoutStatement.findOne({ userId: parentUserId }, null, {
      sort: { createdAt: -1 },
    })

    const getOpenBal = await this.getUserBalance(userId)

    const userAccountData: IAccoutStatement = {
      userId,
      narration,
      amount,
      type: ChipsType.fc,
      txnType: TxnType.cr,
      openBal: getOpenBal,
      closeBal: getOpenBal + +amount,
      txnBy: `${username}/${userData.parent.username}`, //parent username here
    }

    const newUserAccStmt = new AccoutStatement(userAccountData)
    await newUserAccStmt.save()

    if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
      const pnlData = await this.calculatepnl(userId, 'd')
      const mbal = await this.getUserDepWithBalance(userId)
      await Balance.findOneAndUpdate(
        { userId },
        { balance: newUserAccStmt.closeBal, profitLoss: pnlData + +amount, mainBalance: mbal },
        { new: true, upsert: true },
      )

      userAccBal = newUserAccStmt.closeBal
    }

    const getParentOpenBal = getParentAccStmt?.closeBal ? getParentAccStmt.closeBal : 0
    const parentAmt = -amount
    const parentUserAccountData: IAccoutStatement = {
      userId: parentUserId,
      narration,
      amount: parentAmt,
      type: ChipsType.fc,
      txnType: TxnType.dr,
      openBal: getParentOpenBal,
      closeBal: getParentOpenBal - +amount,
      txnId: newUserAccStmt._id,
      txnBy: `${username}/${userData.username}`,
    }

    const newParentUserAccStmt = new AccoutStatement(parentUserAccountData)
    await newParentUserAccStmt.save()

    if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
      const mbal = await this.getUserDepWithBalance(parentUserId)
      await Balance.findOneAndUpdate(
        { userId: parentUserId },
        { balance: newParentUserAccStmt.closeBal, mainBalance: mbal },
        { new: true, upsert: true },
      )
      await AccoutStatement.updateOne(
        { _id: new Types.ObjectId(newUserAccStmt._id) },
        { $set: { txnId: new Types.ObjectId(newParentUserAccStmt._id) } },
      )
    }
    return userAccBal
  }

  async withdrawAdminAccountBalance(req: Request, userData: any) {
    const { _id, username }: any = req?.user

    const { amount, narration } = req.body

    let userAccBal

    const getAccStmt: any = await AccoutStatement.findOne({ userId: _id }, null, {
      sort: { createdAt: -1 },
    })

    try {
      if ((getAccStmt?._id !== undefined && getAccStmt?._id !== null) || getAccStmt !== null) {
        const getPrevCloseBal = await this.getUserBalance(_id)

        const accountData: IAccoutStatement = {
          userId: _id,
          narration,
          amount: -amount,
          type: ChipsType.fc,
          txnType: TxnType.dr,
          openBal: getPrevCloseBal,
          closeBal: getPrevCloseBal - +amount,
          txnBy: `${username}/${userData.username}`,
        }

        const newAccStmt = new AccoutStatement(accountData)
        await newAccStmt.save()

        if (newAccStmt._id !== undefined && newAccStmt._id !== null) {
          const mbal = await this.getUserDepWithBalance(_id)
          await Balance.findOneAndUpdate(
            { userId: _id },
            { balance: newAccStmt.closeBal, mainBalance: mbal },
            { new: true, upsert: true },
          )

          userAccBal = newAccStmt.closeBal
        }

        return userAccBal
      } else {
        throw Error('Withdrawal is not possible due to unsufficient balance')
      }
    } catch (e: any) {
      throw Error(e.message)
    }
  }

  async withdrawAccountBalance(req: Request,  userData: any) {
    const { userId, parentUserId, amount, narration } = req.body
    const user: any = req.user
    let userAccBal

    const getAccStmt = await AccoutStatement.findOne({ userId: userId }, null, {
      sort: { createdAt: -1 },
    })
    const getParentAccStmt = await AccoutStatement.findOne({ userId: parentUserId }, null, {
      sort: { createdAt: -1 },
    })

    if ((getAccStmt?._id !== undefined && getAccStmt?._id !== null) || getAccStmt !== null) {
      const getPrevCloseBal = await this.getUserBalance(userId)

      const userAccountData: IAccoutStatement = {
        userId,
        narration,
        amount: -amount,
        type: ChipsType.fc,
        txnType: TxnType.dr,
        openBal: getPrevCloseBal,
        closeBal: getPrevCloseBal - +amount,
        txnBy: `${user.username}/${userData.parent.username}`, //parent username here
      }

      const newUserAccStmt = new AccoutStatement(userAccountData)
      await newUserAccStmt.save()

      if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
        const pnlData: any = await this.calculatepnl(userId, 'w')
        const mbal = await this.getUserDepWithBalance(userId)
        await Balance.findOneAndUpdate(
          { userId },
          { balance: newUserAccStmt.closeBal, profitLoss: pnlData - +amount, mainBalance: mbal },
          { new: true, upsert: true },
        )

        userAccBal = newUserAccStmt.closeBal
      }

      // Parent checking for balance
      /// const getParentPrevCloseBal = getParentAccStmt?.closeBal ? getParentAccStmt.closeBal : 0
      const getParentPrevCloseBal = await this.getUserBalance(parentUserId)

      const parentUserAccountData: IAccoutStatement = {
        userId: parentUserId,
        narration,
        amount,
        type: ChipsType.fc,
        txnType: TxnType.cr,
        openBal: getParentPrevCloseBal,
        closeBal: getParentPrevCloseBal + +amount,
        txnBy: `${user.username}/${userData.username}`,
      }

      const newParentUserAccStmt = new AccoutStatement(parentUserAccountData)
      await newParentUserAccStmt.save()

      if (newParentUserAccStmt._id !== undefined && newParentUserAccStmt._id !== null) {
        const mbal = await this.getUserDepWithBalance(parentUserId)
        await Balance.findOneAndUpdate(
          { userId: parentUserId },
          { balance: newParentUserAccStmt.closeBal, mainBalance: mbal },
          { new: true, upsert: true },
        )
      }

      return userAccBal
    } else {
      throw Error('Withdrawal is not possible due to unsufficient balance')
    }
  }

  calculatepnl = async (userId: any, type: string = 'W') => {
    // const parent = await User.findOne(
    //   {
    //     parentStr: { $elemMatch: { $eq: Types.ObjectId(userId) } },
    //     role: RoleType.user,
    //   },
    //   { _id: 1 },
    // )
    //   .distinct('_id')
    //   .lean()

    // if (user.role == RoleType.user) {
    //   parent.push(userId)
    // }
    // const pnl = await AccoutStatement.aggregate([
    //   { $match: { userId: { $in: parent }, betId: { $ne: null } } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: '$amount' },
    //     },
    //   },
    // ]);
    const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })

    // const withdrawlsum = await AccoutStatement.aggregate([
    //   {
    //     $match: {
    //       userId: Types.ObjectId(userId),
    //       betId: { $eq: null },
    //       txnId: { $eq: null },
    //       txnType: TxnType.dr,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalAmount: { $sum: '$amount' },
    //     },
    //   },
    // ])
    // const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0
    // //const pnl_ = pnl && pnl.length > 0 ? pnl[0].totalAmount + withdAmt : 0
    // const pnl_ = bal?.profitLoss ? bal?.profitLoss + withdAmt : 0
    return bal?.profitLoss ? bal?.profitLoss : 0
  }
  getUserBalanceWithExposer = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const bal: any = await Balance.findOne({ userId: user._id })
        .select({
          balance: 1,
          exposer: 1,
          casinoexposer: 1,
        })
        .lean()
      bal.exposer = bal?.exposer + (bal?.casinoexposer || 0)
      return this.success(res, bal)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  depositWithdraw = async (req: Request, { role, _id }: IUserModel) => {
    let { userId, parentUserId, amount, balanceUpdateType } = req.body
    const parentBal: any = await Balance.findOne({ userId:new Types.ObjectId(parentUserId) })
    // const userData = await User.findOne({
    //   parentStr: { $elemMatch: { $eq: Types.ObjectId(parentUserId) } },
    //   _id: Types.ObjectId(userId),
    // })
    if (balanceUpdateType == 'ST') {
      if (amount > 0) {
        balanceUpdateType = 'D'
      } else {
        amount = Math.abs(amount)
        balanceUpdateType = 'W'
      }
    }

    const select = {
      _id: 1,
      username: 1,
      parent: 1,
    }
    let userData: any = await User.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(userId),
          parentStr: { $elemMatch: { $eq: new Types.ObjectId(parentUserId) } },
        },
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
        $project: select,
      },
    ])

    userData = userData.length > 0 ? userData[0] : { _id: null }

    if (!userData?._id && role !== RoleType.admin) {
      throw Error('Not a valid parent')
    }

    if (
      balanceUpdateType === 'D' &&
      parentBal.balance - parentBal.exposer < amount &&
      role !== RoleType.admin
    ) {
      throw Error('Insufficient amount')
    }

    let userAccBal
    let successMsg

    if (role === 'admin' && userId == _id) {
      if (balanceUpdateType === 'D') {
        userAccBal = await this.depositAdminAccountBalance(req, userData)
        successMsg = 'Amount deposited to user'
      } else if (balanceUpdateType === 'W') {
        userAccBal = await this.withdrawAdminAccountBalance(req, userData)
        successMsg = 'Successfully withdrawl of amount'
      }
    } else {
      if (balanceUpdateType === 'D') {
        userAccBal = await this.depositAccountBalance(req, userData)
        successMsg = 'Amount deposited to user'
      } else if (balanceUpdateType === 'W') {
        const { userId, amount } = req.body
        console.log('amount', amount)
        const getBalWithExp: any = await Balance.findOne({ userId })
        if (getBalWithExp.balance - getBalWithExp.exposer < amount) {
          throw Error('Insufficient amount to withdrawal, Due to pending exposure or less amount')
        }
        userAccBal = await this.withdrawAccountBalance(req, userData)
        successMsg = 'Successfully withdrawal of amount'
      }
    }
    UserSocket.setExposer({
      balance: userAccBal,
      userId: userId,
    })
    const pnlData: any = await this.calculatepnl(userId, balanceUpdateType)

    return {
      successMsg,
      userAccBal,
      pnlData,
    }
  }
  
  getAccountStmtList = async (req: Request, res: Response) => {
    try {
      const { page }: any = req.query
      const { startDate, endDate, reportType, userId }: any = req.body
      const user: any = req.user
      const options = {
        page: page ? page : 1,
        limit: 20,
      }
      const userid = userId ? new Types.ObjectId(userId) : new Types.ObjectId(user._id)
      var filter: any = {
        userId: userid,
        createdAt: {
          $gte: new Date(`${startDate} 00:00:00`),
          $lte: new Date(`${endDate} 23:59:59`),
        },
      }
      if (reportType == 'game') {
        filter = { ...filter, ...{ betId: { $ne: null } } }
      }
      if (reportType == 'chip') {
        filter = { ...filter, ...{ betId: null } }
      }

      const matchfilter = {
        $match: filter,
      }


    const aggregateFilter: PipelineStage[] = [
      // Convert 'betId' to ObjectId
      {
        $addFields: {
          convertedId: {
            $toObjectId: '$betId',
          },
        },
      },
    
      // Lookup Bets collection using convertedId
      {
        $lookup: {
          from: 'bets',
          localField: 'convertedId',
          foreignField: '_id',
          as: 'result',
        },
      },
    
      // Ensure matchfilter is a valid $match stage object
      matchfilter, // Assuming matchfilter is a valid object, e.g., { $match: { someField: 'someValue' } }
    
      // Facet for handling non-null and null 'convertedId' entries separately
      {
        $facet: {
          nonNullSelections: [
            {
              $match: {
                convertedId: { $ne: null },
              },
            },
            {
              $group: {
                _id: {
                  matchId: '$matchId',
                  marketId: '$result.marketId',
                },
                userId: { $first: '$userId' },
                selectionId: { $first: '$selectionId' },
                matchId: { $first: '$matchId' },
                amount: { $sum: '$amount' },
                txnType: { $first: '$txnType' },
                txnBy: { $first: '$txnBy' },
                openBal: { $first: '$openBal' },
                narration: { $first: '$narration' },
                createdAt: { $first: '$createdAt' },
                type: { $first: '$type' },
                allBets: { $push: '$$ROOT' },
              },
            },
          ],
    
          nullSelections: [
            {
              $match: {
                convertedId: null,
              },
            },
          ],
        },
      },
    
      // Concatenate non-null and null selections into one array
      {
        $project: {
          data: {
            $concatArrays: ['$nonNullSelections', '$nullSelections'],
          },
        },
      },
    
      // Unwind the concatenated data array
      {
        $unwind: '$data',
      },
    
      // Replace root with data field
      {
        $replaceRoot: {
          newRoot: '$data',
        },
      },
    
      // Sort by 'createdAt' field in ascending order
      {
        $sort: { createdAt: 1 },
      },
    ];
    
    // Pagination logic (assuming it's properly handled)
    const pageNo = page ? (page as string) : '1';
    
      const accountStatement = await AccoutStatement.aggregate(aggregateFilter);
      
    // try {
    //   // Execute aggregation query
    //   return accountStatement;
    // } catch (error) {
    //   console.error('Error during aggregation:', error);
    //   throw error;
    // }



  const datasort = accountStatement.sort((a: any, b: any) => a.createdAt - b.createdAt);
  var accountStatementNew = { items: datasort };

  const openingBalance = await AccoutStatement.aggregate([
        {
          $match: {
            userId: userid,
            createdAt: {
              $lte: new Date(`${startDate} 00:00:00`),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ])
      return this.success(res, {
        ...accountStatementNew,
        openingBalance: openingBalance?.[0]?.total || 0,
      })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  profitloss = async (req: Request, res: Response) => {
    try {
      const { page }: any = req.query
      const { startDate, endDate, userId }: any = req.body
      const pageNo = page ? (page as string) : '1'
      const user: any = req.user
      const aggregateFilter = [
        {
          $group: {
            _id: '$matchId',
            total: { $sum: '$amount' },
            narration: { $first: '$narration' },
            type: { $first: '$type' },
            sportId: { $first: '$sportId' },
          },
        },
      ]
      var filter: any = {
        userId: userId ? new Types.ObjectId(userId) : new Types.ObjectId(user._id),
        betId: { $ne: null },
        createdAt: {
          $gte: new Date(`${startDate} 00:00:00`),
          $lte: new Date(`${endDate} 23:59:59`),
        },
      }
      const matchfilter = {
        $match: filter,
      }
      const accountStatement = await AccoutStatement.aggregate(
        paginationPipeLine(pageNo, [matchfilter, ...aggregateFilter]),
      )
      return this.success(res, { ...accountStatement[0] })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
