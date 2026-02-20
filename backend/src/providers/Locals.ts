/**
 * Define App Locals & Configs
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import { Application } from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'

class Locals {
  /**
   * Makes env configs available for your app
   * throughout the app's runtime
   */
  public static config(): any {
    dotenv.config({ path: path.join(__dirname, '../../.env') })

    const url = process.env.APP_URL || `http://localhost:${process.env.PORT}`
    const port = process.env.PORT || 3010
    const portHttps = process.env.HTTPS_PORT || 3011
    const appSecret = process.env.APP_SECRET || '1242#$%$^%!@@$!%*(%^jnadkjcn'
    const mongooseUrl = process.env.MONGOOSE_URL
    const maxUploadLimit = process.env.APP_MAX_UPLOAD_LIMIT || '50mb'
    const maxParameterLimit = process.env.APP_MAX_PARAMETER_LIMIT || '50mb'

    const name = process.env.APP_NAME || 'NodeTS Dashboard'
    const keywords = process.env.APP_KEYWORDS || 'somethings'

    const isCORSEnabled = process.env.CORS_ENABLED || true
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d'
    const apiPrefix = process.env.API_PREFIX || 'api'

    const logDays = process.env.LOG_DAYS || 10

    const redisHttpPort = process.env.REDIS_QUEUE_PORT || 6379
    const redisHttpHost = process.env.REDIS_QUEUE_HOST || '127.0.0.1'
    // const redisPrefix = process.env.REDIS_QUEUE_DB || 'q';
    // const redisDB = process.env.REDIS_QUEUE_PREFIX || 3;

    return {
      appSecret,
      apiPrefix,
      isCORSEnabled,
      jwtExpiresIn,
      keywords,
      logDays,
      maxUploadLimit,
      maxParameterLimit,
      mongooseUrl,
      name,
      port,
      portHttps,
      // redisDB,
      redisHttpPort,
      redisHttpHost,
      // redisPrefix,
      url,
    }
  }

  /**
   * Injects your config to the app's locals
   */
  public static init(_express: Application): Application {
    _express.locals.app = this.config()
    return _express
  }
}

export default Locals
