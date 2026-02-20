import CasinoPnl from './casinoPnl';
import Limitinfo from './_common/limitinfo';
import QueenItem from './_common/new/queenItem';
import QueenBackItem from './_common/new/queenBackItem';
import { isMobile } from 'react-device-detect';

const Race20 = (props: any) => {
  const { lastOdds, liveMatchData } = props
 
  const laybacklayout = () => {
    return (liveMatchData?.defaultMarkets?.[0]?.Runners?.map((Item: any, index: number) => {
      let title = Item.RunnerName == 'K Of Spade' ? <img src='imgs/casino/cards/KHH.png' className='wd44' /> : Item.RunnerName
      title = Item.RunnerName == 'K Of Heart' ? <img src='imgs/casino/cards/KDD.png' className='wd44' /> : title
      title = Item.RunnerName == 'K Of Club' ? <img src='imgs/casino/cards/KCC.png' className='wd44' /> : title
      title = Item.RunnerName == 'K Of Diamond' ? <img src='imgs/casino/cards/KSS.png' className='wd44' /> : title
      return <div className='col-lg-3 col-6' key={Item.SelectionId}>
        <div className={`casino-odds-box-container casino-odds-box-container-extra`}>
          <div className='casino-yn'>
            <div className='casino-odds-box-bhav'>
              <b>{title}</b>
            </div>
            <Limitinfo max={liveMatchData?.event_data?.market?.[0]?.Runners?.[0]?.max} min={liveMatchData?.event_data?.market?.[0]?.Runners?.[0]?.min} nameString={Item.RunnerName.replace(' ', '')} />
          </div>
          <QueenItem selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} />
          <div className='col-12 casino-odds-book'>
            <span className='d-block m-t-5'>
              <CasinoPnl matchId={liveMatchData.match_id} sectionId={Item.SelectionId} />
            </span>
          </div>
        </div>
      </div>
    })
    )
  }
  const winlayout = () => {
    return ([3, 4, 5, 6, 7, 8].map((ItemIndex: any, index: number) => {
      const Item:any = liveMatchData?.defaultMarkets?.[ItemIndex]?.Runners?.[0] || {}
      const ItemNew: any = lastOdds?.[Item.SelectionId] || {}
      const clsstatus = ItemNew.gstatus === 'SUSPENDED' || ItemNew.gstatus === 'CLOSED' ? 'suspended' : ''
      const clsForMobile = isMobile?'col-4':'';
      return <div className={`col-lg-4 ${clsForMobile}`} key={Item.SelectionId} style={{paddingRight:"5px", paddingLeft:"5px"}}>
        <div className={`casino-odds-box-container casino-odds-box-container-extra`}>
          <div className='casino-yn'>
            <div className='casino-odds-box-bhav'>
              <b>{Item.RunnerName}</b>
            </div>
            <Limitinfo max={liveMatchData?.event_data?.market?.[2]?.Runners?.[0]?.max} min={liveMatchData?.event_data?.market?.[3]?.Runners?.[0]?.min} nameString={Item?.RunnerName?.replace(' ', '') || 'NA'} />
          </div>
          <QueenBackItem selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} />
          <div className='col-12 casino-odds-book'>
            <span className='d-block m-t-5'>
              <CasinoPnl matchId={liveMatchData.match_id} sectionId={Item.SelectionId} />
            </span>
          </div>
        </div>
      </div>
    })
    )
  }

  const totalmarket = (indexNumber: number) => {
    return (liveMatchData?.defaultMarkets?.[indexNumber]?.Runners?.map((Item: any, index: number) => {
      return <><div className='col-lg-4 col-4' key={Item.SelectionId}>
        <div className={`casino-odds-box-container casino-odds-box-container-extra`} style={{ marginTop: "43px" }}>
          <div className='casino-yn'>
            <div className='casino-odds-box-bhav'>
              <b>{Item.RunnerName}</b>
            </div>
            <Limitinfo max={liveMatchData?.event_data?.market?.[indexNumber]?.Runners?.[0]?.max}
            min={liveMatchData?.event_data?.market?.[indexNumber]?.Runners?.[0]?.min} 
            nameString={Item.RunnerName.replace(' ', '')} />
          </div>
        </div>
      </div>
        <div className='col-lg-8 col-8' key={index}>
        <div className='' style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
            <div style={{width:"49%", textAlign:"center"}}>Yes</div>
            <div style={{width:"49%", textAlign:"center"}}>No</div>
        </div>
          <div className={`casino-odds-box-container casino-odds-box-container-extra`}>
            <QueenItem selectionid={Item.SelectionId} lastOdds={lastOdds} liveMatchData={liveMatchData} fancystatus={true}/>
            <div className='col-12 casino-odds-book'>
              <CasinoPnl matchId={liveMatchData.match_id} sectionId={Item.SelectionId} />
            </div>
          </div>
        </div></>
    })
    )
  }
  return (
    <div className='new-casino '>
      <div className='row row5 bg-gray' key={0} style={{ paddingTop: '25px', paddingBottom: "10px", margin: "0px", marginBottom: "3px" }}>
        {laybacklayout()}
      </div>
      <div className='row row5 mb-10' key={1}>
        <div className='col-lg-5' >
          <div className='row bg-gray' key={2} style={{ paddingTop: '25px', paddingBottom: isMobile?"23px":"43px", margin: "3px 0px" }}>
            {totalmarket(1)}
            {totalmarket(2)}
          </div>
        </div>
        <div className='col-lg-7'>
        <div className='row bg-gray' key={3} style={{ paddingTop: '25px', paddingBottom:"10px", margin:"0px", marginTop:"3px" }}>
        {winlayout()}
        </div>
      </div> 
      </div>
    </div>
  )
}
export default Race20
