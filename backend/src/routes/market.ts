import { Router } from 'express'
import { MarketController } from '../controllers/MarketController'
import Http from '../middlewares/Http'
import Passport from '../passport/Passport'

export class MarketRoutes {
  public router: Router
  public MarketController: MarketController = new MarketController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/active-markets',
      Passport.authenticateJWT,
      Http.adminUserRequest,
      this.MarketController.activeMarkets,
    )
    this.router.get(
      '/change-status-markets',
      Passport.authenticateJWT,
      Http.adminUserRequest,
      this.MarketController.marketActiveInactive,
    )

    this.router.get(
      '/delete-market',
      Passport.authenticateJWT,
      Http.adminUserRequest,
      this.MarketController.marketDelete,
    )
  }
}
