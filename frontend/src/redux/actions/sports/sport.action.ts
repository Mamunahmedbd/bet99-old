import { createAsyncThunk } from '@reduxjs/toolkit'
import sportsService from '../../../services/sports.service'

export const getSportListAction = createAsyncThunk(
  'sport/list',
  async (data, { rejectWithValue }) => {
    return sportsService
      .getSports()
      .then((res) => {
        return res.data.data
      })
      .catch((e) => {
        return rejectWithValue(e.response.data.message)
      })
  },
)
