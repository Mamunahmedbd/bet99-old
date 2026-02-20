import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice'
import { betPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import { useState } from 'react'
import CasinoPnl from './casinoPnl'
import { isMobile } from 'react-device-detect'
import Limitinfo from './_common/limitinfo'

const Dtl20Layout = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState("D")
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.b1 : item.l1)
    const odds = oddVal.toString()
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === 'SUSPENDED' || item.gstatus === '0') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: liveMatchData?.event_data?.match_id || 0,
            selectionName: item?.nation || item?.RunnerName || item?.nat,
            selectionId: item.sid,
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: getCurrentMatch.title,
            betOn: IBetOn.CASINO,
            gtype: 'dtl20',
          },
        }),
      )
    }
  }
  const laybacklayout = (from: number, to: number) => {
    const clsnamehead = isMobile ? 'box-6' : 'box-4'
    const clsnamename = isMobile ? 'box-4' : 'box-2'
    const heightdata = '';
    const market = liveMatchData?.defaultMarkets || []
    return (
      ['Winner', 'Black', 'Red', 'Odd', 'Even', 'A', '2', '3', '4'].map((ItemNew: any, key: number) => {
        let title = ItemNew == 'Red' ? <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span> : '';
        title = ItemNew == 'Black' ? <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span> : title;

        return <tr key={key} className={`${heightdata}`}>
          <td className={clsnamehead} style={{ paddingLeft: "10px", paddingRight: "10px" }}>
            <div className='d-flex' style={{ justifyContent: 'space-between' }}>
              {key > 4 ?
                <b>
                  <img src={`imgs/card/${ItemNew}.jpg`} style={{ width: '25px' }} />
                </b>
                : ItemNew} {title} {isMobile && ItemNew == 'Winner' ? activeTab : ''}
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </div>
          </td>
          {['D', 'T', 'L'].map((ItemFake: any, keyFake: number) => {
            const mfull =
              ItemFake == 'D'
                ? 'Dragon'
                : ItemFake == 'L'
                  ? 'Lion'
                  : ItemFake == 'T'
                    ? 'Tiger'
                    : ItemFake
            const runnerFilter = market.filter(
              (ItemCheckMarket: any) =>
                ItemCheckMarket.MarketName == `${ItemNew} ${ItemFake}` ||
                ItemCheckMarket.MarketName == ItemNew ||
                ItemCheckMarket.MarketName == `${mfull} ${ItemNew}`,
            )[0]?.Runners?.[0] || {}
            const Item: any = lastOdds?.[runnerFilter.SelectionId] || {}
            const clsstatus =
              !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' || Item.gstatus === '0'
                ? 'suspended'
                : ''
            return (
              !isMobile || ItemFake == activeTab ? <td className={`back teen-section ${clsnamename}`} key={keyFake}>
                <button className={`back ${clsstatus}`} onClick={() => onBet(true, Item)}>
                  <span className='odd'>{Item.b1}</span>{' '}
                  {runnerFilter && <CasinoPnl
                    sectionId={runnerFilter.SelectionId}
                    matchId={liveMatchData?.match_id}
                    clsName={'text-center'}
                  />}
                </button>
              </td> : ""
            )

          })}
        </tr>
      })
    )
  }
  const laybacklayoutfor = (from: number, to: number) => {
    const clsnamehead = isMobile ? 'box-6' : 'box-4'
    const clsnamename = isMobile ? 'box-4' : 'box-2'
    const heightdata = '';
    const market = liveMatchData?.defaultMarkets || []
    return (
      ['5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((ItemNew: any, key: number) => {
        return <tr key={key} className={`${heightdata}`}>
          <td className={clsnamehead} style={{ paddingLeft: "10px", paddingRight: "10px" }}>
            <div className='d-flex' style={{ justifyContent: 'space-between' }}>
              <b>
                <img src={`imgs/card/${ItemNew}.jpg`} style={{ width: '25px' }} />
              </b>
              <Limitinfo nameString={`lbmarket${ItemNew}`} min={100} max={50000} />
            </div>
          </td>
          {['D', 'T', 'L'].map((ItemFake: any, keyFake: number) => {
            const mfull =
              ItemFake == 'D'
                ? 'Dragon'
                : ItemFake == 'L'
                  ? 'Lion'
                  : ItemFake == 'T'
                    ? 'Tiger'
                    : ItemFake
            const runnerFilter = market.filter(
              (ItemCheckMarket: any) =>
                ItemCheckMarket.MarketName == `${ItemNew} ${ItemFake}` ||
                ItemCheckMarket.MarketName == ItemNew ||
                ItemCheckMarket.MarketName == `${mfull} ${ItemNew}`,
            )[0]?.Runners?.[0] || {}
            const Item: any = lastOdds?.[runnerFilter.SelectionId] || {}
            const clsstatus =
              !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' || Item.gstatus === '0'
                ? 'suspended'
                : ''
            return (
              !isMobile || ItemFake == activeTab ? <td className={`back teen-section ${clsnamename}`} key={keyFake}>
                <button className={`back ${clsstatus}`} onClick={() => onBet(true, Item)}>
                  <span className='odd'>{Item.b1}</span>{' '}
                  {runnerFilter && <CasinoPnl
                    sectionId={runnerFilter.SelectionId}
                    matchId={liveMatchData?.match_id}
                    clsName={'text-center'}
                  />}
                </button>
              </td> : ""
            )

          })}
        </tr>
      })
    )
  }

  return (
    <div className='container ' style={{ marginTop: "-10px" }}>
      <div className='row casino-32A '>
        <div className='col-lg-12 col-12 m-b-10 main-market' style={{ padding: '0px' }}>
          {isMobile && lastOdds ? <div className='card-inner card-dtl-mobile'> <div className='d-flex'>
            <div>
              <img
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C1}.png`}
              />
            </div>
            <div>
              <img
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C2}.png`}
              />
            </div>
            <div>
              <img
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastOdds?.['cards']?.C3}.png`}
              />
            </div>
          </div></div> : ""}
          {isMobile ? <div className="home_mobile">
            <div className="mobile-header-for-casino">
              <ul className="nav nav-tabs">
                <li className="nav-item"><a onClick={() => setActiveTab('D')} data-toggle="tab" href="#dragon" className={activeTab === 'D' ? "nav-link active" : "nav-link"}>Dragon</a></li>
                <li className="nav-item"><a onClick={() => setActiveTab('T')} data-toggle="tab" href="#tiger" className={activeTab === 'T' ? "nav-link active" : "nav-link"}>Tiger</a></li>
                <li className="nav-item"><a onClick={() => setActiveTab('L')} data-toggle="tab" href="#Lion" className={activeTab === 'L' ? "nav-link active" : "nav-link"}>Lion</a></li>
              </ul>
            </div>
          </div> : ""}
        </div>
        <div className={`col-lg-6 col-6 m-b-10 main-market  ${!isMobile ? 'bg-gray' : ''}`} style={{ padding: isMobile ? '3px' : '0px' }}>
          <div className='live-poker'>
            <table className={`table coupon-table table table-bordered suspendwidth ${isMobile ? 'bg-gray' : ''}`}>
              {!isMobile ? <thead>
                <tr>
                  <th className={'box-4'}></th>
                  <th className={`${'box-2'}`}>D</th>
                  <th className={`${'box-2'}`}>T</th>
                  <th className={`${'box-2'}`}>L</th>
                </tr>
              </thead> : ""}
              <tbody>{laybacklayout(0, 4)}</tbody>
            </table>
          </div>
        </div>
        <div className={`col-lg-6 col-6 m-b-10 main-market  ${!isMobile ? 'bg-gray' : ''}`} style={{ padding: isMobile ? '3px' : '0px' }}>
          <div className='live-poker'>
            <table className={`table coupon-table table table-bordered suspendwidth ${isMobile ? 'bg-gray' : ''}`}>
              {!isMobile ? <thead>
                <tr>
                  <th className={'box-4'}></th>
                  <th className={`${'box-2'}`}>D</th>
                  <th className={`${'box-2'}`}>T</th>
                  <th className={`${'box-2'}`}>L</th>
                </tr>
              </thead> : ""}
              <tbody>{laybacklayoutfor(5, 9)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dtl20Layout
