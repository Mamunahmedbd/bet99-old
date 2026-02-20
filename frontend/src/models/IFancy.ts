export enum FancyType {
  Session = 'session',
  Fancy1 = 'fancy1',
}
export interface IFancy {
  RunnerName?: string
  LayPrice1?: number
  LaySize1?: string
  BackPrice1?: number
  BackSize1?: string
  GameStatus?: string
  SelectionId: string
  sr_no?: number
  ballsess?: number
  min?: string
  max?: string
  gtype: FancyType
  rem?: string
}
