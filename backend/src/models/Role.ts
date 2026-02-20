import { model, Schema } from 'mongoose'

export enum RoleType {
  admin = 'admin',
  sadmin = 'sadmin',
  smdl = 'smdl',
  mdl = 'mdl',
  dl = 'dl',
  user = 'user',
}

interface IRole extends Document {
  role: RoleType
  name: string
}

const RoleSchema = new Schema({
  role: { type: String, enum: RoleType },
  name: String,
})

const Role = model<typeof RoleSchema>('Role', RoleSchema)

export { IRole, Role }
