import { model, Schema, PopulatedDoc, Types } from 'mongoose'
import cachegoose from 'recachegoose'
import { IUser } from './User'

interface IUserBetStake {
  userId: PopulatedDoc<IUser>
  name1: string
  value1: number
  name2: string
  value2: number
  name3: string
  value3: number
  name4: string
  value4: number
  name5: string
  value5: number
  name6: string
  value6: number
  name7: string
  value7: number
  name8: string
  value8: number
  name9: string
  value9: number
  name10: string
  value10: number
}

const defaultStack: any = {
  name1: '1000',
  value1: 1000,
  name2: '2000',
  value2: 2000,
  name3: '5000',
  value3: 5000,
  name4: '10000',
  value4: 10000,
  name5: '20000',
  value5: 20000,
  name6: '25000',
  value6: 25000,
  name7: '50000',
  value7: 50000,
  name8: '100000',
  value8: 100000,
  name9: '150000',
  value9: 150000,
  name10: '200000',
  value10: 200000,
}
interface IUserBetStakeModel extends IUserBetStake, Document {}

const UserBetStakeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    name1: String,
    value1: Number,
    name2: String,
    value2: Number,
    name3: String,
    value3: Number,
    name4: String,
    value4: Number,
    name5: String,
    value5: Number,
    name6: String,
    value6: Number,
    name7: String,
    value7: Number,
    name8: String,
    value8: Number,
    name9: String,
    value9: Number,
    name10: String,
    value10: Number,
  },
  {
    timestamps: true,
  },
)

UserBetStakeSchema.pre('findOneAndUpdate', async function () {
  // @ts-ignore
  const query = this.getQuery()
  if (query.userId) {
    cachegoose.clearCache('user-stack-' + query.userId, () => {})
  }
})

const UserBetStake = model<typeof UserBetStakeSchema>('UserBetStake', UserBetStakeSchema)

export { IUserBetStake, UserBetStake, defaultStack }
