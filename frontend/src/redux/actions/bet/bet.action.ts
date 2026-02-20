import { createAsyncThunk } from '@reduxjs/toolkit'
import IBet from '../../../models/IBet'
import betService from '../../../services/bet.service'
import { setExposer } from '../balance/balanceSlice'
import { setbetlist, setBookMarketList } from './betSlice'
import { toast } from 'react-toastify'

export const getPlaceBetAction = createAsyncThunk(
  'bet/placebet',
  async (data: IBet, { rejectWithValue, dispatch }) => {
    return betService
      .getPlaceBet(data)
      .then((res) => {
        dispatch(setExposer(res.data.data.exposer))
        dispatch(setBookMarketList(res.data.data.profitlist))
        dispatch(setbetlist(res.data.data.bet))
        toast.success('Bet Placed Successfully')
        return res.data.data.bet
      })
      .catch((e) => {
        return rejectWithValue(e.response.data.message)
      })
  },
)
