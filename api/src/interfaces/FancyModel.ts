export interface IFancy {
  SelectionId: number;
  RunnerName: string;
  LayPrice1: number;
  LaySize1: number;
  BackPrice1: number;
  BackSize1: number;
  LaySize2: number;
  LayPrice3: number;
  LaySize3: number;
  BackPrice2: number;
  BackSize2: number;
  BackPrice3: number;
  BackSize3: number;
  GameStatus: string;
  gtype: string;
  min: string;
  max: string;
  // eslint-disable-next-line camelcase
  sr_no: number | string;
  rem: string;
  ballsess: number | string;
  [key: string]: number | string;
}
