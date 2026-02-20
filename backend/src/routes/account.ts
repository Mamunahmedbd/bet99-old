import { Router } from 'express'
import { AccountController } from '../controllers/AccountController'
import Passport from '../passport/Passport'
import { CasinoController } from '../controllers/CasinoController'

export class AccountRoutes {
  public router: Router
  public AccountController: AccountController = new AccountController()
  public CasinoController: CasinoController = new CasinoController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    // this.router.get(
    //   "/Account",
    //   Passport.authenticateJWT,
    //   this.AccountController.Account
    // );
    // this.router.get("/Account", this.AccountController.Accounts);
    // this.router.post("/Account", this.AccountController.saveAccount);
    this.router.post(
      '/account-statement-list',
      Passport.authenticateJWT,
      this.AccountController.getAccountStmtList,
    )
    this.router.get(
      '/get-casino-games',
      Passport.authenticateJWT,
      this.CasinoController.getCasinoList,
    )
    this.router.get(
      '/get-casino-int-games',
      Passport.authenticateJWT,
      this.CasinoController.getCasinoIntList,
    )
    this.router.get(
      '/disable-casino-games',
      Passport.authenticateJWT,
      this.CasinoController.disableCasinoGame,
    )

    this.router.get(
      '/get-casino-data-by-id/:slug',
      Passport.authenticateJWT,
      this.CasinoController.getCasinoData,
    )

    this.router.get("/html-cards/:type/:roundId", Passport.authenticateJWT, this.CasinoController.htmlCards);

    this.router.get("/done-results/:type", Passport.authenticateJWT, this.CasinoController.results);


    this.router.post('/profit-loss', Passport.authenticateJWT, this.AccountController.profitloss)
  }
}
