import React from "react"
import { IBetOn, IBetType } from "../../../../../models/IBet";
import { RoleType } from "../../../../../models/User";
import { betPopup } from "../../../../../redux/actions/bet/betSlice";
import { selectUserData } from "../../../../../redux/actions/login/loginSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import authService from "../../../../../services/auth.service";
import { nFormatter } from "../../../../../utils/helper";

const LayButton = (props: any) => {
    const { selectionid, lastOdds, liveMatchData, clsnamename } = props;
    const dispatch = useAppDispatch()
    const userState = useAppSelector(selectUserData)
    const onBet = (isBack = false, item: any) => {
        const ipAddress = authService.getIpAddress()
        if (userState.user.role === RoleType.user) {
            const oddsVal = parseFloat(isBack ? item.b1 : item.l1);
            if (oddsVal <= 0) return
            if (!item.gstatus || item.gstatus == 'SUSPENDED') return
            dispatch(
                betPopup({
                    isOpen: true,
                    betData: {
                        isBack,
                        odds: oddsVal,
                        volume: isBack ? (item.bs1>1000000 ? 1 : item.bs1) : (item.ls1>1000000 ? 1 : item.ls1),
                        marketId: item?.mid || item?.marketId,
                        marketName: item.MarketName,
                        matchId: liveMatchData?.event_data?.match_id || 0,
                        selectionName: item.runnerName,
                        selectionId: item?.sid ? parseInt(item?.sid) : item?.sectionId,
                        pnl: 0,
                        stack: 0,
                        currentMarketOdds: isBack ? item.b1 : item.l1,
                        eventId: item?.mid || item?.marketId,
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
    return <>
     <td className={`back teen-section ${clsnamename}`}>
              <button className='back' onClick={() => onBet(true, ItemMarket)}>
                <span className='odd'>{ItemMarket.b1}</span>{' '}
                <span className='fw-12 laysize' style={{display:"block"}}>{nFormatter(ItemMarket.bs1, 2)}</span>
              </button>
            </td>
            <td className={`lay teen-section ${clsnamename}`}>
              <button className='lay' onClick={() => onBet(false, ItemMarket)}>
                <span className='odd'>
                  <b>{ItemMarket.l1}</b>
                </span>
                <span className='fw-12 laysize' style={{display:"block"}}>{nFormatter(ItemMarket.ls1, 2)}</span>
              </button>
            </td>
    </>
}
export default React.memo(LayButton)