import React from "react"
import { IBetOn, IBetType } from "../../../../../models/IBet";
import { RoleType } from "../../../../../models/User";
import { betPopup } from "../../../../../redux/actions/bet/betSlice";
import { selectUserData } from "../../../../../redux/actions/login/loginSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import authService from "../../../../../services/auth.service";
import { nFormatter } from "../../../../../utils/helper";
import CasinoPnl from "../../casinoPnl";

const OddEvenButton = (props: any) => {
  const { selectionid, selectionid2, lastOdds, liveMatchData, clsnamename, bookstatus } = props;
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
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
  const ItemMarket: any = lastOdds?.[selectionid] || {}
  const ItemMarket2: any = lastOdds?.[selectionid2] || {}
  return <>
    <td className={`back teen-section ${clsnamename}`}>
      <button className='back' onClick={() => onBet(true, ItemMarket)}>
        <span className='odd'>{ItemMarket.b1}</span>{' '}
        {!bookstatus && <span className='fw-12 laysize'>{nFormatter(ItemMarket.bs1, 2)}</span>}
        {bookstatus && <CasinoPnl sectionId={selectionid} matchId={liveMatchData?.match_id} />}
      </button>
    </td>
    <td className={`back teen-section ${clsnamename}`}>
      <button className='back' onClick={() => onBet(true, ItemMarket2)}>
        <span className='odd'>
          <b>{ItemMarket2.b1}</b>
        </span>
        {!bookstatus && <span className='fw-12 laysize'>{nFormatter(ItemMarket2.bs1, 2)}</span>}
        {bookstatus && <CasinoPnl sectionId={selectionid2} matchId={liveMatchData?.match_id} />}

      </button>
    </td>
  </>
}
export default React.memo(OddEvenButton)