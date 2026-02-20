import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice';
import { betPopup, selectBetListUser, selectBetPopup } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import React from 'react';
import CasinoPnl from './casinoPnl';
import { isMobile } from 'react-device-detect';

const Cmeter20 = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const betValues = useAppSelector(selectBetPopup)
  const userBets = useAppSelector(selectBetListUser)
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    if (userState.user.role === RoleType.user) {
      const oddsVal = parseFloat(isBack ? item.b1 : item.l1);
      if (parseFloat(oddsVal.toString()) <= 0 || item.gstatus === 'SUSPENDED' || item.gstatus === '0' || (userBets && userBets[0] && userBets[0].selectionName && userBets[0].selectionName != item.nat)) return
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
  const lowCard = () => {
    return <div className="text-center">
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/1.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/2.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/3.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/4.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/5.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/6.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/7.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/8.jpg" />
      {betValues.betData.selectionName == 'Low' || (userBets && userBets[0] && userBets[0].selectionName && userBets[0].selectionName == 'Low') ? <img
        src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/9meter.jpg`} /> : <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/9.jpg" />}
    </div>

  }
  const highCard = () => {
    return <div className="text-center">
      {betValues.betData.selectionName == 'High' || (userBets && userBets[0] && userBets[0].selectionName && userBets[0].selectionName == 'High') ? <img
        src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/10meter.jpg`} /> : <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/10.jpg" />}
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/11.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/12.jpg" />
      <img src="https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/13.jpg" />

    </div>
  }
  const laybacklayout = () => {
    return (liveMatchData?.defaultMarkets?.map((ItemData: any, key: number) => {
      const ItemNew = ItemData?.Runners?.[0] || {}
      const Item: any = lastOdds?.[ItemNew.SelectionId] || {}
      const clsstatus =
        !Item.gstatus || Item.gstatus === 'SUSPENDED' || Item.gstatus === 'CLOSED' || Item.gstatus === '0' || (userBets && userBets[0] && userBets[0].selectionName && userBets[0].selectionName != ItemNew.RunnerName) ? 'suspended' : ''
      return (
        (
          <div className={!isMobile ? `col-lg-6 col-12 ${key == 0 ? 'plr-0' : 'pr-0'}` : 'col-lg-6 col-12'} key={key}>
            <button className={`btn-theme ${clsstatus}`} onClick={() => onBet(true, Item)} style={{ minHeight: "135px" }}>
              <div className="cmeter-title" >
                {(betValues.betData.selectionName == 'High' && ItemNew.RunnerName == 'Low' || (userBets?.[0]?.selectionName == 'High' && ItemNew.RunnerName == 'Low')) && <img key={key}
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/10HH.png`} className={'mr-1'} />}
                <h4 className="d-inline-block" style={{ minHeight: "53px" }}><b >{ItemNew.RunnerName}</b>
                </h4>
                {(betValues.betData.selectionName == 'Low' && ItemNew.RunnerName == 'High' || (userBets?.[0]?.selectionName == 'Low' && ItemNew.RunnerName == 'High')) && <img key={key}
                  src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/9HH.png`} className={'ml-1'} />}

              </div>
              {ItemNew.SelectionId == "1" ? lowCard() : highCard()}
              <div className="text-center"></div>
            </button>
            <div className='d-flex mt-1 mb-10' style={{ justifyContent: "space-between", alignItems: "center" }}>
              <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData.match_id} />
              <p className="m-b-0 m-t-5 text-right min-max">
                <span ><b>Min:</b>{Item.min}</span>
                <span className="m-l-5"><b>Max:</b>{Item.max}</span>
              </p>
            </div>
          </div>
        )
      )
    })
    )
  }
  const pushDataToPositions = React.useCallback(
    (data: string) => {
      const positions = [0, 1, 2, 3]
      const dataArray: Array<string> = data ? data.split(',').filter((d) => d !== '1') : []

      return dataArray.reduce(
        (acc: Record<number, string[]>, item, index) => {
          const positionIndex = index % 4;
          let position = 0;

          // Set position to 1 if the item includes '10', 'J', 'K', or 'Q'
          if (item.includes('10') || item.includes('J') || item.includes('K') || item.includes('Q')) {
            position = 1;
          }

          // Handle specific cases for '9HH' and '10HH'
          if (item === '9HH' && userBets?.[0]?.selectionName === 'Low') {
            position = 1;
          }
          if (item === '10HH' && userBets?.[0]?.selectionName === 'High') {
            position = 0;
          }

          // Ensure the accumulator has an array for the position
          if (!acc[position]) {
            acc[position] = [];
          }

          acc[position].push(item);
          return acc;
        },
        { 0: [], 1: [] } // Ensure the accumulator is initialized properly
      );
    },
    [lastOdds?.cardsstring] // Use optional chaining to handle the lastOdds existence check
  );

  const layoutCard = () => {
    const cards = pushDataToPositions(lastOdds?.cardsstring || '')
    ///console.log(cards)
    return cards[0].length > 0 || cards[1].length > 0 ? <><div className='row  meter-content mb-10'>
      <div className={isMobile ? 'col-lg-12 col12p10' : " col-lg-12 p0"}>
        <div className="meter-lh-card-container mt-1">
          <h5 className="d-inline-block mb-0"><b >Low</b> <span
            className="text-primary ml-1">{lastOdds?.['cards']?.C1 - (userBets?.[0]?.selectionName == 'Low' && lastOdds?.['cards']?.C3 == 1 ? 9 : 0) + (userBets?.[0]?.selectionName == 'High' && lastOdds?.['cards']?.C4 == 1 ? 10 : 0)}</span>
            {isMobile && <div className='runposition'>
              <div className="d-inline-block text-center meter-lh-card ml-1">
                {userBets?.[0]?.selectionName == 'Low' &&
                  <span style={{ marginLeft: "20px" }}>Run Position :  {(parseInt(lastOdds?.['cards']?.C1) - (lastOdds?.['cards']?.C3 == 1 ? 9 : 0)) - (parseInt(lastOdds?.['cards']?.C2) + + (lastOdds?.['cards']?.C3 == 1 ? 9 : 0))}</span>}
                {userBets && userBets[0] && userBets[0].selectionName && userBets[0].selectionName == 'High' &&
                  <span style={{ marginLeft: "20px" }}>Run Position : {(parseInt(lastOdds?.['cards']?.C2) - (lastOdds?.['cards']?.C4 == 1 ? 10 : 0)) - (parseInt(lastOdds?.['cards']?.C1) + + (lastOdds?.['cards']?.C4 == 1 ? 10 : 0))}</span>}

              </div>
            </div>}
          </h5>
          <div className={`${isMobile ? '' : 'd-inline-block'} text-center meter-lh-card ml-1`} style={{ display: "block !important", marginTop: "5px" }}>
            {cards && cards[0].length > 0 && cards[0].map((Item: any, key: number) => {
              return <img key={key}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/mobile/img/cards/${Item}.png`} className="cmertercard" />
            })}
          </div>
          {!isMobile && <div className="d-inline-block text-center meter-lh-card ml-1">
            {userBets?.[0]?.selectionName == 'Low' &&
              <span style={{ marginLeft: "20px" }}>Run Position :  {(parseInt(lastOdds?.['cards']?.C1) - (lastOdds?.['cards']?.C3 == 1 ? 9 : 0)) - (parseInt(lastOdds?.['cards']?.C2) + + (lastOdds?.['cards']?.C3 == 1 ? 9 : 0))}</span>}
          </div>}

        </div>
      </div>
      <div className={isMobile ? 'col-lg-12 col12p10' : " col-lg-12 p0"}>
        <div className="meter-lh-card-container mt-1">
          <h5 className="d-inline-block mb-0"><b >High</b> <span
            className="text-primary ml-1">{lastOdds?.['cards']?.C2 - (userBets?.[0]?.selectionName == 'High' && lastOdds?.['cards']?.C4 == 1 ? 10 : 0) + (userBets?.[0]?.selectionName == 'Low' && lastOdds?.['cards']?.C3 == 1 ? 9 : 0)}</span></h5>
          <div className={`${isMobile ? '' : 'd-inline-block'} text-center meter-lh-card ml-1`} style={{ display: "block !important", marginTop: "5px" }}>
            {cards && cards[1].length > 0 && cards[1].map((Item: any, key: number) => {
              return <img key={key}
                src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/mobile/img/cards/${Item}.png`} className="cmertercard" />
            })}
          </div>
          {!isMobile && <div className="d-inline-block text-center meter-lh-card ml-1">
            {userBets && userBets[0] && userBets[0].selectionName && userBets[0].selectionName == 'High' &&
              <span style={{ marginLeft: "20px" }}>Run Position : {(parseInt(lastOdds?.['cards']?.C2) - (lastOdds?.['cards']?.C4 == 1 ? 10 : 0)) - (parseInt(lastOdds?.['cards']?.C1) + + (lastOdds?.['cards']?.C4 == 1 ? 10 : 0))}</span>}
          </div>}

        </div>
      </div>
    </div></> : ""
  }
  return (
    <div className='container '>
      {layoutCard()}
      <div className='row meter-content '>
        {laybacklayout()}
      </div>
    </div>
  )
}
export default Cmeter20
