export class ISeries {
  id: number;
  name: string;
}

export class IMatchSport {
  id: number;
  name: string;
}

export class IMatch {
  _id: string;
  isActive: boolean;
  matchDateTime: Date;
  matchId: number | string;
  matchOddsMarketId: string;
  name: string;
  sport: IMatchSport;
  series: ISeries;
  inPlayFancyMaxLimit: number;
  inPlayFancyMinLimit: number;
  offPlayFancyMaxLimit: number;
  offPlayFancyMinLimit: number;
  isBookMaker: boolean;
  isFancy: boolean;
  isT10: boolean;
  isDelete: boolean;
}
