import mongoose, { Document, Schema, Model, model, Error, PopulatedDoc, Types } from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import { RoleType } from './Role'
import cachegoose from 'recachegoose'
import paginate from 'mongoose-paginate-v2'

export enum GameType {
  Football = '1',
  Tennis = '2',
  Cricket = '4',
}

export type PartnershipAllRatioType = { parent: string; ratio: number }

export type PartnershipType = Record<
  string,
  { ownRatio: number; allRatio: Array<PartnershipAllRatioType> }
>

export type IUserBetInfo = Record<string, { minBet: number; maxBet: number; delay: number }>

export interface IUser {
  username: string
  password: string
  role: RoleType
  level: number
  parentId: PopulatedDoc<IUser> | null
  parentStr?: Array<string>
  betLock?: boolean
  // isMaster?: boolean;
  isLogin?: boolean
  isDeleted?: boolean
  lastLogin?: Date
  partnership?: PartnershipType
  refreshToken?: string
  fullName?: string
  city?: string
  phone?: string
  creditRefrences?: string
  exposerLimit?: string
  userSetting?: IUserBetInfo
  changePassAndTxn?: boolean
  transactionPassword?: string
  sessionId?: number
  isDemo?: boolean
}

export interface IUserModel extends IUser, Document {
  comparePassword(password: string): Promise<boolean>
  validPassword(password: string, cb: any): string
}

export const userSchema: Schema = new Schema(
  {
    username: String,
    password: { type: String, expose: false },
    role: { type: String, enum: RoleType },
    level: Number,
    parentId: { type: Types.ObjectId, ref: 'User' },
    parentStr: [],
    betLock: Boolean,
    // isMaster: Boolean,
    isLogin: Boolean,
    isDeleted: Boolean,
    lastLogin: Boolean,
    partnership: Object,
    refreshToken: String,
    fullName: String,
    city: String,
    phone: String,
    creditRefrences: String,
    exposerLimit: String,
    userSetting: Object,
    changePassAndTxn: { type: Boolean, default: false },
    transactionPassword: String,
    sessionId: Number,
    isDemo: Boolean
  },
  {
    timestamps: true,
  },
)

userSchema.plugin(paginate)

userSchema.post('findOneAndUpdate', async function (user) {
  if (user.username) {
    cachegoose.clearCache(`user-cache-${user.username.toLowerCase()}`, () => { })
  }
})

userSchema.pre<IUserModel>('save', function save(next) {
  const user = this

  if (user.username) {
    cachegoose.clearCache('user-cache-' + user.username, () => { })
  }

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(10, (err: any, salt: any) => {
    if (err) {
      return next(err)
    }
    // @ts-ignore
    bcrypt.hash(this.password, salt, undefined, (err: Error, hash: any) => {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(
      candidatePassword,
      // @ts-ignore
      this.password,
      (err: Error, isMatch: boolean) => {
        if (err) reject(err)

        resolve(isMatch)
        // resolve(true)
      },
    )
  })
}

userSchema.methods.compareTxnPassword = async function (candidatePassword: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(
      candidatePassword,
      // @ts-ignore
      this.transactionPassword,
      (err: Error, isMatch: boolean) => {
        if (err) reject(err)

        resolve(isMatch)
      },
    )
  })
}

export const User = model<IUserModel, mongoose.PaginateModel<IUserModel>>('User', userSchema)
