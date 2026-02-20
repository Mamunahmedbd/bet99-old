import authService from '../../../services/auth.service';
import { RoleType } from '../../../models/User';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { selectUserData } from '../../../redux/actions/login/loginSlice';
import { selectCasinoCurrentMatch } from '../../../redux/actions/casino/casinoSlice';
import { betPopup } from '../../../redux/actions/bet/betSlice';
import { IBetOn, IBetType } from '../../../models/IBet';
import { useState } from 'react';
import CasinoPnl from './casinoPnl';
import { isMobile } from 'react-device-detect';
import CardItem from './_common/new/CardItem';

const AndarBhar2 = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = useAppSelector(selectCasinoCurrentMatch)
  const [CardSelection, setCardSelect] = useState<any>({ type: 'yes', cards: [] })
  const cardNameValue: any = { 'J': 11, 'Q': 12, 'K': 13 }

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
    const oddVal = item?.rate || item?.b1;
    const odds = oddVal
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === '0') return
      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: item.mid,
            marketName: item.MarketName,
            matchId: liveMatchData?.event_data?.match_id || 0,
            selectionName: `${item.nat} ${CardSelection.cards.join('')}`,
            selectionId: item.sid,
            pnl: 0,
            stack: 0,
            currentMarketOdds: item.rate,
            eventId: item.mid,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData?.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData?.slug
          },
        }),
      )
    }
  }
  const ablayout = (index: number) => {
    const saRunner = liveMatchData?.defaultMarkets?.[0]?.Runners?.[0] || {}
    const saMarkets = lastOdds?.[saRunner.SelectionId] || {}
    const firstBetRunner = liveMatchData?.defaultMarkets?.[2]?.Runners?.[0] || {}
    const firstBetMarkets = lastOdds?.[firstBetRunner.SelectionId] || {}
    const secondBetRunner = liveMatchData?.defaultMarkets?.[3]?.Runners?.[0] || {}
    const secondBetMarkets = lastOdds?.[secondBetRunner.SelectionId] || {}

    const sbRunner = liveMatchData?.defaultMarkets?.[1]?.Runners?.[0] || {}
    const sbMarkets = lastOdds?.[sbRunner.SelectionId] || {}
    const firstBetRunnerB = liveMatchData?.defaultMarkets?.[2]?.Runners?.[1] || {}
    const firstBetMarketsB = lastOdds?.[firstBetRunnerB.SelectionId] || {}
    const secondBetRunnerB = liveMatchData?.defaultMarkets?.[3]?.Runners?.[1] || {}
    const secondBetMarketsB = lastOdds?.[secondBetRunnerB.SelectionId] || {}
    return (
      <>
        <div className="row row5">
          <div className='col-12 col-lg-6'>
            <div className="bet-a" style={{ width: "100%" }}>
              <div className="a-title">A</div>
              <div className="sa">
                <div className={!saMarkets?.gstatus || saMarkets?.gstatus == '0' ? 'suspended' : ''} onClick={() => onBet(true, saMarkets)}>
                  <div >SA</div>
                  <div className="mt-1">{saMarkets?.b1 || '0.00'}</div>
                </div>
                <div className="book text-center" >
                  <CasinoPnl sectionId={saRunner.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
                </div>
              </div>
              <div className="first-bet">
                <div className={!firstBetMarkets?.gstatus || firstBetMarkets?.gstatus == '0' ? 'suspended' : ''} onClick={() => onBet(true, firstBetMarkets)}>
                  <div >1st Bet</div>
                  <div className="mt-1">{firstBetMarkets?.b1 || '0.00'}</div>
                </div>
                <div className="book text-center" >
                  <CasinoPnl sectionId={firstBetRunner.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
                </div>
              </div>
              <div className="second-bet">
                <div className={!secondBetMarkets?.gstatus || secondBetMarkets?.gstatus == '0' ? 'suspended' : ''} onClick={() => onBet(true, secondBetMarkets)}>
                  <div >2nd Bet</div>
                  <div className="mt-1">{secondBetMarkets?.b1 || '0.00'}</div>
                </div>
                <div className="book text-center" >
                  <CasinoPnl sectionId={secondBetRunner.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
                </div>
              </div>
              <div className="a-title">A</div>
            </div>
          </div>
          <div className='col-12 col-lg-6'>
            <div className="bet-a" style={{ width: "100%" }}>
              <div className="a-title">B</div>
              <div className="sa">
                <div className={!sbMarkets?.gstatus || sbMarkets?.gstatus == '0' ? 'suspended' : ''} onClick={() => onBet(true, sbMarkets)}>
                  <div >SB</div>
                  <div className="mt-1">{sbMarkets?.b1 || '0.00'}</div>
                </div>
                <div className="book text-center" >
                  <CasinoPnl sectionId={sbRunner.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
                </div>
              </div>
              <div className="first-bet">
                <div className={!firstBetMarketsB?.gstatus || firstBetMarketsB?.gstatus == '0' ? 'suspended' : ''} onClick={() => onBet(true, firstBetMarketsB)}>
                  <div >1st Bet</div>
                  <div className="mt-1">{firstBetMarketsB?.b1 || '0.00'}</div>
                </div>
                <div className="book text-center" >
                  <CasinoPnl sectionId={firstBetRunnerB.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
                </div>
              </div>
              <div className="second-bet">
                <div className={!secondBetMarketsB?.gstatus || secondBetMarketsB?.gstatus == '0' ? 'suspended' : ''} onClick={() => onBet(true, secondBetMarketsB)}>
                  <div >2nd Bet</div>
                  <div className="mt-1">{secondBetMarketsB?.b1 || '0.00'}</div>
                </div>
                <div className="book text-center" >
                  <CasinoPnl sectionId={secondBetRunnerB.SelectionId} matchId={liveMatchData?.match_id} classData={'text-center'} />
                </div>
              </div>
              <div className="a-title">B</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const layout4 = () => {
    const market = liveMatchData?.defaultMarkets?.[6]?.Runners || []
    return <div className="card-content lucky-seven-content m-b-10 col-12">
      <div className="row m-t-10">
        <div className="col-12 text-center  m-b-10"><b >12.00</b></div>
        <div className="col-12 text-center card-seven">
          {market &&
            market.map((ItemN: any, indexRunner: number) => {
              return <div className="d-inline-block mrc-5" key={indexRunner}>
                <CardItem selectionid={ItemN.SelectionId} title={`Card ${ItemN.RunnerName}`} lastOdds={lastOdds} liveMatchData={liveMatchData} />
                <div >
                  <CasinoPnl matchId={liveMatchData.match_id} sectionId={ItemN.SelectionId} />
                </div>
              </div>
            })
          }
        </div>
      </div>
    </div>
  }
  const layout6 = (index: number, clsName: string) => {
    const market = liveMatchData?.defaultMarkets?.[index]?.Runners || []
    return <div className="card-content lucky-seven-content m-b-10 col-12">
      <div className="row m-t-10">

        {market &&
          market.map((ItemN: any, indexRunner: number) => {
            const ItemMarket: any = lastOdds?.[ItemN.SelectionId] || {}
            const suspend = !ItemMarket.gstatus || ItemMarket.gstatus == 0 || ItemMarket.gstatus == "SUSPENDED" ? 'suspended' : '';
            let title = ItemN.RunnerName == 'Spade' ? <img src="/imgs/casino/spade.png" /> : ItemN.RunnerName;
            title = title == 'Club' ? <img src="/imgs/casino/club.png" /> : title;
            title = title == 'Heart' ? <img src="/imgs/casino/heart.png" /> : title;
            title = title == 'Diamond' ? <img src="/imgs/casino/diamond.png" /> : title;
            return <div className={`${clsName} text-center`} key={indexRunner}>
              <div className="bltitle"><b >{title}</b></div>
              <div className={`back mt-1 blbox ${suspend}`} onClick={() => onBet(true, ItemMarket)}><span className="odd">{ItemMarket?.b1 || 0}</span></div>
              <div className="mt-1">  <CasinoPnl matchId={liveMatchData.match_id} sectionId={ItemN.SelectionId} /></div>
            </div>
          })
        }
      </div>
    </div>
  }

  return (
    <div className='container teenpattixyz' style={{ marginTop: isMobile ? "-10px" : '' }}>
      <div className='row  '>
        <div className='col-lg-12 m-b-10 main-market ' style={{ padding: '0px' }}>
          <div className="card-content lucky-seven-content m-b-10 ">
            {ablayout(0)}
          </div>
          <div className='row '>
            <div className='col-lg-6'>
              {layout6(4, 'col-6')}
            </div>
            <div className='col-lg-6'>
              {layout6(5, 'col-3')}
            </div>
          </div>
          {layout4()}
        </div>
      </div>
    </div>
  )
}
export default AndarBhar2
