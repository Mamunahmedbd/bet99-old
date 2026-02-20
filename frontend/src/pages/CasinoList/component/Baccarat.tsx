import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Chart } from 'react-google-charts'
import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { betPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import Minmax from './_common/minmax'
import CasinoPnl from './casinoPnl'
const data = [
  ['Task', 'Hours per Day'],
  ['Banker', 52],
  ['Player', 39],
  ['Tie', 9],
]
const options = {
  title: 'Statistics',
  colors: ['#ae2130', '#086cb8', '#279532', '#f3b49f', '#f6c7b6'],
  background: '#00000000',
  is3D: true,
  backgroundColor: 'none',
  titleTextStyle: {
    fontSize: 16, // 12, 18 whatever you want (don't specify px)
    bold: true, // true or false
    italic: true, // true of false
  },
  chartArea: {
    left: 5,
    top: 20,
    width: '100%',
    height: '250',
  },
}
const Baccarat = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const [chartclass, setchatclass] = useState(isMobile ? 'hidemob' : '')
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    if (userState.user.role === RoleType.user) {
        const oddsVal = parseFloat(isBack ? item.b1 : item.l1);
        if (oddsVal <= 0) return
        if (!item.gstatus || item.gstatus == '0' || item.gstatus == 'SUSPENDED') return
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
  const layouttop = () => {
    return [5, 6, 7, 8, 9].map((Item: any, index: number) => {
      const odds = liveMatchData?.defaultMarkets?.[Item] || {}
      if (!odds.Runners) return
      const market = odds && odds.Runners ? odds.Runners[0] : {}
      const ItemMarket: any = lastOdds?.[market.SelectionId] || {}
      const statusclass = !ItemMarket.gstatus || ItemMarket.gstatus == '0' || ItemMarket.gstatus == 'SUSPENDED' ? 'suspended' : ''
      let classgrid = liveMatchData.slug == 'baccarat' ? 'col-3' : 'col-20'
      classgrid = liveMatchData.slug == 'baccarat' && isMobile ? 'col-25' : classgrid
      classgrid = liveMatchData.slug == 'baccarat2' && isMobile ? 'col-20' : classgrid

      return odds ? (
        <div className={classgrid} key={index} onClick={() => onBet(true, ItemMarket)}>
          <div className={`bet-odds ${statusclass}`}>
            {market.RunnerName} <br /> {ItemMarket.b1}:1
          </div>
          <div className='book' style={{ color: 'black' }}>
            <CasinoPnl sectionId={market.SelectionId} matchId={liveMatchData.match_id} />
          </div>
        </div>
      ) : (
        ''
      )
    })
  }
  const displayCard = (classn: any, cardIndex: any) => {
    const lastCard = lastOdds?.[`cards`]
    return <div className={`player-card ${classn}`} style={{display:"flex"}}>
      {cardIndex.map((Item: any, index: number) => {
              const clsbacrrat2 = Item == 5 ? 'rrotate' : ((Item == 6) ?'rrotate' : '')
        return <img key={index}
          src={`https://dzm0kbaskt4pv.cloudfront.net/v11/static/front/img/cards/${lastCard?.[`C${Item}`] || 1}.png`}
          className={`${clsbacrrat2} mr--1`}
          style={{marginRight:"5px"}}
        />
      })}
    </div>
  }
  const mainmarket = () => {
    const marketIndex = [0, 2, 1];
    const slug = liveMatchData.slug
    return marketIndex.map((marketIndexItem: any, key: number) => {
      const Item = liveMatchData?.defaultMarkets?.[marketIndexItem]?.Runners?.[0] || {}
      const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
      const statusclassm = !ItemMarket.gstatus || ItemMarket.gstatus == '0' || ItemMarket.gstatus == 'SUSPENDED' ? 'suspended' : ''
      const classn = key == 0 ? 'reverse-div' : ''
      return <div key={key} className={Item.RunnerName} onClick={() => onBet(true, ItemMarket)}>
        <div className={statusclassm}>
          <b className='text-uppercase'>{Item.RunnerName}</b>
          <span className='d-block'>{Math.round(ItemMarket.b1)}:1</span>
          {Item?.RunnerName == 'Player' && displayCard(classn, [5, 3, 1])}
          {Item?.RunnerName == 'Banker' && displayCard(classn, [2, 4, 6])}
        </div>
        <div className='book' style={{ color: 'black' }}>
          <CasinoPnl sectionId={Item.SelectionId} matchId={liveMatchData.match_id} />
        </div>
      </div>

    })
  }

  const updatechartclass = () => {
    if (chartclass == '') {
      setchatclass('hidemob');
    } else {
      setchatclass('');
    }
  }
  const cornermarket = (marketIndex: any, key: number) => {
    const market = liveMatchData?.defaultMarkets?.[marketIndex]?.Runners?.[0] || {}
    const ItemMarket: any = lastOdds?.[market.SelectionId] || {}
    const clsdesign = market.RunnerName == 'Player Pair' ? 'player-pair' : 'banker-pair'
    const statusclassm = !ItemMarket.gstatus || ItemMarket.gstatus == '0' || ItemMarket.gstatus == 'SUSPENDED' ? 'suspended' : ''
    return (
      <div className={clsdesign} key={key} onClick={() => onBet(true, ItemMarket)}>
        <div className={statusclassm}>
          {market.RunnerName}
          <br />
          {Math.round(ItemMarket.b1)}:1
        </div>
        <div className='book' style={{ color: 'black' }}>
          <CasinoPnl sectionId={market.SelectionId} matchId={liveMatchData.match_id} />
        </div>
      </div>
    )
  }
  const lastresultdata = () => {
    const data = []
    data.push(['Task', 'Hours per Day'])
    const lastResult = liveMatchData?.results || []
    const filterbanker = lastResult.filter((Item: any) => Item.result == '2')
    const filterPlayer = lastResult.filter((Item: any) => Item.result == '1')
    const filterTie = lastResult.filter((Item: any) => Item.result == '3')
    data.push(['Banker', Math.round((filterbanker.length / 10) * 100)])
    data.push(['Player', Math.round((filterPlayer.length / 10) * 100)])
    data.push(['Tie', Math.round((filterTie.length / 10) * 100)])
    return data
  }
  return (<>
    {isMobile ? (
      <div className='row row6 p10 bg-theme mt--50'>
        <div className='col-12 statistics-title' onClick={() => updatechartclass()}>
          Statistics{' '}
          {chartclass != '' ? (
            <i className='fas ml-2 fa-angle-right'></i>
          ) : (
            <i className='fas ml-2 fa-angle-down'></i>
          )}
          <span className='ml-2 '>Click here for open statistics</span>
        </div>
        <div className='col-12 mt-1'></div>
      </div>
    ) : (
      ''
    )}
    {lastOdds && <div className='baccarat bg-gray mb-10 '>
      <div className='p15'>
        <div className='row'>
          <div className={`col-lg-3 col-12 ${chartclass}`}>
            <Chart chartType='PieChart' data={lastresultdata()} options={options} width={'100%'} />
          </div>
          <div className='col-lg-9 col-12'>
            <div className='row row6'>{layouttop()}</div>
            <div className='bet-container mt-1'>
              {cornermarket(3, 1)}
              {mainmarket()}
              {cornermarket(4, 2)}
            </div>
            <div className='row row6'>
              <Minmax min={liveMatchData?.event_data?.min} max={liveMatchData?.event_data?.max} />
            </div>
          </div>
        </div>
      </div>
    </div>}
  </>
  )
}
export default Baccarat
