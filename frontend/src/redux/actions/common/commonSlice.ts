import { RootState } from '../../store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type BalanceState = {
  loading: boolean
  changePassAndTxn: boolean
  rules: { open: boolean; type: string }
  initApp: { event: boolean }
}

const initialState: BalanceState = {
  loading: false,
  changePassAndTxn: true,
  rules: { open: false, type: '' },
  initApp: { event: false },
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLoader: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setChangePassAndTxn: (state, action: PayloadAction<boolean>) => {
      state.changePassAndTxn = action.payload
    },
    setRules: (state, action: PayloadAction<{ open: boolean; type: string }>) => {
      state.rules = action.payload
    },
    setInitApp: (state, action: PayloadAction<boolean>) => {
      state.initApp = { ...state.initApp, event: action.payload }
    },
  },
})

export const { setLoader, setChangePassAndTxn, setRules, setInitApp } = commonSlice.actions
export const selectLoader = (state: RootState) => state.commonReducer.loading
export const selectChangePassAndTxn = (state: RootState) => state.commonReducer.changePassAndTxn
export const selectRules = (state: RootState) => state.commonReducer.rules
export const selectInitApp = (state: RootState) => state.commonReducer.initApp

export default commonSlice
