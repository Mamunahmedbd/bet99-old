/**
 * Define cache middleware
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import { NextFunction, Request, Response } from 'express'
import * as mcache from 'memory-cache'

class Cache {
  /**
   * Checks for the available cached data
   * or adds if not available
   */
  public cache(_duration: number): any {
    return (req: Request, res: Response, next: NextFunction) => {
      let key = '__express__' + req.originalUrl || req.url

      let cachedBody = mcache.get(key)
      if (cachedBody) {
        res.send(cachedBody)
      } else {
        // @ts-ignore
        res.sendResponse = res.send
        // @ts-ignore
        res.send = (body) => {
          mcache.put(key, body, _duration * 1000)
          // @ts-ignore
          res.sendResponse(body)
        }
        next()
      }
    }
  }
}

export default new Cache()
