import React from "react"
import { IBetOn, IBetType } from "../../../../../models/IBet";
import { RoleType } from "../../../../../models/User";
import { betPopup } from "../../../../../redux/actions/bet/betSlice";
import { selectUserData } from "../../../../../redux/actions/login/loginSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import authService from "../../../../../services/auth.service";
const QueenItem = (props: any) => {
    const { selectionid, lastOdds, liveMatchData, fancystatus } = props;
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
                        fancystatus:fancystatus?'yes':undefined
                    },
                }),
            )
        }
    }
    const liveMarketData: any = lastOdds?.[selectionid] || {}
    const suspended = !liveMarketData?.gstatus || liveMarketData.gstatus == 'SUSPENDED' || liveMarketData.gstatus == 'CLOSED' ? 'suspended' : ''

    return <>
        <div className='casino-odds-box casino-yn'>
            <div
                className={`back-border ${suspended}`}
                onClick={() => onBet(true, liveMarketData)}
            >
                <span className='casino-odds-box-odd'>{liveMarketData.b1}</span>
                <span className='fw-12 laysize'>{liveMarketData.bs1}</span>
            </div>
            <div
                className={`lay-border ${suspended}`}
                onClick={() => onBet(false, liveMarketData)}
            >
                <span className='casino-odds-box-odd'>{liveMarketData.l1}</span>
                <span className='fw-12 laysize'>{liveMarketData.ls1}</span>
            </div>
        </div>
    </>
}
export default React.memo(QueenItem)