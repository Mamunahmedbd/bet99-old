import React from 'react'
import betService from '../../../services/bet.service'
import { AxiosResponse } from 'axios'
import mobileSubheader from '../_layout/elements/mobile-subheader'

const AdminDashboard = () => {
  const [marketdata, setmarketData] = React.useState([])
  React.useEffect(() => {
    betService.getMarketAnalysis().then((res: AxiosResponse) => {
      setmarketData(res.data.data)
    })
  }, [])
  const listItem = () => {
    const htmlRender: any = []
    marketdata.map((Item: any, index: number) => {
      const htmlOutput = (
        <tr key={index}>
          <td>
            <div>
              <a href={`/admin/odds/${Item.matchId}`}>
                {Item.matchName} ({Item.betCount})
              </a>
            </div>
          </td>
          <td>
            <div className='table-borderedless table-responsive'>
              <table className='table'>
                <tbody>
                  {marketlist(
                    Item.filterMarketByMatch,
                    Item.matchWiseMarket,
                    Item.completemarket_list,
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )

      htmlRender.push(htmlOutput)
    })
    return htmlRender
  }
  const marketlist = (market: any, userbook: any, marketallow: any) => {
    return market.map((ItemMarket: any, index: number) => {
      return (
        marketallow.indexOf(ItemMarket.marketId) > -1 && (
          <tr key={index}>
            <td colSpan={4} style={{ whiteSpace: 'nowrap' }}>
              {ItemMarket.marketName}
            </td>
            {ItemMarket.runners.map((ItemRunners: any, indexn: number) => {
              return (
                <td key={indexn}>
                  {ItemRunners.runnerName} :{' '}
                  <span
                    className={
                      -userbook[`${ItemMarket.marketId}_${ItemRunners.selectionId}`] > 0
                        ? 'green'
                        : 'red'
                    }
                  >
                    {userbook[`${ItemMarket.marketId}_${ItemRunners.selectionId}`] != null
                      ? -userbook[`${ItemMarket.marketId}_${ItemRunners.selectionId}`].toFixed(2)
                      : ''}
                  </span>
                </td>
              )
            })}
          </tr>
        )
      )
    })
  }
  return (
    <>
      {mobileSubheader.subheaderdesktopadmin(
        'Market Analysis',
        'You can view your cricket card books from sport menu.',
      )}

      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12 main-container'>
            <div className='card-body'>
              <div className='table-responsive data-table' style={{ overflow: 'hidden' }}>
                <table className='table table-bordered'>
                  <thead>
                    <tr>
                      <th className='bg2 text-white' style={{ padding: '10px' }}>
                        Event Name
                      </th>
                      <th className='bg2 text-white' style={{ padding: '10px' }}>
                        Team
                      </th>
                    </tr>
                  </thead>
                  <tbody>{listItem()}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default AdminDashboard
