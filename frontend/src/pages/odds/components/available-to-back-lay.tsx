import React from 'react'
import { IBetOn, IBetType } from '../../../models/IBet'
import IRunner from '../../../models/IRunner'
import IMarket, { OddsType } from '../../../models/IMarket'
import { betPopup } from '../../../redux/actions/bet/betSlice'
import { selectCurrentMatch } from '../../../redux/actions/sports/sportSlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import authService from '../../../services/auth.service'
import { nFormatter } from '../../../utils/helper'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { RoleType } from '../../../models/User'
import { isMobile } from 'react-device-detect'

type Props = {
  selections: any
  selectionsPrev: any
  runner: IRunner
  market: IMarket
}
export const AvailableToBackLay = React.memo(({ selections, market, runner }: Props) => {
  const dispatch = useAppDispatch()
  const getCurrentMatch = useAppSelector(selectCurrentMatch)
  const userState = useAppSelector(selectUserData)

  const onBet = (isBack = false, back: { price: number; size: number }) => {
    const ipAddress = authService.getIpAddress()
    if (market.oddsType == OddsType.BM && back.size == 0) return
    if (back.price > 0 && back.size && userState.user.role === RoleType.user) {
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(back.price.toFixed(4)),
            volume: back.size,
            marketId: market.marketId,
            marketName: market.marketName,
            matchId: market.matchId,
            selectionName: runner.runnerName,
            selectionId: runner.selectionId,
            pnl: 0,
            stack: 0,
            currentMarketOdds: back.price,
            eventId: market.sportId,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: getCurrentMatch.name,
            betOn: IBetOn.MATCH_ODDS,
            oddsType: market.oddsType,
          },
        }),
      )
    }
  }

  const availableToBack = () => {
    return selections?.availableToBack?.map((back: any, index: number) => {
      const i = 2 - index
      const cls = index === 2 ? 'back' : `back${i}`
      const blinkCls = back.changed ? 'blink' : ''
      if (isMobile && market.oddsType == OddsType.B && index != 2) return
      const classforbox =
        (!isMobile && market.oddsType != OddsType.BM) || market.oddsType == OddsType.BM
          ? 'box-1'
          : 'box-2'
      return (
        <div
          onClick={() => onBet(true, back)}
          key={index}
          className={`${classforbox}  text-center ${cls} ${blinkCls}`}
        >
          <span className='odd d-block'>
            {market.oddsType == OddsType.BM
              ? back.price1
                ? back.price1
                : '-'
              : back.price
              ? back.price
              : '-'}
          </span>
          <span className='d-block'>{back.size ? nFormatter(back.size, 1) : '-'}</span>
        </div>
      )
    })
  }

  const availableToLay = () => {
    return selections?.availableToLay?.map((lay: any, index: number) => {
      const i = index
      const cls = index === 0 ? 'lay' : `lay${i}`
      const blinkCls = lay.changed ? 'blink' : ''
      if (isMobile && market.oddsType == OddsType.B && index != 0) return
      const classforbox =
        (!isMobile && market.oddsType != OddsType.BM) || market.oddsType == OddsType.BM
          ? 'box-1'
          : 'box-2'

      return (
        <div
          onClick={() => onBet(false, lay)}
          key={index}
          className={`${classforbox}   text-center ${cls} ${blinkCls}`}
        >
          <span className='odd d-block'>
            {market.oddsType == OddsType.BM
              ? lay.price1
                ? lay.price1
                : '-'
              : lay.price
              ? lay.price
              : '-'}
          </span>
          <span className='d-block'>{lay.size ? nFormatter(lay.size, 1) : '-'}</span>
        </div>
      )
    })
  }

  return (
    <>
      {availableToBack()}
      {availableToLay()}
    </>
  )
})
