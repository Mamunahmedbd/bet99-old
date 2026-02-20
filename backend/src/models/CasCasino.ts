import { model, Schema } from 'mongoose'

interface ICasCasino {
  game_status: string
  game_identifier?: string
  game_image: string
  game_name: string
  game_group: string
  game_slot_status: boolean
  game_category: string
  game_provider?: string
}

interface ICasCasinoModel extends ICasCasino, Document { }

const CasCasinoSchema = new Schema<ICasCasino>(
  {
    game_status: String,
    game_identifier: { type: String, index: true },
    game_image: String,
    game_name: String,
    game_group: String,
    game_slot_status: { type: Boolean, index: true },
    game_category: { type: String, index: true },
    game_provider: { type: String, index: true },
  },
  {
    timestamps: true,
  },
)

const CasCasino = model<typeof CasCasinoSchema>('cascasino', CasCasinoSchema)

export { ICasCasino, CasCasino, ICasCasinoModel }
