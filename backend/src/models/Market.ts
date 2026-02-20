import { Model, model, Schema, Document } from 'mongoose';
import cachegoose from 'recachegoose';

// Enums should have string values to ensure compatibility with the Schema type
export enum OddsType {
  B = 'berFair', // Betfair
  BM = 'bookMaker',
  T10 = 't10',
}

export enum YesNo {
  Y = 'Y',
  N = 'N',
}

export interface IRunners {
  selectionId: number;
  runnerName: string;
  handicap: number;
  sortPriority: number;
}

export interface IMatchSetting {
  oddsLimit?: number;
  volumeLimit?: number;
  minOdds?: number;
  maxOdds?: number;
  goingInPlayBet?: YesNo;
  goingInStake?: number;
  goingInProfitLimit?: number;
  minStakeLimit?: number;
  stakeLimit?: number;
  profitLimit?: number;
  lossLimit?: number;
  isUnmatchBet?: YesNo;
  isShow?: YesNo;
  totalMatchRange?: number;
  totalMatchProfit?: number;
  totalMatchStake?: number;
}

interface IMarket extends IMatchSetting {
  matchId: number;
  sportId: number;
  seriesId: number;
  marketId: string;
  marketName: string;
  runners: Array<IRunners>;
  oddsType: OddsType;
  marketStartTime: Date;
  isActive?: boolean;
  marketType?: string;
  betDelay?: number;
  isVolume?: boolean;
  isRollback?: boolean;
  checkDiffVal?: number;
  checkDiffVal1?: number;
  checkDiffVal2?: number;
  checkDiffVal3?: number;
  resultDelcare?: string;
  result?: string;
  isDelete?: boolean; // <-- Add this field to the interface
}

// Model interface extends Mongoose Document
interface IMarketModel extends IMarket, Document { }

const MarketSchema = new Schema<IMarketModel>(
  {
    marketId: { type: String, index: true },
    marketName: { type: String, index: true },
    matchId: { type: Number, index: true },
    sportId: { type: Number, index: true },
    seriesId: { type: Number, index: true },
    runners: {
      type: [
        {
          selectionId: { type: Number, required: true },
          runnerName: { type: String, required: true },
          handicap: { type: Number, required: true },
          sortPriority: { type: Number, required: true },
        },
      ],
      default: [],
    },
    oddsType: {
      type: String,
      enum: OddsType,
    },
    marketStartTime: { type: Date, required: true },
    isActive: { type: Boolean, index: true, default: true },
    isDelete: { type: Boolean, index: true, default: false }, // <-- Now valid in the schema
    marketType: String,
    oddsLimit: Number,
    volumeLimit: Number,
    minOdds: Number,
    maxOdds: Number,
    goingInPlayBet: {
      type: String,
      enum: YesNo,
      required: true,
    },
    goingInStake: Number,
    goingInProfitLimit: Number,
    minStakeLimit: Number,
    stakeLimit: Number,
    profitLimit: Number,
    lossLimit: Number,
    isUnmatchBet: {
      type: String,
      enum: YesNo,
      required: true,
    },
    isShow: {
      type: String,
      enum: YesNo,
      required: true,
    },
    totalMatchRange: Number,
    totalMatchProfit: Number,
    totalMatchStake: Number,
    betDelay: Number,
    isVolume: Boolean,
    isRollback: Boolean,
    checkDiffVal: Number,
    checkDiffVal1: Number,
    checkDiffVal2: Number,
    checkDiffVal3: Number,
    resultDelcare: { type: String, default: 'no' },
    result: String,
  },
  {
    timestamps: true,
  }
);

// Middleware hooks
MarketSchema.pre('find', function () {
  // @ts-ignore
  if (!this._conditions.skipPreHook) {
    this.where({ $or: [{ isDelete: false }, { isDelete: null }] });
  }
  // @ts-ignore
  delete this._conditions.skipPreHook;
});

MarketSchema.pre('findOne', async function () {
  // @ts-ignore
  const query = this.getQuery();
  if (query.matchId) {
    cachegoose.clearCache('Markets-' + query.matchId, () => { });
    cachegoose.clearCache('Markets-Match-Odds-' + query.matchId, () => { });
    cachegoose.clearCache('Markets-ne-Match-Odds-' + query.matchId, () => { });
  }
});

MarketSchema.pre('findOneAndUpdate', async function () {
  // @ts-ignore
  const query = this.getQuery();
  if (query.matchId) {
    cachegoose.clearCache('Markets-' + query.matchId, () => { });
    cachegoose.clearCache('Markets-Match-Odds-' + query.matchId, () => { });
    cachegoose.clearCache('Markets-ne-Match-Odds-' + query.matchId, () => { });
  }
});

const Market: Model<IMarketModel> = model<IMarketModel>('Market', MarketSchema);

export { IMarket, Market, IMarketModel };
