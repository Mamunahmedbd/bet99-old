import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { betPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import React from 'react'
import Limitinfo from './_common/limitinfo'
import { isMobile } from 'react-device-detect'
import CasinoPnl from './casinoPnl'

const TestTp = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
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
    return (
      ['Winner', 'Pair', 'Flush', 'Straight', 'Trio', 'Straight Flush'].map((ItemNew: any, key: number) => {
        const filterMarketLiveData = lastOdds?.market?.filter((ItemLive: any) => ItemLive.nation == `${ItemNew}`)?.[0] || {}
        const status = !filterMarketLiveData?.dstatus || filterMarketLiveData?.dstatus == 'False' ? 'suspended' : ''
        return <tr key={key} className={`sus60perce ${status}`}>
          <td className={"box-4"} style={{ padding: isMobile ? "3px" : "" }}>
            <div className='d-flex' style={{ justifyContent: 'space-between', padding: isMobile ? "0px" : "12px" }}>
              <b>
                {ItemNew}
              </b>
              {!isMobile ? <Limitinfo nameString={ItemNew} min={liveMatchData?.min} max={liveMatchData?.max} /> : ""}
            </div>
          </td>
          {commonLayout(ItemNew)}
        </tr>
      })
    )
  }

  const commonLayout = (market: any) => {
    const clsnamename = 'box-2'
    const filterMarketLiveData = liveMatchData?.event_data?.market?.filter((ItemLive: any) => ItemLive.nation == market)?.[0] || {}
    return (['Tiger', 'Lion', 'Dragon'].map((ItemFake: any, keyFake: number) => {
      const marketRunnerName = `${market} ${ItemFake}`
      let liveObj: any = {}
      if (ItemFake == 'Tiger') liveObj = {
        rate: filterMarketLiveData?.trate,
        SelectionId: filterMarketLiveData?.tsection,
        sid: filterMarketLiveData?.tsection,
        gstatus: filterMarketLiveData?.tstatus,
        mid: filterMarketLiveData?.mid,
        runnerName: marketRunnerName,
        MarketName: marketRunnerName
      }
      if (ItemFake == 'Lion') liveObj = {
        rate: filterMarketLiveData?.lrate,
        SelectionId: filterMarketLiveData?.lsection,
        sid: filterMarketLiveData?.lsection,
        gstatus: filterMarketLiveData?.lstatus,
        runnerName: marketRunnerName,
        mid: filterMarketLiveData?.mid,
        MarketName: marketRunnerName
      }
      if (ItemFake == 'Dragon') liveObj = {
        rate: filterMarketLiveData?.drate,
        SelectionId: filterMarketLiveData?.dsectionid,
        sid: filterMarketLiveData?.dsectionid,
        gstatus: filterMarketLiveData?.dstatus,
        runnerName: marketRunnerName,
        mid: filterMarketLiveData?.mid,
        MarketName: marketRunnerName
      }
      const clsstatus = '';
      return (
        <td className={`back teen-section ${clsnamename}`} key={keyFake}>
          <button className={`back ${clsstatus}`} onClick={() => onBet(true, liveObj)} style={{ height: (isMobile ? '43px' : '45px') }}>
            <span className='odd'>{liveObj.rate}</span>{' '}
            <CasinoPnl
              sectionId={liveObj.SelectionId}
              matchId={liveMatchData.match_id}
              clsName={'text-center'}
            />
          </button>
        </td>
      )
    })
    )
  }
  return (
    <div className='container ' style={{ marginTop: "-10px" }}>
      <div className='row casino-32A '>
        <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <table className='table coupon-table table table-bordered'>
              <thead style={{ borderBottom: "0px" }}>
                <tr>
                  <td className='tx-left' style={{ paddingLeft: "2px" }}>
                    {isMobile && <div>Min:{liveMatchData.min} Max: {liveMatchData.max}</div>}
                  </td>
                  <td colSpan={3} className={'back text-center fw600'} style={{ height: !isMobile ? "35px" : "" }}>
                    BACK
                  </td>
                </tr>
                <tr>
                  <th className={'box-4'}></th>
                  <th className={`${'box-2 back fw600'}`} style={{ height: !isMobile ? "35px" : "" }}>Tiger</th>
                  <th className={`${'box-2 back fw600'}`} style={{ height: !isMobile ? "35px" : "" }}>Lion</th>
                  <th className={`${'box-2 back fw600'}`} style={{ height: !isMobile ? "35px" : "" }}>Dragon</th>
                </tr>
              </thead>
              <tbody>{laybacklayout()}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default TestTp
