import { Request, Response } from 'express'
import { ApiController } from './ApiController'
import { Bet, BetOn } from '../models/Bet'
import { User } from '../models/User'
import { RoleType } from '../models/Role'
import { Market } from '../models/Market'
import { Balance } from '../models/Balance'
var ObjectId = require('mongoose').Types.ObjectId

export class UserBookController extends ApiController {
  getfancybook = async (req: Request, res: Response) => {
    const user: any = req.user
    const body: any = req.body
    const userChilds = await User.find(
      { parentStr: { $elemMatch: { $eq: new ObjectId(user._id) } }, role: RoleType.user },
      { _id: 1 },
    )
    const useridmap: any = []
    userChilds.map((Item) => useridmap.push(new ObjectId(Item._id)))
    useridmap.push(user._id)

    const matchfilter = {
      matchId: parseInt(body.matchId),
      selectionId: parseInt(body.selectionId),
      userId: { $in: useridmap },
      status: 'pending',
    }
    const betlist: any = await Bet.find(matchfilter, { odds: 1, pnl: 1, loss: 1, isBack: 1 }).lean()
    let minOdds: number = 0
    let maxOdds: number = 0
    const promiseminmax = betlist.map((item1: any, index: number) => {
      if (index === 0) {
        minOdds = parseInt(item1.odds)
        maxOdds = parseInt(item1.odds)
      } else {
        minOdds = parseInt(item1.odds) < minOdds ? parseInt(item1.odds) : minOdds
        maxOdds = parseInt(item1.odds) > maxOdds ? parseInt(item1.odds) : maxOdds
      }
    })
    await Promise.all(promiseminmax)
    minOdds = minOdds - 1 >= 0 ? minOdds - 1 : 0
    maxOdds = maxOdds + 1
    let new_showdata: any = {}
    const promiseposition = betlist.map((item1: any, index: number) => {
      if (!item1.isBack) {
        for (let i = minOdds; i <= maxOdds; i++) {
          if (new_showdata[i] == undefined) {
            new_showdata[i] = 0
          }
          if (i < item1.odds) {
            new_showdata[i] = new_showdata[i] + +item1.pnl
          } else {
            new_showdata[i] = new_showdata[i] + +item1.loss
          }
        }
      } else {
        for (let i = minOdds; i <= maxOdds; i++) {
          if (new_showdata[i] == undefined) {
            new_showdata[i] = 0
          }
          if (i >= item1.odds) {
            new_showdata[i] = new_showdata[i] + +item1.pnl
          } else {
            new_showdata[i] = new_showdata[i] + +item1.loss
          }
        }
      }
    })
    await Promise.all(promiseposition)
    return this.success(res, { ...new_showdata })
  }

  getmarketanalysis = async (req: Request, res: Response) => {
    const user: any = req.user
    // {parentStr:{"$elemMatch": { "$eq":new ObjectId(user._id)}}}
    const userChilds = await User.find(
      { parentStr: { $elemMatch: { $eq: new ObjectId(user._id) } }, role: RoleType.user },
      { _id: 1 },
    )
    const useridmap: any = []
    userChilds.map((Item) => useridmap.push(new ObjectId(Item._id)))
    const matchfilter: any = {
      $match: {
        bet_on: { $in: [BetOn.MATCH_ODDS, BetOn.FANCY] },
        userId: { $in: useridmap },
        status: 'pending',
      },
    }
    const groupfilter = {
      $group: {
        _id: '$matchId',
        betCount: { $sum: 1 },
        matchName: { $first: '$matchName' },
        allBets: {
          $push: {
            userId: '$userId',
            odds: '$odds',
            stack: '$stack',
            bet_on: '$bet_on',
            isBack: '$isBack',
            selectionName: '$selectionName',
            marketId: '$marketId',
            selectionId: '$selectionId',
            ratioStr: '$ratioStr',
          },
        },
      },
    }
    const betlist: any = await Bet.aggregate([matchfilter, groupfilter])

    let filterMatchId: any = []
    betlist.map((ItemMatch: any) => {
      filterMatchId.push(parseInt(ItemMatch._id))
    })

    const marketlist: any = await Market.find(
      { matchId: { $in: filterMatchId } },
      { marketId: 1, matchId: 1, marketName: 1, runners: 1 },
    )

    let completeBookList: any = []
    const bookpromise = betlist.map(async (Item: any) => {
      let matchPl = { matchName: Item.matchName, betCount: Item.betCount, matchId: Item._id }
      let matchWiseMarket: any = {}
      let completemarket_list: any = []
      const filterMarketByMatch = marketlist.filter((ItemMarket: any) => {
        return ItemMarket.matchId == Item._id
      })

      const filterMarketByMatchPromise = filterMarketByMatch.map(async (ItemMarketListNew: any) => {
        const filterBetlist = Item.allBets.filter((ItemBetsFilter: any) => {
          return ItemBetsFilter.marketId == ItemMarketListNew.marketId
        })
        if (filterBetlist.length > 0) {
          completemarket_list.push(ItemMarketListNew.marketId)
        }
        const betPromise = filterBetlist.map(async (ItemBet: any) => {
          const allRatio = ItemBet.ratioStr.allRatio
          const filterSelfRatio = allRatio.filter(
            (ItemN: any) => ItemN.parent.toString() == user._id,
          )[0]
          if (filterSelfRatio != undefined) {
            let parentRatio: any = filterSelfRatio.ratio
            let getOdds: any = ItemBet.odds
            let lossAmt: any = ItemBet.stack * (parentRatio / 100)
            let profitAmt = (getOdds - 1) * lossAmt * (parentRatio / 100)
            const filterMarket = filterMarketByMatch.filter((ItemMarket: any) => {
              return ItemMarket.marketId == ItemBet.marketId
            })
            const promiseMarket = filterMarket.map(async (ItemMarketList: any) => {
              ItemMarketList.runners.map((ItemRunners: any) => {
                let selectionId: any = ItemRunners.selectionId
                if (!matchWiseMarket[ItemMarketList.marketId + '_' + selectionId]) {
                  matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] = 0
                }

                if (selectionId == ItemBet.selectionId) {
                  if (ItemBet.isBack) {
                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] + profitAmt
                  } else {
                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] - profitAmt
                  }
                } else {
                  if (ItemBet.isBack) {
                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] - lossAmt
                  } else {
                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] + lossAmt
                  }
                }
              })
            })
            await Promise.all(promiseMarket)
          }
        })
        await Promise.all(betPromise)
      })
      await Promise.all(filterMarketByMatchPromise)
      matchPl = {
        ...matchPl,
        ...{
          matchWiseMarket: matchWiseMarket,
          filterMarketByMatch: filterMarketByMatch,
          completemarket_list: completemarket_list,
        },
      }
      completeBookList.push(matchPl)
    })
    await Promise.all(bookpromise)
    return this.success(res, completeBookList)
  }

  getuserbook = async (req: Request, res: Response) => {
    const user: any = req.user
    const currentUser: any = await User.findOne({ _id: new ObjectId(user._id) })
    const currentBalance: any = await Balance.findOne({ userId: new ObjectId(user._id) })
    const ratio: any = currentUser.partnership[4].allRatio.filter(
      (Item: any) => Item.parent == user._id.toString(),
    )[0].ratio

    const currentpartnership = parseInt(ratio)
    const select = {
      _id: 1,
      username: 1,
      parentId: 1,
      role: 1,
      creditRefrences: 1,
      'balance.balance': 1,
      'balance.exposer': 1,
      'balance.profitLoss': 1,
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
    const users = await User.aggregate([
      {
        $match: {
          parentId: user?._id,
          parentStr: { $elemMatch: { $eq: new ObjectId(user._id) } },
        },
      },
      ...aggregateFilter,
    ])

    const currentcredit = parseInt(currentUser.creditRefrences)
    const currentbalance = parseFloat(currentBalance.balance)
    const currentpl = parseFloat(currentBalance.profitLoss)
    let clientData = {
      uplevelcr: currentcredit,
      totalmasterb: 0,
      availableB: 0,
      downlineob: 0,
      upperlvell: 0,
      avpl: 0,
      downcr: 0,
      downpl: 0,
      mypl: 0,
    }
    let totalmasterb: number = 0
    let availableB: number = 0
    let downcr: number = 0
    let upperlvell: number = 0
    let downbalance: number = 0
    let availableBalancepl = 0
    let downlevelpl = 0
    let totalexposer = 0
    const calculatepl = users.map((Item: any) => {
      const selflevelcredit = parseInt(Item.creditRefrences)
      const balance = Item.balance?.balance || 0
      const exposer = Item.balance?.exposer || 0
      const clientpl = Item.balance?.profitLoss || 0
      ///upperlvell += -(balance - selflevelcredit)
      ///totalmasterb = (balance - selflevelcredit) + currentcredit
      downcr = downcr + +selflevelcredit
      downbalance = downbalance + +(selflevelcredit + +clientpl)
      availableBalancepl += balance - exposer
      totalexposer += exposer
      downlevelpl += clientpl
    })
    Promise.all(calculatepl)

    availableB = currentbalance
    upperlvell = -currentpl

    totalmasterb = currentcredit + +currentpl
    const downlineob = downbalance
    /// const upperlvell = parentuser.creditRefrences - totalmasterb;
    /// const avpl = availableBalancepl;

    const avpl = availableB

    const downpl = -downlevelpl
    const mypl = (downpl * currentpartnership) / 100
    clientData = {
      ...clientData,
      ...{ totalmasterb, availableB, downlineob, upperlvell, avpl, downcr, downpl, mypl },
    }
    return this.success(res, clientData)
  }
  getFinalSuperParentId = async (parentId: string, parentStr: any) => {
    return ""
  }
  getUserWiseBook = async (req: Request, res: Response) => {
    const user: any = req.user
    const body: any = req.body
    const firstUserChilds = await User.find(
      { parentId: new ObjectId(user._id) },
      { _id: 1, username: 1, role: 1 },
    ).lean()
    const finaluserdata: any = []
    let userLink: any = {}
    let completeBookList: any = []
    const filterMarketByMatch: any = await Market.find(
      { matchId: body.matchId, marketId: body.selectionId },
      { marketId: 1, matchId: 1, marketName: 1, runners: 1 },
    )
    const userPromise = firstUserChilds.map(async (ItemUser: any) => {
      const useridmap: any = []
      let selfUserId: any = []
      if (ItemUser.role == RoleType.user) {
        useridmap.push(new ObjectId(ItemUser._id))
        selfUserId.push(new ObjectId(ItemUser._id))
        userLink[ItemUser._id] = ItemUser._id
      } else {
        const userChilds = await User.find(
          { parentStr: { $elemMatch: { $eq: new ObjectId(ItemUser._id) } }, role: RoleType.user },
          { _id: 1, parentId: 1, parentStr: 1 },
        ).lean()

        userChilds.map((ItemN: any) => {
          useridmap.push(new ObjectId(ItemN._id))
          selfUserId.push(new ObjectId(ItemN._id))
          userLink[ItemN._id] = ItemUser._id
        })
      }
      ItemUser = { ...ItemUser, ...{ child: selfUserId } }

      console.log(finaluserdata, "finaluserdata")
      const matchfilter = {
        $match: {
          bet_on: BetOn.MATCH_ODDS,
          userId: { $in: useridmap },
          status: 'pending',
          matchId: body.matchId,
          marketId: body.selectionId,
        },
      }
      const groupfilter = {
        $group: {
          _id: '$marketId',
          betCount: { $sum: 1 },
          userName: { $first: '$userName' },
          matchName: { $first: '$matchName' },
          matchId: { $first: '$matchId' },
          allBets: {
            $push: {
              userId: '$userId',
              odds: '$odds',
              stack: '$stack',
              bet_on: '$bet_on',
              isBack: '$isBack',
              selectionName: '$selectionName',
              marketId: '$marketId',
              selectionId: '$selectionId',
              ratioStr: '$ratioStr',
            },
          },
        },
      }
      const betlist: any = await Bet.aggregate([matchfilter, groupfilter])

      const bookpromise = betlist.map(async (Item: any) => {
        let matchPl = {
          matchName: Item.matchName,
          betCount: Item.betCount,
          matchId: Item.matchId,
          marketId: body.selectionId,
        }
        let matchWiseMarket: any = {}
        let completemarket_list: any = []

        const filterMarketByMatchPromise = filterMarketByMatch.map(async (ItemMarketListNew: any) => {
          const filterBetlist = Item.allBets.filter((ItemBetsFilter: any) => {
            return ItemBetsFilter.marketId == ItemMarketListNew.marketId
          })
          if (filterBetlist.length > 0) {
            completemarket_list.push(ItemMarketListNew.marketId)
          }
          const betPromise = filterBetlist.map(async (ItemBet: any) => {
            const allRatio = ItemBet.ratioStr.allRatio
            const filterSelfRatio = allRatio.filter(
              (ItemN: any) => ItemN.parent.toString() == user._id,
            )[0]
            if (filterSelfRatio != undefined) {
              let parentRatio: any = filterSelfRatio.ratio
              parentRatio = 100;
              let getOdds: any = ItemBet.odds
              let lossAmt: any = ItemBet.stack * (parentRatio / 100)
              let profitAmt = (getOdds - 1) * ItemBet.stack * (parentRatio / 100)
              const filterMarket = filterMarketByMatch.filter((ItemMarket: any) => {
                return ItemMarket.marketId == ItemBet.marketId
              })
              const promiseMarket = filterMarket.map(async (ItemMarketList: any) => {
                ItemMarketList.runners.map((ItemRunners: any) => {
                  let selectionId: any = ItemRunners.selectionId
                  if (!matchWiseMarket[ItemBet.userId]) {
                    matchWiseMarket[ItemBet.userId] = {}
                  }
                  if (!matchWiseMarket[ItemMarketList.marketId + '_' + selectionId]) {
                    matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] = 0
                  }
                  if (selectionId == ItemBet.selectionId) {
                    if (ItemBet.isBack) {
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                        matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] +
                        profitAmt
                    } else {
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                        matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] -
                        profitAmt
                    }
                  } else {
                    if (ItemBet.isBack) {
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                        matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] -
                        lossAmt
                    } else {
                      matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] =
                        matchWiseMarket[ItemMarketList.marketId + '_' + selectionId] +
                        lossAmt
                    }
                  }
                })
              })
              await Promise.all(promiseMarket)
            }
          })
          await Promise.all(betPromise)
        })
        await Promise.all(filterMarketByMatchPromise)
        // const superParentId = userLink[Item._id]
        let userInfo = { username: '', superParentId: ItemUser._id }
        // if (superParentId != undefined) {
        //   const filterSuperUser = finaluserdata.filter(
        //     (ItemUserN: any) => ItemUserN._id == superParentId,
        //   )
        //   console.log(filterSuperUser, "filterSuperUser")
        //   // if (filterSuperUser.length > 0) {
        //   // }
        // }
        userInfo['username'] = ItemUser.username

        matchPl = {
          ...matchPl,
          ...matchWiseMarket,
          ...userInfo,
        }
        completeBookList.push(matchPl)
      })
      await Promise.all(bookpromise)
      finaluserdata.push(ItemUser)
    })
    await Promise.all(userPromise)
    let dataset: any = []
    const data = completeBookList.map((Item: any, index: number) => {
      if (dataset.length > 0) {
        ///   const findIndex = dataset.filter((ItemMatch:any) => ItemMatch.matchId);
      } else {
        dataset.push(Item)
      }
    })

    return this.success(res, {
      markets: filterMarketByMatch[0].runners,
      completeBookList: completeBookList,
    })
  }
}
