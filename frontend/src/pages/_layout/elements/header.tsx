import React, { ChangeEvent, MouseEvent, useRef } from 'react'
import User from '../../../models/User'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { logout, selectUserData } from '../../../redux/actions/login/loginSlice'
import NavMenu from './nav-menu'
import {
  hideBalExp,
  HideBalExp,
  selectBalance,
  selectHideBalExp,
  setExposer,
  setSingleBal,
} from '../../../redux/actions/balance/balanceSlice'
import { CustomLink, useNavigateCustom } from './custom-link'
import { isMobile } from 'react-device-detect'
import Marqueemessge from '../../../admin-app/pages/_layout/elements/welcome'
import NavMobileMenu from './nav-mobile-menu'
import axios, { AxiosResponse } from 'axios'
import { CONSTANTS } from '../../../utils/constants'
import userService from '../../../services/user.service'
import ReactModal from 'react-modal'
import { useWebsocketUser } from '../../../context/webSocketUser'
import Rules from '../../Rules/rules'
import { selectRules } from '../../../redux/actions/common/commonSlice'
import AutocompleteComponent from '../../../components/AutocompleteComponent'
import matchService from '../../../services/match.service'
import IMatch from '../../../models/IMatch'
import casinoSlugs from '../../../utils/casino-slugs.json'

const Header = () => {
  const ref = useRef<any>(null)
  const userState = useAppSelector<{ user: User }>(selectUserData)
  const balance = useAppSelector(selectBalance)
  const selectHideBal = useAppSelector<HideBalExp>(selectHideBalExp)
  const rules = useAppSelector(selectRules)
  const dispatch = useAppDispatch()

  const navigate = useNavigateCustom()

  const { socketUser } = useWebsocketUser()

  const [showMenu, setShowMenu] = React.useState<boolean>(false)
  const [showAuto, setShowAuto] = React.useState<boolean>(false)

  const [userMessage, setUserMessage] = React.useState<string>('')

  const [hideExpBal, setHideExpBal] = React.useState<HideBalExp>({} as HideBalExp)

  const [isOpen, setIsOpen] = React.useState<any>(false)
  const [isOpenRule, setIsOpenRule] = React.useState<any>(false)
  const [getExposerEvent, setGetExposerEvent] = React.useState<any>([])

  React.useEffect(() => {
    axios.get(`http://localhost:3010/userMessage.json?v=${Date.now()}`).then((res: AxiosResponse) => {
      setUserMessage(res.data.message)
    })
  }, [])

  React.useEffect(() => {
    setIsOpenRule(rules.open)
  }, [rules])

  React.useEffect(() => {
    const handlerExposer = ({ exposer, balance }: any) => {
      if (balance !== undefined) dispatch(setSingleBal(balance))
      if (exposer !== undefined) dispatch(setExposer(exposer))
    }
    socketUser.on('updateExposer', handlerExposer)

    return () => {
      socketUser.removeListener('updateExposer', handlerExposer)
    }
  }, [balance, dispatch, socketUser])

  React.useEffect(() => {
    setHideExpBal(selectHideBal)
  }, [selectHideBal])

  const logoutUser = (e: any) => {
    e.preventDefault()
    dispatch(logout())
    navigate.go('/login')
  }

  const onChangeBalExp = (e: ChangeEvent<HTMLInputElement>) => {
    const expBal = { ...hideExpBal, [e.target.name]: e.target.checked }
    dispatch(hideBalExp(expBal))
    localStorage.setItem(CONSTANTS.HIDE_BAL_EXP, JSON.stringify(expBal))
    setHideExpBal(expBal)
  }

  const getExposer = (e: MouseEvent<any>) => {
    e.preventDefault()
    setIsOpen(true)
    userService.getExposerEvent().then((res: AxiosResponse) => {
      setGetExposerEvent(res.data.data)
    })
  }

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    const handleClickOutside = (event: any) => {
      if (showMenu && ref.current && !ref.current.contains(event.target)) {
        closeMenu()
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, showMenu])

  const closeMenu = () => {
    setShowMenu(false)
  }
  const suggestion = ({ value }: any) => {
    return matchService.getMatchListSuggestion({ name: value })
  }

  const onMatchClick = (match: IMatch | null) => {
    if (match) {
      window.location.href = `/odds/${match.matchId}`
    }
  }

  return (
    <header className='header'>
      <div className='container-fluid'>
        <div className='row'>
          <div className='header-top col-md-12'>
            <div className='flex05'>
              {isMobile ? (
                <CustomLink to='/match/4/in-play'>
                  <i className='fas fa-home' />
                </CustomLink>
              ) : (
                ''
              )}
              <CustomLink
                to='/match/4/in-play'
                className='logo router-link-exact-active router-link-active'
              >
                <img src='/imgs/logo.png' className='logo-icon' alt="Logo" />
              </CustomLink>
            </div>

            <ul className='flex05 justify-content-end d-flex profile-right-side'>
              {/* <div className='row-deposit-button mr-20'>
                <CustomLink className='btn btn-deposit mr-10' to={'/deposit'}>Deposit</CustomLink>
                <CustomLink className='btn btn-withdraw' to={'/withdraw'}>Withdraw</CustomLink>
              </div> */}
              {!isMobile ? (
                <>
                  <li className='search float-left row'>
                    {/* <input
                      name='game_keyword'
                      placeholder='All Events'
                      autoComplete='off'
                      type='text'
                      className='search-input-show'
                    /> */}

                    <AutocompleteComponent<IMatch>
                      className={`search-input-show ${showAuto ? 'show' : ''}`}
                      label={'Search'}
                      optionKey={'name'}
                      api={suggestion}
                      onClick={onMatchClick}
                    />

                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0 }}
                      onClick={(e: MouseEvent<any>) => {
                        e.preventDefault()
                        setShowAuto(!showAuto)
                      }}
                      className={`search-input`}
                    >
                      <i className='fas fa-search-plus' />
                    </button>
                  </li>
                  <li className='float-left download-apklink'>
                    <div>
                      <button
                        onClick={(e: any) => {
                          e.preventDefault()
                          setIsOpenRule(true)
                        }}
                        className='rules-link m-r-5'
                        type="button"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        <b>Rules</b>
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                ''
              )}
              <li className='ballance float-left'>
                {!isMobile && !selectHideBal.balance ? (
                  <div className='mby-5'>
                    {!isMobile ? (
                      <span>Balance: </span>
                    ) : (
                      <span>
                        <i
                          className={isMobile ? 'tx-14 fa fa-university' : 'fa fa-university'}
                          aria-hidden='true'
                        ></i>
                      </span>
                    )}
                    <b>
                      <span className={isMobile ? 'tx-14' : ''}>{balance.balance?.toFixed(2)}</span>
                    </b>
                  </div>
                ) : (
                  ''
                )}
                {!selectHideBal.exposer ? (
                  <div className='mty-5'>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textAlign: 'left' }}
                      onClick={(e: any) => getExposer(e)}
                    >
                      {!isMobile ? (
                        <span className=''>Exp : </span>
                      ) : (
                        <span className='tx-14 mrc-2'>Exp : </span>
                      )}

                      <b>
                        <span className={isMobile ? 'tx-14 ' : ''}>
                          {balance.exposer > 0 ? balance.exposer?.toFixed(2) : 0}
                        </span>
                      </b>
                    </button>
                  </div>
                ) : (
                  ''
                )}
              </li>
              <li className='account float-left'>
                {isMobile && !selectHideBal.balance ? (
                  <div>
                    <span>
                      <i className='tx-13 mrc-2 fa fa-university' aria-hidden='true'></i>
                    </span>
                    <span className='tx-13'>{balance.balance?.toFixed(2)}</span>
                  </div>
                ) : (
                  ''
                )}
                <span
                  className={isMobile ? 'profile-section tx-14' : ''}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {userState?.user?.username}
                  <i className='fas fa-chevron-down' />
                </span>
                {/*add class d-block -*/}
                <ul ref={ref} style={{ display: showMenu ? 'block' : 'none' }} className=''>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/match/in-play' className=''>
                      Home
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/accountstatement' className=''>
                      Account Statement
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/depositstatement' className=''>
                      Deposit Statement
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/withdrawstatement' className=''>
                      Withdraw Statement
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/profitloss' className=''>
                      Profit Loss Report
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/bethistory' className=''>
                      Bet History
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/unsettledbet' className=''>
                      Unsettled Bet
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/casino/result' className=''>
                      Casino Report History
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/button-values' className=''>
                      Set Button Values
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/settings/security-auth' className=''>
                      Security Auth Verification
                    </CustomLink>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/changepassword' className=''>
                      Change Password
                    </CustomLink>
                  </li>
                  <li>
                    <label className='mb-0'>
                      <input
                        type={'checkbox'}
                        name={'balance'}
                        checked={hideExpBal.balance || false}
                        onChange={onChangeBalExp}
                        className='mrc-5'
                      />{' '}
                      Balance
                    </label>
                  </li>
                  <li>
                    <label className='mb-0'>
                      <input
                        type={'checkbox'}
                        name={'exposer'}
                        checked={hideExpBal.exposer || false}
                        onChange={onChangeBalExp}
                        className='mrc-5'
                      />{' '}
                      Exposer
                    </label>
                  </li>
                  <li>
                    <CustomLink onClick={() => closeMenu()} to='/rules' className=''>
                      Rules
                    </CustomLink>
                  </li>

                  <li className='border-top'>
                    <button
                      type="button"
                      onClick={logoutUser}
                      style={{ fontWeight: 'bold', color: 'red', textTransform: 'uppercase', background: 'none', border: 'none', padding: 0 }}
                    >
                      signout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          {isMobile ? <Marqueemessge message={userMessage} /> : ""}
          {!isMobile ? <NavMenu /> : <NavMobileMenu />}
        </div>
      </div>
      <div />
      <div className='modal-market' />

      <ReactModal
        isOpen={isOpen}
        onRequestClose={(e: any) => {
          setIsOpen(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog'}
        ariaHideApp={false}
      >
        <div className='modal-content'>
          <div className='modal-header'>
            My Market
            <button onClick={() => setIsOpen(false)} className='close float-right'>
              <i className='fas fa-times-circle'></i>
            </button>
          </div>
          <div className='modal-body'>
            <table className='reponsive table col-12'>
              <tr>
                <th>Event Name</th>
                <th>Total Bets</th>
              </tr>

              {getExposerEvent.map((exposer: any) => {
                let casinoSlug = ''
                if (exposer.sportId === 5000) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  casinoSlug = casinoSlugs?.[exposer?.matchId]
                }
                return (
                  <tr key={exposer.matchName}>
                    <td>
                      <CustomLink
                        onClick={() => {
                          window.location.href =
                            exposer.sportId &&
                              Number.isInteger(+exposer.sportId) &&
                              exposer.sportId !== 5000
                              ? `/odds/${exposer._id}`
                              : `/casino/${casinoSlug}/${exposer._id}`
                          setIsOpen(false)
                        }}
                        to={
                          exposer.sportId &&
                            Number.isInteger(+exposer.sportId) &&
                            exposer.sportId !== 5000
                            ? `/odds/${exposer._id}`
                            : `/casino/${casinoSlug}/${exposer._id}`
                        }
                      >
                        {exposer.matchName}
                      </CustomLink>
                    </td>
                    <td>{exposer.myCount}</td>
                  </tr>
                )
              })}
            </table>
          </div>
        </div>
      </ReactModal>


      <ReactModal
        isOpen={isOpenRule}
        onRequestClose={(e: any) => {
          setIsOpenRule(false)
        }}
        contentLabel='Set Max Bet Limit'
        className={'modal-dialog w-90P'}
        ariaHideApp={false}
      >
        <div className='modal-content' style={{ height: '90vh', marginTop: "1%" }}>
          <div className='modal-header'>
            Rules
            <button onClick={() => setIsOpenRule(false)} className='close float-right'>
              <i className='fas fa-times-circle'></i>
            </button>
          </div>
          <div className='modal-body'>
            <Rules classData={'col-md-12'} />
          </div>
        </div>
      </ReactModal>
    </header>
  )
}
export default Header
