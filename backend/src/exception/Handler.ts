import { Application, NextFunction, Request, Response } from 'express'
import { nextTick } from 'process'
import Log from '../middlewares/Log'
import Locals from '../providers/Locals'
class Handler {
  /**
   * Handles all the not found routes
   */
  public static notFoundHandler(_express: Application): any {
    const apiPrefix = Locals.config().apiPrefix

    _express.use('*', (req: Request, res: Response) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

      Log.error(`Path '${req.originalUrl}' not found [IP: '${ip}']!`)
      if (req.xhr || req.originalUrl.includes(`/${apiPrefix}/`)) {
        return res.json({
          error: 'Page Not Found here',
        })
      } else {
        res.status(404)
        return res.json({
          error: 'Page Not Found',
        })
      }
    })

    return _express
  }

  /**
   * Handles your api/web routes errors/exception
   */
  public static clientErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | any {
    Log.error(err.stack)

    if (req.xhr) {
      return res.status(500).send({ error: 'Something went wrong!' })
    }
    return next(err)
  }

  /**
   * Show undermaintenance page incase of errors
   */
  public static errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | void {
    Log.error(err.stack)
    res.status(500)

    const apiPrefix = Locals.config().apiPrefix
    if (req.originalUrl && req.originalUrl.includes(`/${apiPrefix}/`)) {
      if (err.name && err.name === 'UnauthorizedError') {
        const innerMessage = err.inner && err.inner.message ? err.inner.message : undefined
        return res.json({
          error: ['Invalid Token!', innerMessage],
        })
      }

      return res.json({
        error: err,
      })
    }

    return res.json({
      error: 'Under M',
    })
  }

  /**
   * Register your error / exception monitoring
   * tools right here ie. before "next(err)"!
   */
  public static logErrors(err: any, req: Request, res: Response, next: NextFunction): void {
    Log.error(err.stack)

    return next(err)
  }
}

export default Handler
