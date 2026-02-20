import { Router } from 'express'
import Passport from '../passport/Passport'
import Http from '../middlewares/Http'
import multer from 'multer'
import path from 'node:path'
import { DepositWithdrawController } from '../controllers/DepositWithdrawController'
import { addBankAccountValidation, addDepositWithdraw, deleteBankUpiValidation, getDepositWithdraw, updateDepositWithdraw, upiValidation } from '../validations/deposit-withdraw.validation'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    // Preserve the original extension
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

export class DepositWithdrawRoutes {
  public router: Router
  public DepositWithdrawController: DepositWithdrawController = new DepositWithdrawController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post(
      '/add-bank-account',
      Passport.authenticateJWT,
      addBankAccountValidation,
      Http.validateRequest,
      this.DepositWithdrawController.addBankAccount,
    )

    this.router.post(
      '/add-upi',
      Passport.authenticateJWT,
      upiValidation,
      Http.validateRequest,
      this.DepositWithdrawController.addUpi,
    )

    this.router.post(
      '/delete-upi-bank',
      Passport.authenticateJWT,
      deleteBankUpiValidation,
      Http.validateRequest,
      this.DepositWithdrawController.deleteBankAndUpiAccount,
    )

    this.router.post(
      '/add-deposit-withdraw',
      upload.single('imageUrl'),
      Passport.authenticateJWT,
      addDepositWithdraw,
      Http.validateRequest,
      this.DepositWithdrawController.addDepositWithdraw,
    )

    this.router.get(
      '/get-bank-and-upi-list',
      Passport.authenticateJWT,
      this.DepositWithdrawController.getBankAndUpiAccount,
    )

    this.router.post(
      '/get-deposit-withdraw-list',
      Passport.authenticateJWT,
      getDepositWithdraw,
      Http.validateRequest,
      this.DepositWithdrawController.getDepositWithdraw,
    )

    this.router.post(
      '/update-deposit-withdraw-status',
      Passport.authenticateJWT,
      updateDepositWithdraw,
      Http.validateRequest,
      this.DepositWithdrawController.updateDepositWithdraw,
    )
  }
}
