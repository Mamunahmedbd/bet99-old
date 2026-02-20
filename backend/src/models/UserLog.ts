import { Document, Schema, Model, model, PopulatedDoc, Types } from 'mongoose'
import { IUser } from './User'

export interface IUserLog {
  userId: PopulatedDoc<IUser>
  logs: object
}

export interface IUserLogModel extends IUserLog, Document {}

export const userLogSchema: Schema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    logs: Object,
  },
  {
    timestamps: true,
  },
)

export const UserLog: Model<IUserLogModel> = model<IUserLogModel>('UserLog', userLogSchema)
