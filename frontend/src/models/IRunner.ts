export interface IOdds {
  level?: number
  price: number | string
  size: number | string
}

export default interface IRunner {
  selectionId: number
  runnerName: string
  handicap: number
  sortPriority: number
  status?: string
  ex?: {
    availableToBack: IOdds[]
    availableToLay: IOdds[]
  }
}
