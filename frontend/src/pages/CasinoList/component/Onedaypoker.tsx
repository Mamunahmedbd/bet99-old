import CasinoPnl from './casinoPnl'
import Limitinfo from './_common/limitinfo'
import LayBackButton from './_common/new/LayBackButton'
import BackButtonPnl from './_common/new/BackButtonPnl'
import { isMobile } from 'react-device-detect'

const Onedaypoker = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const laybacklayout = (indexMarket: any) => {
    const clsnamehead = isMobile?'box-4':'box-6'
    const clsnamename = isMobile?'box-3':'box-2'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{paddingLeft:"5px"}}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>
            <th className={`back ${clsnamename}`}>BACK</th>
            <th className={`lay-color ${clsnamename}`}>LAY</th>
          </tr>
        </thead>
        <tbody>
          {liveMatchData?.defaultMarkets?.[indexMarket]?.Runners?.map((Item: any, key: number) => {
            const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
            const clsstatus =
            !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
            return (
              (
                <tr key={key} data-title='SUSPENDED' className={`${isMobile?'sus60perce':''} ${clsstatus} ${heightdata}`}>
                  <td className={clsnamehead} style={{ paddingLeft: "5px" }}>
                    <b>{Item.RunnerName}</b>
                    <CasinoPnl sectionId={Item.SelectionId} matchId={liveMatchData?.match_id} />
                  </td>
                  <LayBackButton selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} />
                </tr>
              )
            )
          })}
        </tbody>
      </table>
    )
  }
  const onlybacklayout = (keyLimit: any) => {
    const clsnamehead = 'box-4'
    const clsnamename = 'box-3'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{paddingLeft:"5px"}}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>
            <th className={`back ${clsnamename}`}>BACK</th>
            <th className={`back ${clsnamename}`}>BACK</th>
          </tr>
        </thead>
        <tbody>
          {
            [[1, 3], [2, 4]].map((Item: any, index: number) => {
              const market = index==0?lastOdds?.[3]:lastOdds?.[5];
              const clsstatus = !market?.gstatus || market?.gstatus=='SUSPENDED' || market?.gstatus=='CLOSED' ? 'suspended':'';
              return <tr style={{ minHeight: "55px" }} key={index} data-title='SUSPENDED' className={`sus60perce ${clsstatus} ${heightdata}`}>
                <td className={clsnamehead} style={{ paddingLeft: "5px" }}>
                  <b>{index == 0 ? `Player A` : `Player B`}</b>
                </td>
                {
                  Item.map((MarketIndex: any, KeyIndex: number) => {
                    const market = liveMatchData?.defaultMarkets?.[MarketIndex]?.Runners?.[0] || {}
                    return <BackButtonPnl key={KeyIndex} selectionid={market.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} needSuspend={false} titleStatus={true}/>
                  })
                }
              </tr>
            })
          }
        </tbody>
      </table>
    )
  }
  return (
    <div className='container '>
      <div className='row casino-32A '>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{laybacklayout(0)}</div>
        </div>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          {isMobile? <div className="card-header" style={{background:"#0f2462", color:"#fff"}}>
        <h6 className="card-title d-inline-block" style={{color:"#fff"}}>
            Bonus Bet
        </h6>
    </div>:''}
          <div className='live-poker'>{onlybacklayout(4)}</div>
        </div>
      </div>
    </div>
  )
}
export default Onedaypoker
