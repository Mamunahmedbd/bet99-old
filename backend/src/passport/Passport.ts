import { Application, NextFunction, Request, Response } from 'express'
import passport from 'passport'
import JwtStrategy from './Jwt'
import Log from '../middlewares/Log'
import { IUser, User } from '../models/User'
import { error } from '../util/ResponseApi'

class Passport {
  public mountPackage(_express: Application): Application {
    _express = _express.use(passport.initialize())
    // _express = _express.use(passport.session());

    passport.serializeUser<any, any>((user, done) => {
      // @ts-ignore
      done(null, user.id)
    })

    passport.deserializeUser<any, any>((id, done) => {
      User.findById(id, (err: any, user: typeof User) => {
        done(err, user)
      })
    })

    this.mountLocalStrategies()

    return _express
  }

  public mountLocalStrategies(): void {
    try {
      JwtStrategy.init(passport)
    } catch (_err: any) {
      Log.error(_err.stack)
    }
  }

  public isAuthenticated(req: Request, res: Response, next: NextFunction): Response | void {
    if (req.isAuthenticated()) {
      return next()
    }

    return res.redirect('/login')
  }

  public isAuthorized(req: Request, res: Response, next: NextFunction): Response | void {
    const provider = req.path.split('/').slice(-1)[0]
    // @ts-ignore
    const token = req.user.tokens.find((token: any) => token.kind === provider)
    if (token) {
      return next()
    } else {
      return res.redirect(`/auth/${provider}`)
    }
  }

  public authenticateJWT(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate('jwt', function (err: Error, user: IUser, info: any) {
      if (err) {
        return res.status(401).json(error(info?.message ? info.message : '', {}, res.statusCode))
      }
      if (!user) {
        return res.status(401).json(error(info?.message ? info.message : '', {}, res.statusCode))
      } else {
        req.user = user
        return next()
      }
    })(req, res, next)
  }
}

export default new Passport()
