/**
 * Primary file for your Clustered API Server
 *
 * @author Faiz A. Farooqui <faiz@geekyants.com>
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

import Express from './Express'
import { Database } from './Database'

import Log from '../middlewares/Log'

class App {
  // Clear the console
  public clearConsole(): void {
    process.stdout.write('\x1B[2J\x1B[0f')
  }

  // Loads your dotenv file
  public loadConfiguration(): void {
    Log.info('Configuration :: Booting @ Master...')
    const fileName =
      process.env.NODE_ENV === 'development' ? '.env' : `.env.${process.env.NODE_ENV}`
    dotenv.config({
      path: path.join(__dirname, `../../${fileName}`),
    })
  }

  // Loads your Server
  public loadServer(): void {
    Log.info('Server :: Booting @ Master...')

    Express.init()
  }

  // Loads the Database Pool
  public loadDatabase(): void {
    Log.info('Database :: Booting @ Master...')

    Database.init()
  }
}

export default new App()
