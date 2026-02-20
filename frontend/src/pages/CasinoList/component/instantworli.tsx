import Limitinfo from './_common/limitinfo'
import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import authService from '../../../services/auth.service'
import { RoleType } from '../../../models/User'
import { betPopup, selectBetPopup } from '../../../redux/actions/bet/betSlice'
import { IBetOn, IBetType } from '../../../models/IBet'
import CasinoPnl from './casinoPnl'
import { isMobile } from 'react-device-detect'

const Instantworli = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const [selectionId, setselectionId] = useState<any>("")
  const [checkRoundIdChange, setCheckRoundIdChange] = useState('')
  const betValues: any = useAppSelector(selectBetPopup)

  React.useEffect(() => {
    if (lastOdds && lastOdds['1']) {
      if (lastOdds['1'].mid !== checkRoundIdChange) {
        setCheckRoundIdChange(lastOdds['1'].mid);  // Update the round ID
        setselectionId("");  // Clear the selection ID
      }
    }
  }, [lastOdds, checkRoundIdChange]);
  React.useEffect(() => {
    if (betValues.isOpen == false) setselectionId("")
  }, [betValues.betData])
  const onBet = (isBack = false, item: any) => {
    const ipAddress = authService.getIpAddress()
    const oddVal = item?.rate || item?.b1;
    const odds = oddVal
    if (userState.user.role === RoleType.user) {
      if (parseFloat(odds) <= 0 || item.gstatus === '0') return
      setselectionId(item.sid)
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
            selectionName: item.RunnerName,
            selectionId: item.sid,
            pnl: 0,
            stack: 0,
            currentMarketOdds: item.rate,
            eventId: liveMatchData.match_id,
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

  const numberLayoutDesk = () => {
    const heightdata = ''
    const ItemMarket: any = lastOdds?.[1] || {}
    const clsstatus =
      !ItemMarket.gstatus || ItemMarket.gstatus === '0' || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th style={{ paddingLeft: "5px", width: "60%" }} >
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                9
              </div>
            </th>
            <th style={{ paddingLeft: "5px", width: "40%" }}>
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                9
              </div>

            </th>

          </tr>
        </thead>
        <tbody data-title='SUSPENDED' className={`card32btbody ${clsstatus}`}>
          <tr>
            <td style={{ width: "60%" }}>
              <table className='table coupon-table table table-bordered'>
                <tbody data-title='SUSPENDED' className={`card32btbody`}>
                  <tr style={{ height: isMobile ? "69px" : "89px" }} key={2} className={`${heightdata}`}>
                    {[0, 1, 2, 3, 4].map((indexMarket: any, key: number) => {
                      const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
                      const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
                      ItemMarket['rate'] = 9;
                      return <td key={key} className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                        <span className="d-block card-number">{Item?.RunnerName?.replace(' Single', '')}</span>
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
                  <tr style={{ height: isMobile ? "69px" : "89px" }} key={3} className={`${heightdata}`}>
                    {[5, 6, 7, 8, 9].map((indexMarket: any, key: number) => {
                      const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
                      const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
                      ItemMarket['rate'] = 9;
                      return <td key={key} className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                        <span className="d-block card-number">{Item?.RunnerName?.replace(' Single', '')}</span>
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
            </td>
            <td style={{ width: "40%" }}>
              <table className='table coupon-table table table-bordered'>
                <tbody data-title='SUSPENDED' className={`card32btbody`}>
                  <tr style={{ height: isMobile ? "59px" : "89px" }} key={0} className={`${heightdata}`}>
                    {[10, 12].map((indexMarket: any, key: number) => {
                      const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
                      const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
                      ItemMarket['rate'] = 9;
                      return <td className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                        <span className="d-block" style={{ fontSize: "18px" }}>{Item?.RunnerName}</span>
                        {indexMarket == 10 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>1|2|3|4|5</p>}
                        {indexMarket == 12 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>1|3|5|7|9</p>}
                        <div>
                        </div>
                      </td>
                    })
                    }
                  </tr>
                  <tr style={{ height: isMobile ? "59px" : "89px" }} key={1} className={`${heightdata}`}>
                    {[11, 13].map((indexMarket: any, key: number) => {
                      const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
                      const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
                      ItemMarket['rate'] = 9;
                      return <td className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                        <span className="d-block" style={{ fontSize: "18px" }}>{Item?.RunnerName}</span>
                        {indexMarket == 11 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>6|7|8|9|0</p>}
                        {indexMarket == 13 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>2|4|6|8|0</p>}
                        <div>
                        </div>
                      </td>
                    })
                    }

                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
  const numberLayout = () => {
    const heightdata = ''
    const ItemMarket: any = lastOdds?.[1] || {}
    const clsstatus =
      !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
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

          <tr style={{ height: isMobile ? "69px" : "89px" }} key={2} className={`${heightdata}`}>
            {[0, 1, 2, 3, 4].map((indexMarket: any, key: number) => {
              const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              return <td key={key} className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number">{Item?.RunnerName?.replace(' Single', '')}</span>
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
          <tr style={{ height: isMobile ? "69px" : "89px" }} key={3} className={`${heightdata}`}>
            {[5, 6, 7, 8, 9].map((indexMarket: any, key: number) => {
              const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              return <td key={key} className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block card-number">{Item?.RunnerName?.replace(' Single', '')}</span>
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
  const numberLayout2 = () => {
    const heightdata = ''
    const ItemMarket: any = lastOdds?.[1] || {}
    const clsstatus =
      !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
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
          <tr style={{ height: isMobile ? "59px" : "89px" }} key={0} className={`${heightdata}`}>
            {[10, 12].map((indexMarket: any, key: number) => {
              const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              return <td className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block" style={{ fontSize: "18px" }}>{Item?.RunnerName}</span>
                {indexMarket == 10 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>1|2|3|4|5</p>}
                {indexMarket == 12 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>1|3|5|7|9</p>}
                <div>
                </div>
              </td>
            })
            }
          </tr>
          <tr style={{ height: isMobile ? "59px" : "89px" }} key={1} className={`${heightdata}`}>
            {[11, 13].map((indexMarket: any, key: number) => {
              const Item: any = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.[0] || {}
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              ItemMarket['rate'] = 9;
              return <td className={`text-center bet-action back ${selectionId == Item.SelectionId ? 'bg-green' : ''}`} key={Item.SelectionId} onClick={() => onBet(true, ItemMarket)}>
                <span className="d-block" style={{ fontSize: "18px" }}>{Item?.RunnerName}</span>
                {indexMarket == 11 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>6|7|8|9|0</p>}
                {indexMarket == 13 && <p style={{ fontSize: "18px", marginTop: isMobile ? "5px" : "10px" }}>2|4|6|8|0</p>}
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
  return (
    <div className='container '>
      {isMobile && <div className='row casino-32A '>
        <div className='col-lg-8 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{numberLayout()}</div>
        </div>
        <div className='col-lg-4 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{numberLayout2()}</div>
        </div>
      </div>}
      {!isMobile && <div className='row casino-32A '>
        <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{numberLayoutDesk()}</div>
        </div>
      </div>
      }
    </div>
  )
}
export default React.memo(Instantworli)
