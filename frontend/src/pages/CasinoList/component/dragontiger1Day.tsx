import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice';
import { betPopup } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import { useState } from 'react';
import CasinoPnl from './casinoPnl';
import Limitinfo from './_common/limitinfo';
import LayBackButton from './_common/new/LayBackButton';
import ButtonItem from './_common/new/ButtonItem';
import BackButtonPnl from './_common/new/BackButtonPnl';

const Dragontiger1Day = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const [updateOdds, setUpdateOdds] = useState<any>(undefined)

  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.b1 : item.l1);
    const odds = oddVal.toString();
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === 'SUSPENDED') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: getCurrentMatch?.match_id || 0,
            selectionName: item?.nation || item?.RunnerName || item?.nat,
            selectionId: item.SelectionId,
            pnl: 0,
            stack: 0,
            currentMarketOdds: isBack ? item.b1 : item.l1,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: getCurrentMatch.title,
            betOn: IBetOn.CASINO,
            gtype: 'dragontiger1Day',
          },
        }),
      )
    }
  }
  const laybacklayout = () => {
    const clsnamehead = 'box-4'
    return (liveMatchData?.defaultMarkets?.[0]?.Runners.map((ItemNew: any, key: number) => {
      const ItemMarket: any = lastOdds?.[ItemNew.SelectionId] || {}
      const clsstatus = !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
      return (
        (
          <tr key={key} className={`${clsstatus}`}>
            <td className={clsnamehead} style={{ paddingLeft: "10px" }}>
              <b>{ItemNew.RunnerName}</b>
              <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData?.match_id} />
            </td>
            <LayBackButton selectionid={ItemNew.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} />
          </tr>
        )
      )
    })
    )
  }

  const oddeven = () => {
    return (['Dragon', 'Tiger'].map((ItemNew: any, key: number) => {
      const market1 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Even`)?.[0]?.Runners?.[0] || {}
      const market2 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Odd`)?.[0]?.Runners?.[0] || {}
      return <tr key={key}>
        <td className='box-4' style={{ paddingLeft: "10px" }}>{ItemNew}</td>
        <BackButtonPnl key={key} selectionid={market1.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
        <BackButtonPnl key={key + 2} selectionid={market2.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
      </tr>
    }))
  }

  const redblack = () => {
    return (['Dragon', 'Tiger'].map((ItemNew: any, key: number) => {
      const market1 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Red`)?.[0]?.Runners?.[0] || {}
      const market2 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Black`)?.[0]?.Runners?.[0] || {}
      return <tr key={key}>
        <td className='box-4' style={{ paddingLeft: "10px" }}>{ItemNew}</td>
        <BackButtonPnl key={key} selectionid={market1.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
        <BackButtonPnl key={key + 2} selectionid={market2.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
      </tr>
    }))
  }
  const carditem = () => {
    return (['Dragon', 'Tiger'].map((ItemNew: any, key: number) => {
      const market1 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Spade`)?.[0]?.Runners?.[0] || {}
      const market2 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Heart`)?.[0]?.Runners?.[0] || {}
      const market3 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Diamond`)?.[0]?.Runners?.[0] || {}
      const market4 = liveMatchData?.defaultMarkets?.filter((ItemEven: any) => ItemEven.MarketName == `${ItemNew} Club`)?.[0]?.Runners?.[0] || {}
      return <tr key={key}>
        <td className='box-2' style={{ paddingLeft: "10px" }}>{ItemNew}</td>
        <BackButtonPnl key={key} selectionid={market1.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
        <BackButtonPnl key={key + 4} selectionid={market2.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
        <BackButtonPnl key={key + 8} selectionid={market3.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
        <BackButtonPnl key={key + 12} selectionid={market4.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} />
      </tr>
    }))
  }
  return (
    <div className='container ' id={`${getCurrentMatch?.slug}`} style={{ marginTop: "-10px" }}>
      <div className='row '>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <table className='table coupon-table table table-bordered'>
              <thead style={{ borderBottom: "0px" }}>
                <tr>
                  <th className={"box-4"} style={{ paddingLeft: "10px" }}>
                    <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
                  </th>
                  <th className={`back ${"box-3"} fw600`}>BACK</th>
                  <th className={`lay-color ${"box-3"} fw600`}>LAY</th>
                </tr>
              </thead>
              <tbody>
                {laybacklayout()}
              </tbody>
            </table>
          </div>
        </div>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: "20px" }}>
          {liveMatchData?.defaultMarkets?.[1]?.Runners.map((ItemNew: any, key: number) => {
            const Item: any = updateOdds?.[ItemNew.SelectionId] || {}
            return <>
              <ButtonItem key={key} selectionid={ItemNew.SelectionId} title={ItemNew.RunnerName} lastOdds={lastOdds} liveMatchData={liveMatchData} />
              <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData?.match_id} clsName={'text-center'} />
            </>
          })}
        </div>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <table className='table coupon-table table table-bordered suspendwidth'>
            <thead style={{ borderBottom: "10px" }}>
              <tr>
                <th className={"box-4"} style={{ paddingLeft: "10px" }}>
                  <Limitinfo nameString={'evenodd'} min={100} max={50000} />
                </th>
                <th className={`back ${"box-3"} fw600`}>EVEN</th>
                <th className={`back ${"box-3"} fw600`}>ODD</th>
              </tr>
            </thead>
            <tbody>
              {oddeven()}
            </tbody>
          </table>
        </div>

        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <table className='table coupon-table table table-bordered suspendwidth'>
              <thead style={{ borderBottom: "0px" }}>
                <tr>
                  <th className={"box-4"} style={{ paddingLeft: "10px" }}>
                    <Limitinfo nameString={'redblack'} min={100} max={50000} />
                  </th>
                  <th className={`back ${"box-3"} fw600`}>Red <span className="card-icon"> <span className={"card-red"}>{"[{"}</span> </span></th>
                  <th className={`back ${"box-3"} fw600`}>Black <span className="card-icon"> <span className={"card-black"}>{"]}"}</span> </span></th>
                </tr>
              </thead>
              <tbody>
                {redblack()}
              </tbody>
            </table>
          </div>
        </div>

        <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <table className='table coupon-table table table-bordered suspendwidth'>
              <thead style={{ borderBottom: "0px" }}>
                <tr>
                  <th className={"box-2"} style={{ paddingLeft: "10px" }}>
                    <Limitinfo nameString={'redblack'} min={100} max={50000} />
                  </th>
                  <th className={`back ${"box-2"}`}>  <span className="card-icon"> <span className={"card-black"}>{"}"}</span> </span></th>
                  <th className={`back ${"box-2"}`}><span className="card-icon"> <span className={"card-red"}>{"{"}</span> </span></th>
                  <th className={`back ${"box-2"}`}><span className="card-icon"> <span className={"card-black"}>{"]"}</span> </span></th>
                  <th className={`back ${"box-2"}`}><span className="card-icon"> <span className={"card-red"}>{"["}</span> </span></th>
                </tr>
              </thead>
              <tbody>
                {carditem()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dragontiger1Day
