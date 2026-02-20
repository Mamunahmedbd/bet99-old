import { RootState } from '../../store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ICasinoMatch from '../../../models/ICasinoMatch'
export type CasinoState = {
  currentMatch : ICasinoMatch,
  homePageCasino : Array<ICasinoMatch>,
}

const initialState: CasinoState = {
    currentMatch: {} as ICasinoMatch,
    homePageCasino: []
 }

const casinoSlice = createSlice({
  name: 'casino',
  initialState,
  reducers: {
    setCasinoCurrentMatch: (state, action: PayloadAction<any>) => {
      state.currentMatch = action.payload
    },
    setHomePageCasinoMatch: (state, action: PayloadAction<any>) => {
      state.homePageCasino = action.payload
    }
  }
})

export const {
  setCasinoCurrentMatch,
  setHomePageCasinoMatch
} = casinoSlice.actions
export const selectCasinoCurrentMatch = (state: RootState) => state.casinoReducer.currentMatch
export const selectCasinoMatchList = (state: RootState) => state.casinoReducer.homePageCasino

export default casinoSlice
