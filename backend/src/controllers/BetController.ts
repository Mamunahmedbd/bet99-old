import { Request, Response } from 'express'
import { Balance, IBalance } from '../models/Balance'
import { Bet, BetOn, IBet } from '../models/Bet'
import { Match } from '../models/Match'
import { IUser, User } from '../models/User'
import { ApiController } from './ApiController'
import { Market } from '../models/Market'
import { sportsApi } from '../util/api'
import { Types } from 'mongoose'
import { RoleType } from '../models/Role'
import UserSocket from '../sockets/user-socket'
import { Casino } from '../models/CasinoMatches'
import { BetLock } from '../models/BetLock'
import axios from 'axios'
const ObjectId = Types.ObjectId
const default_settings: any = { minBet: 100, maxBet: 100, delay: 0 }
const defaultRatio: any = {
  ownRatio: 100,
  allRatio: [
    {
      parent: new ObjectId('63382d9bfbb3a573110c1ba5'),
      ratio: 100,
    },
  ],
}
export class BetController extends ApiController {
  checkMarketOddsConditions = async ({
    market_id,
    market_name,
    selectionId,
    isBack,
    odds,
    selectionName,
  }: any) => {
    let current_odds = await this.getcurrentodds(market_id, market_name)

    if (
      !current_odds ||
      (current_odds && !current_odds.sports) ||
      (current_odds && current_odds.sports && !current_odds.sports[0])
    ) {
      return 'Bet is not acceptable.'
    } else {
      let currentsports: any = current_odds.sports[0]
      let current_runners = currentsports.runners
      let filter_runners = current_runners.filter((Item: any) => Item.selectionId == selectionId)
      if (filter_runners && filter_runners[0]) {
        let market_status: string = filter_runners[0].status
        if (market_status == 'ACTIVE' || market_status == 'OPEN') {
          let oddsdata = isBack
            ? filter_runners[0].ex.availableToBack
            : filter_runners[0].ex.availableToLay
          if (oddsdata.length > 0) {
            let max = 0
            oddsdata.map((Itemn: any) => (max = Itemn.price > max ? Itemn.price : max))
            if (odds > max) {
              return odds + ' is not valid.'
            }
          }
        } else if (market_status == 'SUSPENDED') {
          market_status = 'Is Suspended'
          return selectionName + ' market ' + market_status
        } else if (market_status == 'CLOSED') {
          market_status = 'Is Closed'
          return selectionName + ' market ' + market_status
        }
      } else {
        return 'Market Suspended'
      }
    }
  }

  fancybetListSelection = async (req: Request, res: Response): Promise<Response> => {
    try {
      const bets: Array<any> = await Bet.find({
        bet_on: BetOn.FANCY,
        status: 'pending',
      }, {
        matchId: 1,
        selectionId: 1,
        id: -1,
        _id: -1,
        selectionName: 1
      })
      return this.success(res, { list: bets })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
  checkFancyOddsConditions = async ({
    match_id,
    selectionId,
    isBack,
    odds,
    selectionName,
  }: any) => {
    let current_odds = await this.getcurrentfancyodds(match_id, selectionId)
    if (
      !current_odds ||
      (current_odds && !current_odds.sports) ||
      (current_odds && current_odds.sports && !current_odds.sports[0])
    ) {
      return 'Bet is not acceptable.'
    } else {
      let currentsports: any = current_odds.sports[0]
      let market_status: string = currentsports.GameStatus
      if (market_status == '') {
        let oddsdata = isBack ? currentsports.BackPrice1 : currentsports.LayPrice1
        if (isBack && odds > oddsdata) {
          return odds + ' is not valid.'
        }
        if (!isBack && odds < oddsdata) {
          return odds + ' is not valid.'
        }
      } else if (market_status == 'SUSPENDED') {
        market_status = 'Is Suspended'
      } else if (market_status == 'Ball Running') {
        market_status = 'Is Ball Running'
      }
      if (market_status != '') {
        return selectionName + ' market ' + market_status
      }
    }
  }
  placebet = async (req: Request, res: Response): Promise<Response> => {
    try {
      const betData = req.body
      if (betData.stack != undefined) {
        const user: any = req.user
        const userId: any = user._id
        betData['user_id'] = userId
        const start = performance.now()
        const response = await axios.post('http://64.227.186.121:5001/api/placebet', betData)
        const end = performance.now()
        console.log(response)
        return this.success(
          res,
          { bet: betData, time: end - start, ...response.data },
          'PLace Bet Successfully',
        )
      } else {
        return this.fail(res, '')
      }
    } catch (e: any) {
      return this.fail(res, e.stack)
    }
  }
  placebetold = async (req: Request, res: Response): Promise<Response> => {
    try {
      const betData = req.body
      if (betData.stack != undefined) {
        const user: any = req.user
        const userId: any = user._id
        const userInfo: IUser | null | any = await User.findOne({
          _id: new ObjectId(user._id),
        })
        const parentinfo: IUser | null = await User.findOne({
          _id: new ObjectId(userInfo.parentId),
        })
        let event_id = betData.eventId
        let bet_On = betData.betOn

        const settings: any =
          userInfo != null && userInfo.userSetting != undefined && bet_On !== BetOn.CASINO
            ? userInfo.userSetting[event_id]
            : parentinfo != null && parentinfo.userSetting != undefined && bet_On == BetOn.CASINO
              ? parentinfo.userSetting[event_id]
              : default_settings
        const partnership: any =
          parentinfo != null && parentinfo.partnership != undefined && bet_On !== BetOn.CASINO
            ? parentinfo.partnership[event_id]
            : parentinfo != null && parentinfo.partnership != undefined && bet_On == BetOn.CASINO
              ? parentinfo.partnership[4]
              : defaultRatio
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
        const betClickTime = new Date()

        const userBlance: IBalance | null = await Balance.findOne({
          userId: new ObjectId(user._id),
        })
        let stake = betData.stack
        let profit = parseFloat(betData.pnl)
        let odds = parseFloat(betData.odds)
        let match_id = betData.matchId
        let market_id = betData.marketId
        let market_name = betData.marketName
        let loss = parseFloat(betData.exposure)
        let selectionName = betData.selectionName
        let selectionId = betData.selectionId
        let isBack = betData.isBack
        let ipAddress = betData.ipAddress

        const betLock: any = await BetLock.findOne({
          matchId: parseInt(match_id),
          userId: { $eq: undefined },
        })
        const betLockUser: any = await BetLock.findOne({
          matchId: parseInt(match_id),
          userId: new ObjectId(user._id),
        })
        /// console.log(betLock)

        if (parseInt(stake) >= 99999999) {
          return this.fail(res, stake + ' is not valid.')
        }
        if (userBlance && userBlance.balance <= parseInt(stake)) {
          return this.fail(res, ' Low Balance.')
        }

        if (!stake || !profit || !Math.abs(loss) || !odds) {
          ///return this.fail(res, 'Bet is not acceptable.')
        }

        if (!userInfo || (userInfo && !userInfo.betLock)) {
          return this.fail(res, 'Bet is not acceptable.Please contact upline')
        }

        if (
          (betLock && betLock.betFair && market_name == 'Match Odds') ||
          (betLockUser && betLockUser.betFair && market_name == 'Match Odds')
        ) {
          return this.fail(res, 'Bet is not acceptable.Please contact upline')
        }
        if (
          (betLock && betLock.book && market_name == 'Bookmaker') ||
          (betLockUser && betLockUser.book && market_name == 'Bookmaker')
        ) {
          return this.fail(res, 'Bet is not acceptable.Please contact upline')
        }
        if (
          (betLock && betLock.fancy && market_name == 'Fancy') ||
          (betLockUser && betLockUser.fancy && market_name == 'Fancy')
        ) {
          return this.fail(res, 'Bet is not acceptable.Please contact upline')
        }

        if ((settings && settings.minBet > stake) || (settings && settings.maxBet < stake)) {
          return this.fail(res, 'Check Maximum or Minimum Bet Limit')
        }

        if (market_name == 'Match Odds') {
          await delay((parseInt(settings.delay) - 5) * 1000)
        }
        if (market_name != 'Fancy' && bet_On != BetOn.CASINO) {
          const errors = await this.checkMarketOddsConditions({
            market_id,
            market_name,
            selectionId,
            isBack,
            odds,
            selectionName,
          })
          if (errors) return this.fail(res, errors)
        } else if (bet_On == BetOn.CASINO) {
          /// perform casino validation
          // const errors = await this.checkFancyOddsConditions({
          //   match_id,
          //   selectionId,
          //   isBack,
          //   odds,
          //   selectionName,
          // })
          // if (errors) return this.fail(res, errors)
        } else {
          const errors = await this.checkFancyOddsConditions({
            match_id,
            selectionId,
            isBack,
            odds,
            selectionName,
          })
          if (errors) return this.fail(res, errors)
        }

        let matchName = ''
        let runners = []
        if (bet_On == BetOn.CASINO) {
          const matchdata: any = await Casino.findOne({ match_id: match_id })
          matchName = matchdata != null ? matchdata.title : ''
          if (matchdata.status == 0) {
            return this.fail(res, 'Match Is Not In Play')
          }
          const marketRunnerFinder = matchdata.event_data.market.filter(
            (ItemMarket: any) => ItemMarket.MarketName == market_name,
          )[0]
          runners = marketRunnerFinder?.Runners || []
        } else {
          const matchdata: any = await Match.findOne({ matchId: match_id })
          matchName = matchdata != null ? matchdata.name : ''
          if (!matchdata.active) {
            return this.fail(res, 'Match Is Not In Play')
          }
          const market_current_bet: any = await Market.findOne(
            { marketId: market_id, matchId: match_id },
            { _id: 1, runners: 1 },
          )
          runners = market_current_bet != null ? market_current_bet.runners : []
        }

        let json: IBet = {
          sportId: event_id,
          userId: new ObjectId(user._id),
          userName: userInfo.username,
          betClickTime,
          matchId: match_id,
          marketId: market_id,
          selectionId: selectionId,
          selectionName: selectionName,
          matchName: matchName,
          odds: odds,
          volume: betData.volume,
          stack: stake,
          pnl: profit,
          marketName: market_name,
          isBack: isBack,
          matchedDate: new Date(),
          matchedOdds: odds,
          matchedInfo: '',
          userIp: ipAddress,
          loss: loss,
          parentStr: userInfo.parentStr,
          ratioStr: partnership,
          bet_on:
            market_name == 'Fancy'
              ? BetOn.FANCY
              : bet_On == BetOn.CASINO
                ? bet_On
                : BetOn.MATCH_ODDS,
          runners: runners,
          //Todo: This is for fancy1 if fancy1 volume is grater then 100000
          gtype: (betData.gtype && betData.volume >= 100000) || BetOn.CASINO ? betData.gtype : '',
          C1: betData?.C1,
          C2: betData?.C2,
          C3: betData?.C3,
          fancystatus: betData?.fancystatus,
        }
        const bet = new Bet(json)
        if (bet_On != BetOn.CASINO) {
            let exposer = await this.getexposerfunction(user, false, json);
            if (exposer != 'failed') {
                let available_balance = userBlance && userBlance.balance ? userBlance.balance : -exposer;
                if (available_balance && available_balance < parseInt(exposer)) {
                    return this.fail(res, 'Max limit Exceed.');
                }
                try {
                    await bet.save();  // Directly use await instead of passing a callback function
                } catch (err) {
                    throw err;  // Handle the error if the save fails
                }
        
                const expoMain: any = await Balance.findOneAndUpdate(
                    { userId: user._id },
                    { $set: { exposer } },
                );
                // balance event here
        
                const bets: Array<IBet | null> = await Bet.find({
                    userId: userId,
                    matchId: match_id,
                    status: 'pending',
                }).sort({
                    createdAt: -1,
                });
        
                const markets: any = await Market.find({
                    matchId: match_id,
                });
        
                const profitlist = this.getoddsprofit(bets, markets);
        
                const ex = exposer + +expoMain?.casinoexposer || 0;
                return this.success(
                    res,
                    { bet, bets, exposer: ex, profitlist },
                    'Place Bet Successfully',
                );
            } else {
                return this.fail(res, 'Invalid Data');
            }
        } else {
            let casinoexposer = await this.getcasinoexposerfunction(user, false, json);
            if (casinoexposer != 'failed') {
                let available_balance = userBlance && userBlance.balance ? userBlance.balance : -casinoexposer;
                if (available_balance && available_balance < parseInt(casinoexposer)) {
                    return this.fail(res, 'Max limit Exceed.');
                }
                try {
                    await bet.save();  // Directly use await here too
                } catch (err) {
                    throw err;  // Handle the error if the save fails
                }
        
                const expofull: any = await Balance.findOneAndUpdate(
                    { userId: user._id },
                    { $set: { casinoexposer } },
                );
                // balance event here
        
                const bets: Array<IBet | null> = await Bet.find({
                    userId: userId,
                    matchId: match_id,
                    status: 'pending',
                    bet_on: BetOn.CASINO,
                }).sort({
                    createdAt: -1,
                });
        
                const markets: any = await Casino.findOne({
                    match_id: match_id,
                });
                console.log(markets, 'marketsmarketsmarkets');
                const profitlist = this.getcasinooddsprofit(bets, markets?.event_data?.market, markets);
        
                return this.success(
                    res,
                    { bet, bets, exposer: casinoexposer + +expofull?.exposer, profitlist },
                    'Place Bet Successfully',
                );
            } else {
                return this.fail(res, 'Invalid Data');
            }
        }

      } else {
        return this.fail(res, 'Invalid Data')
      }
    } catch (e: any) {
      return this.fail(res, e.stack)
    }
  }

  getexposer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: any = req.user
      const userbet: any = await Bet.find(
        { status: 'pending', userId:new ObjectId(user._id) },
        { _id: 1, matchId: 1 },
      )
      const event_id: any = []
      userbet.map((Item: any) => {
        if (event_id.indexOf(Item.matchId) <= -1) {
          event_id.push(Item.matchId)
        }
      })
      if (event_id.length > 0) {
        const match_list = await Match.find({ matchId: { $in: event_id } })
        let new_match_list: any = []
        const market_grab = await match_list.map(async (Item: any) => {
          let markets = await Market.find({ matchId: Item.matchId })
          Item['markets'] = markets
          new_match_list.push(Item)
        })
        await Promise.all(market_grab)
        let fancy_expo: number = 0
        var main_expo: any = 0
        const exposer_list = await new_match_list.map(async (Item: any) => {
          let profit: any = {}
          let fancypl: any = {}
          const event_data = Item.markets
          if (event_data.length > 0) {
            event_data.map(async (ItemEvent: any) => {
              let betlist: any = await Bet.find({
                status: 'pending',
                userId: new ObjectId(user._id),
                matchId: Item.matchId,
                bet_on: BetOn.MATCH_ODDS,
                marketId: ItemEvent.marketId,
              })
              let profit = await this.getmatchoddsexposer(betlist, Item)
              let expo_li: any = []
              Object.values(profit).forEach((key, index) => {
                let o_key: any = key
                if (parseFloat(o_key) < 0) {
                  expo_li.push(key)
                }
              })
              main_expo = main_expo + Math.abs(Math.min(expo_li))
            })
          }
          let fancybetlist: any = await Bet.find({
            status: 'pending',
            userId: new ObjectId(user._id),
            matchId: Item.matchId,
            bet_on: BetOn.FANCY,
          })
          fancypl = await this.getfancysexposer(fancybetlist)
          Object.values(fancypl).forEach((key, index) => {
            let o_key: any = key
            fancy_expo += Math.abs(o_key)
          })
        })
        await Promise.all(exposer_list)
        let totalexposer = fancy_expo + main_expo
        let update_ob = { exposer: totalexposer }
        const exposer = await Balance.findOneAndUpdate({ userId: new ObjectId(user._id) }, update_ob, {
          new: true,
          upsert: true,
        })
        return this.success(
          res,
          {
            exposer: totalexposer,
            fancy_expo: fancy_expo,
            main_expo: main_expo,
          },
          'Found',
        )
      } else {
        return this.success(res, {}, 'Not Found')
      }
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  getexposerfunction = async (user: any, updatestaus: boolean, currenbet: IBet): Promise<any> => {
    try {
      const userbet: any = await Bet.find(
        { status: 'pending', userId: new ObjectId(user._id) },
        { _id: 1, matchId: 1 },
      )

      const event_id: any = []

        ;[...userbet, currenbet].map((Item: any) => {
          if (event_id.indexOf(Item.matchId) <= -1) {
            event_id.push(Item.matchId)
          }
        })

      let completeBetlist: any = await Bet.find({
        status: 'pending',
        userId: new ObjectId(user._id),
      })
      completeBetlist.push(currenbet)

      if (event_id.length > 0) {
        const match_list = await Match.find({ matchId: { $in: event_id } })
        let new_match_list: any = []
        const market_grab = await match_list.map(async (Item: any) => {
          let markets = await Market.find({ matchId: Item.matchId })
          Item['markets'] = markets
          new_match_list.push(Item)
        })
        await Promise.all(market_grab)
        let fancy_expo: number = 0
        var main_expo: number = 0
        const exposer_list = await new_match_list.map(async (Item: any) => {
          let fancypl: any = {}

          const event_data = Item.markets
          if (event_data.length > 0) {
            const promismatchodds = event_data.map(async (ItemEvent: any) => {
              let betlist: any = completeBetlist.filter(
                (ItemBetList: any) =>
                  ItemBetList.matchId == Item.matchId &&
                  ItemBetList.bet_on == BetOn.MATCH_ODDS &&
                  ItemBetList.marketId == ItemEvent.marketId,
              )
              let profit = await this.getmatchoddsexposer(betlist, Item)
              let expo_li: any = []
              Object.values(profit).forEach((key, index) => {
                let o_key: any = key
                if (parseFloat(o_key) < 0) {
                  if (expo_li.indexOf(key) <= -1) {
                    expo_li.push(key)
                  }
                }
              })

              main_expo += expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0
            })
            await Promise.all(promismatchodds)
          }
          let fancybetlist: any = completeBetlist.filter(
            (ItemBetList: any) =>
              ItemBetList.matchId == Item.matchId && ItemBetList.bet_on == BetOn.FANCY,
          )
          fancypl = await this.getfancysexposer(fancybetlist)
          Object.values(fancypl).forEach((key, index) => {
            let o_key: any = key
            fancy_expo += Math.abs(o_key)
          })
        })

        await Promise.all(exposer_list)
        let totalexposer: number = fancy_expo + +main_expo
        if (updatestaus) {
          let update_ob = { exposer: totalexposer }
          const exposer = await Balance.findOneAndUpdate(
            { userId: new ObjectId(user._id) },
            update_ob,
            { new: true, upsert: true },
          )
          UserSocket.setExposer({
            exposer: totalexposer,
            balance: exposer.balance,
            userId: user._id,
          })
        }
        return totalexposer
        /// return this.success(res, { exposer: totalexposer, fancy_expo: fancy_expo, main_expo: main_expo }, "Found");
      } else {
        return 'failed'
        ///   return this.success(res, {}, "Not Found");
      }
    } catch (e: any) {
      console.log(e)
      return 'failed'
      /// return this.fail(res, e.message);
    }
  }

  getcasinoexposerfunction = async (
    user: any,
    updatestaus: boolean,
    currenbet: IBet,
  ): Promise<any> => {
    try {
      const userbet: any = await Bet.find(
        { status: 'pending', userId: new ObjectId(user._id), bet_on: BetOn.CASINO },
        { _id: 1, matchId: 1, marketId: 1 },
      )

      const event_id: any = []
        ;[...userbet, currenbet].map((Item: any) => {
          if (event_id.indexOf(Item.matchId) <= -1) {
            event_id.push(Item.matchId)
          }
        })

      const roundid: any = []
        ;[...userbet, currenbet].map((Item: any) => {
          const checkalready = roundid.filter((ItemN: any) => ItemN.roundid == Item.marketId)
          if (checkalready.length <= 0) {
            roundid.push({ match_id: Item.matchId, roundid: Item.marketId })
          }
        })

      let completeBetlist: any = await Bet.find({
        status: 'pending',
        userId: new ObjectId(user._id),
        bet_on: BetOn.CASINO,
      })
      completeBetlist.push(currenbet)
      if (event_id.length > 0) {
        const match_list = await Casino.find({ match_id: { $in: event_id } })
        const matchData = match_list && match_list != null ? match_list : []
        var main_expo: number = 0
        const exposer_list = await matchData.map(async (Item: any) => {
          const event_data = Item.event_data.market
          const filterround = roundid.filter(
            (ItemRound: any) => ItemRound.match_id == Item.match_id,
          )
          if (event_data.length > 0 && filterround.length > 0) {
            const promismatchodds = event_data.map(async (ItemEvent: any) => {
              const promise2 = filterround.map(async (ItemRoundWise: any) => {
                let betlist: any = completeBetlist.filter(
                  (ItemBetList: any) =>
                    ItemBetList.matchId == Item.match_id &&
                    ItemBetList.bet_on == BetOn.CASINO &&
                    ItemBetList.marketName == ItemEvent.MarketName &&
                    ItemBetList.marketId == ItemRoundWise.roundid,
                )
                if (betlist.length > 0) {
                  let profit
                  if (Item.match_id == 33) {
                    profit = await this.getCmetercasinoexposer(betlist, Item)
                  } else {
                    profit = await this.getmatchcasinoexposer(betlist, Item)
                  }
                  console.log(profit, 'profitprofitprofit')
                  let expo_li: any = []
                  Object.values(profit).forEach((key, index) => {
                    let o_key: any = key
                    if (parseFloat(o_key) < 0) {
                      if (expo_li.indexOf(key) <= -1) {
                        expo_li.push(key)
                      }
                    }
                  })
                  /// console.log(expo_li, "expo_li"+ItemRoundWise.roundid)
                  ///  console.log(betlist, "expo_li"+ItemRoundWise.roundid)
                  main_expo += expo_li.length > 0 ? Math.abs(Math.min(...expo_li)) : 0
                }
              })
              await Promise.all(promise2)
            })
            await Promise.all(promismatchodds)
          }
        })
        await Promise.all(exposer_list)
        console.log(main_expo)
        let totalexposer: number = main_expo
        if (updatestaus) {
          let update_ob = { casinoexposer: totalexposer }
          const exposer = await Balance.findOneAndUpdate(
            { userId: new ObjectId(user._id) },
            update_ob,
            { new: true, upsert: true },
          )
          console.log(
            totalexposer + +exposer?.exposer,
            'totalexposer + + exposer?.exposertotalexposer + + exposer?.exposerx',
          )
          UserSocket.setExposer({
            exposer: totalexposer + +exposer?.exposer,
            balance: exposer.balance,
            userId: user._id,
          })
        }
        return totalexposer
        /// return this.success(res, { exposer: totalexposer, fancy_expo: fancy_expo, main_expo: main_expo }, "Found");
      } else {
        return 'failed'
        ///   return this.success(res, {}, "Not Found");
      }
    } catch (e: any) {
      console.log(e)
      return 'failed'
      /// return this.fail(res, e.message);
    }
  }
  /********this is for match odd / bookmaker exposer calculation*/
  getmatchoddsexposer = async (betlist: any, match_data: any) => {
    let profit: any = {}
    betlist.map((ItemBets: any) => {
      let runner_data_check = match_data.markets.filter(
        (ItemRunn: any) => ItemRunn.marketId == ItemBets.marketId,
      )
      if (runner_data_check[0] == undefined) return
      const runner_data: any = runner_data_check[0].runners
      runner_data.map((ItemRunners: any) => {
        if (profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] == undefined) {
          profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] = 0
        }
        if (ItemBets['bet_on'] == BetOn.MATCH_ODDS) {
          if (ItemBets['isBack'] == true) {
            if (ItemBets['selectionId'] == ItemRunners['selectionId']) {
              profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['pnl']
            } else {
              profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['loss']
            }
          } else {
            if (ItemBets['selectionId'] == ItemRunners['selectionId']) {
              profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['loss']
            } else {
              profit[ItemBets['marketId'] + '_' + ItemRunners['selectionId']] += ItemBets['pnl']
            }
          }
        }
      })
    })
    return profit
  }

  getmatchcasinoexposer = async (betlist: any, match_data: any) => {
    let profit: any = {}
    betlist.map((ItemBets: any) => {
      let runner_data_check = match_data.event_data.market.filter(
        (ItemRunn: any) => ItemRunn.MarketName == ItemBets.marketName,
      )
      if (runner_data_check[0] == undefined) return
      const runner_data: any = runner_data_check[0].Runners
      runner_data.map((ItemRunners: any) => {
        if (profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] == undefined) {
          profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] = 0
        }
        if (ItemBets['bet_on'] == BetOn.CASINO) {
          if (ItemBets['isBack'] == true) {
            if (ItemBets['fancystatus'] == 'yes') {
              const filterbets =
                betlist && betlist.length > 0
                  ? betlist.filter((ItemN: any) => {
                    console.log(ItemN.marketId, ' ItemN.marketId')
                    return (
                      ItemN.bet_on == BetOn.CASINO &&
                      ItemN.marketId == ItemBets.marketId &&
                      !ItemN.isBack
                    )
                  })
                  : []
              if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                if (ItemBets['isBack']) {
                  profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +
                    (filterbets.length > 0 ? ItemBets.pnl : -ItemBets.stack)
                } else {
                  profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] + ItemBets.loss
                }
              } else {
                if (ItemBets['isBack']) {
                  profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +
                    (filterbets.length > 0 ? ItemBets.pnl : -ItemBets.stack)
                } else {
                  profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] =
                    profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] + ItemBets.loss
                }
              }
            } else {
              if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +=
                  runner_data.length == 1 ? ItemBets['loss'] : ItemBets['pnl']
              } else {
                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss']
              }
            }
          } else {
            if (ItemBets['fancystatus'] == 'yes') {
              if (ItemBets.marketName === 'Fancy1 Market') {
                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] +=
                  -1 * (ItemBets.odds * ItemBets.stack - ItemBets.stack)
              } else {
                let amt: any = (parseInt(ItemBets['stack']) * parseInt(ItemBets['volume'])) / 100
                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += -amt
              }
            } else {
              if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss']
              } else {
                profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['pnl']
              }
            }
          }
        }
      })
    })
    return profit
  }
  getCmetercasinoexposer = async (betlist: any, match_data: any) => {
    let profit: any = {}
    betlist.map((ItemBets: any) => {
      let runner_data_check = match_data.event_data.market.filter(
        (ItemRunn: any) => ItemRunn.MarketName == ItemBets.marketName,
      )
      if (runner_data_check[0] == undefined) return
      const runner_data: any = runner_data_check[0].Runners
      runner_data.map((ItemRunners: any) => {
        if (profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] == undefined) {
          profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] = 0
        }
        if (ItemBets['bet_on'] == BetOn.CASINO) {
          if (ItemBets['isBack'] == true) {
            if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
              profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss']
            }
          } else {
            if (ItemBets['selectionId'] == ItemRunners['SelectionId']) {
              profit[ItemBets['marketId'] + '_' + ItemRunners['SelectionId']] += ItemBets['loss']
            }
          }
        }
      })
    })
    return profit
  }
  /********this is for Current odds from odds api*/
  getcurrentodds = async (marketid: any, type: string) => {
    let url: string = !type.includes('Bookmaker')
      ? `/get-odds?MarketID=${marketid}`
      : `/get-bookmaker-odds?marketId=${marketid}`
    const response = await sportsApi.get(`${url}`).then(async (response: any) => {
      return response.data
    })
    return response
  }

  getcurrentfancyodds = async (marketid: any, selectionId: any) => {
    const response = await sportsApi
      .get(`/get-single-session?MatchID=${marketid}&SelectionId=${selectionId}`)
      .then(async (response: any) => {
        return response.data
      })
    return response
  }

  /********this is for fancy exposer calculation*/
  getfancysexposer = async (fancybetlist: any) => {
    let fancypl: any = {}
    fancybetlist.map((ItemBets: any) => {
      if (fancypl[ItemBets['selectionId']] == undefined) {
        fancypl[ItemBets['selectionId']] = 0
      }
      if (ItemBets['isBack'] == true) {
        if (ItemBets['volume'] > 100) {
          if (ItemBets.gtype === 'fancy1') {
            fancypl[ItemBets['selectionId']] += -ItemBets.stack
            //fancypl[ItemBets['selectionId']] += ItemBets.odds * ItemBets.stack - ItemBets.stack
          } else {
            fancypl[ItemBets['selectionId']] += (ItemBets['stack'] * ItemBets['volume']) / 100
          }
        } else {
          fancypl[ItemBets['selectionId']] += ItemBets['stack']
        }
      } else {
        if (ItemBets['volume'] > 100) {
          if (ItemBets.gtype === 'fancy1') {
            fancypl[ItemBets['selectionId']] +=
              -1 * (ItemBets.odds * ItemBets.stack - ItemBets.stack)
          } else {
            let amt: any = (parseInt(ItemBets['stack']) * parseInt(ItemBets['volume'])) / 100
            fancypl[ItemBets['selectionId']] += amt
          }
        } else {
          fancypl[ItemBets['selectionId']] += ItemBets['stack']
        }
      }
    })
    return fancypl
  }

  betList = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: any = req.user
      const { matchId } = req.query
      let userId: any = { userId: new ObjectId(user._id) }
      if (user.role !== RoleType.user) userId = { parentStr: { $in: new ObjectId(user._id) } }
      const bets: Array<IBet | null> = await Bet.find({
        ...userId,
        matchId,
        status: 'pending',
      }).sort({
        createdAt: -1,
      })
      if (bets.length > 0) {
        const betFirst = bets[0]
        if (betFirst?.bet_on != 'CASINO') {
          const markets: any = await Market.find({
            matchId,
          })
          const profitlist = this.getoddsprofit(bets, markets)
          return this.success(res, { bets: bets, odds_profit: profitlist })
        } else {
          const markets: any = await Casino.findOne({
            match_id: matchId,
          })
          console.log(JSON.stringify(markets), 'marketsmarketsmarketsmarkets')
          const profitlist = this.getcasinooddsprofit(bets, markets.event_data.market, markets)
          return this.success(res, { bets: bets, odds_profit: profitlist })
        }
      } else {
        return this.success(res, { bets: [], odds_profit: [] })
      }
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getoddsprofit = (bets: any, markets: any) => {
    var odds_profit: any = {}
    const filterbets =
      bets && bets.length > 0 ? bets.filter((Item: any) => Item.bet_on == BetOn.MATCH_ODDS) : []
    const promiseprofit = filterbets.map((Item: any) => {
      const selectionIdBet = Item.selectionId
      const getBetType = Item.isBack
      const lossAmt = Item.stack
      const getOdds = Item.odds

      let profitAmt: number = (parseFloat(getOdds) - 1) * parseFloat(lossAmt)
      let filtermarket =
        markets && markets.length > 0
          ? markets.filter((ItemMarket: any) => ItemMarket.marketId == Item.marketId)
          : []
      const filtermarketdata: any = filtermarket && filtermarket.length > 0 ? filtermarket[0] : {}
      if (filtermarketdata) {
        filtermarketdata.runners.map((mData: any, mIndex: number) => {
          var SelectionId = mData.selectionId
          if (odds_profit[filtermarketdata.marketId + '_' + SelectionId] == undefined) {
            odds_profit[filtermarketdata.marketId + '_' + SelectionId] = 0
          }

          if (SelectionId == selectionIdBet) {
            if (getBetType) {
              odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                odds_profit[filtermarketdata.marketId + '_' + SelectionId] + profitAmt
            } else {
              odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                odds_profit[filtermarketdata.marketId + '_' + SelectionId] - profitAmt
            }
          } else {
            if (getBetType) {
              odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                odds_profit[filtermarketdata.marketId + '_' + SelectionId] - lossAmt
            } else {
              odds_profit[filtermarketdata.marketId + '_' + SelectionId] =
                odds_profit[filtermarketdata.marketId + '_' + SelectionId] + lossAmt
            }
          }
        })
      }
    })
    Promise.all(promiseprofit)
    const filterbetsFancy =
      bets && bets.length > 0 ? bets.filter((Item: any) => Item.bet_on == BetOn.FANCY) : []

    var fancy_profit: any = {}
    const promiseprofitFancy = filterbetsFancy.map((Item: any) => {
      if (fancy_profit[Item.selectionId] == undefined) {
        fancy_profit[Item.selectionId] = 0
      }
      if (Item.isBack) {
        if (Item['volume'] > 100) {
          if (Item.gtype === 'fancy1') {
            //fancy_profit[Item['selectionId']] += Item.odds * Item.stack - Item.stack
            fancy_profit[Item['selectionId']] += -Item.stack
          } else {
            fancy_profit[Item['selectionId']] += -Item['stack']
          }
        } else {
          fancy_profit[Item['selectionId']] += -Item['stack']
        }
        ///fancy_profit[Item['selectionId']] += -(Item['stack'] * Item['volume']) / 100
      } else {
        if (Item['volume'] > 100) {
          if (Item.gtype === 'fancy1') {
            fancy_profit[Item['selectionId']] += -1 * (Item.odds * Item.stack - Item.stack)
          } else {
            let amt: any = (parseInt(Item['stack']) * parseInt(Item['volume'])) / 100
            fancy_profit[Item['selectionId']] += -amt
          }
        } else {
          fancy_profit[Item['selectionId']] += -Item['stack']
        }

        /// fancy_profit[Item['selectionId']] +=
        ///  -(parseInt(Item['stack']) * parseInt(Item['volume'])) / 100
      }
    })
    Promise.all(promiseprofitFancy)

    odds_profit = { ...odds_profit, ...fancy_profit }
    return odds_profit
  }

  getcasinooddsprofit = (bets: any, markets: any, matchInfo: any) => {
    var odds_profit: any = {}
    const filterbets =
      bets && bets.length > 0 ? bets.filter((Item: any) => Item.bet_on == BetOn.CASINO) : []
    const promiseprofit = filterbets.map((Item: any) => {
      const selectionIdBet = Item.selectionId
      const getBetType = Item.isBack
      const lossAmt = Item.matchId == 33 ? Item.stack : Item.loss
      const getOdds = Item.odds
      let profitAmt: number = 0
      if (Item.fancystatus == 'yes') {
        profitAmt = Item.pnl
      } else {
        profitAmt = (parseFloat(getOdds) - 1) * parseFloat(lossAmt)
      }
      let filtermarket =
        markets && markets.length > 0
          ? markets.filter((ItemMarket: any) => ItemMarket.MarketName == Item.marketName)
          : []
      const filtermarketdata: any =
        filtermarket && filtermarket.length > 0 ? filtermarket[0] : { Runners: [] }
      if (filtermarketdata) {
        filtermarketdata.Runners.map((mData: any, mIndex: number) => {
          var SelectionId = mData.SelectionId
          if (odds_profit[Item.marketId + '_' + SelectionId] == undefined) {
            odds_profit[Item.marketId + '_' + SelectionId] = 0
          }
          console.log(matchInfo.match_id)
          if (matchInfo.match_id == 33) {
            //// specific condition for cmeter game
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] + lossAmt
              } else {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] - profitAmt
              }
            }
          } else if (matchInfo.match_id == 46) {
            // race2020
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] + lossAmt
              } else {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] + lossAmt
              }
            }
          } else if (Item.fancystatus == 'yes') {
            // all fancy cases
            const filterbets =
              bets && bets.length > 0
                ? bets.filter((ItemN: any) => {
                  console.log(ItemN.marketId, ' ItemN.marketId')
                  return (
                    ItemN.bet_on == BetOn.CASINO &&
                    ItemN.marketId == Item.marketId &&
                    !ItemN.isBack
                  )
                })
                : []
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] +
                  (filterbets.length > 0 ? Item.pnl : -Item.stack)
              } else {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] + lossAmt
              }
            }
          } else {
            if (SelectionId == selectionIdBet) {
              if (getBetType) {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] + profitAmt
              } else {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] - profitAmt
              }
            } else {
              if (getBetType) {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] - lossAmt
              } else {
                odds_profit[Item.marketId + '_' + SelectionId] =
                  odds_profit[Item.marketId + '_' + SelectionId] + lossAmt
              }
            }
          }
        })
      }
    })
    Promise.all(promiseprofit)
    console.log(odds_profit, 'odds_profit')
    /// odds_profit = { ...odds_profit }
    return odds_profit
  }

  alluserbetList = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page }: any = req.query
      let { reportType, startDate, endDate, userId, name, type, status, matchId }: any = req.body
      const user: any = req.user

      if (user.role === RoleType.user && status == 'deleted') {
        // Fake data for user
        return this.success(res, {
          docs: [],
          hasNextPage: false,
          hasPrevPage: false,
          limit: 20,
          nextPage: null,
          page: 1,
          pagingCounter: 1,
          prevPage: null,
          totalDocs: 0,
          totalPages: 0,
        })
      }
      const options = {
        page: page ? page : 1,
        limit: 20,
        sort: { createdAt: -1 },
      }
      const useridmap: any = []
      if (userId) {
        useridmap.push(userId)
      } else {
        const userChilds = await User.find(
          { parentStr: { $elemMatch: { $eq: new ObjectId(user._id) } }, role: RoleType.user },
          { _id: 1 },
        )
        useridmap.push(new ObjectId(user._id))
        userChilds.map((Item) => useridmap.push(new ObjectId(Item._id)))
      }

      var filter: any = {
        userId: { $in: useridmap },
        status: type ? 'deleted' : status,
      }
      if (matchId) {
        filter = { ...filter, matchId: parseInt(matchId) }
      }

      if (startDate && startDate != '') {
        startDate = startDate.includes('T')
          ? `${startDate.replace('T', ' ')}:00`
          : `${startDate} 00:00:00`
        endDate = endDate.includes('T') ? `${endDate.replace('T', ' ')}:00` : `${endDate} 23:59:59`
        filter = {
          ...filter,
          ...{
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        }
      }
      if (reportType && reportType != '') {
        filter = { ...filter, sportId: { $in: [parseInt(reportType), reportType] } }
      }
      if (name) {
        filter = {
          ...filter,
          $or: [{ selectionName: new RegExp(name, 'i') }, { matchName: new RegExp(name, 'i') }],
        }
      }

      console.log(filter)
      const bets = await Bet.paginate(filter, options)
      return this.success(res, bets)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getExposerEvent = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user: any = req.user
      var filter: any = [
        {
          $match: {
            userId: new Types.ObjectId(user._id),
            status: 'pending',
          },
        },
        {
          $group: {
            _id: '$matchId',
            matchName: { $first: '$matchName' },
            myCount: { $sum: 1 },
            matchslug: { $first: '$matchDetails.slug' },
            matchId: { $first: '$matchDetails.matchId' },
          },
        },
      ]
      const bets = await Bet.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(user._id),
            status: 'pending',
          },
        },
        {
          $group: {
            _id: '$matchId',
            matchName: { $first: '$matchName' },
            myCount: { $sum: 1 },
            sportId: { $first: '$sportId' },
            matchId: { $first: '$matchId' },
          },
        },
      ])

      // const bets = await Bet.aggregate([
      //   {
      //     $match: {
      //       userId: Types.ObjectId(user._id),
      //       status: 'pending',
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: '$matchId',
      //       matchName: { $first: '$matchName' },
      //       myCount: { $sum: 1 },
      //       betOn: { $first: '$bet_on' }, // Preserve the bet_on field for conditional lookup
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'casinomatches', // Collection to lookup if bet_on is 'CASINO'
      //       localField: '_id',
      //       foreignField: '_id',
      //       as: 'matchDetails',
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'matches', // Collection to lookup if bet_on is not 'CASINO'
      //       localField: '_id',
      //       foreignField: '_id',
      //       as: 'matchDetails',
      //     },
      //   },
      //   {
      //     $unwind: '$matchDetails',
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       matchName: 1,
      //       myCount: 1,
      //       matchslug: '$matchDetails.slug',
      //       matchId: '$matchDetails.matchId',
      //       betOn: 1, // Include the preserved bet_on field in the result
      //     },
      //   },
      // ]);

      return this.success(res, bets)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
  getBetListByIds = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { betIds, page } = req.body
      const ids = betIds instanceof Array ? betIds : [betIds]
      const options = {
        page: page ? page : 1,
        limit: 10,
        sort: { createdAt: -1 },
      }
      const bets = await Bet.paginate(
        { _id: { $in: ids }, status: { $nin: ['pending', 'deleted'] } },
        options,
      )
      return this.success(res, bets)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  deleteCurrentBet = async (req: Request, res: Response): Promise<Response> => {
    try {
      let status: string = 'deleted'
      const userbet: any = await Bet.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: { status } },
      )
      const json: any = {}
      let exposer = await this.getexposerfunction({ _id: userbet.userId }, true, json)
      // balance event here
      return this.success(res, { success: true }, 'Bet deleted successfully')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  deleteBets = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { ids } = req.body
      const userIds = await Bet.find({ _id: { $in: ids } })
        .select({ userId: 1 })
        .distinct('userId')
        .lean()

      let status: string = 'deleted'
      await Bet.updateMany({ _id: { $in: ids } }, { $set: { status } })
      if (userIds.length > 0) {
        userIds.map(async (userId) => {
          const json: any = {}
          await this.getexposerfunction({ _id: userId }, true, json)
        })
      }
      // balance event here
      return this.success(res, { success: true }, 'Bet deleted successfully')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
