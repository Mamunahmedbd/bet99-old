import { model, PopulatedDoc, Schema, Types } from 'mongoose'
import { IUser } from './User'
import { Double } from './UserChip'

interface IBalance {
  userId: PopulatedDoc<IUser>
  balance: number
  exposer: number
  profitLoss: number
  casinoexposer:number
  mainBalance:number
  // free_chip: number;
  // pnl: number;
  // settlement: number;
  // creditLimit: number;
  // creditGiven: number;
}

interface IBalanceModel extends IBalance, Document {}

const BalanceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    balance: Number,
    exposer: { type: Number, default: 0 },
    profitLoss: { type: Number, default: 0 },
    casinoexposer: { type: Number, default: 0 },
    mainBalance:  { type: Number, default: 0 },
    // free_chip: Double,
    // pnl: Double,
    // settlement: Double,
    // creditLimit: Double,
    // creditGiven: Double,
  },
  {
    toJSON: { getters: true }, //this right here
    timestamps: true,
  },
)

const Balance = model<IBalanceModel>('Balance', BalanceSchema)

export { IBalance, Balance, IBalanceModel }
