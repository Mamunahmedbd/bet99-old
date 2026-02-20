import { RootState } from '../../store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type HideBalExp = { balance: boolean; exposer: boolean }

export type BalanceState = {
  balance: { balance: number; exposer: number }
  hide: HideBalExp
}

const initialState: BalanceState = {
  balance: {
    balance: 0,
    exposer: 0,
  },
  hide: { balance: false, exposer: false },
}

const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<{ balance: number; exposer: number }>) => {
      state.balance = action.payload
    },
    setExposer: (state, action: PayloadAction<number>) => {
      state.balance = { ...state.balance, exposer: action.payload }
    },
    setSingleBal: (state, action: PayloadAction<number>) => {
      state.balance = { ...state.balance, balance: action.payload }
    },
    hideBalExp: (state, action: PayloadAction<HideBalExp>) => {
      state.hide = action.payload
    },
  },
})

export const { setBalance, setExposer, hideBalExp, setSingleBal } = balanceSlice.actions
export const selectBalance = (state: RootState) => state.balanceReducer.balance
export const selectHideBalExp = (state: RootState) => state.balanceReducer.hide

export default balanceSlice
