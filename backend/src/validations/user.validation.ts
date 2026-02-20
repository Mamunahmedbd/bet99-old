import { check } from 'express-validator'

export const signupValidation = [
  check('username', 'Username is requied').not().isEmpty(),
  // check("email", "Please include a valid email")
  //   .isEmail()
  //   .normalizeEmail({ gmail_remove_dots: true }),
  check('password', 'Password must be 6 or more characters').isLength({
    min: 6,
  }),
  check('role', 'Role is requied').not().isEmpty().isIn(['sadmin', 'smdl', 'mdl', 'dl', 'user']),
  check('parent', 'Parent is requied').not().isEmpty(),
  check('creditRefrences', 'Credit Refrences is requied').not().isEmpty(),
  //check('exposerLimit', 'exposerLimit is requied').not().isEmpty(),
  check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]

export const passwordUpdateValidation = [
  check('username', 'Username is requied').not().isEmpty(),
  check('password', 'Password must be 6 or more characters').isLength({
    min: 6,
  }),
  check('confirmPassword', 'Password must be 6 or more characters').isLength({
    min: 6,
  }),
  check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]

export const statusValidation = [
  check('username', 'Username is requied').not().isEmpty(),
  check('isUserActive', 'User active value required').not().isEmpty(),
  check('isUserBetActive', 'User bet value required').not().isEmpty(),
  // check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]

export const accountBalanceValidation = [
  check('userId', 'User id is requied').not().isEmpty(),
  check('parentUserId', 'Parent user id is requied').not().isEmpty(),
  check('amount', 'Amount value required').not().isEmpty(),
  check('balanceUpdateType', 'Balance type required').not().isEmpty().isIn(['W', 'D']),
  check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]

export const walletValidation = [
  check('username', 'User name is requied').not().isEmpty(),
  check('amount', 'Amount value required').not().isEmpty(),
  check('walletUpdateType', 'Wallet type required').not().isEmpty().isIn(['EXP', 'CRD']),
  check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]

export const refreshTokenValidation = [check('token', 'token is requied').not().isEmpty()]

export const saveGenSettings = [
  check('userId', 'User id is requied').not().isEmpty(),
  check('userSetting.1.minBet').isInt(),
  check('userSetting.1.maxBet').isInt(),
  check('userSetting.1.delay').isInt(),
  check('userSetting.2.minBet').isInt(),
  check('userSetting.2.maxBet').isInt(),
  check('userSetting.2.delay').isInt(),
  check('userSetting.4.minBet').isInt(),
  check('userSetting.4.maxBet').isInt(),
  check('userSetting.4.delay').isInt(),
  check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]

export const resetTxnPassword = [
  check('userId', 'User id is requied').not().isEmpty(),
  check('transactionPassword', 'Transaction Password is required').not().isEmpty(),
]
