import React from 'react'
import { IBetOn, IBetType } from '../../../../models/IBet'
import { RoleType } from '../../../../models/User'
import { betPopup } from '../../../../redux/actions/bet/betSlice'
import { selectUserData } from '../../../../redux/actions/login/loginSlice'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'
import authService from '../../../../services/auth.service'
import CasinoPnl from '../casinoPnl'

const CasinoQueenLayout = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  // let interValCasino: any = null
  const totalMarket = liveMatchData?.defaultMarkets?.[0]

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    if (userState.user.role === RoleType.user) {
      const oddsVal = parseFloat(isBack ? item.b1 : item.l1);
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
            selectionId: item.sid,
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

  const marketRow = (Item: any) => {
    const liveMarketData: any =
      lastOdds && lastOdds[Item.SelectionId]
        ? lastOdds[Item.SelectionId]
        : {}
    const suspended = !liveMarketData.gstatus || liveMarketData.gstatus == 'SUSPENDED' || liveMarketData.gstatus == 'CLOSED' ? 'suspended' : ''

    return <div className='casino-odds-box casino-yn'>
      <div
        className={`back-border ${suspended}`}
        onClick={() => onBet(true, liveMarketData)}
      >
        <span className='casino-odds-box-odd'>{liveMarketData.b1}</span>
        <span className='fw-12 laysize'>{liveMarketData.bs1}</span>
      </div>
      <div
        className={`lay-border ${suspended}`}
        onClick={() => onBet(false, liveMarketData)}
      >
        <span className='casino-odds-box-odd'>{liveMarketData.l1}</span>
        <span className='fw-12 laysize'>{liveMarketData.ls1}</span>
      </div>
    </div>
  }

  return (
    <div className='new-casino'>
      <div className='card-content' style={{ padding: '10px' }}>
        <div className='row row5'>
          {
            totalMarket?.Runners?.map((Item: any, index: number) => {
              return (
                <div className='col-lg-3 col-6' key={index}>
                  <div className={`casino-odds-box-container casino-odds-box-container-extra`}>
                    <div className='casino-yn'>
                      <div className='casino-odds-box-bhav'>
                        <b>{Item.RunnerName}</b>
                      </div>
                    </div>
                    {marketRow(Item)}
                    <div className='col-12 casino-odds-book'>
                      <span className='d-block m-t-5'>
                        <CasinoPnl matchId={liveMatchData.match_id} sectionId={Item.SelectionId} />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className='col-md-12 text-right'>
          <span className='m-r-10'>
            <b>Min:</b>
            <span>{liveMatchData.min}</span>
          </span>
          <span>
            <b>Max:</b>
            <span>{liveMatchData.max}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
export default React.memo(CasinoQueenLayout)
