import { Request, Response } from 'express'
import { ApiController } from './ApiController'
import { Casino, ICasinoMatchModel } from '../models/CasinoMatches'
import axios from 'axios'
import { Bet, BetOn, IBet } from '../models/Bet'
const ObjectId = require('mongoose').Types.ObjectId
import { FancyController } from './FancyController'
import UserSocket from '../sockets/user-socket'
import { Types } from 'mongoose'
import cachegoose from 'recachegoose'
import { AccoutStatement } from '../models/AccountStatement'
import { CasinoGameResult } from '../models/CasinoGameResult'
import { CasCasino } from '../models/CasCasino'

setInterval(() => {
  try {
    new CasinoController().setResultByTimePeriod()
  } catch (e) {}
}, 3000)

export class CasinoController extends ApiController {
  getCasinoList = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const games = await Casino.find({ status: { $in: [1] } })
        .sort({ order: 1 })
        .select({ match_id: 1, slug: 1, title: 1, image: 1, isDisable: 1, order: 1 })
      // @ts-ignore
      // .cache(0, 'casino-all-new-1')
      this.success(res, games, 'Data Found')
    } catch (e: unknown) {
      const err = e as Error
      this.fail(res, err.message)
    }
  }

  public getCasinoIntList = async (req: Request, res: Response) => {
    const { type, provider, category } = req?.query
    try {
      let slotCat = []
      var condition = {};
      var providerCondition = {};
      if (type == 'slots') {
        condition = { game_status: "active", game_slot_status: true, game_name: { $not: /Mobile/i } }
      } else if (type == 'live-casino') {
        condition = { game_status: "active", game_slot_status: false, game_name: { $not: /Mobile/i } }
      } else if (type == 'virtual-casino') {
        const regexPattern = /(20-20 DTL|Bollywood|Lucky 7|Virtual)/i;
        condition = { game_status: "active", game_slot_status: false, game_name: { $regex: regexPattern, $not: /Mobile/i } }
      } else if (type == 'fantasy') {
        const regexPattern = /(Aviator|Crash)/i;
        condition = { game_status: "active", game_slot_status: false, game_name: { $regex: regexPattern, $not: /Mobile/i } }
      }
      
      providerCondition = condition
    

      


      //@ts-ignore
      const providers = await CasCasino.aggregate([{
        $match: providerCondition
      }, {
        $group: {
          _id: "$game_provider",
          game_image: { $first: "$game_image" }
        }
      }, {
        $sort: {
          _id: 1
        }
      }])

      
      const firstProvider = providers?.[0]
      console.log(firstProvider)
      
      if (provider != "undefined" && provider != "null") {
        condition = { ...condition, game_provider: provider }
      }else{
        condition = {
          ...condition,
          game_provider: firstProvider._id
        }
      }

      const category = await CasCasino.aggregate([{
        $match: condition
      }, {
        $group: {
          _id: "$game_category",
        }
      }, {
        $sort: {
          _id: 1
        }
      }])
      const games = await CasCasino.aggregate([{ $match: condition }, {
        $group: {
          _id: "$game_identifier",
          "identifier": { $first: "$game_identifier" },
          "game_images": { $first: "$game_image" },
          "provider_id": { $first: "$game_provider" },
          "provider": { $first: "$game_name" },
          "game_name": { $first: "$game_name" },
          "live_category": { $first: "$game_category" },
          "slot_category": { $first: "$game_category" },
          "image_url": { $first: "$game_image" },
        }
      }, {
        $sort: {
          game_name: 1
        }
      }]);
      const providerdata = { "message": "ok", "result": games, "providers": providers, "status": "success", "category":category };
      return res.status(200).json(providerdata)

    } catch (e) {
      // console.log(e);
      return res.status(200).json({ "message": "failed", "result": [] })
    }
  }
 

  getCasinoData = async (req: Request, res: Response) => {
    try {
      const body: any = req.params
      const games = await Casino.findOne({ slug: body.slug })
      this.success(res, games, 'Data Found')
    } catch (e: unknown) {
      const err = e as Error
      this.fail(res, err.message)
    }
  }
  // Todo: If you modified any code in setResult function so you need to change below as well
  setResult = async (req: Request, res: Response) => {
    try {
      const { casinoType, matchId, beforeResultSet } = req.params

      if (!casinoType) this.fail(res, 'Casino type is required field')
      // const resultUrl = beforeResultSet
      //   ? `https://casino.drsgames.io/api/results/${casinoType}/${beforeResultSet}`
      //   : `https://casino.drsgames.io/api/results/${casinoType}`

      // const getPendingResults = await axios.get(`${resultUrl}`)
      await CasinoGameResult.updateMany(
        { 'data.status': 'pending' },
        { $set: { 'data.status': 'processing' } },
      )
      return this.success(res, { processing: true })
      const getPendingResults: any = await CasinoGameResult.find({ status: 'processing' })

      let getAllMatchIds = getPendingResults.map((m: any) => m.mid)

      if (matchId) getAllMatchIds = [matchId]
      const bets: any = await Bet.find({ marketId: { $in: getAllMatchIds } }).lean()
      const notBetsMatchId = getAllMatchIds.filter(
        (o1: any) => !bets.some((o2: any) => o1 === o2.marketId),
      )
      const BetsMatchId = getAllMatchIds.filter((o1: any) =>
        bets.some((o2: any) => o1 === o2.marketId),
      )
      notBetsMatchId.map(async (mid: string) => {
        await CasinoGameResult.updateMany(
          { mid: mid, gameType: casinoType },
          { $set: { 'data.status': 'done', 'data.result-over': 'done' } },
        )
      })
      // Todo: (isBack===true && selectioId===sid)? profit: ((isBack===false && ?selectioId!==sid)?profit:loss)

      const fancyController = new FancyController()
      let winnerString: string = ''
      await getPendingResults.data.data.map(
        async ({
          mid: marketId,
          result: selectionId,
          resultsids,
          sid50,
          overResult,
          ...rest
        }: any) => {
          if (BetsMatchId.indexOf(marketId) > -1) {
            let winSids: any = []
            if (!selectionId && resultsids && resultsids.length > 0) {
              if (casinoType === 'fivewicket')
                winSids = resultsids.split(',').map((i: any) => +i.replace('SID', ''))
              else if (casinoType === 'Superover') winSids = [1, 2, 7, 9]
            }
            let conditionFilterBet: any = {
              status: 'pending',
              bet_on: BetOn.CASINO,
              marketId: marketId,
            }
            if (overResult) {
              conditionFilterBet = { ...conditionFilterBet, ...{ fancystatus: 'yes' } }
            }
            const userbet: any = await Bet.aggregate([
              {
                $match: conditionFilterBet,
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
              if (rest.gameType === 'fivewicket' || rest.gameType === 'Superover')
                allbets = Item.allBets.filter((b: any) => {
                  if (casinoType === 'fivewicket') return winSids.indexOf(b.selectionId) > -1
                  else if (casinoType === 'Superover') return winSids.indexOf(b.selectionId) > -1
                })

              const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
                let { profitLoss: profitLossAmt } = this.canculatePnl({
                  ItemBetList,
                  selectionId,
                  sid50,
                  resultsids:
                    casinoType != 'worlimatka'
                      ? resultsids
                        ? resultsids.split(',')
                        : null
                      : resultsids,
                  data: rest,
                })

                let type_string: string = ItemBetList.isBack ? 'Back' : 'Lay'
                let profitlossStatus = profitLossAmt >= 0 ? 'profit' : 'loss'
                let narration: string =
                  ItemBetList.matchName +
                  ' / Rno-' +
                  ItemBetList.marketId +
                  ', ' +
                  profitlossStatus +
                  '  [ winner: ' +
                  rest?.winnersString +
                  '] '

                winnerString = rest?.winnersString
                // +
                // ItemBetList.selectionName +
                // ' / ' +
                // type_string +
                // ' / ' +
                // selectionId
                //For casino game sport id should be 5000
                await fancyController.addprofitlosstouser({
                  userId: ObjectId(Item._id),
                  bet_id: ObjectId(ItemBetList._id),
                  profit_loss: isNaN(profitLossAmt) ? 0 : profitLossAmt,
                  matchId: ItemBetList.matchId,
                  narration,
                  sportsType: ItemBetList.sportId,
                  selectionId: ItemBetList.marketId,
                  sportId: 5000,
                })
                await Bet.updateOne(
                  { _id: new Types.ObjectId(ItemBetList._id) },
                  { $set: { pnl: isNaN(profitLossAmt) ? 0 : profitLossAmt } },
                )
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

            let query: any = {
              userId: { $in: userIdList },
              //matchId: matchId,
              bet_on: BetOn.CASINO,
              marketId: marketId,
            }

            if (!selectionId && resultsids && resultsids.length > 0) {
              if (casinoType == 'fivewicket')
                query['selectionId'] = {
                  $in: resultsids.split(',').map((i: any) => +i.replace('SID', '')),
                }
              if (casinoType == 'Superover')
                query['selectionId'] = {
                  $nin: [1, 2, 7, 9],
                }
            }
            if ((casinoType == 'fivewicket' || casinoType == 'Superover') && winnerString) {
              // await AccoutStatement.updateMany(
              //   { selectionId: marketId },
              //   {
              //     $set: {
              //       narration: {
              //         $regexReplace: {
              //           input: '$narration',
              //           find: 'undefined',
              //           replacement: winnerString,
              //         },
              //       },
              //     },
              //   },
              // )
            }

            await Promise.all(declare_result)
            await Bet.updateMany(query, { $set: { status: 'completed' } })
            const unique = [...new Set(userIdList)]
            if (unique.length > 0) {
              await fancyController.updateUserAccountStatementCasino(unique, parentIdList)
            }

            await CasinoGameResult.updateMany(
              { mid: marketId, gameType: casinoType },
              { $set: { 'data.status': 'done', 'data.result-over': 'done' } },
            )
          }
        },
      )

      this.success(res, {
        notBetsMatchId: notBetsMatchId.length,
        getAllMatchIds: getAllMatchIds.length,
      })
    } catch (e: unknown) {
      const err = e as Error
      this.fail(res, err.message)
    }
  }

  // Todo: If any code modification so you need to modify above as well
  setResultByCron = async (req: Request, res: Response) => {
    try {
      const bets: any = await Bet.find({ status: 'pending', bet_on: BetOn.CASINO }).lean()
      const getAllMatchIds = bets.map((data: any) => data.marketId)
      if (getAllMatchIds.length <= 0) return
      const getPendingResults = await CasinoGameResult.find({ mid: { $in: getAllMatchIds } })

      this.setPendingResult(getPendingResults)

      this.success(res, {
        notBetsMatchId: 0,
        getAllMatchIds: 0,
      })
    } catch (e: unknown) {
      const err = e as Error
      this.fail(res, err.message)
    }
  }

  setResultByTimePeriod = async () => {
    try {
      const getPendingResults = await CasinoGameResult.find({
        'data.status': ['processing'],
      })

      this.setPendingResult(getPendingResults)
    } catch (e: unknown) {}
  }

  setPendingResult = (getPendingResults: any, redisData = false) => {
    const fancyController = new FancyController()
    let winnerString: string = ''
    getPendingResults.map(async (casinoResultData: any) => {
      casinoResultData = redisData ? { data: casinoResultData } : casinoResultData
      let { mid: marketId, result: selectionId, resultsids, sid50, ...rest } = casinoResultData.data
      let winSids: any = []
      const casinoType = casinoResultData.gameType
      if (!selectionId && resultsids && resultsids.length > 0) {
        if (casinoType === 'fivewicket')
          winSids = resultsids.split(',').map((i: any) => +i.replace('SID', ''))
        else if (casinoType === 'Superover') winSids = [1, 2, 7, 9]
      }
      const userbet: any = await Bet.aggregate([
        {
          $match: {
            status: 'pending',
            bet_on: BetOn.CASINO,
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
        if ((rest.gameType === 'fivewicket' || rest.gameType === 'Superover') && !selectionId) {
          allbets = Item.allBets.filter((b: any) => {
            if (casinoType === 'fivewicket') return winSids.indexOf(b.selectionId) > -1
            else if (casinoType === 'Superover') return winSids.indexOf(b.selectionId) > -1
          })
        }

        const settle_single = allbets.map(async (ItemBetList: any, indexBetList: number) => {
          let { profitLoss: profitLossAmt } = this.canculatePnl({
            ItemBetList,
            selectionId,
            sid50,
            resultsids:
              casinoType != 'worlimatka' ? (resultsids ? resultsids.split(',') : null) : resultsids,
            data: rest,
          })

          let type_string: string = ItemBetList.isBack ? 'Back' : 'Lay'
          let profitlossStatus = profitLossAmt >= 0 ? 'profit' : 'loss'
          let narration: string =
            ItemBetList.matchName +
            ' / Rno-' +
            ItemBetList.marketId +
            ', ' +
            profitlossStatus +
            '  [ winner: ' +
            rest?.winnersString +
            '] '

          winnerString = rest?.winnersString
          // +
          // ItemBetList.selectionName +
          // ' / ' +
          // type_string +
          // ' / ' +
          // selectionId
          //For casino game sport id should be 5000
          await fancyController.addprofitlosstouser({
            userId: ObjectId(Item._id),
            bet_id: ObjectId(ItemBetList._id),
            profit_loss: isNaN(profitLossAmt) ? 0 : profitLossAmt,
            matchId: ItemBetList.matchId,
            narration,
            sportsType: ItemBetList.sportId,
            selectionId: ItemBetList.marketId,
            sportId: 5000,
          })
          await Bet.updateOne(
            { _id: new Types.ObjectId(ItemBetList._id) },
            { $set: { pnl: isNaN(profitLossAmt) ? 0 : profitLossAmt } },
          )
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

      let query: any = {
        userId: { $in: userIdList },
        //matchId: matchId,
        bet_on: BetOn.CASINO,
        marketId: marketId,
      }

      if (!selectionId && resultsids && resultsids.length > 0) {
        if (casinoType == 'fivewicket')
          query['selectionId'] = {
            $in: resultsids.split(',').map((i: any) => +i.replace('SID', '')),
          }
        if (casinoType == 'Superover')
          query['selectionId'] = {
            $nin: [1, 2, 7, 9],
          }
      }
      if ((casinoType == 'fivewicket' || casinoType == 'Superover') && winnerString) {
        // await AccoutStatement.updateMany(
        //   { selectionId: marketId },
        //   {
        //     $set: {
        //       narration: {
        //         $regexReplace: {
        //           input: '$narration',
        //           find: 'undefined',
        //           replacement: winnerString,
        //         },
        //       },
        //     },
        //   },
        // )
      }

      await Promise.all(declare_result)
      await Bet.updateMany(query, { $set: { status: 'completed' } })
      const unique = [...new Set(userIdList)]
      if (unique.length > 0) {
        await fancyController.updateUserAccountStatementCasino(unique, parentIdList)
      }

      await CasinoGameResult.updateMany(
        { mid: marketId, gameType: casinoType },
        { $set: { 'data.status': 'done', 'data.result-over': 'done' } },
      )
    })
  }

  canculatePnl = ({ ItemBetList, selectionId, sid50, resultsids, data }: any) => {
    sid50 = sid50 ? sid50.split(',') : ''
    let profit_type = 'loss',
      profitLossAmt = 0
    let fancy = false
    switch (ItemBetList.gtype) {
      case 'queen':
      case 'card32':
      case 'card32a':
        profit_type =
          ItemBetList.isBack === true && ItemBetList.selectionId == selectionId
            ? 'profit'
            : ItemBetList.isBack === false && ItemBetList.selectionId != selectionId
            ? 'profit'
            : 'loss'
        if (profit_type == 'profit') {
          if (ItemBetList.isBack === true) {
            profitLossAmt =
              (parseFloat(ItemBetList.odds.toString()) - 1) *
              parseFloat(ItemBetList.stack.toString())
          } else if (ItemBetList.isBack === false) {
            profitLossAmt = parseFloat(ItemBetList.stack.toString())
          }
        } else if (profit_type == 'loss') {
          if (ItemBetList.isBack === true) {
            profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1
          } else if (ItemBetList.isBack === false) {
            profitLossAmt =
              (parseFloat(ItemBetList.odds.toString()) - 1) *
              parseFloat(ItemBetList.stack.toString()) *
              -1
          }
        }
        break
      case 'lucky7':
      case 'lucky7B':
      case 'ddb':
      case 'aaa':
      case 'AAA':
      case 'dt20':
      case 'dt20b':
      case 'dtl20':
      case 'dragontiger1Day':
      case 'cmeter2020':
      case 'card32b':
      case 'warcasino':
      case 'Andarbahar':
      case 'Andarbahar2':
        if (resultsids) {
          let totalPoints = 0
          profit_type =
            ItemBetList.isBack === true && resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
              ? 'profit'
              : ItemBetList.isBack === false &&
                !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
              ? 'profit'
              : 'loss'

          if (ItemBetList.gtype == 'cmeter2020') {
            totalPoints = parseInt(data.C1) - parseInt(data.C2)
            if (Math.abs(totalPoints) > 50) totalPoints = 50
            profit_type = `SID${ItemBetList.selectionId}` === data.resultsids ? 'profit' : 'loss'

            // CMeter20 9HH and 10HH win logic
            if (ItemBetList.selectionId == 1 && data.C3 == 1) {
              totalPoints = totalPoints - 18
              profit_type = parseInt(data.C1) - 9 > parseInt(data.C2) + 9 ? 'profit' : 'loss'
            }

            if (ItemBetList.selectionId == 2 && data.C4 == 1) {
              totalPoints = totalPoints + 20
              profit_type = parseInt(data.C2) - 10 > parseInt(data.C1) + 10 ? 'profit' : 'loss'
            }
          }

          if (profit_type == 'profit') {
            if (ItemBetList.isBack === true) {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
            } else {
              profitLossAmt = parseFloat(ItemBetList.stack.toString())
            }
          } else if (profit_type == 'loss') {
            profitLossAmt = parseFloat(ItemBetList.loss.toString())

            if (ItemBetList.isBack === false) {
              profitLossAmt = -(
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
              )
            }
          }

          if (sid50 && (ItemBetList.gtype !== 'dt20' || ItemBetList.gtype !== 'dt20b')) {
            profitLossAmt = sid50.includes(`SID${ItemBetList.selectionId}`)
              ? (ItemBetList.stack / 2) * -1
              : profitLossAmt
          }

          if (sid50 && (ItemBetList.gtype === 'dt20' || ItemBetList.gtype === 'dt20b')) {
            profitLossAmt = sid50.includes(`SID${ItemBetList.selectionId}`)
              ? (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
              : profitLossAmt
          }

          if (
            ItemBetList.gtype === 'ddb' &&
            ItemBetList.selectionId == 7 &&
            ItemBetList.isBack === false &&
            data['C1'].slice(0, -2) === 'Q'
          ) {
            profitLossAmt = parseFloat(ItemBetList.stack.toString())
          }

          if (ItemBetList.gtype === 'cmeter2020') {
            if (profit_type == 'profit') {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString()) *
                Math.abs(totalPoints)
            } else {
              profitLossAmt =
                -(parseFloat(ItemBetList.odds.toString()) - 1.15) *
                parseFloat(ItemBetList.stack.toString()) *
                Math.abs(totalPoints)
            }

            ItemBetList.volume = profit_type === 'profit' ? totalPoints : -Math.abs(totalPoints)
          }
        }
        break
      case 'baccarat':
      case 'baccarat2':
        if (resultsids) {
          profit_type = resultsids.indexOf(`sid${ItemBetList.selectionId}`) > -1 ? 'profit' : 'loss'
          if (profit_type == 'profit') {
            profitLossAmt = parseFloat(ItemBetList.pnl)
            if (ItemBetList.odds == 1)
              profitLossAmt =
                parseFloat(ItemBetList.odds.toString()) * parseFloat(ItemBetList.stack.toString())
            else if (ItemBetList.odds > 0 || ItemBetList.odds < 1)
              profitLossAmt =
                (parseFloat('1') + parseFloat(ItemBetList.odds.toString())) *
                  parseFloat(ItemBetList.stack.toString()) -
                parseFloat(ItemBetList.stack.toString())
            else
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
          } else if (profit_type == 'loss') {
            profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1
          }
          if (selectionId == 3 && (ItemBetList.selectionId == 1 || ItemBetList.selectionId == 2)) {
            profitLossAmt = 0
            profit_type = 'profit'
          }
          if (sid50) {
            profitLossAmt = sid50.includes(`sid${ItemBetList.selectionId}`)
              ? ItemBetList.stack / 2
              : profitLossAmt
          }
        }
        break
      case 'onedaypoker':
      case 'onedaypoker20':
      case 'Tp1Day':
      case 'teen20':
      case 'poker6player':
      case 'opentp':
      case 'testtp':
      case 'worliinstant':
        if (resultsids || selectionId) {
          if (ItemBetList.gtype === 'worliinstant' && ItemBetList.selectionId > 10) {
            ItemBetList.odds = 5
          }
          if (ItemBetList.gtype == 'Tp1Day') {
            ItemBetList.odds = ItemBetList.odds / 100 + 1
          }
          if (resultsids && resultsids.length > 0) {
            profit_type =
              ItemBetList.isBack === true &&
              resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
                ? 'profit'
                : ItemBetList.isBack === false &&
                  !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
                ? 'profit'
                : 'loss'
          } else {
            profit_type =
              ItemBetList.isBack === true && ItemBetList.selectionId == selectionId
                ? 'profit'
                : ItemBetList.isBack === false && ItemBetList.selectionId != selectionId
                ? 'profit'
                : 'loss'
          }

          if (profit_type == 'profit') {
            if (ItemBetList.isBack === true) {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
            } else if (ItemBetList.isBack === false)
              profitLossAmt = parseFloat(ItemBetList.stack.toString())

            if (ItemBetList.gtype === 'onedaypoker' || ItemBetList.gtype === 'teen20') {
              if (data.odds) {
                const oddsData = data.odds //JSON.parse(data.odds)
                if (oddsData && oddsData[`SID${ItemBetList.selectionId}`]) {
                  profitLossAmt =
                    parseFloat(oddsData[`SID${ItemBetList.selectionId}`]) *
                    parseFloat(ItemBetList.stack.toString())
                }
              }
            }
            // profitLossAmt =
            //   (parseFloat(ItemBetList.odds.toString()) - 1) *
            //   parseFloat(ItemBetList.stack.toString())
          } else if (profit_type == 'loss') {
            if (ItemBetList.isBack === true)
              profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1
            else {
              profitLossAmt =
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString()) *
                -1
            }

            if (ItemBetList.gtype == 'worliinstant') {
              if (ItemBetList.selectionId > 10) {
                profitLossAmt =
                  parseFloat(ItemBetList.odds.toString()) *
                  parseFloat(ItemBetList.stack.toString()) *
                  -1
              } else {
                profitLossAmt = parseFloat(ItemBetList.stack.toString()) * -1
              }
            }
          }
          if (data.abandoned) {
            profitLossAmt = 0
            profit_type = 'profit'
          }
          if (sid50) {
            profitLossAmt = sid50.includes(`SID${ItemBetList.selectionId}`)
              ? ItemBetList.stack / 2
              : profitLossAmt
          }
        }
        break
      case 'race2020':
        if (ItemBetList.selectionId == 5) {
          // This logic for total points
          profit_type =
            ItemBetList.isBack == false && parseInt(data.totalPoints) < parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          profit_type =
            ItemBetList.isBack == true && parseInt(data.totalPoints) >= parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          fancy = true
        } else if (ItemBetList.selectionId == 6) {
          // This logic for total cards
          profit_type =
            ItemBetList.isBack == false && parseInt(data.totalCards) < parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          profit_type =
            ItemBetList.isBack == true && parseInt(data.totalCards) >= parseInt(ItemBetList.odds)
              ? 'profit'
              : profit_type
          fancy = true
        } else {
          profit_type =
            ItemBetList.isBack === true && resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
              ? 'profit'
              : ItemBetList.isBack === false &&
                !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
              ? 'profit'
              : 'loss'
        }

        if (profit_type == 'profit') {
          if (fancy) {
            profitLossAmt = ItemBetList.isBack
              ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
              : ItemBetList.stack
          } else {
            profitLossAmt = ItemBetList.isBack
              ? (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
              : ItemBetList.stack
          }
        } else {
          if (fancy) {
            profitLossAmt = ItemBetList.isBack
              ? -ItemBetList.stack
              : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
          } else {
            profitLossAmt = ItemBetList.isBack
              ? -ItemBetList.stack
              : -(
                  (parseFloat(ItemBetList.odds.toString()) - 1) *
                  parseFloat(ItemBetList.stack.toString())
                )
          }
        }
        break
      case 'Superover':
      case 'fivewicket':
        // This sids for superover
        if ([3, 5].indexOf(parseInt(ItemBetList.selectionId.toString())) > -1) {
          fancy = true
        }
        if (
          ItemBetList.marketName.indexOf('Fancy Market') > -1 &&
          ItemBetList.gtype == 'fivewicket'
        ) {
          fancy = true
        }

        if (ItemBetList.marketName.indexOf('Fancy Market') > -1 && resultsids) {
          profit_type =
            ItemBetList.isBack === true && parseInt(data.totalRuns) >= parseInt(ItemBetList.odds)
              ? 'profit'
              : ItemBetList.isBack === false &&
                parseInt(data.totalRuns) < parseInt(ItemBetList.odds)
              ? 'profit'
              : 'loss'

          profitLossAmt = this.profitLossCalculation({
            ItemBetList,
            profit_type,
            profitLossAmt,
            fancy,
          })
        } else if (ItemBetList.marketName.indexOf('Fancy1 Market') > -1) {
          profit_type =
            ItemBetList.isBack === true && resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1
              ? 'profit'
              : ItemBetList.isBack === false &&
                !(resultsids.indexOf(`SID${ItemBetList.selectionId}`) > -1)
              ? 'profit'
              : 'loss'
          profitLossAmt = this.profitLossCalculation({
            ItemBetList,
            profit_type,
            profitLossAmt,
            fancy,
          })
        } else if (selectionId) {
          profit_type =
            ItemBetList.isBack === true && ItemBetList.selectionId == selectionId
              ? 'profit'
              : ItemBetList.isBack === false && ItemBetList.selectionId != selectionId
              ? 'profit'
              : 'loss'
          profitLossAmt = this.profitLossCalculation({
            ItemBetList,
            profit_type,
            profitLossAmt,
            fancy,
          })
        }
        break
      case 'Cards3J':
        const userCards = [ItemBetList.C1, ItemBetList.C2, ItemBetList.C3]
        const cardValues: any = {
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 'J',
          Q: 'Q',
          K: 'K',
          A: 1,
        }
        const resultCards = [
          cardValues[data.C1.slice(0, -2)],
          cardValues[data.C2.slice(0, -2)],
          cardValues[data.C3.slice(0, -2)],
        ]
        const winner = userCards.reduce((isCard, card) => {
          if (resultCards.includes(card)) isCard = true
          return isCard
        }, false)

        if (ItemBetList.isBack && winner) {
          profit_type = 'profit'
        } else if (ItemBetList.isBack === false && !winner) {
          profit_type = 'profit'
        } else {
          profit_type = 'loss'
        }

        if (profit_type == 'profit') {
          profitLossAmt = ItemBetList.isBack
            ? (parseFloat(ItemBetList.odds.toString()) - 1) *
              parseFloat(ItemBetList.stack.toString())
            : ItemBetList.stack
        } else {
          profitLossAmt = ItemBetList.isBack
            ? -ItemBetList.stack
            : -(
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
              )
        }
        break
      case 'cricket2020':
        const totalRuns = parseInt(ItemBetList.selectionId.toString()) + 1 + parseInt(selectionId)
        if (ItemBetList.isBack && totalRuns >= 12) {
          profit_type = 'profit'
        } else if (ItemBetList.isBack == false && totalRuns < 12) {
          profit_type = 'profit'
        }

        if (profit_type == 'profit') {
          profitLossAmt = ItemBetList.isBack
            ? (parseFloat(ItemBetList.odds.toString()) - 1) *
              parseFloat(ItemBetList.stack.toString())
            : ItemBetList.stack
        } else {
          profitLossAmt = ItemBetList.isBack
            ? -ItemBetList.stack
            : -(
                (parseFloat(ItemBetList.odds.toString()) - 1) *
                parseFloat(ItemBetList.stack.toString())
              )
        }
        break
      case 'worlimatka':
        const userCardsC1 = ItemBetList.C1
        const userCardsC3 = ItemBetList.C3
        const resultsData = data.resultsids
        if (resultsData[userCardsC3]) {
        }
        break
    }

    return {
      profitLoss: profitLossAmt,
      profit_type,
    }
  }

  profitLossCalculation = ({ ItemBetList, profit_type, profitLossAmt, fancy }: any) => {
    if (profit_type == 'profit') {
      if (fancy) {
        profitLossAmt = ItemBetList.isBack
          ? (parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
          : ItemBetList.stack
      } else {
        profitLossAmt = ItemBetList.isBack
          ? (parseFloat(ItemBetList.odds.toString()) - 1) * parseFloat(ItemBetList.stack.toString())
          : ItemBetList.stack
      }
    } else if (profit_type == 'loss') {
      if (fancy) {
        profitLossAmt = ItemBetList.isBack
          ? -ItemBetList.stack
          : -(parseFloat(ItemBetList.volume) * parseFloat(ItemBetList.stack)) / 100
      } else {
        profitLossAmt = ItemBetList.isBack
          ? -ItemBetList.stack
          : -(
              (parseFloat(ItemBetList.odds.toString()) - 1) *
              parseFloat(ItemBetList.stack.toString())
            )
      }
    }
    return profitLossAmt
  }

  disableCasinoGame = async (req: Request, res: Response) => {
    try {
      const user: any = req.user
      const { matchId } = req.query
      console.log('matchId', matchId)
      if (matchId) {
        const casino = await Casino.findOne({ match_id: matchId })
        if (casino) {
          // @ts-ignore
          await casino.updateOne({ $set: { isDisable: !casino.isDisable } })

          cachegoose.clearCache(0, 'casino-all-NEW')

          return this.success(res, {}, 'Casino game disabled')
        }
      }
      return this.fail(res, 'Match id required field')
    } catch (e: unknown) {
      const err = e as Error
      return this.fail(res, err.message)
    }
  }

  saveCasinoMatchData = async (req: Request, res: Response) => {
    try {
      const { data } = req.body
      await CasinoGameResult.findOneAndUpdate(
        { mid: data.mid },
        { mid: data.mid, gameType: data.gameType, data: { ...data, status: 'processing' } },
        { new: true, upsert: true },
      )
      this.success(res, {}, 'Save casino match data successfully!')
    } catch (e: unknown) {
      const err = e as Error
      return this.fail(res, err.message)
    }
  }

  results = async (req: Request, res: Response) => {
    let { type: gameType } = req.params
    let { filter_date, page, roundId } = req.query
    try {
      if (gameType === 'AAA') gameType = 'aaa'
      const date = new Date()

      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()
      const dateFilter = filter_date
        ? new Date(filter_date.toString())
        : new Date(`${day}-${month}-${year}`)

      let query: any = {
        gameType,
        createdAt: { $gte: dateFilter },
      }
      if (roundId) {
        query = { ...query, mid: { $regex: roundId } }
      }

      const results = await CasinoGameResult.paginate(query, {
        page: page ? +page : 1,
        limit: 50,
        select: ['mid', 'gameType', 'data'],
        sort: { createdAt: -1 },
      })
      return this.success(res, results)
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  htmlCards = async (req: Request, res: Response) => {
    const { type, roundId } = req.params
    try {
      let casinoType: any = await CasinoGameResult.findOne({ mid: roundId })
      const html = casinoType?.data?.html
      return this.success(res, { html })
    } catch (e: any) {
      return this.fail(res, e.stack)
    }
  }
}
