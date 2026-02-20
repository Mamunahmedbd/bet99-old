import React from "react"
import { isMobile } from "react-device-detect";
import { IBetOn, IBetType } from "../../../../../models/IBet";
import { RoleType } from "../../../../../models/User";
import { betPopup } from "../../../../../redux/actions/bet/betSlice";
import { selectUserData } from "../../../../../redux/actions/login/loginSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import authService from "../../../../../services/auth.service";
import CasinoPnl from "../../casinoPnl";

const BackButtonPnl = (props: any) => {
    const { selectionid, lastOdds, liveMatchData, clsnamename, needSuspend, titleStatus } = props;
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
    const clsstatus = !ItemMarket.gstatus || ItemMarket.gstatus === '0' || ItemMarket.gstatus ==='SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    return <>
     <td className={`back teen-section ${clsnamename} ${needSuspend==undefined || (needSuspend && needSuspend==true)? clsstatus : ''}`}>
              <button className='back' onClick={() => onBet(true, ItemMarket)}>
                <span className='odd' style={{fontSize:isMobile?"12px":''}}>{titleStatus!=undefined?ItemMarket.runnerName:ItemMarket.b1}</span>{' '}
                <span className='fw-12 laysize'>
                <CasinoPnl sectionId={selectionid} matchId={liveMatchData?.match_id} />
                </span>
              </button>
      </td>
    </>
}
export default React.memo(BackButtonPnl)