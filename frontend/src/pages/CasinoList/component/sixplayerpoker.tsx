import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { betPopup } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import { useState } from 'react';
import CasinoPnl from './casinoPnl';
import { replacecardstring } from '../../../utils/helper';
import { isMobile } from 'react-device-detect';

const Sixplayerpoker = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const [activeTab, setActivetab] = useState<any>("hands")

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    if (userState.user.role === RoleType.user) {
      const oddsVal = parseFloat(isBack ? item.b1 : item.l1);
      if (oddsVal <= 0) return
      if (!item.gstatus || item.gstatus == 'SUSPENDED' || item.gstatus == '0') return
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
  const laybacklayout = () => {
    const finalMarkets = liveMatchData?.defaultMarkets?.[0]?.Runners || []
    const cards = lastOdds?.[`cards`] || {}
    return (finalMarkets.map((ItemNew: any, key: number) => {
      const Item: any = lastOdds?.[ItemNew.SelectionId] || {}
      const clsstatus = !Item.gstatus || Item.gstatus === '0' || Item.gstatus === 'CLOSED' ? 'suspended' : ''
      const card = cards[`C${key + 1}`] && cards[`C${key + 1}`] != '1' && cards[`C${key + 1}`];
      const card2 = cards[`C${key + 7}`] && cards[`C${key + 7}`] != 1 && cards[`C${key + 7}`];
      return (
        (
          <div className='col-lg-6 col-6 mb-10 p0' style={{ paddingRight: key % 2 == 0 ? "10px" : "0px" }} key={key}>
            <button className={`bt-action btn-theme ${clsstatus}`} onClick={() => onBet(true, Item)}>
              <div className="color-card"></div>
              <span className="patern-name">{ItemNew.RunnerName}
                {card && <span className="card-icon m-l-20">{replacecardstring(card)} {card.includes('CC') && <span className="card-black">{"}"}</span>} {card.includes('HH') && <span className="card-black">]</span>} {card.includes('DD') && <span className="card-red">{"{"}</span>} {card.includes('SS') && <span className="card-red">[</span>}</span>}
                {card2 && <span className="card-icon m-l-5">{replacecardstring(card2)} {card2.includes('CC') && <span className="card-black">{"}"}</span>}{card2.includes('HH') && <span className="card-black">]</span>}  {card2.includes('DD') && <span className="card-red">{"{"}</span>} {card2.includes('SS') && <span className="card-red">[</span>}</span>}
              </span>
              <span className="point">{Item.rate}</span>
              {isMobile ? <p className="m-b-0 m-t-5 text-right min-max"><span ><b>Min:</b>{Item.min}</span> <span className="m-l-5"><b>Max:</b>{Item.max}</span></p> : ""}
            </button>
            <div className='limit-block mtc-5'>
              <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData.match_id} clsName={'float-left'} />
              {!isMobile ? <p className="m-b-0 m-t-5 text-right min-max"><span ><b>Min:</b>{Item.min}</span> <span className="m-l-5"><b>Max:</b>{Item.max}</span></p> : ""}
            </div>
          </div>
        )
      )
    })
    )
  }

  const patterns = () => {
    const finalMarkets = liveMatchData?.defaultMarkets || []

    return ([1, 2, 3, 4, 5, 6, 7, 8, 9].map((ItemIndex: any) => {
      const runners = finalMarkets?.[ItemIndex]?.Runners || []
      return runners.map((ItemNew: any, key: number) => {
        const Item: any = lastOdds?.[ItemNew.SelectionId] || {}
        const clsstatus =
          !Item.gstatus || Item.gstatus === '0' || Item.gstatus === 'CLOSED' ? 'suspended' : ''
        return (
          (
            <div className='col-lg-4 col-4 mb-10 p0' style={{ paddingRight: key % 2 == 0 ? "10px" : "0px" }} key={key}>
              <button className={`bt-action btn-theme ${clsstatus}`} onClick={() => onBet(true, Item)}>
                <span className="patern-name">{ItemNew.RunnerName}
                </span>
                <span className="point">{Item.rate}</span>
                {isMobile ? <p className="m-b-0 m-t-5 text-right min-max"><span ><b>Min:</b>{Item.min}</span> <span className="m-l-5"><b>Max:</b>{Item.max}</span></p> : ""}
              </button>
              <div className='limit-block mtc-5'>
                <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData.match_id} clsName={'float-left'} />
                {!isMobile ? <p className="m-b-0 m-t-5 text-right min-max"><span ><b>Min:</b>{Item.min}</span> <span className="m-l-5"><b>Max:</b>{Item.max}</span></p> : ""}
              </div>
            </div>
          )
        )
      })
    })
    )
  }
  return (
    <div className='container hands-pattern-container' style={{ marginTop: isMobile ? '-10px' : '' }}>
      <div className='row '>
        {lastOdds && lastOdds.desc != '' && <div className='col-lg-12 main-market text-center tx-white bg-theme' style={{ padding: '10px' }}>
          RESULT : {lastOdds.desc}
        </div>}
        <div className='col-lg-12 m-b-10 main-market' style={{ padding: '0px' }}>
          <ul className="nav nav-tabs m-b-5 ">
            <li className="nav-item">
              <a data-toggle="tab" href="#hands" onClick={() => { setActivetab('hands') }}
                className="nav-link active">Hands</a>
            </li>
            <li className="nav-item">
              <a data-toggle="tab" href="#patterns" onClick={() => { setActivetab('patterns') }}
                className="nav-link">Patterns</a>
            </li>
          </ul>
        </div>
        {activeTab == 'hands' && laybacklayout()}
        {activeTab == 'patterns' && patterns()}
      </div>
    </div>
  )
}
export default Sixplayerpoker
