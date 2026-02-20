import Limitinfo from './_common/limitinfo'
import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { betPopup, selectBetPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import CasinoPnl from './casinoPnl'

const Worli = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const [CardSelection, setCardSelect] = useState<any>({ type: 'yes', cards: [] })
  const [activeTab, setActivetab] = useState<any>("Single")
  const rateList: any = { 'Single': '9', 'Pana': 'SP: 140 | DP: 240 | TP: 700', 'SP': "140", 'DP': '140', 'Motor SP': '140', '56 Charts': '140', '64 Charts': '140', 'COMMON SP': '140', 'COMMON DP': '140', 'COLOR DP': '140', 'Trio': '700' }
  const limitList: any = { 'Single': { min: 1, max: 1 }, 'Pana': { min: 1, max: 3 }, 'SP': { min: 1, max: 1 }, 'DP': { min: 1, max: 1 }, 'Motor SP': { min: 4, max: 9 }, '56 Charts': { min: 1, max: 1 }, '64 Charts': { min: 1, max: 1 }, 'COMMON SP': { min: 1, max: 1 }, 'COMMON DP': { min: 1, max: 1 }, 'COLOR DP': { min: 1, max: 1 }, 'Trio': { min: 1, max: 1 }, "Cycle": { min: 1, max: 2 } }
  const betValues: any = useAppSelector(selectBetPopup)
  const [checkRoundIdChange, setCheckRoundIdChange] = useState('')
  const [selectionId, setselectionId] = useState<any>([])

  React.useEffect(() => {
    if (lastOdds && lastOdds['1']) {
      if (lastOdds['1'].mid !== checkRoundIdChange) {
        setCheckRoundIdChange(lastOdds['1'].mid);
        setselectionId([]);
      }
    }
  }, [lastOdds, checkRoundIdChange]);

  React.useEffect(() => {
    if (betValues.isOpen == false) setselectionId([])
  }, [betValues.betData])

  const getName = (selectionIdList: any, type: boolean) => {
    const firstString: any = [];
    selectionIdList.map((ItemCheck: any) => {
      const ItemMarket: any = lastOdds?.[ItemCheck] || {}
      firstString.push(`${ItemMarket?.RunnerName?.split(' ')?.[0]}`);
    })
    return type ? `${firstString.join('')} ${activeTab}` : `${firstString.join('')}`
  }
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = item?.rate || item?.b1;
    const odds = oddVal
    if (userState.user.role === RoleType.user) {
      /// if (parseFloat(odds) <= 0 || item.gstatus === '0') return 
      const activeMarketCondition = limitList?.[activeTab] || { min: 1, max: 1 }
      let selectionIdDataList: any = selectionId;
      if (activeMarketCondition.max <= 1) selectionIdDataList = [];
      if (selectionIdDataList.indexOf(parseInt(item.sid)) <= -1) {
        if (activeMarketCondition.max > selectionIdDataList.length) {
          selectionIdDataList = [...selectionIdDataList, parseInt(item.sid)]
          setselectionId(selectionIdDataList)
        }
      }
      if (selectionIdDataList.length < activeMarketCondition.min) return

      selectionIdDataList.sort((a: any, b: any) => a - b);
      const SelectionNames = getName(selectionIdDataList, true);
      const SelectionNamesStr = getName(selectionIdDataList, false);

      dispatch(
        betPopup({
          isOpen: true,
          betData: {
            isBack,
            odds: parseFloat(odds),
            volume: 100,
            marketId: liveMatchData.match_id,
            marketName: item.MarketName,
            matchId: parseInt(liveMatchData?.match_id) || 0,
            selectionName: SelectionNames,
            selectionId: parseInt(item.sid),
            pnl: 0,
            stack: 0,
            currentMarketOdds: item.rate,
            eventId: liveMatchData.match_id,
            exposure: -0,
            ipAddress: ipAddress,
            type: IBetType.Match,
            matchName: liveMatchData?.title,
            betOn: IBetOn.CASINO,
            gtype: liveMatchData?.slug,
            C1: SelectionNamesStr,
            C2: selectionIdDataList.join(','),
            C3: activeTab
          },
        }),
      )
    }
  }
  const numberLayout = (marketNameSerach: string, marketRemarkSearch = '') => {
    const heightdata = ''
    const marketList: any = marketRemarkSearch == '' ? liveMatchData?.defaultMarkets?.filter((Item: any) => Item.MarketName.includes(marketNameSerach)) : liveMatchData?.defaultMarkets?.filter((Item: any) => Item.remark.includes(`Welcome ${marketNameSerach}`))
    const ItemMarket: any = lastOdds?.[1] || {}
    //  const clsstatus =
    //   !ItemMarket.gstatus || ItemMarket.gstatus=='0' || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    const clsstatus = '';
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th style={{ paddingLeft: "5px", display: "flex", alignItems: "center" }} colSpan={5}>
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                {rateList?.[marketNameSerach]}
              </div>

              <span className='tx-right'><Limitinfo nameString={'lbmarket'} min={100} max={50000} /></span>
            </th>

          </tr>
        </thead>
        <tbody data-title='SUSPENDED' className={`card32btbody ${clsstatus}`}>

          <tr style={{ height: "89px" }} key={4} className={`${heightdata}`}>
            {marketList?.map((ItemN: any, key: number) => {
              const Item = ItemN?.Runners?.[0] || {}
              if (key > 4) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td key={key} className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number">{Item.RunnerName.replace(' Single', '').replace(' Pana', '').replace(' SP', '').replace(' DP', '').replace(' Cycle', '').replace(' Motor', '').replace(' 56 Charts', '').replace(' 64 Charts', '').replace(' COMMON', '').replace(' COLOR', '')}</span>
                <div>
                  <div className="ubook text-danger">
                    <b style={{ color: "#000" }}>
                      <CasinoPnl sectionId={ItemMarket.sid} matchId={liveMatchData?.match_id} />
                    </b>
                  </div>
                </div>
              </td>

            })
            }
            {['SP', 'DP', '56 Charts', '64 Charts', 'COLOR DP'].indexOf(marketNameSerach) > -1 && marketList?.map((ItemM: any, key: number) => {
              const Item = ItemM?.Runners?.[0] || {}
              if (key != 10) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td style={{ width: "33%" }} rowSpan={2} className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number" >{Item.RunnerName.replace('Charts ', '')}</span>

              </td>
            })
            }
          </tr>
          <tr style={{ height: "89px" }} key={3} className={`${heightdata}`}>
            {marketList?.map((ItemN: any, key: number) => {
              const Item = ItemN?.Runners?.[0] || {}
              if (key <= 4 || key > 9) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td key={key} className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number">{Item.RunnerName.replace(' Single', '').replace(' Pana', '').replace(' SP', '').replace(' DP', '').replace(' Cycle', '').replace(' Motor', '').replace(' 56 Charts', '').replace(' 64 Charts', '').replace(' COMMON', '').replace(' COLOR', '')}</span>
                <div>
                  <div className="ubook text-danger">
                    <b style={{ color: "#000" }}>
                      <CasinoPnl sectionId={ItemMarket.sid} matchId={liveMatchData?.match_id} />
                    </b>
                  </div>
                </div>
              </td>

            })
            }

          </tr>
        </tbody>
      </table>
    )
  }
  const numberLayout2 = (marketNameSerach: string) => {
    const marketList: any = liveMatchData?.defaultMarkets?.filter((Item: any) => Item.MarketName.includes(marketNameSerach))
    const ItemMarket: any = lastOdds?.[1] || {}
    const clsstatus =
      !ItemMarket.gstatus || ItemMarket.gstatus == '0' || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th style={{ paddingLeft: "5px", display: "flex", alignItems: "center" }} colSpan={5}>
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                9
              </div>

              <span className='tx-right'><Limitinfo nameString={'lbmarket'} min={100} max={50000} /></span>
            </th>
          </tr>
        </thead>
        <tbody data-title='SUSPENDED' className={`card32btbody ${clsstatus}`}>
          <tr style={{ height: "89px" }} key={0} >
            {marketList?.map((ItemM: any, key: number) => {
              const Item = ItemM?.Runners?.[0] || {}
              if (key != 10 && key != 12) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = rateList?.[marketNameSerach] || 0;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block" style={{ fontSize: "18px" }}>{Item.RunnerName}</span>
                {key == 10 && <p style={{ fontSize: "18px", marginTop: "10px" }}>1|2|3|4|5</p>}
                {key == 12 && <p style={{ fontSize: "18px", marginTop: "10px" }}>1|3|5|7|9</p>}
                <div>
                </div>
              </td>
            })
            }
          </tr>
          <tr style={{ height: "89px" }} key={1}>
            {marketList?.map((ItemM: any, key: number) => {
              const Item = ItemM?.Runners?.[0] || {}
              if (key != 11 && key != 13) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block" style={{ fontSize: "18px" }}>{Item.RunnerName}</span>
                {key == 11 && <p style={{ fontSize: "18px", marginTop: "10px" }}>6|7|8|9|0</p>}
                {key == 13 && <p style={{ fontSize: "18px", marginTop: "10px" }}>2|4|6|8|0</p>}
                <div>
                </div>
              </td>
            })
            }

          </tr>
        </tbody>
      </table>
    )
  }

  const trioLayout = (marketNameSerach: string, marketRemarkSearch = '') => {
    const heightdata = ''
    const marketList: any = marketRemarkSearch == '' ? liveMatchData?.defaultMarkets?.filter((Item: any) => Item.MarketName.includes(marketNameSerach)) : liveMatchData?.defaultMarkets?.filter((Item: any) => Item.remark.includes(`Welcome ${marketNameSerach}`))
    const ItemMarket: any = lastOdds?.[1] || {}
    const clsstatus =
      !ItemMarket.gstatus || ItemMarket.gstatus == '0' || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th style={{ paddingLeft: "5px", display: "flex", alignItems: "center" }} colSpan={5}>
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                {rateList?.[marketNameSerach]}
              </div>
            </th>
          </tr>
        </thead>
        <tbody data-title='SUSPENDED' className={`card32btbody ${clsstatus}`}>

          <tr style={{ height: "89px" }} key={4} className={`${heightdata}`}>
            {marketList?.map((ItemN: any, key: number) => {
              const Item = ItemN?.Runners?.[0] || {}
              if (key > 4) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = rateList?.[marketNameSerach] || 0;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td key={key} className="text-center bet-action back" onClick={() => onBet(true, ItemMarket)}>
                <button className="btn btn-primary text-uppercase custom-trio">All Trio</button>
                <div>
                  <div className="ubook text-danger">
                    <b style={{ color: "#000" }}>
                      <CasinoPnl sectionId={ItemMarket.sid} matchId={liveMatchData?.match_id} />
                    </b>
                  </div>
                </div>
              </td>

            })
            }
          </tr>

        </tbody>
      </table>
    )
  }
  const numberLayoutABR = (marketNameSerach: string, marketRemarkSearch = '') => {
    const heightdata = ''
    const marketList: any = marketRemarkSearch == '' ? liveMatchData?.defaultMarkets?.filter((Item: any) => Item.MarketName.includes(marketNameSerach)) : liveMatchData?.defaultMarkets?.filter((Item: any) => Item.remark.includes(`Welcome ${marketNameSerach}`))
    const ItemMarket: any = lastOdds?.[1] || {}
    const clsstatus =
      !ItemMarket.gstatus || ItemMarket.gstatus == '0' || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th style={{ paddingLeft: "5px", display: "flex", alignItems: "center" }} colSpan={5}>
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                {rateList?.[marketNameSerach]}
              </div>

              <span className='tx-right'><Limitinfo nameString={'lbmarket'} min={100} max={50000} /></span>
            </th>
          </tr>
        </thead>
        <tbody data-title='SUSPENDED' className={`card32btbody ${clsstatus}`}>

          <tr style={{ height: "89px" }} key={4} className={`${heightdata}`}>
            {[1, 2, 3]?.map((ItemIndex: any, key: number) => {
              const ItemN = marketList?.[ItemIndex] || {}
              const Item = ItemN?.Runners?.[0] || {}
              if (key > 4) return;
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = rateList?.[marketNameSerach] || 0;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td key={key} className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number">{Item.RunnerName.replace(' Single', '').replace(' Pana', '').replace(' SP', '').replace(' DP', '').replace(' Cycle', '').replace(' Motor', '').replace(' 56 Charts', '').replace(' 64 Charts', '').replace(' COMMON', '').replace(' COLOR', '')}</span>
                <div>
                  <div className="ubook text-danger">
                    <b style={{ color: "#000" }}>
                      <CasinoPnl sectionId={ItemMarket.sid} matchId={liveMatchData?.match_id} />
                    </b>
                  </div>
                </div>
              </td>

            })
            }
            {[6]?.map((ItemMIndex: any, key: number) => {
              const ItemM = marketList?.[ItemMIndex] || {}
              const Item = ItemM?.Runners?.[0] || {}
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = rateList?.[marketNameSerach] || 0;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td style={{ width: "33%" }} className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number" >{Item.RunnerName.replace('Charts ', '')}</span>

              </td>
            })
            }
          </tr>
          <tr style={{ height: "89px" }} key={3} className={`${heightdata}`}>
            {[3, 4, 5, 7]?.map((ItemNIndex: any, key: number) => {
              const ItemN = marketList?.[ItemNIndex] || {}
              const Item = ItemN?.Runners?.[0] || {}
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = rateList?.[marketNameSerach] || 0;
              ItemMarket['RunnerName'] = Item.RunnerName;
              return <td key={key} className={`text-center bet-action back ${selectionId.indexOf(parseInt(Item.SelectionId)) > -1 ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number">{Item.RunnerName.replace(' Single', '').replace(' Pana', '').replace(' SP', '').replace(' DP', '').replace(' Cycle', '').replace(' Motor', '').replace(' 56 Charts', '').replace(' 64 Charts', '').replace(' COMMON', '').replace(' COLOR', '')}</span>
                <div>
                  <div className="ubook text-danger">
                    <b style={{ color: "#000" }}>
                      <CasinoPnl sectionId={ItemMarket.sid} matchId={liveMatchData?.match_id} />
                    </b>
                  </div>
                </div>
              </td>

            })
            }

          </tr>
        </tbody>
      </table>
    )
  }
  return (
    <div className='container '>
      <div className='row casino-32A '>
        <div className='col-lg-12 m-b-10 main-market' style={{ padding: '0px' }}>
          <ul className="nav nav-tabs m-b-5 ">
            {['Single', 'Pana', 'SP', 'DP', 'Trio', 'Cycle', 'Motor SP', '56 Charts', '64 Charts', 'ABR', 'COMMON SP', 'COMMON DP', 'COLOR DP'].map((Item: any, key: number) => {
              return <li key={key} className="nav-item" style={{ display: "inline-grid" }}>
                <a data-toggle="tab" href={`#${Item}`} onClick={() => {
                  setActivetab(Item);
                  setselectionId([]);
                }}
                  className={`nav-link ${activeTab == Item ? 'active' : ''}`}>{Item}</a>
              </li>
            })}
          </ul>
        </div>
        {activeTab == 'Single' && <>
          <div className='col-lg-8 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('Single')}</div>
          </div>
          <div className='col-lg-4 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout2('Single')}</div>
          </div>
        </>
        }
        {activeTab == 'Pana' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('Pana')}</div>
          </div>
        </>
        }
        {activeTab == 'SP' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('SP', 'SP')}</div>
          </div>
        </>
        }
        {activeTab == 'DP' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('DP', 'DP')}</div>
          </div>
        </>
        }
        {activeTab == 'Cycle' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('Cycle')}</div>
          </div>
        </>
        }
        {activeTab == 'Motor SP' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('Motor SP')}</div>
          </div>
        </>
        }
        {activeTab == '56 Charts' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('56 Charts')}</div>
          </div>
        </>
        }
        {activeTab == '64 Charts' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('64 Charts')}</div>
          </div>
        </>
        }
        {activeTab == 'COMMON SP' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('COMMON SP')}</div>
          </div>
        </>
        }
        {activeTab == 'COMMON DP' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('COMMON DP')}</div>
          </div>
        </>
        }
        {activeTab == 'COLOR DP' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayout('COLOR DP')}</div>
          </div>
        </>
        }
        {activeTab == 'Trio' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{trioLayout('Trio')}</div>
          </div>
        </>
        }
        {activeTab == 'ABR' && <>
          <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{numberLayoutABR('ABR', 'ABR')}</div>
          </div>
        </>
        }
      </div>
    </div>
  )
}
export default React.memo(Worli)
