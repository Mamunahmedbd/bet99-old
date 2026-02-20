import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { selectUserData } from '../../../redux/actions/login/loginSlice'
import { useState } from 'react'
import Limitinfo from './_common/limitinfo'
import BookmakerMarket from './_common/bookmakerMarket'
import FancyMarket from './_common/fancyMarket'
import { isMobile } from 'react-device-detect'

const SuperOver = (props: any) => {
  const { lastOdds, liveMatchData } = props
  const dispatch = useAppDispatch()
  const userState = useAppSelector(selectUserData)
  const getCurrentMatch = liveMatchData?.defaultMarkets || []
  const [updateOdds, setUpdateOdds] = useState<any>(undefined)
  
 // console.log(lastOdds)
  return (
    <div className='container '>
      <div className='row superover'>
        {getCurrentMatch.map((ItemNew: any, key: number) => {
            const clsName: string = key == 0 ? 'col-lg-12' : 'col-lg-6'
            const oddsMarket =lastOdds?.market?.filter((ItemM:any) => ItemNew.MarketName==ItemM.MarketName)?.[0] || {}
            return (
              oddsMarket.Runners &&
              oddsMarket.Runners.length > 0 && (
                <div className={`${clsName} main-market`} style={{ padding: '1px' }} key={key}>
                  <div className='card m-b-5 my-bet '>
                    {((isMobile &&
                      !ItemNew.MarketName.includes('Fancy1') &&
                      !ItemNew.MarketName.includes('Fancy')) ||
                      !isMobile) && (
                      <div className='card-header casino'>
                        <h6 className='card-title d-inline-block'>
                          {ItemNew.MarketName}
                          <span className='float-right'>
                            <Limitinfo
                              max={lastOdds.max}
                              min={lastOdds.min}
                              nameString={ItemNew.MarketName.replace(' ', '')}
                            />
                          </span>
                        </h6>
                      </div>
                    )}
                    <div className='card-body' style={{ padding: '0px', textAlign: 'right' }}>
                      {key == 0 ? (
                        <BookmakerMarket oddsMarket={oddsMarket} lastOdds={liveMatchData} />
                      ) : oddsMarket.Runners && oddsMarket.Runners.length > 0 ? (
                        <FancyMarket oddsMarket={oddsMarket} lastOdds={liveMatchData} />
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              )
            )
          })}
      </div>
    </div>
  )
}
export default SuperOver
