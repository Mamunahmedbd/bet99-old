import { check } from 'express-validator'

export const saveMatchValidation = [
  check('matches.*.sportId', 'Sport Id is requied').not().isEmpty(),
  check('matches.*.seriesId', 'Series Id is requied').not().isEmpty(),
  check('matches.*.countryCode', 'Country Code is requied').not().isEmpty(),
  check('matches.*.matchDateTime', 'Match Date Time is requied').not().isEmpty(),
  check('matches.*.name', 'name is requied').not().isEmpty(),
  check('matches.*.matchId', 'Match Id is requied').not().isEmpty(),
]

export const matchIdValidation = [check('matchId', 'Match Id is requied').not().isEmpty()]
