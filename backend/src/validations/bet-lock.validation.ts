import { check } from 'express-validator'

export const betLockValidation = [
  check('match.matchId', 'Match Id is requied').not().isEmpty(),
  check('type', 'Type is requied').not().isEmpty().isIn(['M', 'B', 'F']), // M=>Match Odds, B=Book,F=Fancy
]
