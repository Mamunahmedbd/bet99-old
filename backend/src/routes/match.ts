import { Router } from 'express'
import { MatchController } from '../controllers/MatchController'
import Http from '../middlewares/Http'
import Passport from '../passport/Passport'

export class MatchRoutes {
  public router: Router
  public MatchController: MatchController = new MatchController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get(
      '/active-matches',
      Passport.authenticateJWT,
      Http.adminUserRequest,
      this.MatchController.activeMatches,
    )

    this.router.get(
      '/change-status-match',
      Passport.authenticateJWT,
      Http.adminUserRequest,
      this.MatchController.matchActiveInactive,
    )

    this.router.get(
      '/delete-match',
      Passport.authenticateJWT,
      Http.adminUserRequest,
      this.MatchController.matchDelete,
    )
    this.router.post(
      '/get-match-list-suggestion',
      Passport.authenticateJWT,
      this.MatchController.getMatchListSuggestion,
    )
  }
}
