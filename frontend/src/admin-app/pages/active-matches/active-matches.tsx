import { AxiosResponse } from 'axios'
import moment from 'moment'
import React, { MouseEvent } from 'react'
import ReactPaginate from 'react-paginate'
import { useParams } from 'react-router-dom'
import IMatch from '../../../models/IMatch'
import { CustomLink } from '../../../pages/_layout/elements/custom-link'
import matchService from '../../../services/match.service'
import { dateFormat } from '../../../utils/helper'
import BetMaxLimitModal from './bet-max-limit-modal'
import mobileSubheader from '../_layout/elements/mobile-subheader'

const ActiveMatches = () => {
  const [matches, setMaches] = React.useState<any>({})
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedMatch, setSelectedMatch] = React.useState<any>({})
  const [page, setPage] = React.useState(1)
  const { sportId, matchType } = useParams()
  const [searchByMatch, setSearchByMatch] = React.useState('')

  React.useEffect(() => {
    activeMatches(1)
    setPage(1)
  }, [sportId, matchType])

  const activeMatches = (currentPage: number) => {
    const type = matchType === undefined ? '0' : matchType
    matchService
      .getActiveMatches(sportId!, type, searchByMatch, currentPage)
      .then((res: AxiosResponse) => {
        setMaches(res.data.data)
        setPage(currentPage)
      })
  }

  const handlePageClick = (event: any) => {
    activeMatches(event.selected + 1)
  }

  const changeStatus = (e: any, match: IMatch) => {
    e.preventDefault()
    //const con = confirm('Are you sure you want to change match status')
    const con = true
    if (con) {
      // /change-status-matchs
      matchService.changeStatusMatch(match.matchId).then((res) => {
        const allMatchs: any = [...matches.docs]
        const index = allMatchs.findIndex((m: IMatch) => m.matchId === match.matchId)
        allMatchs[index].active = !match.active
        setMaches({ ...matches, docs: allMatchs })
      })
    }
  }

  const deleteMatch = (e: any, match: IMatch) => {
    e.preventDefault()
    //const con = confirm('Are you sure you want to delete this match')
    const con = true
    if (con) {
      matchService.deleteMatch(match.matchId).then((res) => {
        const allMatchs: any = [...matches.docs]
        const allM = allMatchs.filter((m: IMatch) => m.matchId !== match.matchId)
        setMaches({ ...matches, docs: allM })
      })
    }
  }

  const rollbackResult = (e: MouseEvent<HTMLAnchorElement>, match: IMatch) => {
    e.preventDefault()
    matchService.rollbackResultMarket(match.matchId).then(() => {
      activeMatches(page)
    })
  }

  const openMaxBetPopup = (
    e: MouseEvent<HTMLAnchorElement | undefined>,
    match?: IMatch,
    closed?: boolean,
  ) => {
    e.preventDefault()
    if (match) setSelectedMatch(match)
    setIsOpen(!isOpen)

    if (closed) {
      const allMatches = [...matches.docs]
      const index = allMatches.findIndex((m: IMatch) => m._id === match?._id)
      allMatches[index] = match
      setMaches({ docs: allMatches })
    }
  }

  const listMenu = () => {
    const menus = [
      { type: '', label: 'Current Match' },
      { type: '1', label: 'Completed Match' },
      { type: '2', label: 'Deleted Match' },
    ]
    const type = matchType === undefined ? '' : matchType
    return menus.map((menu) => (
      <li
        key={menu.type}
        onClick={() => {
          console.log('cliedddd')
          setPage(1)
        }}
        className='nav-item'
      >
        <CustomLink
          to={`/active-matches/${sportId}/${menu.type}`}
          className={`nav-link ${type === menu.type ? 'active' : ''}`}
        >
          <span style={{ textTransform: 'uppercase' }}>{menu.label}</span>
        </CustomLink>
      </li>
    ))
  }

  const onSearchSubmit = () => {
    activeMatches(1)
    setPage(1)
  }

  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Match List')}
      <div className='container-fluid'>
        <div className='row justify-content-md-center'>
          <div className='col-md-4 p-2'>
            <label>&nbsp;</label>
            <ul role='tablist' className='nav nav-tabs fancy-group' aria-label='Tabs'>
              {listMenu()}
            </ul>
          </div>
          <div className='form-group col-md-4'>
            <label htmlFor='SearchByMatch'>Search By Match</label>
            <input
              type='text'
              className='form-control'
              id='SearchByMatch'
              placeholder='Search By Match'
              onChange={(e) => setSearchByMatch(e.target.value)}
            />
          </div>
          <div className='col-md-2'>
            <label>&nbsp;</label>
            <button className='btn btn-primary btn-block' onClick={onSearchSubmit}>
              Search
            </button>
          </div>
          <div className='col-md-12 main-container'>
            <table className='table table-bordered'>
              <thead>
                <tr>
                  <th>In Play</th>
                  <th>Game</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Bet Limit</th>
                  <th>Manage Fancy</th>
                  <th>Rollback</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(matches).length > 0 &&
                  matches.docs.map((match: IMatch) => (
                    <tr key={match.matchId}>
                      <td>
                        <i
                          className={`fas fa-circle ${match.active ? 'text-success' : 'text-danger'
                            } fa-lg mr-2`}
                        ></i>
                      </td>
                      <td>
                        <CustomLink to={`/active-markets/${match.matchId}`}>
                          {match.name}{' '}
                        </CustomLink>
                        <span>{moment(match.matchDateTime).format(dateFormat)}</span>
                      </td>
                      <td>{match.active ? 'Active' : 'In-Active'}</td>
                      <td>
                        <div>
                          <a href='#' onClick={(e) => changeStatus(e, match)}>
                            Click To {match.active ? 'In-Active' : 'Active'}
                          </a>
                          <br />
                          <a href='#' onClick={(e) => deleteMatch(e, match)}>
                            Click To {match.isDelete ? 'Undo' : 'Delete'}
                          </a>
                        </div>
                      </td>
                      <td>
                        <a href='#' onClick={(e: any) => openMaxBetPopup(e, match)}>
                          Maximum Bet Limit
                        </a>
                      </td>
                      <td>
                        <CustomLink to={`/active-fancies/${match.matchId}`}>
                          Manage Fancy
                        </CustomLink>
                      </td>

                      <td>
                        {match.result && (
                          <a href='#' onClick={(e: any) => rollbackResult(e, match)}>
                            Rollback Result
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <ReactPaginate
            breakLabel='...'
            nextLabel='>>'
            forcePage={page - 1}
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={matches.totalPages}
            containerClassName={'pagination'}
            activeClassName={'active'}
            previousLabel={'<<'}
            breakClassName={'break-me'}
          />

          <BetMaxLimitModal
            showDialog={isOpen}
            selectedMatch={selectedMatch}
            closeModal={(e: any, savedMatch: any) => {
              openMaxBetPopup(e, savedMatch, true)
            }}
          />
        </div>
      </div>
    </>
  )
}

export default ActiveMatches
