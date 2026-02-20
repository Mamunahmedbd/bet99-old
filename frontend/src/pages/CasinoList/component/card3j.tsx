import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice';
import { betPopup, selectMarketBook, selectPlaceBet } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import React, { useState } from 'react';
import CasinoPnl from './casinoPnl';
import { isMobile } from 'react-device-detect';
import { IApiStatus } from '../../../models/IApiStatus';
import Marquee from 'react-fast-marquee';

const Card3JLayout = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const getPlaceBet = useAppSelector(selectPlaceBet)
  const [CardSelection, setCardSelect] = useState<any>({ type: 'yes', cards: [] })
  const cardNameValue: any = { 'J': 11, 'Q': 12, 'K': 13 }
  const getMarketBook: any = useAppSelector(selectMarketBook);

  const setDataCards = (name: string, type: string, ItemNew: any, Item: any) => {
    const cards = CardSelection;
    if (cards.type == type) {
      cards.type = type
      if (cards.cards.length < 3 && cards.cards.indexOf(name) <= -1) {
        cards.cards.push(name)
      }
    } else {
      cards.type = type
      cards.cards = [];
      if (cards.cards.length <= 3) {
        cards.cards.push(name)
      }
    }
    setCardSelect(cards)
    if (isMobile && cards.cards.length < 3) return
    onBet(ItemNew.RunnerName == 'YES' ? true : false, Item)
  }
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = item.rate;
    const odds = oddVal
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === '0' || CardSelection.cards.length < 3) return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: parseInt(liveMatchData?.match_id) || 0,
            selectionName: `${item.nat} ${CardSelection.cards.join('')}`,
            selectionId: parseInt(item.sid),
            pnl: 0,
            stack: 0,
            currentMarketOdds: item.rate,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData.slug,
            C1: CardSelection.cards[0],
            C2: CardSelection.cards[1],
            C3: CardSelection.cards[2]
          },
        }),
      )
    }
  }
  const laybacklayout = () => {
    return (liveMatchData?.defaultMarkets?.[0]?.Runners.map((ItemNew: any, key: number) => {
      const Item: any = lastOdds?.[ItemNew.SelectionId] || {}
      const clsnameForLB = ItemNew.RunnerName == 'YES' ? 'back' : 'lay'
      return (
        (
          <>
            <tr>
              <td colSpan={isMobile ? 1 : 2} className={`${!isMobile ? 'text-center' : clsnameForLB} brate`}><span>
                {isMobile && `${ItemNew.RunnerName} -`}{Item?.rate || `0.00`}</span>
                {getMarketBook[`${liveMatchData?.match_id || 0}_${ItemNew.SelectionId}`] ? (
                  <span
                    className={
                      getMarketBook[`${liveMatchData?.match_id || 0}_${ItemNew.SelectionId}`] > 0
                        ? `green `
                        : `red`
                    }
                    style={{ float: "right" }}
                  >
                    {getMarketBook[`${liveMatchData?.match_id || 0}_${ItemNew.SelectionId}`].toLocaleString()}
                  </span>
                ) : (
                  <span style={{ color: 'black', float: "right" }}>0</span>
                )}
              </td>
            </tr>
            <tbody className={`${!lastOdds?.[1] && !isMobile || lastOdds?.[1]?.gstatus == '0' && !isMobile ? 'suspended' : ''}`}>
              <tr className={`${ItemNew.RunnerName == 'YES' ? 'back' : 'lay'} ${!lastOdds?.[1] && isMobile || lastOdds?.[1]?.gstatus == '0' && isMobile ? 'suspended' : ''}`} >
                {!isMobile && <td width="10%">
                  <div id="nation1" className="p-title text-center">{ItemNew.RunnerName}</div> <span
                    className="d-block text-center text-danger tx-black" >
                    <CasinoPnl sectionId={ItemNew.SelectionId} matchId={liveMatchData.match_id} />
                  </span>
                </td>}
                <td id="andar-box" className={`text-center p5`}>
                  <div className={`${isMobile && 'horizontal-scorller'}`}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'].map((ItemCardsData: any, keyCardsData: number) => {
                      const clasName = CardSelection.type == ItemNew.RunnerName && CardSelection.cards.indexOf(ItemCardsData) > -1 ? 'selected-card' : '';
                      const cardImage = cardNameValue[ItemCardsData] ? cardNameValue[ItemCardsData] : ItemCardsData
                      return <span className="game-section m-r-5" key={keyCardsData} onClick={() => { setDataCards(ItemCardsData, ItemNew.RunnerName, ItemNew, Item) }}><img src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/andar_bahar/${cardImage}.jpg`} className={`card-image ${clasName}`} /></span>
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
            <tr>
              <td colSpan={2} className="text-right text-info remark">
                {isMobile ? <Marquee speed={60} gradient={false} pauseOnHover={true} loop={0}>
                  {liveMatchData?.remark?.split('|')?.[key] || 'N/A'}
                </Marquee> : (liveMatchData?.remark?.split('|')?.[key] || 'N/A')}

              </td>
            </tr>
          </>
        )
      )
    })
    )
  }
  React.useEffect(() => {
    if (getPlaceBet.status === IApiStatus.Done) {
      const cards = CardSelection;
      cards.cards = [];
      setCardSelect(cards)
    }
  }, [getPlaceBet.status])

  return (
    <div className='container teenpattixyz' style={{ marginTop: isMobile ? "-10px" : '' }}>
      <div className='row  '>
        <div className='col-lg-12 m-b-10 main-market ' style={{ padding: '0px' }}>
          <div className='live-poker'>
            <div className="card-content m-b-5">
              <table data-title="SUSPENDED" className={`table main-table table-bordered `}>
                <tbody>
                  {laybacklayout()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Card3JLayout
