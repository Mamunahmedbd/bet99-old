import React, { MouseEvent } from 'react'
import { toast } from 'react-toastify'
import UserService from '../../../services/user.service'
import moment from 'moment'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import CustomAutoComplete from '../../components/CustomAutoComplete'
import userService from '../../../services/user.service'
import { useAppSelector } from '../../../redux/hooks'
import { selectSportList } from '../../../redux/actions/sports/sportSlice'
import IBet from '../../../models/IBet'
import betService from '../../../services/bet.service'
import { AxiosResponse } from 'axios'
import BetListComponent from './bet-list.component'
import { useWebsocketUser } from '../../../context/webSocketUser'
import { useParams } from 'react-router-dom'
import User, { RoleType } from '../../../models/User'
import { selectUserData } from '../../../redux/actions/login/loginSlice'

const UnsetteleBetHistoryAdmin = ({ hideHeader, matchId }: any) => {
  const [bethistory, setbethistory] = React.useState<any>({})
  const params = useParams()
  const [filterdata, setfilterdata] = React.useState<any>({
    status: 'pending',
    type: params.type,
    matchId,
  })
  const sportList = useAppSelector(selectSportList)
  const [page, setPage] = React.useState(1)
  const [submitClicked, setSubmitClicked] = React.useState(false)
  const [selectAll, setSelectAll] = React.useState(false)
  const userState = useAppSelector<{ user: User }>(selectUserData)

  const { socketUser } = useWebsocketUser()
  const ref = React.useRef<any>(null)
  React.useEffect(() => {
    const filterObj = filterdata
    if (!matchId) {
      filterObj.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
      filterObj.endDate = moment().format('YYYY-MM-DD')
    }
    setfilterdata(filterObj)
    getbethistory(page)
  }, [])

  React.useEffect(() => {
    const filterObj = filterdata
    if (!matchId) {
      filterObj.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
      filterObj.endDate = moment().format('YYYY-MM-DD')
    }
    filterObj.type = params.type
    setfilterdata(filterObj)
    getbethistory(page)
  }, [params.type])

  React.useEffect(() => {
    if (submitClicked) {
      getbethistory(1)
      setSubmitClicked(false) // Reset submitClicked state
    }
  }, [submitClicked])

  const getbethistory = (page: number) => {
    UserService.getUsercompletedbets(page, filterdata)
      .then((res) => {
        res && res.data && res.data.data && setbethistory(res.data.data)
        setPage(page)
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }

  const onSuggestionsFetchRequested = ({ value }: any) => {
    return userService.getUserListSuggestion({ username: value })
  }

  const onSelectUser = (user: any) => {
    setfilterdata({ ...filterdata, userId: user._id })
  }

  const handleformchange = (event: any) => {
    setfilterdata({ ...filterdata, [event.target.name]: event.target.value })
  }
  const handleSubmitform = (event: any) => {
    event.preventDefault()
    setSubmitClicked(true)
  }
  const handlePageClick = (event: any) => {
    getbethistory(event.selected + 1)
  }
  const onTrash = (e: MouseEvent<HTMLAnchorElement>, bet: IBet) => {
    e.preventDefault();

    // Check if bet._id exists before proceeding
    if (!bet._id) {
      toast.error("Invalid bet data. Unable to delete.");
      return;
    }

    // Replace confirm with a custom modal for better UX (Optional)
    const userConfirmed = window.confirm('Are you sure you want to delete?');

    if (userConfirmed) {
      betService.deleteCurrentBet(bet._id).then((res: AxiosResponse) => {
        const { success, message } = res.data.data;

        if (success) {
          // Notify backend via socket
          socketUser.emit('betDelete', { betId: bet._id, userId: bet.userId });

          // Show success toast notification
          toast.success(message);

          // Update state safely
          setbethistory((prevState: any) => ({
            ...prevState,
            docs: prevState.docs.filter(({ _id }: IBet) => _id !== bet._id),
          }));
        } else {
          toast.error('Failed to delete bet.');
        }
      }).catch((err) => {
        console.error('Error deleting bet:', err);
        toast.error('An error occurred while deleting the bet.');
      });
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll) // Toggle the state of "Select All" checkbox
    const updatedHistory = bethistory.docs.map((item: any) => ({
      ...item,
      selected: !selectAll, // Set the selected state of each item based on the new state of "Select All" checkbox
    }))
    setbethistory({ ...bethistory, docs: updatedHistory })
  }

  const handleSelectItem = (item: IBet) => {
    const updatedHistory = bethistory.docs.map((historyItem: any) =>
      historyItem === item ? { ...historyItem, selected: !historyItem.selected } : historyItem,
    )
    setbethistory({ ...bethistory, docs: updatedHistory })
  }

  const reset = () => {
    ref.current.resetValue()
    setfilterdata({ status: 'pending' })
    setSubmitClicked(true)
  }

  const deleteBulk = () => {
    const select = bethistory.docs.reduce((selected: boolean, item: IBet) => {
      if (item.selected) {
        selected = true
      }
      return selected
    }, false)
    if (selectAll || select) {
      const selectedItems = bethistory.docs
        .filter((item: IBet) => item.selected)
        .map((item: IBet) => item._id)
      if (selectedItems.length > 0) {
        betService.deleteBets({ ids: selectedItems }).then((res) => {
          if (res.data.data.success) {
            setbethistory({
              ...bethistory,
              docs: bethistory.docs.filter((item: IBet) => !item.selected),
            })
            setSelectAll(false)
            toast.success(res.data.message)
          }
        })
      }
    } else {
      toast.error('Please select one item')
    }
  }

  return (
    <>
      {!hideHeader && mobileSubheader.subheaderdesktopadmin(params.type=='deleted'?'Deleted Bet History':'Unsettled Bet History')}
      <div className='container-fluid'>
        <div className='row'>
          <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
            <div className=''>
              <div className='card-body p15 bg-gray mb-20'>
                <form
                  className='ng-pristine ng-valid ng-touched mb-0'
                  method='post'
                  onSubmit={handleSubmitform}
                >
                  <div className='row row5'>
                    <div className='col-6 col-lg-2 mbc-5'>
                      <label className='label'>User</label>
                      <CustomAutoComplete
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSelectUser={onSelectUser}
                        ref={ref}
                      />
                    </div>
                    <div className='col-6 col-lg-2 mbc-5'>
                      <div className='form-group mb-0'>
                        <label className='label'>Search By Name</label>
                        <input
                          type={'text'}
                          className={'mx-input'}
                          name={'name'}
                          onChange={handleformchange}
                          placeholder={'Search By Name'}
                        />
                      </div>
                    </div>
                    <div className='col-6 col-lg-2 mbc-5'>
                      <div className='form-group mb-0'>
                        <label className='label'>Sport</label>
                        <select
                          name='reportType'
                          onChange={handleformchange}
                          className='custom-select ng-untouched ng-pristine ng-valid'
                        >
                          <option value=''>Select Sport</option>
                          {sportList.sports.map((sport: any) => (
                            <option key={sport.sportId} value={sport.sportId}>
                              {sport.name}{' '}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* <div className='col-6 col-lg-2 mbc-5'>
                      <div className='form-group mb-0'>
                        <label className='label'>Bet Type</label>
                        <select
                          name='bet_status'
                          onChange={handleformchange}
                          className='custom-select ng-untouched ng-pristine ng-valid'
                        >
                          <option value='ALL'>Bet Type </option>
                          <option value='matched'>Matched </option>
                          <option value='unmatched'>Un-Matched </option>
                          <option value='deleted'>Deleted </option>
                        </select>
                      </div>
                    </div> */}
                    <div className='col-6 col-lg-2 mbc-5'>
                      <div className='form-group mb-0'>
                        <label className='label'>Start Date</label>
                        <div className='mx-datepicker'>
                          <div className='mx-input-wrapper'>
                            <input
                              name='startDate'
                              type='datetime-local'
                              autoComplete='off'
                              onChange={handleformchange}
                              defaultValue={filterdata.startDate}
                              placeholder='Select Date'
                              className='mx-input ng-pristine ng-valid ng-touched'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-6 col-lg-2 mbc-5'>
                      <div className='form-group mb-0'>
                        <label className='label'>End Date</label>
                        <div className='mx-datepicker'>
                          <div className='mx-input-wrapper'>
                            <input
                              name='endDate'
                              type='datetime-local'
                              autoComplete='off'
                              defaultValue={filterdata.endDate}
                              onChange={handleformchange}
                              placeholder='Select Date'
                              className='mx-input ng-untouched ng-pristine ng-valid'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-12 col-lg-1 mbc-5'>
                      <label className='label'>&nbsp;</label>

                      <button type='submit' className='btn btn-primary btn-block'>
                        Submit
                      </button>
                    </div>
                    <div className='col-12 col-lg-1 mbc-5'>
                      <label className='label'>&nbsp;</label>
                      <button type='button' onClick={reset} className='btn btn-primary btn-block'>
                        Reset
                      </button>
                    </div>
                    {userState?.user?.role === RoleType.admin && (
                      <div className='col-12 col-lg-1 mbc-5'>
                        <label className='label'>&nbsp;</label>
                        <button
                          type='button'
                          onClick={deleteBulk}
                          className='btn btn-primary btn-block'
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className='card-body'>
                <BetListComponent
                  bethistory={bethistory}
                  handlePageClick={handlePageClick}
                  onTrash={onTrash}
                  page={page}
                  isTrash={true}
                  handleSelectAll={handleSelectAll}
                  selectAll={selectAll}
                  handleSelectItem={handleSelectItem}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default UnsetteleBetHistoryAdmin
