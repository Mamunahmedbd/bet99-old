import { Router } from 'express'
import { BetController } from '../controllers/BetController'
import { BetLockController } from '../controllers/BetLockController'
import Http from '../middlewares/Http'
import Passport from '../passport/Passport'
import { betLockValidation } from '../validations/bet-lock.validation'

export class BetRoute {
  public router: Router
  public betController: BetController = new BetController()
  public betLockController: BetLockController = new BetLockController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/placebet', Passport.authenticateJWT, this.betController.placebet)

    this.router.post('/getexposer', Passport.authenticateJWT, this.betController.getexposer)

    this.router.get('/bets', Passport.authenticateJWT, this.betController.betList)

    this.router.post(
      '/get-bet-list-by-ids',
      Passport.authenticateJWT,
      this.betController.getBetListByIds,
    )

    this.router.post('/alluserbetList', Passport.authenticateJWT, this.betController.alluserbetList)
    this.router.get(
      '/get-exposer-event',
      Passport.authenticateJWT,
      this.betController.getExposerEvent,
    )

    this.router.delete(
      '/delete-current-bet/:id',
      Passport.authenticateJWT,
      this.betController.deleteCurrentBet,
    )

    this.router.post('/delete-bets', Passport.authenticateJWT, this.betController.deleteBets)

    this.router.post(
      '/bet-lock',
      betLockValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.betLockController.betLock,
    )
    this.router.get(
      '/get-child-user-list',
      Passport.authenticateJWT,
      this.betLockController.getChildUserList,
    )
    this.router.post('/users-lock', Passport.authenticateJWT, this.betLockController.usersLock)
  }
}
