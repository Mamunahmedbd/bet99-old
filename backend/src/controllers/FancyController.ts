import axios from 'axios'
import { Request, Response } from 'express'
import { IFancy, IFancyModel, Fancy } from '../models/Fancy'
import { ApiController } from './ApiController'
import { Bet, BetOn, BetType, IBet } from '../models/Bet'
import { IMatch, Match } from '../models/Match'
import { BetController } from './BetController'
import { User } from '../models/User'
import { AccoutStatement, ChipsType, IAccoutStatement } from '../models/AccountStatement'
import { TxnType } from '../models/UserChip'
import { Balance } from '../models/Balance'
import { ObjectId, Types } from 'mongoose'
import UserSocket from '../sockets/user-socket'
import { RoleType } from '../models/Role'
import { Market } from '../models/Market'
import { CasCasino } from '../models/CasCasino'
var ObjectId = require('mongoose').Types.ObjectId

export class FancyController extends ApiController {
  activeFancies = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId, gtype }: any = req.query
      if (!matchId) return this.fail(res, 'matchId is required field')

      const strings = ['wkt', 'Wkts', 'Fours', 'Sixes']

      const filters = {
        $nor: [
          ...strings.map((string) => ({ fancyName: { $regex: string } })),
          { ballByBall: 'ballRun' },
        ],
        gtype,
      }
      let filter: any = { gtype }
      switch (gtype) {
        case 'session':
          filter = filters
          break
        case 'fancy1':
          filter = { gtype }
          break
        case 'wkt':
          filter = {
            $or: [{ fancyName: { $regex: gtype } }, { fancyName: { $regex: strings[1] } }],
            gtype: { $ne: 'fancy1' },
          }
          break
        case 'ballRun':
          filter = { ballByBall: 'ballRun' }
          break
      }

      if (strings.find((str) => str.includes(gtype))) {
        filter = { fancyName: { $regex: gtype }, gtype: { $ne: 'fancy1' } }
      }
      const bets = await Bet.find({ matchId, bet_on: BetOn.FANCY }).select({ selectionId: 1 })
      let allBets: any = {}
      if (bets.length) {
        bets.forEach((bet) => {
          allBets[`${bet.selectionId}`] = true
        })
      }
      let fancy = await Fancy.find({
        matchId,
        ...filter,
      })
        .sort({ active: -1 })
        .lean()

      fancy = fancy
        .map((f: any) => {
          f.bet = allBets[f.marketId] ? true : false
          return f
        })
        .sort((a, b) => b.bet - a.bet)

      return this.success(res, fancy)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  suspendFancy = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { marketId, matchId, type }: any = req.query

      const newFancy: any = await Fancy.findOne({
        marketId: `${marketId}`,
        matchId,
      })

      if (newFancy && type) {
        newFancy[type] = !newFancy[type]
        if (type !== 'active') newFancy.GameStatus = newFancy[type] ? 'SUSPENDED' : ''
        newFancy.save()
      }

      axios
        .post(`${process.env.OD_NODE_URL}fancy-suspend`, {
          fancy: newFancy,
          type,
        })
        .then((res) => console.log(res.data))
        .catch((e: any) => {
          console.log(e.response.data)
        })
      return this.success(res, newFancy)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  rollbackfancyresult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { marketId, matchId }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'completed',
            bet_on: BetOn.FANCY,
            marketId: marketId,
            matchId: parseInt(matchId),
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
        {
          $addFields: {
            allBets: {
              $map: {
                input: '$allBets',
                as: 'bet',
                in: {
                  $mergeObjects: [
                    '$$bet',
                    {
                      odds: { $toString: '$$bet.odds' },
                      volume: { $toString: '$$bet.volume' },
                      stack: { $toString: '$$bet.stack' },
                      pnl: { $toString: '$$bet.pnl' },
                      commission: { $toString: '$$bet.commission' },
                      matchedOdds: { $toString: '$$bet.matchedOdds' },
                      loss: { $toString: '$$bet.loss' },
                      profitLoss: { $toString: '$$bet.profitLoss' },
                    },
                  ],
                },
              },
            },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          UserSocket.onRollbackPlaceBet(ItemBetList)
          await AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) })
          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
        })
        Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })
      await Promise.all(declare_result)
      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          selectionId: marketId,
          bet_on: BetOn.FANCY,
        },
        { $set: { status: 'pending' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: '' } })
      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  rollbackfancyresultbyapi = async ({ marketId, matchId }: any) => {
    try {
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'completed',
            bet_on: BetOn.FANCY,
            marketId: marketId,
            matchId: parseInt(matchId),
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
        {
          $addFields: {
            allBets: {
              $map: {
                input: '$allBets',
                as: 'bet',
                in: {
                  $mergeObjects: [
                    '$$bet',
                    {
                      odds: { $toString: '$$bet.odds' },
                      volume: { $toString: '$$bet.volume' },
                      stack: { $toString: '$$bet.stack' },
                      pnl: { $toString: '$$bet.pnl' },
                      commission: { $toString: '$$bet.commission' },
                      matchedOdds: { $toString: '$$bet.matchedOdds' },
                      loss: { $toString: '$$bet.loss' },
                      profitLoss: { $toString: '$$bet.profitLoss' },
                    },
                  ],
                },
              },
            },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          UserSocket.onRollbackPlaceBet(ItemBetList)
          await AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) })
          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
        })
        Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })
      await Promise.all(declare_result)
      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          selectionId: marketId,
          bet_on: BetOn.FANCY,
        },
        { $set: { status: 'pending' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: '' } })
      return true
    } catch (e: any) {
      return false
    }
  }
  updatefancyresultapi = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = req.body;
      if (data.result != '' && data.message == 'ok') {
        const findFancy: any = await Fancy.findOne({ fancyName: data.runnerName, matchId: data.matchId })
        if (findFancy?._id && !data.isRollback) {
          this.declarefancyresultAuto({ matchId: findFancy.matchId, marketId: findFancy.marketId, result: data.result });
        } else if (findFancy?._id) {
          this.rollbackfancyresultbyapi({ matchId: findFancy.matchId, marketId: findFancy.marketId });
        }
        return this.success(res, {})
      } else {
        return this.success(res, { message: "result not found" });
      }
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  declarefancyresultAuto = async ({ marketId, matchId, result }: any) => {
    try {
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'pending',
            bet_on: BetOn.FANCY,
            marketId: marketId,
            matchId: parseInt(matchId),
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          let profit_type: string = 'loss'
          profit_type =
            ItemBetList.isBack == false && parseInt(result) < parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          profit_type =
            ItemBetList.isBack == true && parseInt(result) >= parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          let profitLossAmt: number = 0
          if (ItemBetList.gtype === 'fancy1') {
            profit_type =
              ItemBetList.isBack == true && parseInt(result) == 1 ? 'profit' : profit_type

            profit_type =
              ItemBetList.isBack == false && parseInt(result) == 0 ? 'profit' : profit_type
          }
          if (profit_type == 'profit') {
            if (ItemBetList.gtype === 'fancy1') {
              profitLossAmt = ItemBetList.isBack
                ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                : ItemBetList.stack
            } else {
              profitLossAmt = ItemBetList.isBack
                ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                : ItemBetList.stack
            }
          } else if (profit_type == 'loss') {
            if (ItemBetList.gtype === 'fancy1') {
              profitLossAmt = ItemBetList.isBack
                ? -ItemBetList.stack
                : -1 * (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack)
            } else {
              profitLossAmt = ItemBetList.isBack
                ? -ItemBetList.stack
                : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
            }
          }
          let type_string: string = ItemBetList.isBack ? 'Yes' : 'No'
          if (result == -1) {
            profitLossAmt = 0
          }
          let narration: string =
            ItemBetList.matchName +
            ' / ' +
            ItemBetList.selectionName +
            ' / ' +
            type_string +
            ' / ' +
            (result == -1 ? 'Abandoned' : result)
          await this.addprofitlosstouser({
            userId: ObjectId(Item._id),
            bet_id: ObjectId(ItemBetList._id),
            profit_loss: profitLossAmt,
            matchId,
            narration,
            sportsType: ItemBetList.sportId,
            selectionId: ItemBetList.selectionId,
            sportId: ItemBetList.sportId,
          })
          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
          UserSocket.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId })
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })
      await Promise.all(declare_result)
      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          selectionId: marketId,
          bet_on: BetOn.FANCY,
        },
        { $set: { status: 'completed' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: result } })
      return true
    } catch (e: any) {
      return false
    }
  }
  updateUserAccountStatement = async (userIds: any, parentIdList: any): Promise<void> => {
    if (userIds.length > 0) {
      const betController = new BetController()
      const json: any = {}
      const promiseStatment = userIds.map(async (ItemUserId: any) => {
        let exposer: number = 0
        let balancePnl: number = 0
        const blanceData = await this.updateUserBal(ItemUserId, parentIdList)
        if (parentIdList.indexOf(ItemUserId) == -1) {
          exposer = await betController.getexposerfunction(
            { _id: ItemUserId.toString() },
            false,
            json,
          )
          balancePnl = blanceData.pnl_
        } else {
          balancePnl = blanceData.pnl_
        }
        await Balance.findOneAndUpdate(
          { userId: ItemUserId },
          { balance: blanceData.Balance_, exposer: exposer, profitLoss: balancePnl },
          { new: true, upsert: true },
        )
        UserSocket.setExposer({
          balance: blanceData.Balance_,
          exposer: exposer,
          userId: ItemUserId,
        })
      })
      await Promise.all(promiseStatment)
    }
  }
  updateUserAccountStatementCasino = async (userIds: any, parentIdList: any): Promise<void> => {
    if (userIds.length > 0) {
      const betController = new BetController()
      const json: any = {}
      const promiseStatment = userIds.map(async (ItemUserId: any) => {
        let exposer: number = 0
        let balancePnl: number = 0
        const blanceData = await this.updateUserBal(ItemUserId, parentIdList)
        if (parentIdList.indexOf(ItemUserId) == -1) {
          exposer = await betController.getcasinoexposerfunction(
            { _id: ItemUserId.toString() },
            false,
            json,
          )
          balancePnl = blanceData.pnl_
        } else {
          balancePnl = blanceData.pnl_
        }
        const updateUserBal = await Balance.findOneAndUpdate(
          { userId: ItemUserId },
          { balance: blanceData.Balance_, casinoexposer: exposer, profitLoss: balancePnl },
          { new: true, upsert: true },
        )
        UserSocket.setExposer({
          balance: blanceData.Balance_,
          exposer: exposer + +updateUserBal?.exposer,
          userId: ItemUserId,
        })
      })
      await Promise.all(promiseStatment)
    }
  }

  declarefancyresult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { marketId, matchId, result }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'pending',
            bet_on: BetOn.FANCY,
            marketId: marketId,
            matchId: parseInt(matchId),
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          let profit_type: string = 'loss'
          profit_type =
            ItemBetList.isBack == false && parseInt(result) < parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          profit_type =
            ItemBetList.isBack == true && parseInt(result) >= parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          let profitLossAmt: number = 0
          if (ItemBetList.gtype === 'fancy1') {
            profit_type =
              ItemBetList.isBack == true && parseInt(result) == 1 ? 'profit' : profit_type

            profit_type =
              ItemBetList.isBack == false && parseInt(result) == 0 ? 'profit' : profit_type
          }
          if (profit_type == 'profit') {
            if (ItemBetList.gtype === 'fancy1') {
              profitLossAmt = ItemBetList.isBack
                ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                : ItemBetList.stack
            } else {
              profitLossAmt = ItemBetList.isBack
                ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                : ItemBetList.stack
            }
          } else if (profit_type == 'loss') {
            if (ItemBetList.gtype === 'fancy1') {
              profitLossAmt = ItemBetList.isBack
                ? -ItemBetList.stack
                : -1 * (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack)
            } else {
              profitLossAmt = ItemBetList.isBack
                ? -ItemBetList.stack
                : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
            }
          }
          let type_string: string = ItemBetList.isBack ? 'Yes' : 'No'
          if (result == -1) {
            profitLossAmt = 0
          }
          let narration: string =
            ItemBetList.matchName +
            ' / ' +
            ItemBetList.selectionName +
            ' / ' +
            type_string +
            ' / ' +
            (result == -1 ? 'Abandoned' : result)
          await this.addprofitlosstouser({
            userId: ObjectId(Item._id),
            bet_id: ObjectId(ItemBetList._id),
            profit_loss: profitLossAmt,
            matchId,
            narration,
            sportsType: ItemBetList.sportId,
            selectionId: ItemBetList.selectionId,
            sportId: ItemBetList.sportId,
          })
          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
          UserSocket.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId })
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })
      await Promise.all(declare_result)
      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          selectionId: marketId,
          bet_on: BetOn.FANCY,
        },
        { $set: { status: 'completed' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Fancy.updateOne({ matchId: matchId, marketId: marketId }, { $set: { result: result } })
      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  setT10FancyResult = async (req: Request, res: Response): Promise<Response> => {
    const pendingFanciesMatchs = await Fancy.aggregate([
      { $match: { status: { $eq: undefined } } },
      { $group: { _id: '$matchId' } },
      { $project: { matchId: 1 } },
    ])
    pendingFanciesMatchs.map((item) => {
      axios
        .get(`${process.env.SUPER_NODE_URL}api/get-t10-fancy-result?matchId=${item._id}`)
        .then(async (response) => {
          await new FancyController().declarefancyresultauto(response.data)
        })
        .catch((e) => console.log(e.message))
    })

    return this.success(res, {})
  }

  declarefancyresultauto = async ({ marketIdList, matchId }: any): Promise<boolean> => {
    try {
      const pendingFancies = await Fancy.find(
        { status: { $eq: undefined }, matchId: matchId },
        { marketId: 1 },
      )
      const finalArray = pendingFancies.map((ItemPending: any) => ItemPending.marketId)
      const declareResultList = marketIdList.filter(
        (ItemSet: any) => finalArray.indexOf(ItemSet.marketId) > -1,
      )
      const dataPromise = declareResultList.map(async (ItemResult: any) => {
        const { marketId, result }: any = ItemResult
        const userbet: any = await Bet.aggregate([
          {
            $match: {
              status: 'pending',
              bet_on: BetOn.FANCY,
              marketId: marketId,
              matchId: parseInt(matchId),
            },
          },
          {
            $group: {
              _id: '$userId',
              allBets: { $push: '$$ROOT' },
            },
          },
        ])
        let userIdList: any = []
        const parentIdList: any = []
        const declare_result = userbet.map(async (Item: any) => {
          let allbets: any = Item.allBets
          const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
            let profit_type: string = 'loss'
            profit_type =
              ItemBetList.isBack == false && parseInt(result) < parseInt(ItemBetList.odds)
                ? 'profit'
                : profit_type
            profit_type =
              ItemBetList.isBack == true && parseInt(result) >= parseInt(ItemBetList.odds)
                ? 'profit'
                : profit_type
            let profitLossAmt: number = 0
            if (ItemBetList.gtype === 'fancy1') {
              profit_type =
                ItemBetList.isBack == true && parseInt(result) == 1 ? 'profit' : profit_type

              profit_type =
                ItemBetList.isBack == false && parseInt(result) == 0 ? 'profit' : profit_type
            }
            if (profit_type == 'profit') {
              if (ItemBetList.gtype === 'fancy1') {
                profitLossAmt = ItemBetList.isBack
                  ? ItemBetList.odds * ItemBetList.stack - ItemBetList.stack
                  : ItemBetList.stack
              } else {
                profitLossAmt = ItemBetList.isBack
                  ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
                  : ItemBetList.stack
              }
            } else if (profit_type == 'loss') {
              if (ItemBetList.gtype === 'fancy1') {
                profitLossAmt = ItemBetList.isBack
                  ? -ItemBetList.stack
                  : -1 * (ItemBetList.odds * ItemBetList.stack - ItemBetList.stack)
              } else {
                profitLossAmt = ItemBetList.isBack
                  ? -ItemBetList.stack
                  : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
              }
            }
            let type_string: string = ItemBetList.isBack ? 'Yes' : 'No'
            let narration: string =
              ItemBetList.matchName +
              ' / ' +
              ItemBetList.selectionName +
              ' / ' +
              type_string +
              ' / ' +
              result
            await this.addprofitlosstouser({
              userId: ObjectId(Item._id),
              bet_id: ObjectId(ItemBetList._id),
              profit_loss: profitLossAmt,
              matchId,
              narration,
              sportsType: ItemBetList.sportId,
              selectionId: ItemBetList.selectionId,
              sportId: ItemBetList.sportId,
            })
            if (indexBetList == 0) {
              ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
                parentIdList.push(ItemParentStr.parent)
                userIdList.push(ObjectId(ItemParentStr.parent))
              })
            }
            UserSocket.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId })
          })
          await Promise.all(settle_single)
          userIdList.push(ObjectId(Item._id))
        })
        await Promise.all(declare_result)
        await Bet.updateMany(
          {
            userId: { $in: userIdList },
            matchId: matchId,
            selectionId: marketId,
            bet_on: BetOn.FANCY,
          },
          { $set: { status: 'completed' } },
        )
        const unique = [...new Set(userIdList)]
        if (unique.length > 0) {
          await this.updateUserAccountStatement(unique, parentIdList)
        }
        await Fancy.updateOne(
          { matchId: parseInt(matchId), marketId: marketId },
          { $set: { result: result, status: 'completed' } },
        )
      })
      await Promise.all(dataPromise)
      return true
    } catch (e: any) {
      return false
    }
  }

  updateUserBal = async (userId: any, parentIdList: any) => {
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const parent = await User.findOne(
      {
        parentStr: { $elemMatch: { $eq: new Types.ObjectId(userId) } },
        role: RoleType.user,
      },
      { _id: 1 },
    )
      .distinct('_id')
      .lean()

    if (parentIdList.indexOf(userId) == -1) {
      parent.push(userId)
    }
    const pnl = await AccoutStatement.aggregate([
      { $match: { userId: { $in: parent }, betId: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const withdrawlsum = await AccoutStatement.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          betId: { $eq: null },
          txnId: { $eq: null },
          txnType: TxnType.dr,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])

    const depositesum = await AccoutStatement.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          betId: { $eq: null },
          txnId: { $ne: null },
          txnType: TxnType.cr,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])

    const userCr = await User.findOne({ _id: ObjectId(userId) }).select({ creditRefrences: 1 })
    const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0
    const depositeAmt = depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0
    const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0
    const pnl_ =
      pnl && pnl.length > 0
        ? pnl[0].totalAmount +
        withdAmt +
        depositeAmt -
        (userCr && userCr.creditRefrences ? parseInt(userCr.creditRefrences) : 0)
        : withdAmt +
        depositeAmt -
        (userCr && userCr.creditRefrences ? parseInt(userCr.creditRefrences) : 0)
    ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
    //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0

    return { Balance_, pnl_ }
  }
  declarematchresult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { selectionId, matchId }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'pending',
            bet_on: BetOn.MATCH_ODDS,
            matchId: parseInt(matchId),
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          let profit_type: string = 'loss'
          if (parseInt(selectionId) == ItemBetList.selectionId) {
            profit_type = ItemBetList.isBack == true ? 'profit' : profit_type
          } else {
            profit_type = ItemBetList.isBack == true ? profit_type : 'profit'
          }
          let profitLossAmt: number = 0
          if (ItemBetList.isBack) {
            if (profit_type == 'profit') {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
            } else if (profit_type == 'loss') {
              profitLossAmt = parseFloat(ItemBetList.loss.toString())
            }
          } else {
            if (profit_type == 'profit') {
              profitLossAmt = ItemBetList.stack
            } else if (profit_type == 'loss') {
              profitLossAmt = parseFloat(ItemBetList.loss.toString())
            }
          }

          let type_string: string = ItemBetList.isBack ? 'Back' : 'Lay'
          let narration: string =
            ItemBetList.matchName +
            ' / ' +
            ItemBetList.selectionName +
            ' / ' +
            type_string +
            ' / ' +
            selectionId
          await this.addprofitlosstouser({
            userId: ObjectId(Item._id),
            bet_id: ObjectId(ItemBetList._id),
            profit_loss: profitLossAmt,
            matchId,
            narration,
            sportsType: ItemBetList.sportId,
            selectionId: ItemBetList.selectionId,
            sportId: ItemBetList.sportId,
          })

          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })

      await Promise.all(declare_result)

      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          bet_on: BetOn.MATCH_ODDS,
        },
        { $set: { status: 'completed' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Match.updateOne(
        { matchId: parseInt(matchId) },
        { $set: { result_delare: true, result: selectionId } },
      )
      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
  declaremarketresult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { selectionId, matchId, marketId }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'pending',
            bet_on: BetOn.MATCH_ODDS,
            matchId: parseInt(matchId),
            marketId: marketId,
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          let profit_type: string = 'loss'
          if (parseInt(selectionId) == ItemBetList.selectionId) {
            profit_type = ItemBetList.isBack == true ? 'profit' : profit_type
          } else {
            profit_type = ItemBetList.isBack == true ? profit_type : 'profit'
          }
          let profitLossAmt: number = 0
          if (ItemBetList.isBack) {
            if (profit_type == 'profit') {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
            } else if (profit_type == 'loss') {
              profitLossAmt = parseFloat(ItemBetList.loss.toString())
            }
          } else {
            if (profit_type == 'profit') {
              profitLossAmt = ItemBetList.stack
            } else if (profit_type == 'loss') {
              profitLossAmt = parseFloat(ItemBetList.loss.toString())
            }
          }
          if (selectionId == -1) {
            profitLossAmt = 0
          }

          let type_string: string = ItemBetList.isBack ? 'Back' : 'Lay'
          let narration: string =
            ItemBetList.matchName +
            ' / ' +
            ItemBetList.selectionName +
            ' / ' +
            type_string +
            ' / ' +
            (selectionId == -1 ? 'Abandoned' : selectionId)
          await this.addprofitlosstouser({
            userId: ObjectId(Item._id),
            bet_id: ObjectId(ItemBetList._id),
            profit_loss: profitLossAmt,
            matchId,
            narration,
            sportsType: ItemBetList.sportId,
            selectionId: ItemBetList.selectionId,
            sportId: ItemBetList.sportId,
          })

          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })

      await Promise.all(declare_result)

      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          bet_on: BetOn.MATCH_ODDS,
          marketId: marketId,
        },
        { $set: { status: 'completed' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Match.updateOne(
        { matchId: parseInt(matchId) },
        { $set: { result_delare: true, result: selectionId } },
      )
      await Market.updateOne(
        { marketId: marketId },
        { $set: { resultDelcare: 'yes', result: selectionId } },
      )
      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  declaremarketresultAuto = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { selectionId, matchId, marketId }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'pending',
            bet_on: BetOn.MATCH_ODDS,
            matchId: parseInt(matchId),
            marketId: marketId,
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          let profit_type: string = 'loss'
          if (parseInt(selectionId) == ItemBetList.selectionId) {
            profit_type = ItemBetList.isBack == true ? 'profit' : profit_type
          } else {
            profit_type = ItemBetList.isBack == true ? profit_type : 'profit'
          }
          let profitLossAmt: number = 0
          if (ItemBetList.isBack) {
            if (profit_type == 'profit') {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
            } else if (profit_type == 'loss') {
              profitLossAmt = parseFloat(ItemBetList.loss.toString())
            }
          } else {
            if (profit_type == 'profit') {
              profitLossAmt = ItemBetList.stack
            } else if (profit_type == 'loss') {
              profitLossAmt = parseFloat(ItemBetList.loss.toString())
            }
          }

          if (selectionId == -1) {
            profitLossAmt = 0
          }

          let type_string: string = ItemBetList.isBack ? 'Back' : 'Lay'
          let narration: string =
            ItemBetList.matchName +
            ' / ' +
            ItemBetList.selectionName +
            ' / ' +
            type_string +
            ' / ' +
            (selectionId == -1 ? 'Abandoned' : selectionId)
          await this.addprofitlosstouser({
            userId: ObjectId(Item._id),
            bet_id: ObjectId(ItemBetList._id),
            profit_loss: profitLossAmt,
            matchId,
            narration,
            sportsType: ItemBetList.sportId,
            selectionId: ItemBetList.selectionId,
            sportId: ItemBetList.sportId,
          })

          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
          UserSocket.betDelete({ betId: ItemBetList._id, userId: ItemBetList.userId })
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })

      await Promise.all(declare_result)

      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          bet_on: BetOn.MATCH_ODDS,
          marketId: marketId,
        },
        { $set: { status: 'completed' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Market.updateOne(
        { marketId: marketId },
        { $set: { resultDelcare: 'yes', result: selectionId, isActive: false } },
      )
      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  rollbackmarketresult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'completed',
            bet_on: BetOn.MATCH_ODDS,
            matchId: parseInt(matchId),
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          await AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) })
          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })
      await Promise.all(declare_result)
      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          bet_on: BetOn.MATCH_ODDS,
        },
        { $set: { status: 'pending' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }
      await Match.updateOne(
        { matchId: parseInt(matchId) },
        { $set: { result_delare: false, result: '' } },
      )
      await Market.updateOne({ matchId: parseInt(matchId) }, { $set: { resultDelcare: 'no' } })
      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  /// market wise karna h
  rollbackmarketwiseresult = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { matchId, marketId }: any = req.query
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'completed',
            bet_on: BetOn.MATCH_ODDS,
            matchId: parseInt(matchId),
            marketId: marketId,
          },
        },
        {
          $group: {
            _id: '$userId',
            allBets: { $push: '$$ROOT' },
          },
        },
      ])
      let userIdList: any = []
      const parentIdList: any = []
      const declare_result = userbet.map(async (Item: any) => {
        let allbets: any = Item.allBets
        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          await AccoutStatement.deleteMany({ betId: ObjectId(ItemBetList._id) })
          if (indexBetList == 0) {
            ItemBetList.ratioStr.allRatio.map((ItemParentStr: any) => {
              parentIdList.push(ItemParentStr.parent)
              userIdList.push(ObjectId(ItemParentStr.parent))
            })
          }
        })
        await Promise.all(settle_single)
        userIdList.push(ObjectId(Item._id))
      })
      await Promise.all(declare_result)
      await Bet.updateMany(
        {
          userId: { $in: userIdList },
          matchId: matchId,
          bet_on: BetOn.MATCH_ODDS,
          marketId: marketId,
        },
        { $set: { status: 'pending' } },
      )
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await this.updateUserAccountStatement(unique, parentIdList)
      }

      await Market.updateOne({ marketId: marketId }, { $set: { resultDelcare: 'no' } })

      return this.success(res, userbet, '')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  addprofitlosstouser = async ({
    userId,
    bet_id,
    profit_loss,
    matchId,
    narration,
    sportsType,
    selectionId,
    sportId,
  }: {
    userId: ObjectId
    bet_id: ObjectId
    profit_loss: number
    matchId: number
    narration: string
    sportsType: number
    selectionId: number
    sportId: number
  }): Promise<void> => {
    const user = await User.findOne({ _id: userId })
    const user_parent = await User.findOne({ _id: user?.parentId })
    const parent_ratio =
      sportId == 5000
        ? user_parent?.partnership?.[4]?.allRatio
        : user_parent?.partnership?.[sportsType]?.allRatio
    const reference_id = await this.sendcreditdebit(
      userId,
      narration,
      profit_loss,
      matchId,
      bet_id,
      selectionId,
      sportId,
    )
    const updateplToBet = await Bet.updateOne(
      { _id: bet_id },
      { $set: { profitLoss: profit_loss } },
    )
    if (parent_ratio && parent_ratio.length > 0) {
      const accountforparent = parent_ratio.map(async (Item) => {
        let pl = (Math.abs(profit_loss) * Item.ratio) / 100
        const final_amount: number = profit_loss > 0 ? -pl : pl
        await this.sendcreditdebit(
          Item.parent,
          narration,
          final_amount,
          matchId,
          bet_id,
          selectionId,
          sportId,
        )
      })
      await Promise.all(accountforparent)
    }
  }

  sendcreditdebit = async (
    userId: any,
    narration: string,
    profit_loss: number,
    matchId: number,
    betId: ObjectId,
    selectionId: number,
    sportId: number,
  ): Promise<any> => {
    const getAccStmt = await AccoutStatement.findOne({ userId: userId })
      .sort({ createdAt: -1 })
      .lean()
    const getOpenBal = getAccStmt?.closeBal ? getAccStmt.closeBal : 0

    const userAccountData: IAccoutStatement = {
      userId,
      narration: narration,
      amount: profit_loss,
      type: ChipsType.pnl,
      txnType: profit_loss > 0 ? TxnType.cr : TxnType.dr,
      openBal: getOpenBal,
      closeBal: getOpenBal + +profit_loss,
      matchId: matchId,
      betId: betId,
      selectionId,
      sportId,
    }

    const entryCheck = await AccoutStatement.findOne({
      txnType: profit_loss > 0 ? TxnType.cr : TxnType.dr,
      betId: betId,
      userId: userId,
    })
    if (!entryCheck) {
      const newUserAccStmt = new AccoutStatement(userAccountData)
      await newUserAccStmt.save()

      if (newUserAccStmt._id !== undefined && newUserAccStmt._id !== null) {
        return newUserAccStmt._id
      } else {
        return null
      }
    } else {
      return entryCheck._id
    }
  }
  updateaccountstatement = async (userId: ObjectId, betid: ObjectId): Promise<any> => { }

  apiupdateUserBal = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.body
    const userInfo = await User.findOne({ _id: new ObjectId(userId) })
    const ac = await AccoutStatement.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const parent = await User.findOne(
      {
        parentStr: { $elemMatch: { $eq: new Types.ObjectId(userId) } },
        role: RoleType.user,
      },
      { _id: 1 },
    )
      .distinct('_id')
      .lean()

    if (userInfo?.role == RoleType.user) {
      parent.push(new ObjectId(userId))
    }
    const pnl = await AccoutStatement.aggregate([
      { $match: { userId: { $in: parent }, betId: { $ne: null } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])
    const withdrawlsum = await AccoutStatement.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          betId: { $eq: null },
          txnId: { $eq: null },
          txnType: TxnType.dr,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])

    const depositesum = await AccoutStatement.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          betId: { $eq: null },
          txnId: { $ne: null },
          txnType: TxnType.cr,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ])

    const userCr = await User.findOne({ _id: new ObjectId(userId) }).select({ creditRefrences: 1 })
    const withdAmt = withdrawlsum && withdrawlsum.length > 0 ? withdrawlsum[0].totalAmount : 0
    const depositeAmt = depositesum && depositesum.length > 0 ? depositesum[0].totalAmount : 0
    const Balance_ = ac && ac.length > 0 ? ac[0].totalAmount : 0
    const pnl_ =
      pnl && pnl.length > 0
        ? pnl[0].totalAmount +
        withdAmt +
        depositeAmt -
        (userCr && userCr.creditRefrences ? parseInt(userCr.creditRefrences) : 0)
        : 0
    ////const bal = await Balance.findOne({ userId: userId }).select({ profitLoss: 1 })
    //// const pnl_ = bal?.profitLoss ? bal?.profitLoss : 0

    return this.success(res, { Balance_, pnl_, depositesum, withdrawlsum, pnl }, '')
  }

  getCasPlayUrl = async (req: Request, res: Response) => {
    const { lobby_url, isMobile, ipAddress } = req.body
    const userInfo: any = req.user

    const gameInfo: any = await CasCasino.findOne({
      game_identifier: lobby_url,
    })
    if (gameInfo) {

      const payload = {
        user: userInfo.username,
        token: 'NOt_AVIALBEL',
        partner_id: 'NOt_AVIALBEL',
        platform: isMobile ? 'GPL_MOBILE' : "GPL_DESKTOP",
        lobby_url: lobby_url,
        lang: 'en',
        ip: ipAddress,
        game_id: lobby_url,
        game_code: lobby_url,
        currency: 'INR',
        id: userInfo._id,
        balance: '0.00',
      }
      console.log(JSON.stringify(payload))
      return axios
        .post('PROVIDER_URL', payload)
        .then((resData) => {
          const data = resData?.data
          if (data?.message != "failed") {
            this.success(
              res,
              { gameInfo: gameInfo, payload: payload, url: resData?.data?.url },
              'Data Found',
            )

          } else {
            this.fail(res, "Game Not Found")

          }
        })
    } else {
      this.fail(res, "Game Not Found")
    }
  }
}
