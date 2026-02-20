import cors from 'cors'
import { Application } from 'express'
import compress from 'compression'

import Log from './Log'
import Locals from '../providers/Locals'
import Passport from '../passport/Passport'
import * as express from 'express'
import { validationResult } from 'express-validator'
import { validation, error } from '../util/ResponseApi'
import { RoleType } from '../models/Role'
import { existsSync, readFileSync } from 'node:fs'
import { checkMaintenance } from '../util/maintenance'

class Http {
  public static mount(_express: Application): Application {
    Log.info("Booting the 'HTTP' middleware...")

    // Enables the request body parser
    _express.use(
      express.json({
        limit: Locals.config().maxUploadLimit,
      }),
    )

    _express.use(
      express.urlencoded({
        limit: Locals.config().maxUploadLimit,
        parameterLimit: Locals.config().maxParameterLimit,
        extended: false,
      }),
    )

    // Disable the x-powered-by header in response
    _express.disable('x-powered-by')

    // Enables the CORS
    _express.use(cors())

    // Enables the "gzip" / "deflate" compression for response
    _express.use(compress())

    // Loads the passport configuration
    _express = Passport.mountPackage(_express)

    return _express
  }

  static validateRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorObject: { [key: string]: string } = {}
      errors.array().map((err) => {
        errorObject[err.param] = err.msg
      })
      return res.status(400).json(validation(errorObject))
    }
    next()
  }

  static adminUserRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user: any = req.user
    if (!user) {
      return res.status(400).json(error('You are not authrized'))
    } else if (user.role !== RoleType.admin && user.role !== RoleType.sadmin) {
      return res.status(400).json(error('You are not authrized'))
    }
    next()
  }

  static maintenance(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user: any = req.user
    if (user && user.role !== RoleType.admin) {
      const message = checkMaintenance()
      if (message) {
        return res.status(401).json(error(message.message, { maintenance: true }))
      }
    }
    next()
  }

  static postMiddleware = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): any => {
    const originalJson = res.json

    // @ts-ignore
    res.json = function (data) {
      const user: any = req.user
      if (user) data.changePassAndTxn = user.changePassAndTxn

      originalJson.call(this, data)
    }
    next()
  }
}

export default Http
