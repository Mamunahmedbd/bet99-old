import { Router } from 'express'
import { FancyController } from '../controllers/FancyController'
import Http from '../middlewares/Http'
import Passport from '../passport/Passport'
import { CasCallbackController } from '../controllers/CasCallbackController'

export class CallbackRoutes {
  public router: Router
  public casCallBackController: CasCallbackController = new CasCallbackController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/get-balance', this.casCallBackController.getbalance)
    this.router.post('/get-bet-request', this.casCallBackController.getBetrequest)
    this.router.post('/get-win-request', this.casCallBackController.getCreditRequest)

  }
}
