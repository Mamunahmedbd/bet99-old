import React from 'react'
import { IBetOn, IBetType } from '../../../../models/IBet'
import { RoleType } from '../../../../models/User'
import { selectCasinoCurrentMatch } from '../../../../redux/actions/casino/casinoSlice'
import { selectUserData } from '../../../../redux/actions/login/loginSlice'
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks'
import authService from '../../../../services/auth.service'

import { betPopup } from '../../../../redux/actions/bet/betSlice'
import CasinoPnl from '../casinoPnl'
import { isMobile } from 'react-device-detect'
import Limitinfo from './limitinfo'

const FancyMarket = (props: any) => {
  const { oddsMarket, lastOdds, max } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.b1 : item.l1)
    const odds = oddVal.toString()
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.status === 'SUSPENDED') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: parseFloat(isBack ? item.bs1 : item.ls1),
            marketId: item.mid,
            marketName: oddsMarket.MarketName,
            matchId: parseInt(lastOdds?.match_id || 0),
            selectionName: item.nat,
            selectionId: item.sid,
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: lastOdds.title,
            betOn: IBetOn.CASINO,
            gtype: lastOdds.slug,
            fancystatus: 'yes'
          },
        }),
      )
    }
  }
  const layoutRunner = () => {
    return (
      oddsMarket &&
      oddsMarket.Runners &&
      oddsMarket.Runners.length > 0 &&
      oddsMarket.Runners.map((ItemRunner: any, keyRunner: number) => {
        const gstatus =
          ItemRunner.status == 'SUSPENDED' || ItemRunner.status == 'CLOSED' ? 'suspended' : ''
        return (
          <div className='table-body' key={keyRunner}>
            <div className='fancy-tripple'>
              <div data-title={ItemRunner.status} className={`table-row ${gstatus}`}>
                <div className='float-left country-name box-6'>
                  <p className='m-b-0 tx-left'>{ItemRunner.nat}</p>
                  <CasinoPnl
                    matchId={lastOdds.match_id}
                    sectionId={ItemRunner.sid}
                    clsName={'tx-left'}
                  />
                </div>

                <div
                  className={`lay ${!isMobile ? 'box-1' : 'box-2'} float-left back text-center`}
                  onClick={() => {
                    onBet(false, ItemRunner)
                  }}
                >
                  <span className='odd d-block'> {ItemRunner.l1}</span>
                  <span>{ItemRunner.ls1}</span>
                </div>
                <div
                  className={`back ${!isMobile ? 'box-1' : 'box-2'} float-left back text-center`}
                  onClick={() => {
                    onBet(true, ItemRunner)
                  }}
                >
                  <span className='odd d-block'> {ItemRunner.b1}</span>
                  <span>{ItemRunner.bs1}</span>
                </div>
                {!isMobile ? <div className='box-2 float-left text-right min-max'></div> : ''}
              </div>
            </div>
          </div>
        )
      })
    )
  }
  return (
    <div>
      <div className='table-header'>
        <div className={`float-left country-name box-6 ${isMobile ? 'bg-theme2 tx-white text-left' : ''}`}>

          {isMobile && <h6 className='card-title d-inline-block' style={{ width: "100%" }}>
            {oddsMarket.MarketName}
            <span className='float-right'>
              <Limitinfo
                max={lastOdds.max}
                min={lastOdds.min}
                nameString={oddsMarket.MarketName.replace(' ', '')}
              />
            </span>
          </h6>}
        </div>
        <div className={`lay ${!isMobile ? 'box-1' : 'box-2'} float-left back text-center`}>
          <b>No</b>
        </div>

        <div className={`back ${!isMobile ? 'box-1' : 'box-2'} float-left back text-center`}>
          <b>Yes</b>
        </div>
        {!isMobile ? <div className='box-2 float-left'></div> : ''}
      </div>
      {layoutRunner()}
    </div>
  )
}
export default React.memo(FancyMarket)
