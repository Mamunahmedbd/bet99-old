import { Router } from 'express'
import Passport from '../passport/Passport'
import Http from '../middlewares/Http'
import { UserBookController } from '../controllers/UserBookController'

export class UserBookRoutes {
  public router: Router
  public userBookController: UserBookController = new UserBookController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post(
      '/get-fancy-position',
      Passport.authenticateJWT,
      this.userBookController.getfancybook,
    )
    this.router.get(
      '/get-market-analysis',
      Passport.authenticateJWT,
      this.userBookController.getmarketanalysis,
    )
    this.router.get('/get-user-book', Passport.authenticateJWT, this.userBookController.getuserbook)
    this.router.post(
      '/get-user-wise-book',
      Passport.authenticateJWT,
      this.userBookController.getUserWiseBook,
    )
  }
}
