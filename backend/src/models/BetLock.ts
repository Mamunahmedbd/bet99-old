import mongoose, { model, PopulatedDoc, Schema, Types } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import { IUser } from './User'

interface IBetLock {
  sportId: number
  matchId: number
  userId?: PopulatedDoc<IUser>
  parentId: PopulatedDoc<IUser>
  betFair: boolean
  book: boolean
  fancy: boolean
}

interface IBetLockModel extends IBetLock, Document {}

const BetLockSchema = new Schema(
  {
    sportId: Number,
    matchId: { type: Number, index: true },
    parentId: { type: Types.ObjectId, ref: 'User', index: true },
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    betFair: Boolean,
    book: Boolean,
    fancy: Boolean,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  },
)
BetLockSchema.plugin(paginate)

const BetLock = model<IBetLockModel, mongoose.PaginateModel<IBetLockModel>>(
  'BetLock',
  BetLockSchema,
)
export { IBetLock, BetLock, IBetLockModel }
