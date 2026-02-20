import { RootState } from '../../store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import IBet from '../../../models/IBet'
import { getPlaceBetAction } from './bet.action'
import { IApiStatus } from '../../../models/IApiStatus'

export type FancyBook = { matchId: number; selectionId: string; marketName: string }

export type BetState = {
  bet: {
    isOpen: boolean
    betData: IBet
  }
  placeBet: {
    bet: IBet
    status: string
    error: any
  }
  betCount: number
  fancyType: string
  userBookMarketList: object
  fancyMatchAndSelectionId: FancyBook
  marketBookAndSelectionId: FancyBook
  betlist: any

}

const initialState: BetState = {
  bet: {
    isOpen: false,
    betData: {} as IBet,
  },
  placeBet: {
    bet: {} as IBet,
    status: '',
    error: '',
  },
  betCount: 0,
  fancyType: 'session',
  userBookMarketList: {},
  fancyMatchAndSelectionId: {} as FancyBook,
  marketBookAndSelectionId: {} as FancyBook,
  betlist: [] as any
}

const betSlice = createSlice({
  name: 'bet',
  initialState,
  reducers: {
    betPopup: (
      state,
      action: PayloadAction<{
        isOpen: boolean
        betData: IBet
      }>,
    ) => {
      state.bet = action.payload
    },
    setBetCount: (state, action: PayloadAction<number>) => {
      state.betCount = action.payload
    },
    setFancyType: (state, action: PayloadAction<string>) => {
      state.fancyType = action.payload
    },
    setBookMarketList: (state, action: PayloadAction<Record<string, number>>) => {
      state.userBookMarketList = { /*...state.userBookMarketList,*/ ...action.payload }
    },
    setBookFancy: (state, action: PayloadAction<FancyBook>) => {
      state.fancyMatchAndSelectionId = action.payload
    },
    setMarketBookUser: (state, action: PayloadAction<FancyBook>) => {
      state.marketBookAndSelectionId = action.payload
    },
    setbetlist: (state, action: PayloadAction<FancyBook>) => {
      state.betlist = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPlaceBetAction.pending, (state) => {
        state.placeBet.status = IApiStatus.Loading
      })
      .addCase(getPlaceBetAction.fulfilled, (state, action) => {
        state.placeBet.bet = action.payload
        state.placeBet.error = ''
        state.placeBet.status = IApiStatus.Done
      })
      .addCase(getPlaceBetAction.rejected, (state, action) => {
        state.placeBet.error = action.payload
        state.placeBet.status = IApiStatus.Fail
      })
  },
})

export const {
  betPopup,
  setBetCount,
  setFancyType,
  setBookMarketList,
  setBookFancy,
  setMarketBookUser,
  setbetlist /// specific for cmeter
} = betSlice.actions
export const selectBetPopup = (state: RootState) => state.betReducer.bet

export const selectPlaceBet = (state: RootState) => state.betReducer.placeBet

export const selectBetCount = (state: RootState) => state.betReducer.betCount

export const selectFancyType = (state: RootState) => state.betReducer.fancyType

export const selectMarketBook = (state: RootState) => state.betReducer.userBookMarketList

export const selectBookFancy = (state: RootState) => state.betReducer.fancyMatchAndSelectionId
export const selectBookMarketUser = (state: RootState) => state.betReducer.marketBookAndSelectionId
export const selectBetListUser = (state: RootState) => state.betReducer.betlist /// specific for cmeter

export default betSlice
