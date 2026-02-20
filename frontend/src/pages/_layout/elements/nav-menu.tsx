import { useParams } from 'react-router-dom'
import ISport from '../../../models/ISport'
import { useAppSelector } from '../../../redux/hooks'
import { selectSportList } from '../../../redux/actions/sports/sportSlice'
import { CustomLink } from './custom-link'

const NavMenu = () => {
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList)
  const { sportId } = useParams()
  return (
    <div className='header-bottom m-t-10 col-md-12'>
      <nav className='navbar navbar-expand-md btco-hover-menu'>
        <button
          type='button'
          data-toggle='collapse'
          data-target='#navbarNavDropdown'
          aria-controls='navbarNavDropdown'
          aria-expanded='false'
          aria-label='Toggle navigation'
          className='navbar-toggler'
        >
          <span className='navbar-toggler-icon' />
        </button>
        <div className='collapse navbar-collapse'>
          <ul className='list-unstyled navbar-nav'>
            <li className='nav-item active'>
              <CustomLink to={'/'} className='router-link-exact-active router-link-active'>
                <b>Home</b>
              </CustomLink>
            </li>
            <li className='nav-item active'>
              <CustomLink to={'/match/4/in-play'} className='router-link-exact-active router-link-active'>
                <b>Inplay</b>
              </CustomLink>
            </li>

            {sportListState.sports.map((sport: ISport) => (
              <li key={sport._id} className='nav-item'>
                <CustomLink
                  to={`/match/${sport.sportId}`}
                  className={`nav-link ${sportId === sport.sportId?.toString() ? 'router-link-active' : ''}`}
                >
                  {sport.name}
                </CustomLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}
export default NavMenu
