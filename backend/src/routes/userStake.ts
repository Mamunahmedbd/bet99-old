import { Router } from 'express'
import Passport from '../passport/Passport'
import Http from '../middlewares/Http'
import { UserStakeController } from '../controllers/UserStakeController'
import { userStakeValidation } from '../validations/userStake.validation'

export class UserStakeRoutes {
  public router: Router
  public userStakeController: UserStakeController = new UserStakeController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-user-stake', Passport.authenticateJWT, this.userStakeController.getStake)

    this.router.post(
      '/save-user-stake',
      Passport.authenticateJWT,
      userStakeValidation,
      Http.validateRequest,
      this.userStakeController.saveStake,
    )
  }
}
