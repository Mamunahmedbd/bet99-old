import mongoose from 'mongoose'
import bluebird from 'bluebird'

import Locals from './Locals'
import Log from '../middlewares/Log'
import { CallbackError } from 'mongoose'
import cachegoose from 'recachegoose'

export class Database {
  // Initialize your database pool
  public static init(): void {
    const dsn = `${Locals.config().mongooseUrl}?retryWrites=false`;

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,
    };

    // Set Mongoose to use Bluebird promises
    mongoose.Promise = bluebird;

    // Initialize Redis cache
    this.redisCache();

    // Connect to MongoDB
    mongoose
      .connect(dsn, options)
      .then(() => {
        Log.info('Connected to Mongo server at: ' + dsn);
      })
      .catch((error: CallbackError) => {
        Log.info('Failed to connect to the Mongo server!!');
        console.error(error);
        throw error;
      });
  }

  // Initialize Redis cache
  public static redisCache(): void {
    cachegoose(mongoose, {
      engine: 'redis',
      port: +process.env.REDIS_QUEUE_PORT!, // Ensure these environment variables are defined
      host: process.env.REDIS_QUEUE_HOST!,
    });
  }

  // Get Mongoose connection instance
  public static getInstance(): mongoose.Connection {
    return mongoose.connection;
  }
}

export default mongoose
