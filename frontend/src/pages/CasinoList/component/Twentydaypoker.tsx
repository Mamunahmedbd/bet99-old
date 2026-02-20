import { isMobile } from 'react-device-detect'
import Limitinfo from './_common/limitinfo'
import BackButtonPnl from './_common/new/BackButtonPnl'

const Twentydaypoker = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const setItem = (ItemData: any, clsnamename: any) => {
    return ItemData.Runners.map((Item: any, key: number) => {
      return (
        <BackButtonPnl key={key} selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={'back twentypoker teen-section'} needSuspend={false}/>
      )
    })
  }
  const laybacklayout = (keyLimit: any, kettolimit: any) => {
    const fancydata = liveMatchData?.defaultMarkets || []
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    const marketExist: any = [];
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{ paddingLeft: "10px" }}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>
            <th className={`back ${clsnamename}`}>Player A</th>
            <th className={`back ${clsnamename}`}>Player B</th>
          </tr>
        </thead>
        <tbody>
          {fancydata && fancydata.map((ItemData: any, KeyData: number) => {
            let name = ItemData.MarketName.replace('A', '')
            name = name.replace('B', '')
            const indexNew = marketExist.indexOf(name);
            marketExist.push(name)
            const ItemMarket: any = lastOdds?.[ItemData?.Runners?.[0]?.SelectionId || 0] || {}
            const clsstatus = !ItemMarket.gstatus || ItemMarket.gstatus === '0' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
            return indexNew <= -1 && KeyData <= kettolimit && KeyData >= keyLimit ? <tr key={KeyData} data-title='SUSPENDED' className={`${clsstatus} ${heightdata}`}>
              <td className={clsnamehead} style={{ paddingLeft: "10px" }}>
                <b>{name}</b>
              </td>
              {setItem(ItemData, clsnamename)}
              {KeyData >= 0 && setItem(fancydata[KeyData + 1], clsnamename)}
            </tr> : ""
          })
          }
        </tbody>
      </table>
    )
  }
  return (
    <div className='container '>
      <div className='row casino-32A mt--30'>
        <div className='col-lg-6 m-b-10 col-12 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{isMobile ? laybacklayout(-1, 17) : laybacklayout(-1, 9)}</div>
        </div>
        {!isMobile ?
          <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
            <div className='live-poker'>{laybacklayout(10, 17)}</div>
          </div> : ""}
      </div>
    </div>
  )
}
export default Twentydaypoker
