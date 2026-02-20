import React from 'react'
import { CustomLink } from './custom-link'
import ISport from '../../../models/ISport'

const GameTabs = (props: any) => {
  return (
    <div className='horizontal-scorller'>
      <ul role='tablist' id='home-events' className='nav nav-tabs'>
        <li className='nav-item'>
          <CustomLink to={'/'} className={`nav-link ${!props.sportId ? 'active' : ''}`}>
            All
          </CustomLink>
        </li>
        {props.sportListState.sports.map((sport: ISport) => (
          <li key={sport._id} className='nav-item'>
            <CustomLink
              to={`/match/${sport.sportId}`}
              className={`nav-link ${props.sportId === sport.sportId ? 'active' : ''}`}
            >
              {sport.name}
            </CustomLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default React.memo(GameTabs)
