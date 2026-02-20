import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice';
import { betPopup } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import React, { useState } from 'react';
import CasinoPnl from './casinoPnl';
import Limitinfo from './_common/limitinfo';

const TeenPatti20 = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const [updateOdds, setUpdateOdds] = useState<any>(undefined)

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    if (userState.user.role === RoleType.user) {
        const oddsVal = parseFloat(isBack ? item.rate : item.rate);
        if (oddsVal <= 0) return
        if (item.gstatus == 'False') return
        dispatch(
            betPopup({
                isOpen: true,
                betData: {
                    isBack,
                    odds: oddsVal,
                    volume: 100,
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
  const laybacklayout = () => {
    const clsnamehead = 'box-4'
    const clsnamename = 'box-2'
    const heightdata = ''
    return ([0, 1].map((ItemIndex: any, key: number) => {
      const ItemNew = liveMatchData?.defaultMarkets?.[ItemIndex].Runners?.[0] || {}
      const Item: any = lastOdds?.[ItemNew.SelectionId] || {}
      const clsstatus =
        !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' || Item.gstatus === '0' ? 'suspended' : ''
      const otherMarket = liveMatchData?.defaultMarkets?.[key + 2]?.Runners[0] || {}
      const ItemOther: any = lastOdds?.[otherMarket.SelectionId] || {}
      const clsstatus2 =
        !ItemOther.gstatus || ItemOther.gstatus === 'SUSPENDED' || ItemOther.gstatus === 'CLOSED' || ItemOther.gstatus === '0' ? 'suspended' : ''
      return (
        (
          <tr key={key} className={` ${heightdata}`}>
            <td className={clsnamehead} style={{paddingLeft:"10px"}}>
              <b>{ItemNew.RunnerName}</b>
            </td>
            <td className={`back teen-section ${clsstatus} ${clsnamename}`}>
              <button className='back' onClick={() => onBet(true, Item)}>
                <span className='odd'>{Item.rate}</span>{' '}
                <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
              </button>
            </td>
            <td className={`back teen-section box-4 ${clsstatus2}`}>
              <button className='back' onClick={() => onBet(true, ItemOther)}>
                <span className='odd'>
                  <b>{otherMarket.RunnerName}</b>
                </span>{' '}
                <CasinoPnl sectionId={otherMarket.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
              </button>
            </td>
          </tr>
        )
      )
    })
    )
  }
  return (
    <div className='container '>
      <div className='row casino-32A '>
        <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <table className='table coupon-table table table-bordered suspendwidth'>
              <thead style={{borderBottom:"0px"}}>
                <tr>
                  <th className={'box-4'} style={{ paddingLeft: "10px" }}>
                    <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
                  </th>
                  <th className={`back ${"box-2"}`}>BACK</th>
                  <th className={`back ${"box-4"}`}></th>
                </tr>
              </thead>
              <tbody>
                {laybacklayout()}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
export default TeenPatti20
