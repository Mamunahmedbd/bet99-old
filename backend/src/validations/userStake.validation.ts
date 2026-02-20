import { check } from 'express-validator'

export const userStakeValidation = [
  check('name1', 'Name1 is requied').not().isEmpty(),
  check('value1', 'Value1 is requied').not().isEmpty(),
  check('name2', 'Name2 is requied').not().isEmpty(),
  check('value2', 'Value2 is requied').not().isEmpty(),
  check('name3', 'Name3 is requied').not().isEmpty(),
  check('value3', 'Value3 is requied').not().isEmpty(),
  check('name4', 'Name4 is requied').not().isEmpty(),
  check('value4', 'Value4 is requied').not().isEmpty(),
  check('name5', 'Name5 is requied').not().isEmpty(),
  check('value5', 'Value5 is requied').not().isEmpty(),
  check('name6', 'Name6 is requied').not().isEmpty(),
  check('value6', 'Value6 is requied').not().isEmpty(),
  check('name7', 'Name7 is requied').not().isEmpty(),
  check('value7', 'Value7 is requied').not().isEmpty(),
  check('name8', 'Name8 is requied').not().isEmpty(),
  check('value8', 'Value8 is requied').not().isEmpty(),
  check('name9', 'Name9 is requied').not().isEmpty(),
  check('value9', 'Value9 is requied').not().isEmpty(),
  check('name10', 'Name10 is requied').not().isEmpty(),
  check('value10', 'Value10 is requied').not().isEmpty(),
]
