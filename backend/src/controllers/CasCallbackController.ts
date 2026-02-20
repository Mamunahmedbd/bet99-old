import { AnyAaaaRecord } from 'dns';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Balance } from '../models/Balance';
import { Match } from '../models/Match';
import { IUser, User } from '../models/User';
import { ApiController } from './ApiController';
import { FancyController } from './FancyController';
import { CasCasino } from '../models/CasCasino';
import UserSocket from '../sockets/user-socket';
import { CasinoBet } from '../models/CasinoBet';

const defaultRatio: any = {
  ownRatio: 100,
  allRatio: [
    {
      parent: new Types.ObjectId('63382d9bfbb3a573110c1ba5'),
      ratio: 100,
    },
  ],
};

export class CasCallbackController extends ApiController {
  getbalance = async (req: Request, res: Response) => {
    try {
      const { userId, partner_id } = req.body;
      if (partner_id != 'D48CJ9BTHT2NCT4XMZPY') {
        return res.status(500).json({ bet_status: 'N', balance: '0.00', status: 'OP_FAILURE' });
      }
      const balance = await Balance.findOne({ userId: new Types.ObjectId(userId) });
      if (balance) {
        return res.status(200).json({
          bet_status: 'Y',
          balance: balance?.balance - balance?.exposer,
          status: 'OP_SUCCESS',
        });
      } else {
        return res.status(500).json({
          bet_status: 'N',
          balance: 0,
          status: 'OP_FAILURE',
        });
      }
    } catch (e: any) {
      return res.status(500).json({
        bet_status: 'N',
        balance: 0,
        status: 'OP_FAILURE',
      });
    }
  };

  getBetrequest = async (req: Request, res: Response) => {
    try {
      const { user, partnerKey, transactionData, gameData } = req.body;
      if (partnerKey != 'D48CJ9BTHT2NCT4XMZPY') {
        return res.status(500).json({
          bet_status: 'N',
          balance: 0,
          status: 'OP_FAILURE',
        });
      }
      if (transactionData.amount < 0) {
        return res.status(500).json({
          bet_status: 'N',
          balance: 0,
          status: 'OP_ERROR_NEGATIVE_DEBIT_AMOUNT',
        });
      }
      const fancyController = new FancyController();
      let balance: any = await Balance.findOne({ userId: new Types.ObjectId(user.id) });
      const userInfo: any = await User.findOne({ _id: new Types.ObjectId(user.id) });
      if (balance && userInfo._id) {
        const currentBalance = balance?.balance - balance?.exposer;
        if (currentBalance < transactionData.amount) {
          return res.status(500).json({
            bet_status: 'N',
            balance: 0,
            status: 'OP_INSUFFICIENT_FUNDS',
          });
        }
        const findGame: any = await CasCasino.findOne({ game_identifier: gameData.gameCode });
        const checkBetExist = await CasinoBet.findOne({ providerTransactionId: gameData.providerTransactionId });
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '');

        if (!checkBetExist && findGame) {
          const parentinfo: any = await User.findOne({ _id: userInfo?.parentId });
          const partnership: any =
            parentinfo != null && parentinfo.partnership != undefined
              ? parentinfo.partnership[4]
              : defaultRatio;

          const obj = {
            userId: new Types.ObjectId(userInfo._id),
            amount: transactionData.amount,
            gameCode: findGame.game_code,
            currency: 'INR',
            round: gameData.providerRoundId,
            providerCode: findGame.game_code,
            providerTransactionId: transactionData.providerTransactionId,
            status: 'completed',
            rolledBack: 'N',
            gameId: findGame.game_identifier,
            matchId: findGame.game_identifier,
            marketId: parseInt(`${timeString}`),
            description: 'bet',
            requestUuid: transactionData.referenceId,
            transactionUuid: transactionData._id,
            userName: userInfo.username,
            parentStr: userInfo.parentStr,
            ratioStr: partnership,
            gameName: findGame.game_name,
          };
          const bet = new CasinoBet(obj);
          const sbet: any = await bet.save();
          if (sbet) {
            let userIdList: any = [];
            const parentIdList: any = [];
            const narrationN = `CCASINO-${findGame.game_name} [${gameData.providerRoundId}]`;

            await fancyController.addprofitlosstouser({
              userId: new Types.ObjectId(userInfo._id),
              bet_id: sbet._id,
              profit_loss: -transactionData.amount,
              matchId: parseInt(`${timeString}`),
              narration: narrationN,
              sportsType: 5000,
              selectionId: parseInt(`${timeString}`),
              sportId: 5000,
            });
            userIdList.push(new Types.ObjectId(userInfo._id));
            partnership.allRatio.map((ItemParentStr: any) => {
              userIdList.push(new Types.ObjectId(ItemParentStr.parent));
              parentIdList.push(ItemParentStr.parent);
            });
            const unique = [...new Set(userIdList)];
            if (unique.length > 0) {
              await fancyController.updateUserAccountStatementCasino(unique, parentIdList);
            }
          }
          balance = await Balance.findOne({ userId: new Types.ObjectId(userInfo._id) });
          UserSocket.setExposer({
            balance: balance?.balance,
            exposer: balance?.exposer,
            userId: userInfo._id,
          });
          return res.status(200).json({
            balance: balance?.balance - balance?.exposer,
            bet_status: 'Y',
            status: 'OP_SUCCESS',
          });
        } else {
          return res.status(500).json({
            balance: 0,
            bet_status: checkBetExist ? 'N' : 'N',
            status: checkBetExist ? 'OP_DUPLICATE_TRANSACTION' : 'OP_FAILURE_BET_EXIST',
          });
        }
      } else {
        return res.status(500).json({
          bet_status: 'N',
          balance: 0,
          status: 'OP_FAILURE',
        });
      }
    } catch (e: any) {
      return res.status(500).json({
        balance: 0,
        bet_status: 'N',
        status: 'OP_FAILURE',
      });
    }
  };
  
  
    getCreditRequest = async (req: Request, res: Response) => {
    try {
      const { user, partnerKey, transactionData, gameData } =
        req.body
      console.log(req.body, "req.body credit")

      if (partnerKey != 'D48CJ9BTHT2NCT4XMZPY') {
        return res.status(500).json({
          bet_status: "N",
          balance: 0,
          status: 'OP_FAILURE',
        })
      }
      if (transactionData.amount < 0) {
        return res.status(500).json({
          bet_status: "N",
          balance: 0,
          status: 'OP_ERROR_NEGATIVE_DEBIT_AMOUNT',
        })
      }
      const fancyController = new FancyController()
      let balance: any = await Balance.findOne({ userId: new Types.ObjectId(user.id) })
      const userInfo: any = await User.findOne({ _id: new Types.ObjectId(user.id) })
      if (balance && userInfo._id) {
        const currentBalance = balance?.balance - balance?.exposer
        // if (currentBalance < transactionData.amount) {
        //   return res.status(500).json({
        //     bet_status: "N",
        //     balance: 0,
        //     status: 'OP_INSUFFICIENT_FUNDS',
        //   })
        // }
        const findGame: any = await CasCasino.findOne({ game_identifier: gameData.gameCode })
        const checkWinExist = await CasinoBet.findOne({ providerTransactionId: gameData.providerTransactionId, description: 'win' })
        const checkRollback = await CasinoBet.findOne({
          providerTransactionId: gameData.providerTransactionId,
          description: 'win',
          rolledBack: 'Y',
        })
        const checkBetExist = await CasinoBet.findOne({ providerTransactionId: gameData.providerTransactionId })

        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0') // Get hours (00-23)
        const minutes = String(now.getMinutes()).padStart(2, '0') // Get minutes (00-59)
        const seconds = String(now.getSeconds()).padStart(2, '0') // Get seconds (00-59)

        const timeString = `${hours}${minutes}${seconds}`
        if (findGame && !checkWinExist && !checkRollback) {
          const parentinfo: any = await User.findOne({ _id: userInfo?.parentId })
          const partnership: any =
            parentinfo != null && parentinfo.partnership != undefined
              ? parentinfo.partnership[4]
              : defaultRatio

          const obj = {
            userId: new Types.ObjectId(userInfo._id),
            amount: transactionData.amount,
            gameCode: findGame.game_code,
            currency: 'INR',
            round: gameData.providerRoundId,
            providerCode: findGame.game_code,
            providerTransactionId: transactionData.providerTransactionId,
            status: 'completed',
            rolledBack: 'N',
            gameId: findGame.game_identifier,
            matchId: findGame.game_identifier,
            marketId: parseInt(`${findGame.game_identifier}${timeString}`),
            description: 'win',
            requestUuid: transactionData.referenceId,
            transactionUuid: transactionData.referenceId,
            userName: userInfo.username,
            parentStr: userInfo.parentStr,
            ratioStr: partnership,
            gameName: findGame.game_name,
          }
          const bet = new CasinoBet(obj)
          const sbet: any = await bet.save()
          if (sbet) {
            let userIdList: any = []
            const parentIdList: any = []
            const narrationN = `CCASINO-${findGame.game_name} [${gameData.providerRoundId}]`

            await fancyController.addprofitlosstouser({
              userId: new Types.ObjectId(userInfo._id),
              bet_id: sbet._id,
              profit_loss: transactionData.amount,
              matchId: parseInt(`${timeString}`),
              narration: narrationN,
              sportsType: 5000,
              selectionId: parseInt(`${timeString}`),
              sportId: 5000,
            })
            userIdList.push(new Types.ObjectId(userInfo._id))
            partnership.allRatio.map((ItemParentStr: any) => {
              userIdList.push(new Types.ObjectId(ItemParentStr.parent))
              parentIdList.push(ItemParentStr.parent)
            })
            const unique = [...new Set(userIdList)]
            if (unique.length > 0) {
              await fancyController.updateUserAccountStatementCasino(unique, parentIdList)
            }
          }
          balance = await Balance.findOne({ userId: new Types.ObjectId(userInfo._id) })
          UserSocket.setExposer({
            balance: balance?.balance,
            exposer: balance?.exposer,
            userId: userInfo._id,
          })
          return res.status(200).json({
            balance: balance?.balance - balance?.exposer,
            bet_status: "Y",
            status: 'OP_SUCCESS',
          })
        } else {
          if (checkBetExist) {
            return res.status(500).json({
              balance: 0,
              bet_status: "N",
              status: 'OP_DUPLICATE_TRANSACTION',
            })
          } else {
            return res.status(500).json({
              balance: 0,
              bet_status: "N",
              status: 'OP_FAILURE_BET_EXIST',
            })
          }
        }
      } else {
        return res.status(500).json({
          bet_status: "N",
          balance: 0,
          status: 'OP_FAILURE',
        })
      }
    } catch (e: any) {
      return res.status(500).json({
        balance: 0,
        bet_status: "N",
        status: 'OP_FAILURE',
      })
    }
  }
}
