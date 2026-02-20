import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import Log from '../middlewares/Log'
import { IUserModel, User } from '../models/User'
import Locals from '../providers/Locals'

class JwtStrategy {
  public static init(_passport: any): any {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Locals.config().appSecret,
    }
    _passport.use(
      new Strategy(opts, ({ username }, done: any) => {
        User.findOne({ username: username })
          // @ts-ignore
          /// .cache(1800, `user-cache-${username.toLowerCase()}`)
          .then((user: IUserModel) => {
            if (user) {
              const {
                _id,
                username,
                role,
                level,
                partnership,
                userSetting,
                changePassAndTxn,
                sessionId,
                parentId
              } = user
              return done(null, {
                _id,
                username,
                sessionId,
                role,
                level,
                partnership,
                userSetting,
                changePassAndTxn,
                parentId
              })
            }
            return done(null, false)
          })
      }),
    )
  }
}

export default JwtStrategy
