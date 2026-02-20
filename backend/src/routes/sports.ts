import { Router } from 'express'
import SportsController from '../controllers/SportsController'
import Http from '../middlewares/Http'
import Passport from '../passport/Passport'
import { matchIdValidation, saveMatchValidation } from '../validations/match.validation'
import { saveSeriesValidation } from '../validations/sport.validation'

export class SportRoutes {
  public router: Router
  public SportController: SportsController = new SportsController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/get-sport-list', this.SportController.getSportList)
    this.router.post('/add-new-fancy', this.SportController.addFancyToDb)

    this.router.post('/deactivate-fancy', this.SportController.deactivateFancy)

    this.router.post('/deactivate-markets', this.SportController.deactivateMarkets)

    this.router.post('/activate-markets', this.SportController.activateMarkets)

    this.router.get('/get-series-with-market', this.SportController.getSeriesWithMarket)
    this.router.get(
      '/get-series-with-market-with-date',
      this.SportController.getSeriesWithMarketWithDate,
    )

    this.router.post('/inplay-market', this.SportController.inplayMarket)
    this.router.post(
      '/save-series',
      saveSeriesValidation,
      Http.validateRequest,
      this.SportController.saveSeries,
    )

    this.router.post(
      '/save-match',
      saveMatchValidation,
      Http.validateRequest,
      this.SportController.saveMatch,
    )

    this.router.get('/get-match-list', this.SportController.getMatchList)

    this.router.get(
      '/get-fancy-list',
      matchIdValidation,
      Http.validateRequest,
      this.SportController.getFancyList,
    )

    this.router.get(
      '/get-match-by-id',
      Passport.authenticateJWT,
      matchIdValidation,
      Http.validateRequest,
      this.SportController.getMatchById,
    )

    this.router.get(
      '/get-market-list',
      Passport.authenticateJWT,
      matchIdValidation,
      Http.validateRequest,
      this.SportController.getMarketList,
    )
  }
}
