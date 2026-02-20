import { check } from 'express-validator'

export const saveSeriesValidation = [
  check('seriesId', 'Series Id is requied').not().isEmpty(),
  check('sportId', 'Sport Id is requied').not().isEmpty(),
  check('seriesName', 'Series Name is requied').not().isEmpty(),
  check('region', 'Region is requied').not().isEmpty(),
  check('marketCount', 'MarketCount is requied').not().isEmpty(),
]
