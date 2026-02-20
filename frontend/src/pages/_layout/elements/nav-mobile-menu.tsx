import { CustomLink } from './custom-link'
import { useLocation } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import React from 'react'
import { isMobile } from 'react-device-detect'
import Fav from './fav'

const NavMobileMenu = (props: any) => {
  const location = useLocation()
  const [headerMessage, setHeaderMessage] = React.useState<any>()
  // const { sportId, status } = useParams()
  // const [matchList, setMatchList] = React.useState([])

  React.useEffect(() => {
    axios.get(`headerMessage.json?v=${Date.now()}`).then((res: AxiosResponse) => {
      setHeaderMessage(res.data)
    })

  }, [])

  return (
    <div className='header-mobile'>
      <Fav />
      <div className=' header-b-menu'>
        <a href={headerMessage?.headerMessageLink}>{headerMessage?.headerMessage}</a>
      </div>
      {isMobile && !location.pathname.includes('/odds') && !location.pathname.includes('/casino') && <ul className='list-unstyled navbarnav'>
        <li className={'nav-item'}>
          <CustomLink
            className={location.pathname.includes('in-play') ? 'active' : ''}
            to='/match/4/in-play'
          >
            In-play
          </CustomLink>
        </li>
        <li className={'nav-item'}>
          <CustomLink
            className={location.pathname.includes('sports') ? 'active' : ''}
            to='/match/4/sports'
          >
            Sports
          </CustomLink>
        </li>
        <li className={'nav-item'}>
          <CustomLink
            className={location.pathname === '/casino-games' ? 'active' : ''}
            to='/casino-games'
          >
            Casino + Slot
          </CustomLink>
        </li>
        <li className='nav-item'>
          <CustomLink to='#'>Others</CustomLink>
        </li>
      </ul>}
    </div>
  )
}
export default NavMobileMenu
