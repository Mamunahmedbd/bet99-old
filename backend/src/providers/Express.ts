import express from 'express'
import ExceptionHandler from '../exception/Handler'
import Http from '../middlewares/Http'
import Bootstrap from '../middlewares/Kernel'
import { routes } from '../routes'
import Locals from './Locals'
class Express {
  /**
   * Create the express object
   */
  public express: express.Application

  /**
   * Initializes the express server
   */
  constructor() {
    this.express = express()
    this.mountDotEnv()
    this.mountMiddlewares()
    this.routes()
  }

  private mountDotEnv(): void {
    this.express = Locals.init(this.express)
  }

  /**
   * Mounts all the defined middlewares
   */
  private mountMiddlewares(): void {
    this.express = Bootstrap.init(this.express)
  }

  /**
   * Starts the express server
   */
  public init(): void {
    const port: number = Locals.config().port
    const portHttps: number = Locals.config().portHttps

    // Registering Exception / Error Handlers
    this.express.use(ExceptionHandler.logErrors)
    this.express.use(ExceptionHandler.clientErrorHandler)
    this.express.use(ExceptionHandler.errorHandler)

    this.express = ExceptionHandler.notFoundHandler(this.express)

    // const options = {
    //   key: readFileSync(path.resolve('certificate/cert.key')),
    //   cert: readFileSync(path.resolve('certificate/cert.pem')),
    // }
    // const server = createServer(options, this.express)
    // @ts-ignore
    // Start the server on the specified port
    this.express
      .listen(port, () => {
        return console.log('\x1b[33m%s\x1b[0m', `Server :: Running @ 'http://localhost:${port}'`)
      })
      .on('error', (_error) => {
        return console.log('Error: ', _error.message)
      })
    // server
    //   .listen(portHttps, () => {
    //     return console.log('\x1b[33m%s\x1b[0m', `Server :: Running @ 'http://localhost:${port}'`)
    //   })
    //   .on('error', (_error) => {
    //     return console.log('Error: ', _error.message)
    //   })
  }

  private routes() {
    this.express.use(routes)
    this.express.use(Http.postMiddleware)
  }
}

/** Export the express module */
export default new Express()
