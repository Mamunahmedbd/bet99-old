import { ISeries } from "./MatchModel";

export enum IMarketType {
  M = "M",
  BM = "BM",
  T10 = "T10",
  F = "F",
}
export interface IOdds {
  level?: number;
  price: number | string;
  size: number | string;
}

export class IRunnerType {
  selectionId: number;
  runnerName: string;
  sortProperty: number;
  back?: IOdds[];
  lay?: IOdds[];
  runner?: string;
  status?: string;
  ex?: {
    availableToBack: IOdds[];
    availableToLay: IOdds[];
  };
}

export class IMarketMatch {
  id: number;
  name: string;
}

export class IMarket {
  _id: string;
  marketId: string;
  match: IMarketMatch;
  isActive: boolean;
  isDelete: boolean;
  marketStartTime: Date;
  oddsType: IMarketType;
  marketName: string;
  runners: IRunnerType[];
  series: ISeries;
  sport: ISeries;
  offPlayMaxLimit: number;
  offPlayMinLimit: number;
  inPlayMaxLimit: number;
  inPlayMinLimit: number;
  inPlayBookMaxLimit: number;
  inPlayBookMinLimit: number;
  offPlayBookMaxLimit: number;
  offPlayBookMinLimit: number;
  inPlayFancyMaxLimit: number;
  inPlayFancyMinLimit: number;
  offPlayFancyMaxLimit: number;
  offPlayFancyMinLimit: number;
  rem?: string;
  status?: string;
  sortPriority?: number;
  fancyType?: string;
}
