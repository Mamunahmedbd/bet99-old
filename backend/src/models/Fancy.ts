import { model, Schema, Document } from 'mongoose';

interface IFancy {
  matchId: number;
  sportId: number;
  marketId: string;
  fancyName: string;
  active?: boolean;
  gtype: string;
  sr_no: number;
  result?: string;
  ballByBall?: string;
  status?: string;
  isSuspend?: boolean; // <-- Add this field to the interface
  GameStatus?: string; // <-- Add GameStatus to the interface
}

interface IFancyModel extends IFancy, Document {}

const FancySchema = new Schema<IFancy>(
  {
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    marketId: { type: String, index: true },
    fancyName: { type: String, index: true },
    active: { type: Boolean, index: true },
    gtype: { type: String, index: true },
    isSuspend: { type: Boolean, index: true, default: false },
    GameStatus: { type: String, index: true }, // <-- Define GameStatus in the schema
    sr_no: { type: Number, index: true },
    result: { type: String, index: false, default: '' },
    ballByBall: { type: String, index: true },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

const Fancy = model<IFancyModel>('Fancy', FancySchema);

export { IFancy, Fancy, IFancyModel };
