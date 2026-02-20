import express, { Request, Response } from 'express'
import { TodoRoutes } from './todo'
import { UserRoutes } from './user'
import { SportRoutes } from './sports'
import path from 'node:path'
import { UserStakeRoutes } from './userStake'
import { BetRoute } from './bet'
import { MatchRoutes } from './match'
import { MarketRoutes } from './market'
import { FancyRoutes } from './fancy'
import { AccountRoutes } from './account'
import Passport from '../passport/Passport'
import { AuthController } from '../controllers/AuthController'
import Http from '../middlewares/Http'
import { SportSettingsRoutes } from './sport-settings'
import { UserBookRoutes } from './book'
import { CasinoController } from '../controllers/CasinoController'
import { T10ResultRoutes } from './t10-result'
import { FancyController } from '../controllers/FancyController'
import { MatchController } from '../controllers/MatchController'
import { BetController } from '../controllers/BetController'
import SportsController from '../controllers/SportsController'
import { DepositWithdrawRoutes } from './deposit-withdraw'
import { CallbackRoutes } from './intcasino'

const router = express.Router()

router.get('/api/t10', function (req, res) {
  const { id } = req.query
  return res.send(`<iframe src='https://alpha-n.qnsports.live/route/rih.php?id=${id}'></iframe>`)
})

router.post('/api/login', new AuthController().login)
router.post('/api/login-admin', new AuthController().loginAdmin)
router.get(
  '/api/setResult/:casinoType/:beforeResultSet?/:matchId?',
  new CasinoController().setResult,
)
router.get('/api/setResultByCron', new CasinoController().setResultByCron)
router.get('/api/setResultByTimePeriod', new CasinoController().setResultByTimePeriod)
router.post('/api/save-casino-match', new CasinoController().saveCasinoMatchData)

router.get('/api/result-fancy-no-token', new FancyController().declarefancyresult)
router.post('/api/sh', function (req, res) {
  console.log(req.params, req.body, req.query)
  return res.json({ helloworld: true })
})
router.get('/api/set-market-result-by-cron', new MatchController().setResultApi)

router.get('/api/result-market-auto', new FancyController().declaremarketresultAuto)
router.get('/api/result-market-fancy-auto', new FancyController().setT10FancyResult)

router.get('/api/get-business-fancy-list', new BetController().fancybetListSelection)
router.post('/api/update-fancy-result', new FancyController().updatefancyresultapi)

router.get('/api/resync_bookmaker_id', new SportsController().saveMatchResyncCron)
router.use('/api', new T10ResultRoutes().router)
router.use('/api', new SportRoutes().router)
router.use('/api/callback', new CallbackRoutes().router)

router.use('/api', Passport.authenticateJWT, Http.maintenance, new UserRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new TodoRoutes().router)

router.use('/api', Passport.authenticateJWT, Http.maintenance, new UserStakeRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new BetRoute().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new MatchRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new MarketRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new FancyRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new AccountRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new SportSettingsRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new UserBookRoutes().router)
router.use('/api', Passport.authenticateJWT, Http.maintenance, new DepositWithdrawRoutes().router)

// router.get("/", (req: Request, res: Response) => {
//   return res.json({ helloWorld: "Hello World" });
// });

router.get('/*', (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, '../../public', 'index.html'))
})

export { router as routes }
