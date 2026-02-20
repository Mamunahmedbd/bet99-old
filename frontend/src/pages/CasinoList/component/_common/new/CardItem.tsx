import React from "react"
import { IBetOn, IBetType } from "../../../../../models/IBet";
import { RoleType } from "../../../../../models/User";
import { betPopup } from "../../../../../redux/actions/bet/betSlice";
import { selectUserData } from "../../../../../redux/actions/login/loginSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import authService from "../../../../../services/auth.service";

const CardItem = (props: any) => {
    const { selectionid, title, lastOdds, liveMatchData } = props;
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
    const suspend = !ItemMarket.gstatus || ItemMarket.gstatus == 0 || ItemMarket.gstatus=="SUSPENDED" || ItemMarket.gstatus=="CLOSED"? 'suspended' : '';
    const newtitle = title=='Card A'?'Card 1':title;
    return <div className={`lucky7card  ${suspend}`} >
    <img onClick={() => onBet(true, ItemMarket)} src={`/imgs/casino/cards/${newtitle}.jpeg`} className="m-r-5 m-l-5 wd-casino" />
</div>
}
export default React.memo(CardItem)