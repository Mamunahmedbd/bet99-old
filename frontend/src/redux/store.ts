import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import loginSlice from './actions/login/loginSlice'
import sportSlice from './actions/sports/sportSlice'
import betSlice from './actions/bet/betSlice'
import balanceSlice from './actions/balance/balanceSlice'
import commonSlice from './actions/common/commonSlice'
import casinoSlice from './actions/casino/casinoSlice'

export const store = configureStore({
  reducer: {
    commonReducer: commonSlice.reducer,
    userReducer: loginSlice.reducer,
    sportReducer: sportSlice.reducer,
    betReducer: betSlice.reducer,
    balanceReducer: balanceSlice.reducer,
    casinoReducer: casinoSlice.reducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
