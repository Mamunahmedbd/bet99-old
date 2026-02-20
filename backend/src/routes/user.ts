import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import Passport from '../passport/Passport'
import {
  accountBalanceValidation,
  passwordUpdateValidation,
  refreshTokenValidation,
  resetTxnPassword,
  saveGenSettings,
  signupValidation,
  statusValidation,
  walletValidation,
} from '../validations/user.validation'
import Http from '../middlewares/Http'
import { DealersController } from '../controllers/DealersController'
import { AccountController } from '../controllers/AccountController'

export class UserRoutes {
  public router: Router
  public authController: AuthController = new AuthController()
  public dealerController: DealersController = new DealersController()
  public accountController: AccountController = new AccountController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.get('/user-info', Passport.authenticateJWT, this.authController.getUser)
    /* Dealer Routes */
    this.router.post(
      '/register',
      signupValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.dealerController.signUp,
    )

    this.router.post(
      '/refresh-token',
      refreshTokenValidation,
      Http.validateRequest,
      this.authController.refreshToken,
    )

    this.router.get('/get-user-list', Passport.authenticateJWT, this.dealerController.getUserList)

    this.router.get(
      '/get-user-detail',
      Passport.authenticateJWT,
      this.dealerController.getUserDetail,
    )

    this.router.get(
      '/get-parent-user-detail',
      Passport.authenticateJWT,
      this.dealerController.getParentUserDetail,
    )

    this.router.post(
      '/update-user',
      passwordUpdateValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.dealerController.updateUser,
    )

    this.router.post(
      '/update-user-status',
      statusValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.dealerController.updateUserStatus,
    )

    this.router.post(
      '/update-user-wallet',
      walletValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.dealerController.updateUserWallet,
    )

    this.router.post(
      '/user-account-balance',
      accountBalanceValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.accountController.saveUserDepositFC,
    )

    this.router.get(
      '/get-user-balance',
      Passport.authenticateJWT,
      this.accountController.getUserBalanceWithExposer,
    )

    this.router.post(
      '/update-password',
      Passport.authenticateJWT,
      this.authController.updatePassword,
    )

    this.router.post(
      '/get-user-list-suggestion',
      Passport.authenticateJWT,
      this.dealerController.getUserListSuggestion,
    )
    this.router.post(
      '/add-transaction-password',
      Passport.authenticateJWT,
      this.authController.addTransactionPassword,
    )

    this.router.post(
      '/save-general-setting',
      saveGenSettings,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.dealerController.saveGeneralSettings,
    )
    this.router.post(
      '/reset-transaction-password',
      resetTxnPassword,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.dealerController.resetTransactionPassword,
    )
  }
}
