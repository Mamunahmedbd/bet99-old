import { check } from 'express-validator'

export const saveSportSettings = [
  check('matchId', 'Series Id is requied').not().isEmpty(),
  check('inPlayMinLimit', 'inPlayMinLimit is requied').not().isEmpty(),
  check('inPlayMaxLimit', 'inPlayMaxLimit is requied').not().isEmpty(),
  check('offPlayMinLimit', 'offPlayMinLimit is requied').not().isEmpty(),
  check('offPlayMaxLimit', 'offPlayMaxLimit is requied').not().isEmpty(),
]
