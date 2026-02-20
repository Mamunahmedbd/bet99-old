import React from "react"
import { IBetOn, IBetType } from "../../../../models/IBet";
import { RoleType } from "../../../../models/User";
import { selectCasinoCurrentMatch } from "../../../../redux/actions/casino/casinoSlice";
import { selectUserData } from "../../../../redux/actions/login/loginSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import authService from "../../../../services/auth.service";
import { nFormatter } from "../../../../utils/helper";
import CasinoPnl from "../casinoPnl";
import { betPopup } from '../../../../redux/actions/bet/betSlice';
import { isMobile } from "react-device-detect";

const BookmakerMarket = (props: any) => {
  const { oddsMarket, lastOdds, max } = props;
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = parseFloat(isBack ? item.b1 : item.l1);
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
          },
        }),
      )
    }
  }
  const boxLayoutCls = isMobile?'box-2':'box-4';
  const boxLayoutCls2 = isMobile?'box-15':'box-1';
  const layoutRunner = () => {
    return oddsMarket?.Runners?.map((ItemRunner:any, keyRunner:number) => {
    const gstatus = ItemRunner.status == 'SUSPENDED' || ItemRunner.status == 'CLOSED'? 'suspended' : '';
    return <div className="table-body" key={keyRunner}>
    <div data-title={ItemRunner.status} className={`table-row ${gstatus}`}>
        <div className={`float-left country-name ${boxLayoutCls} tx-left`}>
          <span className="team-name tx-left">{ItemRunner.nat}</span>
          <CasinoPnl matchId={lastOdds.match_id} sectionId={ItemRunner.sid} />
        </div>
        <div className={`${boxLayoutCls2} back2 float-left text-center`}>
        </div>
        <div className={`${boxLayoutCls2} back1 back-2 float-left text-center`}>
        </div>
        <div className={`${boxLayoutCls2} back float-left back lock text-center betting-disabled`} onClick={() => { onBet(true, ItemRunner) }}>
          {ItemRunner.b1}
          <span className="d-block">{nFormatter(ItemRunner.bs1, 2)}</span>
        </div>
        <div className={`${boxLayoutCls2} lay float-left text-center betting-disabled`} onClick={() => { onBet(false, ItemRunner) }}>
        {ItemRunner.l1}
          <span className="d-block">{nFormatter(ItemRunner.ls1, 2)}</span>
        </div>
        <div className={`${boxLayoutCls2} lay2 float-left text-center`}>
        </div>
        <div className={`${boxLayoutCls2} lay1 float-left text-center`}>
        </div>
    </div>
</div>
})
  }
  return <div>
    <div className="table-header">
      <div className={`float-left country-name ${boxLayoutCls} text-info`}></div>
      <div className={`${boxLayoutCls2} float-left`}></div>
      <div className={`${boxLayoutCls2} float-left`}></div>
      <div className={`back ${boxLayoutCls2} float-left text-center`}><b >BACK</b></div>
      <div className={`lay ${boxLayoutCls2} float-left text-center`}><b >LAY</b></div>
      <div className={`${boxLayoutCls2} float-left`}></div>
      <div className={`${boxLayoutCls2} float-left`}></div>
    </div>
    {layoutRunner()}
  </div>
}
export default React.memo(BookmakerMarket)
