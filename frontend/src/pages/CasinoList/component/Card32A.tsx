import CasinoPnl from './casinoPnl'
import Limitinfo from './_common/limitinfo'
import LayBackButton from './_common/new/LayBackButton'

const Card32A = (props: any) => {
  const { lastOdds, liveMatchData } = props

  const laybacklayout = (keyLimit: any, fromlimit: any) => {
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{borderBottom:"0px"}}>
          <tr>
            <th className={clsnamehead} style={{paddingLeft:"5px"}}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>
            <th className={`back ${clsnamename}`}>BACK</th>
            <th className={`lay-color ${clsnamename}`}>LAY</th>
          </tr>
        </thead>
        <tbody>
          {liveMatchData?.defaultMarkets?.[0]?.Runners?.map((Item: any, key: number) => {
             const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
            const clsstatus =
            !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
            return (
              key < keyLimit && key>=fromlimit && (
                <tr key={key} data-title='SUSPENDED' className={`${clsstatus} ${heightdata}`}>
                  <td className={clsnamehead} style={{paddingLeft:"5px"}}>
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
  return (
    <div className='container '>
      <div className='row casino-32A '>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{laybacklayout(2, 0)}</div>
        </div>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{laybacklayout(4, 2)}</div>
        </div>
      </div>
    </div>
  )
}
export default Card32A
