import React from 'react'
import { CustomLink } from './custom-link'
import ISport from '../../../models/ISport'
import { useLocation } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
const GameTabMobile = (props: any) => {
  const location = useLocation()
  const [filter, setFilter] = React.useState('in-play')
  React.useEffect(() => {
    const loca = location.pathname.includes('in-play') && isMobile ? 'in-play' : 'sports'
    setFilter(loca)
  }, [location.pathname])
  return (
    <div className={'mobile-header mobile-header-2'}>
      <ul role='tablist' className='nav nav-tabs nav-justified w-100'>
        {props.sportListState.sports.map((sport: ISport) => {
          const ttpecass = sport.sportId == 7 || sport.sportId == 4339 ? 'new-launch-text' : ''
          return (
            <li key={sport._id} className='nav-item'>
              <CustomLink
                to={`/match/${sport.sportId}/${filter}`}
                className={`nav-link ${props.sportId == sport.sportId ? 'active' : ''} ${ttpecass}`}
              >
                <img src={sport.icon} alt='' height='22' width='22' />
                <p>{sport.name}</p>
              </CustomLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
export default React.memo(GameTabMobile)
