import * as path from 'path'
import * as express from 'express'

import Log from './Log'

class Statics {
  public static mount(_express: express.Application): express.Application {
    Log.info("Booting the 'Statics' middleware...")

    // Loads Options
    const options = { maxAge: 31557600000 }

    // Load Statics
    _express.use('/', express.static(path.join(__dirname, '../../public'), options))
    _express.use('/uploads', express.static(path.join(__dirname, '../../uploads')))
    _express.use(
      '/uploads-settings',
      express.static(path.join(__dirname, '../../uploads-settings')),)
    // Load NPM Statics
    _express.use('/vendor', express.static(path.join(__dirname, '../../node_modules'), options))

    return _express
  }
}

export default Statics
