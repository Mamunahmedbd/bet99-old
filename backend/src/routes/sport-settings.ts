import { Router } from 'express'
import { SportSettingsController } from '../controllers/SportSettingsController'

import Http from '../middlewares/Http'
import Passport from '../passport/Passport'
import { saveSportSettings } from '../validations/sport-settings.validation'

export class SportSettingsRoutes {
  public router: Router
  public SportSettingsController: SportSettingsController = new SportSettingsController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post(
      '/save-sport-settings',
      Passport.authenticateJWT,
      saveSportSettings,
      Http.validateRequest,
      this.SportSettingsController.saveSportSettings,
    )
  }
}
