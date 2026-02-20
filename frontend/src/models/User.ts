import { IBalance } from './IBalance'
export enum RoleType {
  admin = 'admin',
  sadmin = 'sadmin',
  smdl = 'smdl',
  mdl = 'mdl',
  dl = 'dl',
  user = 'user',
}

export const RoleName: Record<string, string> = {
  admin: 'Super Admin',
  sadmin: 'Admin',
  smdl: 'SMDL',
  mdl: 'MDL',
  dl: 'DL',
  user: 'USER',
}
export default interface User {
  _id?: string
  username: string
  password?: string
  role?: RoleType
  partnership?: PartnershipType
  userSetting?: IUserBetInfo
  parentId?: any
  parentStr?: []
  passwordConfirmation?: string
  parent?: string
  partnershipOur?: any
  fullname?: string
  city?: string
  phone?: number
  creditRefrences?: number
  exposerLimit?: number
  minbet?: any
  maxbet?: any
  delay?: any
  balance?: IBalance
  isLogin?: boolean
  betLock?: boolean
  logs?: string
  transactionPassword?: string
  selected?: boolean
  [key: string]: any
}

export type PartnershipAllRatioType = { parent: string; ratio: number }

export type PartnershipType = Record<
  string,
  { ownRatio: number; allRatio: Array<PartnershipAllRatioType> }
>

export type IUserBetInfo = Record<
  string,
  { minBet: number; maxBet: number; delay: number; transactionPassword?: string }
>
