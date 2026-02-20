import { check } from 'express-validator'

export const addBankAccountValidation = [
  check('accountHolderName', 'Account Holder name is required').not().isEmpty(),
  check('accountNumber', 'Account number is required').not().isEmpty(),
  check('ifscCode', 'IFSC code is required').not().isEmpty(),
]

export const upiValidation = [check('upiId', 'Upi id is required').not().isEmpty()]

export const deleteBankUpiValidation = [
  check('type', 'type is required')
    .not()
    .isEmpty()
    .isIn(['upi', 'bank'])
    .withMessage('type should be upi or bank'),
  check('id', 'id is required').not().isEmpty(),
]

export const addDepositWithdraw = [
  check('type', 'type is required')
    .not()
    .isEmpty()
    .isIn(['deposit', 'withdraw'])
    .withMessage('type should be deposit or withdraw'),
  check('amount', 'amount is required')
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage('amount should be number'),
  check('remark', 'remark is required').not().isEmpty(),
]

export const getDepositWithdraw = [
  check('type', 'type is required')
    .not()
    .isEmpty()
    .isIn(['deposit', 'withdraw'])
    .withMessage('type should be deposit or withdraw'),
]

export const updateDepositWithdraw = [
  check('id', 'id is required').not().isEmpty(),
  check('narration', 'Narration is required').not().isEmpty(),
  check('balanceUpdateType', 'Balance type required').not().isEmpty().isIn(['W', 'D']),
  check('status', 'Status required').not().isEmpty().isIn(['approved', 'rejected']),
]
