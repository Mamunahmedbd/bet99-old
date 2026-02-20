import React, { useEffect, useState } from 'react'
import IBet, { IBetOn, IBetType } from '../../../../models/IBet'
import { RoleType } from '../../../../models/User'
import { selectUserData } from '../../../../redux/actions/login/loginSlice'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'
import authService from '../../../../services/auth.service'
import { betPopup, selectBetListUser } from '../../../../redux/actions/bet/betSlice'
import { calculateTotalNumbersFromString } from '../../../../utils/helper'

const TwentyCricketItem = (props: any) => {
  const { ItemNew, selectionId, lastOdds, liveMatchData, checkRoundIdChange } = props
  const [ballValue, setBallValue] = useState<any>({})
  const userState = useAppSelector(selectUserData)
  const dispatch = useAppDispatch()
  const betList = useAppSelector(selectBetListUser)

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    if (userState.user.role === RoleType.user) {
      const oddsVal = parseFloat(isBack ? item.b1 : item.l1)
      if (oddsVal <= 0) return
      if (item.SUSPENDED == 'SUSPENDED') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: oddsVal,
            volume: isBack ? item.bs1 : item.ls1,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: liveMatchData?.event_data?.match_id || 0,
            selectionName: item.runnerName,
            selectionId: parseInt(item.sid),
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData.slug,
          },
        }),
      )
    }
  }

  useEffect(() => {
    if (betList && betList.length > 0) {
      let run: any = {}
      betList.forEach((bet: IBet) => {
        run = { ...run, [bet.selectionId]: { ball: '19.5' } }
      })
      setBallValue(run)
    }
  }, [betList])

  useEffect(() => {
    if (checkRoundIdChange) setBallValue({})
  }, [checkRoundIdChange])

  const imagename = ItemNew?.RunnerName?.replace('Run ', '')

  const ItemMarket = lastOdds?.[selectionId] || {}
  const clsstatus =
  !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' ||
    ItemMarket.gstatus === 'CLOSED' ||
    ItemMarket.gstatus === '0'
      ? 'suspended'
      : ''

   const totalDealerCard = lastOdds?.cards?.C1!='1' ? (calculateTotalNumbersFromString(lastOdds?.cards?.C1 || '')) : 0
   return (
    <div className={`score-box btn-theme ${clsstatus}`}>
      <img src={`imgs/casino/ball${imagename}.png`} className='img-fluid ball-image' />
      <img
        src='https://dzm0kbaskt4pv.cloudfront.net/v11/static/img/balls/score-bat-icon.png'
        className='score-img'
      />
      <div className='team-score'>
        <div>
          <span>Team A</span>{' '}
          <span className='ml-1'>
            {lastOdds?.cards?.C2} /{lastOdds?.cards?.C3}
          </span>{' '}
          <span className='ml-1'>{lastOdds?.cards?.C4} Over</span>
        </div>
        <div>
          <span>Team B</span>{' '}
          <span className='ml-1'>
            {+lastOdds?.cards?.C5 + (ballValue?.[selectionId]?.ball ? +selectionId + 1 : 0) + (totalDealerCard)}/
            {lastOdds?.cards?.C6}
          </span>{' '}
          <span>
            {(lastOdds?.cards?.C1 != '1' ? ' 20' : null) ||
              (ItemMarket.gstatus === 'SUSPENDED' ? '19.5' : null) ||
              ballValue?.[selectionId]?.ball ||
              lastOdds?.cards?.C7}{' '}
            Over
          </span>
        </div>
      </div>
      <div className='min-max'>
        <span>
          Min:<span>{ItemMarket.min} </span>
          Max:<span>{ItemMarket.max}</span>
        </span>
      </div>
      <div
        className='back backbox'
        onClick={() => {
          onBet(true, ItemMarket)
        }}
      >
        <span className='odds d-block'>{ItemMarket.b1}</span>
      </div>
      <div
        className='lay laybox'
        onClick={() => {
          onBet(false, ItemMarket)
        }}
      >
        <span className='odds d-block'>{ItemMarket.l1}</span>
      </div>
    </div>
  )
}
export default React.memo(TwentyCricketItem)
