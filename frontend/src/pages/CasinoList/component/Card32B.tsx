import CasinoPnl from './casinoPnl'
import Limitinfo from './_common/limitinfo'
import LayBackButton from './_common/new/LayBackButton'
import React from 'react'
import OddEvenButton from './_common/new/OddEvenButton'
import BackButton from './_common/new/BackButton'
import NumberLayout from './_common/new/numberLayout'

const Card32B = (props: any) => {
  const { lastOdds, liveMatchData } = props

  const laybacklayout = (indexMarket: number) => {
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{ paddingLeft: "5px" }}>
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
                <tr key={key} data-title='SUSPENDED' className={`${clsstatus} ${heightdata}`}>
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
  const laybacklayoutrange = (indexMarket: number) => {
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{ paddingLeft: "5px" }}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>
            <th className={`back ${clsnamename}`}>BACK</th>
            <th className={`lay-color ${clsnamename}`}>LAY</th>
          </tr>
        </thead>
        <tbody>
          {
          [9, 10, 11].map((ItemIndex:any, keyIndex:number) => {
            return liveMatchData?.defaultMarkets?.[ItemIndex]?.Runners?.map((Item: any, key: number) => {
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              const clsstatus =
              !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
              return (
                (
                  <tr key={keyIndex} data-title='SUSPENDED' className={`${clsstatus} ${heightdata}`}>
                    <td className={clsnamehead} style={{ paddingLeft: "5px" }}>
                      <b>{Item.RunnerName}</b>
                      <CasinoPnl sectionId={Item.SelectionId} matchId={liveMatchData?.match_id} />
                    </td>
                    <LayBackButton selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} />
                  </tr>
                )
              )
            })
          })
          }
        </tbody>
      </table>
    )
  }
  const oddeventLayout = (indexMarket: number) => {
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{ paddingLeft: "5px" }}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>
            <th className={`back ${clsnamename}`}>Even</th>
            <th className={`back ${clsnamename}`}>Odd</th>
          </tr>
        </thead>
        <tbody>
          {[2, 4, 6, 8].map((indexMarket: any, key: number) => {
            const marketInfo = liveMatchData?.defaultMarkets?.[indexMarket]?.Runners || [];
            const Item = marketInfo?.[0] || {}
            const Item2 = liveMatchData?.defaultMarkets?.[indexMarket-1]?.Runners?.[0] || {}
            const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
            const title = Item?.RunnerName?.replace('Even', '')
            const clsstatus =
              !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
            return (
              (
                <tr key={key} data-title='SUSPENDED' className={`${clsstatus} ${heightdata}`}>
                  <td className={clsnamehead} style={{ paddingLeft: "5px" }}>
                    <b>{title}</b>
                  </td>
                  <OddEvenButton selectionid={Item?.SelectionId} selectionid2={Item2?.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} bookstatus={true}/>
                </tr>
              )
            )
          })}
        </tbody>
      </table>
    )
  }
  const totalLayout = (indexMarket: number) => {
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th className={clsnamehead} style={{ paddingLeft: "5px" }}>
              <Limitinfo nameString={'lbmarket'} min={100} max={50000} />
            </th>

          </tr>
        </thead>
        <tbody>
          {liveMatchData?.defaultMarkets?.[22]?.Runners?.map((Item: any, key: number) => {
            const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
            const clsstatus =
            !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
            return (
              (
                <tr style={{ height: "69px" }} key={key} data-title='SUSPENDED' className={`${clsstatus} ${heightdata} heightsuspend`}>
                  <td className={clsnamehead} style={{ paddingLeft: "5px" }}>
                    <b>{Item.RunnerName}</b>
                    <CasinoPnl sectionId={Item.SelectionId} matchId={liveMatchData?.match_id} />
                  </td>
                  <BackButton selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} />
                </tr>
              )
            )
          })}
        </tbody>
      </table>
    )
  }
  const numberLayout = (indexMarket: number) => {
    const clsnamehead = 'box-6'
    const clsnamename = 'box-2'
    const heightdata = ''
    const ItemMarket: any = lastOdds?.[15] || {}
    const clsstatus =
    !ItemMarket.gstatus || ItemMarket.gstatus === 'SUSPENDED' || ItemMarket.gstatus === 'CLOSED' ? 'suspended' : ''
    return (
      <table className='table coupon-table table table-bordered'>
        <thead style={{ borderBottom: "0px" }}>
          <tr>
            <th style={{ paddingLeft: "5px", display: "flex", alignItems: "center" }} colSpan={5}>
              <div style={{ width: "97%", fontSize: "18px", textAlign: "center" }}>
                9.50
              </div>

              <span className='tx-right'><Limitinfo nameString={'lbmarket'} min={100} max={50000} /></span>
            </th>

          </tr>
        </thead>
        <tbody data-title='SUSPENDED' className={`card32btbody ${clsstatus}`}>
         
            <tr style={{ height: "69px" }} key={0} className={`${heightdata}`}>
          {[12, 13, 14, 15, 16].map((ItemNumber: any, keyNumber: number) => 
          {
            return liveMatchData?.defaultMarkets?.[ItemNumber]?.Runners?.map((Item: any, key: number) => {
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              return <NumberLayout key={key} selectionid={Item.SelectionId} RunnerName={Item?.RunnerName?.replace('Single', '') || keyNumber+1} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} />
            })
          }
          )}
            </tr>
            <tr style={{ height: "69px" }} key={0} className={`${heightdata}`}>
          {[17, 18, 19, 20, 21].map((ItemNumber: any, keyNumber: number) => 
          {
            return liveMatchData?.defaultMarkets?.[ItemNumber]?.Runners?.map((Item: any, key: number) => {
              const ItemMarket: any = lastOdds?.[Item.SelectionId] || {}
              return <NumberLayout key={key} selectionid={Item.SelectionId} RunnerName={Item?.RunnerName?.replace('Single', '') || keyNumber+1} lastOdds={lastOdds} liveMatchData={liveMatchData} clsnamename={''} />
            })
          }
          )}
          
            </tr>
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
          <div className='live-poker'>{oddeventLayout(0)}</div>
        </div>
      </div>
      <div className='row casino-32A '>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{laybacklayoutrange(5)}</div>
        </div>
        <div className='col-lg-6 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{totalLayout(7)}</div>
        </div>
      </div>
      <div className='row casino-32A '>
        <div className='col-lg-12 m-b-10 main-market  bg-gray' style={{ padding: '0px' }}>
          <div className='live-poker'>{numberLayout(5)}</div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(Card32B)
