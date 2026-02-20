import React, { MouseEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import {
  betPopup,
  selectBetCount,
  selectBetPopup,
  selectPlaceBet,
  setBetCount,
} from '../../../redux/actions/bet/betSlice'
import { IUserBetStake } from '../../../models/IUserStake'
import IBet, { IBetOn, IBetType } from '../../../models/IBet'
import { getPlaceBetAction } from '../../../redux/actions/bet/bet.action'
import { IApiStatus } from '../../../models/IApiStatus'
import { useWebsocketUser } from '../../../context/webSocketUser'
import { OddsType } from '../../../models/IMarket'

const PlaceBetBox = ({ stake }: { stake: IUserBetStake }) => {
  const [betObj, setBetObj] = React.useState<IBet>({} as IBet)
  const betValues = useAppSelector(selectBetPopup)
  const getPlaceBet = useAppSelector(selectPlaceBet)
  const betCount = useAppSelector(selectBetCount)
  const { socketUser } = useWebsocketUser()

  const dispatch = useAppDispatch()

  React.useEffect(() => {
    setBetObj({
      ...betValues.betData,
      odds:
        typeof betValues.betData.odds === 'string'
          ? parseFloat(betValues.betData.odds)
          : betValues.betData.odds,
    })
  }, [betValues.betData])

  React.useEffect(() => {
    if (getPlaceBet.status === IApiStatus.Done) {
      socketUser.emit('place-bet', getPlaceBet.bet)
      // dispatch(setBookMarketList({}))
      dispatch(betPopup({ isOpen: false, betData: {} as IBet }))
      dispatch(setBetCount(betCount + 1))
    }
  }, [getPlaceBet.status])

  const reset = () => {
    setBetObj({ ...betObj, stack: 0, pnl: 0 })
    dispatch(betPopup({ ...betValues, betData: { ...betValues.betData, stack: 0, pnl: 0 } }))
  }

  const onStack = (stack: number) => {
    const betObjItem = { ...betObj }
    betObjItem.stack = betObjItem.stack + stack
    const calPnl = calculatePnlF(betObjItem)

    betObjItem.pnl = calPnl.pnl
    betObjItem.exposure = calPnl.exposure
    setBetObj(betObjItem)
    dispatch(betPopup({ ...betValues, betData: { ...betObjItem } }))
  }

  const incrementDecrementOdds = (type = 'inc') => {
    const betObjItem = { ...betObj }

    if (betObjItem.oddsType === OddsType.BM || betObjItem.oddsType === OddsType.F) {
      return true
    }
    switch (type) {
      case 'inc':
        betObjItem.odds = parseFloat((betObjItem.odds + 0.01).toFixed(4))
        break
      case 'dec':
        betObjItem.odds = parseFloat((betObjItem.odds - 0.01).toFixed(4))
        break
    }
    const calPnl = calculatePnlF(betObjItem)
    betObjItem.pnl = calPnl.pnl
    betObjItem.exposure = calPnl.exposure
    betObjItem.type =
      betObjItem.odds !== betObjItem.currentMarketOdds ? IBetType.UnMatch : IBetType.Match
    dispatch(betPopup({ ...betValues, betData: { ...betObjItem } }))

    setBetObj(betObjItem)
  }

  const calculatePnlF = (betValue: IBet) => {
    let pnl = 0,
      exposure = 0
    if (Object.keys(betValue).length > 0) {
      if (betValue.betOn == IBetOn.MATCH_ODDS || betValue.gtype === 'fancy1') {
        if (betValue.isBack) {
          pnl = betValue.odds * betValue.stack - betValue.stack
          exposure = -1 * betValue.stack
        } else {
          pnl = betValue.stack
          exposure = -1 * (betValue.odds * betValue.stack - betValue.stack)
        }
      } else if (betValue.betOn != IBetOn.CASINO) {
        if (betValue.isBack) {
          pnl = (betValue.volume * betValue.stack) / 100
          exposure = -betValue.stack
        } else {
          exposure = -((betValue.volume * betValue.stack) / 100)
          pnl = betValue.stack
        }
      } else if (betValue.betOn == IBetOn.CASINO) {
        if (betValue.matchId == 33) {
          //// specific condition for cmeter game
          pnl = 0
          exposure = -50 * betValue.stack * 1.0
        } else if (betValue.matchId == 9) {
          //// specific condition for tp1day game
          if (betValue.isBack) {
            pnl = (betValue.odds / 100) * betValue.stack
            exposure = -betValue.stack
          } else {
            pnl = betValue.stack
            exposure = -1 * (betValue.odds * betValue.stack - betValue.stack)
          }
        } else if (betValue.fancystatus == 'yes') {
          //// specific condition for cmeter game
          if (betValue.isBack) {
            pnl = (betValue.volume * betValue.stack) / 100
            exposure = -betValue.stack
          } else {
            exposure = -((betValue.volume * betValue.stack) / 100)
            pnl = betValue.stack
          }
        } else {
          if (betValue.isBack) {
            pnl = betValue.odds * betValue.stack - betValue.stack
            exposure = -1 * betValue.stack
          } else {
            pnl = betValue.stack
            exposure = -1 * (betValue.odds * betValue.stack - betValue.stack)
          }
        }
      }
    }
    return { pnl: parseInt(pnl.toFixed()), exposure: parseInt(exposure.toFixed()) }
  }

  const onChangeStack = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetObj({ ...betObj, stack: parseInt(e.target.value) })
  }

  const onBlurStack = () => {
    onStack(0)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(getPlaceBetAction(betObj))
  }

  const renderStakeButtons = () => {
    const buttons = []
    for (let i = 1; i <= 10; i++) {
      buttons.push(
        <button
          key={i}
          type='button'
          onClick={() => onStack(stake[`value${i}`])}
          className='btn btn-secondary m-l-5 m-b-5'
        >
          {stake[`name${i}`]}
        </button>,
      )
    }
    return buttons
  }

  const closeBetPopup = () => {
    dispatch(
      betPopup({
        ...betValues,
        isOpen: false,
        betData: { ...betValues.betData, stack: 0, pnl: 0 },
      }),
    )
  }
  const onBackDrop = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    dispatch(
      betPopup({
        ...betValues,
        isOpen: false,
        betData: { ...betValues.betData, stack: 0, pnl: 0 },
      }),
    )
  }

  return (
    <>
      {betValues.isOpen && (
        <>
          <div onClick={onBackDrop} className='backdrop-custom'></div>

          <div className='card m-b-10 place-bet'>
            <div className='card-header'>
              <h6 className='card-title d-inline-block col-10'>Place Bet</h6>
              <span className='card-title d-inline-block col-2' onClick={closeBetPopup}>
                X
              </span>
            </div>
            <div className={`table-responsive ${betObj.isBack ? 'back' : 'lay'}`}>
              <form onSubmit={onSubmit}>
                <table className='coupon-table table table-borderedless'>
                  <thead>
                    <tr>
                      <th style={{ width: '35%', textAlign: 'left' }}>(Bet for)</th>
                      <th style={{ width: '25%', textAlign: 'left' }}>Odds</th>
                      <th style={{ width: '15%', textAlign: 'left' }}>Stake</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className='text-center'>
                        <a onClick={closeBetPopup} className='text-danger'>
                          <i className='fa fa-times' />
                        </a>
                        {betObj.selectionName}
                      </td>
                      <td className='bet-odds'>
                        <div className='form-group'>
                          <input
                            value={parseFloat(betObj?.odds?.toFixed(4)) || ''}
                            type='text'
                            required
                            maxLength={4}
                            readOnly
                            className='amountint'
                            style={{ width: 60, verticalAlign: 'middle' }}
                          />
                          <div className='spinner-buttons input-group-btn btn-group-vertical'>
                            <button
                              type='button'
                              className='custom-btn-spinner btn btn-xs btn-default'
                              onClick={() => incrementDecrementOdds('inc')}
                            >
                              <i className='fa fa-angle-up' />
                            </button>
                            <button
                              type='button'
                              className='custom-btn-spinner btn btn-xs btn-default'
                              onClick={() => incrementDecrementOdds('dec')}
                            >
                              <i className='fa fa-angle-down' />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className='bet-stakes'>
                        <div className='form-group bet-stake'>
                          <input
                            maxLength={10}
                            required
                            type='number'
                            value={betObj.stack || ''}
                            onBlur={onBlurStack}
                            onChange={onChangeStack}
                          />
                        </div>
                      </td>
                      <td className='text-right bet-profit'>{betValues.betData.pnl}</td>
                    </tr>
                    <tr>
                      <td colSpan={5} className='value-buttons' style={{ padding: 5 }}>
                        {renderStakeButtons()}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className='col-md-12'>
                  <button
                    onClick={reset}
                    type='button'
                    className='btn btn-sm btn-danger float-left'
                  >
                    Reset
                  </button>
                  <button
                    type='submit'
                    disabled={getPlaceBet.status === IApiStatus.Loading}
                    className='btn btn-sm btn-success float-right m-b-5'
                  >
                    Submit
                    {getPlaceBet.status === IApiStatus.Loading ? (
                      <i className='mx-5 fas fa-spinner fa-spin'></i>
                    ) : (
                      ''
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default PlaceBetBox
