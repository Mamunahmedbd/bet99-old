import React from 'react'
import TwentyCricketItem from './_common/TwentyCricketItem'

const TwentyCricket = (props: any) => {
  const { lastOdds, liveMatchData, checkRoundIdChange } = props

  const laybacklayout = () => {
    return liveMatchData?.defaultMarkets?.[0]?.Runners?.map((ItemNew: any, key: number) => {
      return (
        <div className='col-lg-6 col-12' key={key}>
          <TwentyCricketItem
            selectionId={ItemNew.SelectionId}
            ItemNew={ItemNew}
            lastOdds={lastOdds}
            liveMatchData={liveMatchData}
            checkRoundIdChange={checkRoundIdChange}
          />
        </div>
      )
    })
  }
  return (
    <div className='container '>
      <div className='row cc-20 '>
        <div className='col-lg-12 m-b-10 main-market  ' style={{ padding: '0px' }}>
          <div className='row'>{laybacklayout()}</div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(TwentyCricket)
