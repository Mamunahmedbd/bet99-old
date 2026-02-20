import { Request, Response } from 'express'
import { BankAccount } from '../models/BankAccount'
import { IUserModel, User } from '../models/User'
import { ApiController } from './ApiController'
import { DepositWithdraw, IDepositWithdrawModel } from '../models/DepositWithdraw'
import { Types } from 'mongoose'
import { RoleType } from '../models/Role'
import { AccountController } from './AccountController'
import { Balance } from '../models/Balance'
import { Upi } from '../models/Upi'

export class DepositWithdrawController extends ApiController {
  addBankAccount = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserModel
      const bank = await BankAccount.create({ userId: user._id, ...req.body })
      return this.success(res, { success: true, bank }, 'Bank account added successfully')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  addUpi = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserModel
      const upi = await Upi.create({ userId: user._id, ...req.body })
      return this.success(res, { success: true, upi }, 'Upi account added successfully')
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  getBankAndUpiAccount = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserModel
      const upi = await Upi.find({ userId: user._id }).exec()
      const bank = await BankAccount.find({ userId: user._id }).exec()
      return this.success(res, { upi, bank })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  deleteBankAndUpiAccount = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserModel
      if (req.body.type === 'upi')
        await Upi.deleteOne({ _id: req.body.id, userId: user._id }).exec()
      else
        await BankAccount.deleteOne({ _id: req.body.id, userId: user._id }).exec()

      return this.success(res, { success: true })
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  addDepositWithdraw = async (req: Request, res: Response): Promise<any> => {
    try {
      let user = req.user as IUserModel
      user = await User.findOne({ _id: new Types.ObjectId(user?._id) })
      const filePath = req.file ? req.file.path : null
      const { type, utrno } = req.body
      const parentUsers = [...user.parentStr!]
      const checkWithdraw = await DepositWithdraw.findOne({ userId: user._id, status: 'pending', type: type })
      if (checkWithdraw) throw Error(`You have already created ${type} request!`)

      const getBalWithExp: any = await Balance.findOne({ userId: user._id })
      if (getBalWithExp.balance - getBalWithExp.exposer < req.body.amount && type == "withdraw") {
        throw Error('Insufficient amount to withdrawal, Due to pending exposure or less amount')
      }

      await DepositWithdraw.create({
        userId: user._id,
        parentId: parentUsers?.pop(),
        parentStr: user.parentStr,
        username: user.username,
        ...req.body,
        imageUrl: filePath,
        orderId: Date.now(),
        utrno: utrno
      })

      return this.success(
        res,
        { success: true },
        `${req.body.type === 'deposit' ? 'Deposit' : 'Withdraw'} amount added successfully`,
      )
    } catch (e: any) {
      return this.fail(res, e.message)
    }
  }

  getDepositWithdraw = async (req: Request, res: Response): Promise<any> => {
    try {
      let { startDate, endDate, username, reportType } = req.body
      const user = req.user as IUserModel
      let query: any = {
        userId: new Types.ObjectId(user._id),
        type: req.body.type,
      }
      if (user.role !== RoleType.user) {
        delete query.userId
        query.parentStr = { $elemMatch: { $eq: new Types.ObjectId(user._id) } }
      }

      if (username) query.username = username

      if (startDate) {
        query.createdAt = {
          $gte: startDate.includes('T')
            ? `${startDate.replace('T', ' ')}:00`
            : `${startDate} 00:00:00`,
        }
      }
      if (endDate) {
        query.createdAt = {
          ...query.createdAt,
          $lte: endDate.includes('T') ? `${endDate.replace('T', ' ')}:00` : `${endDate} 23:59:59`,
        }
      }

      if (reportType && reportType != 'ALL') {
        query.status = reportType
      }

      const data = await DepositWithdraw.find(query).exec()
      return this.success(res, data)
    } catch (e: any) {
      return this.fail(res, e)
    }
  }

  updateDepositWithdraw = async (req: Request, res: Response): Promise<any> => {
    try {
      const user = req.user as IUserModel
      const { id, status, ...rest } = req.body
      const txn: any = await DepositWithdraw.findOne({
        _id: new Types.ObjectId(id),
        status: 'pending',
      })
      if (!txn) return this.fail(res, 'Entry not found')
      txn.remark = req.body.narration
      if (status === 'approved') {
        req.body.amount = txn.amount
        req.body.parentUserId = txn.parentId
        req.body.userId = txn.userId

        const { userAccBal, pnlData } = await new AccountController().depositWithdraw(
          req,
          req?.user as IUserModel,
        )
        const successMsg = 'Transaction Approved'

        if (successMsg) {
          txn.status = status
        }
        await txn.save()

        return this.success(res, { success: true }, successMsg)
      } else {
        const successMsg = 'Transaction rejected'
        txn.status = 'rejected'
        await txn.save()

        return this.success(res, { success: true }, successMsg)
      }
    } catch (e: any) {
      return this.fail(res, e)
    }
  }
}
