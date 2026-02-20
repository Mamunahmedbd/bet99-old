import { useParams } from 'react-router-dom'
import ISport from '../../../models/ISport'
import { selectSportList } from '../../../redux/actions/sports/sportSlice'
import { useAppSelector } from '../../../redux/hooks'
import { CustomLink } from './custom-link'

const SideBar = () => {
  const sportListState = useAppSelector<{ sports: ISport[] }>(selectSportList)
  const { sportId /* , matchId */ } = useParams()

  return (
    <div className='sidebar col-md-2'>
      <div data-toggle='collapse' data-target='.racing' className='sidebar-title'>
        <h5 className='d-inline-block m-b-0'>Racing</h5>
      </div>
      <nav className='collapse racing show'>
        <ul>
          {sportListState.sports.map((sport: ISport) => {
            if (sport.sportId !== 7 && sport.sportId !== 4339) return null
            return (
              <li key={sport._id} className='nav-item'>
                <CustomLink
                  to={`/match/${sport.sportId}`}
                  className={`nav-link ${parseInt(sportId || '0') === sport.sportId ? 'router-link-active' : ''}`}
                >
                  <span className='new-launch-text'>{sport.name}</span>
                </CustomLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div data-toggle='collapse' data-target='.casino' className='sidebar-title'>
        <h5 className='d-inline-block m-b-0'>Others</h5>
      </div>
      <nav className='collapse casino show'>
        <ul>
          <li className='nav-item'>
            <CustomLink
              to={`/casino-in/live-dmd`}
              className={`nav-link`}
            >
              <span className='new-launch-text blink_me'>Our Casino</span>
            </CustomLink>
          </li>
          <li className='nav-item'>
            <CustomLink
              to={`/casino-int/virtual-casino`}
              className={`nav-link`}
            >
              <span className='new-launch-text blink_me'>Our Virtual</span>
            </CustomLink>
          </li>
          <li className='nav-item'>
            <CustomLink
              to={`/casino-int/live-casino`}
              className={`nav-link`}
            >
              <span className='new-launch-text '>Live Casino</span>
            </CustomLink>
          </li>
          <li className='nav-item'>
            <CustomLink
              to={`/casino-int/slots`}
              className={`nav-link`}
            >
              <span className='new-launch-text'>Slot Game</span>
            </CustomLink>
          </li>
          <li className='nav-item'>
            <CustomLink
              to={`/casino-int/fantasy`}
              className={`nav-link`}
            >
              <span className='new-launch-text'>Fantasy Game</span>
            </CustomLink>
          </li>
        </ul>
      </nav>
      <div data-toggle='collapse' data-target='.sports' className='sidebar-title'>
        <h5 className='d-inline-block m-b-0'>Sports</h5>
      </div>
      <nav className='collapse sports show'>
        <ul>
          {sportListState.sports.map((sport: ISport) => (
            <li key={sport._id} className='nav-item'>
              <CustomLink
                to={`/match/${sport.sportId}`}
                className={`nav-link ${sportId === sport.sportId?.toString() ? 'router-link-active' : ''}`}
              >
                <i className="far fa-plus-square me-1"></i>
                <span className='new-launch-text'>{sport.name}</span>
              </CustomLink>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  )
}
export default SideBar
