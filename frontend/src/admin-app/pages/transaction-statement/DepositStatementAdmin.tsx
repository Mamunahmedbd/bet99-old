import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import CustomAutoComplete from '../../components/CustomAutoComplete'
import moment from 'moment'
import userService from '../../../services/user.service'
import depositWithdrawService from '../../../services/deposit-withdraw.service'
import ReactPaginate from 'react-paginate'
import BankDetailModal from './modal/BankDetailModal'
import { toast } from 'react-toastify'
import RejectedModal from './modal/RejectedModal'
const DepositStatement = () => {
  const [filterData, setFilterData] = React.useState<any>({
    startDate: '',
    endDate: '',
    reportType: '',
    username: '',
  })
  const [depositStatement, setDepositStatement] = useState([])
  const [pageCount, setPageCount] = React.useState<any>(0)
  const [bankDetails, setBankDetails] = useState({})
  const [rejectedModal, setRejectedModal] = useState(false)
  const [rejectedData, setRejectedData] = useState<any>({})
  useEffect(() => {
    getAccountStmt(1)
  }, [rejectedModal])

  React.useEffect(() => {
    const filterObj = filterData
    filterObj.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    filterObj.endDate = moment().format('YYYY-MM-DD')
    setFilterData(filterObj)
  }, [])

  const handleClick = (details: any) => {
    setBankDetails(details)
  }

  const getAccountStmt = (page: number) => {
    depositWithdrawService
      .getDepositWithdrawLists({ type: 'deposit', ...filterData })
      .then((res) => setDepositStatement(res?.data?.data))
  }

  const handleformchange = (event: any) => {
    const filterObj = filterData
    filterObj[event.target.name] = event.target.value
    setFilterData(filterObj)
  }

  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getAccountStmt(1)
  }

  const onSuggestionsFetchRequested = ({ value }: any) => {
    return userService.getUserListSuggestion({ username: value })
  }
  const onSelectUser = (username: any) => {
    setFilterData({ ...filterData, username: username })
  }
  const getDepositUpdateStatus = async (item: any, type: string) => {
    if (type == 'rejected') {
      setRejectedModal(true)
      setRejectedData(item)
    } else {
      const obj = {
        id: item._id,
        narration: item.remark,
        balanceUpdateType: 'D',
        status: type,
      }
      const response = await depositWithdrawService.updateDepositWithdrawStatus(obj)
      try {
        if (response?.data) {
          getAccountStmt(1)
          toast.success(response?.data?.message)
        }
      } catch (error) {
        toast.error(response?.data?.message)
      }
    }
  }
  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Deposit Statements')}
      <div className='container-fluid'>
        <div className='row'>
          <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
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
                      onChangeSelectValue={onSelectUser}
                    />
                  </div>
                  <div className='col-6 col-lg-2 mbc-5'>
                    <div className='form-group mb-0'>
                      <label className='label'>Start Date</label>
                      <div className='mx-datepicker'>
                        <div className='mx-input-wrapper'>
                          <input
                            name='startDate'
                            type='date'
                            autoComplete='off'
                            onChange={handleformchange}
                            defaultValue={filterData.startDate}
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
                            type='date'
                            autoComplete='off'
                            defaultValue={filterData.endDate}
                            onChange={handleformchange}
                            placeholder='Select Date'
                            className='mx-input ng-untouched ng-pristine ng-valid'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-12 col-lg-2 mbc-5'>
                    <div className='form-group mb-0'>
                      <label className='label'>Type</label>
                      <select
                        name='reportType'
                        onChange={handleformchange}
                        className='custom-select ng-untouched ng-pristine ng-valid'
                      >
                        <option value=''>All </option>
                        <option value='approved'>Approved</option>
                        <option value='pending'>Pending</option>
                        <option value='rejected'>Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className='col-12 col-lg-1 mbc-5'>
                    <label className='label'>&nbsp;</label>
                    <button type='submit' className='btn btn-primary btn-block'>
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className='card-body'>
              <div className='table-responsive'>
                <table className='table table-bordered' id='customers1'>
                  <thead>
                    <tr>
                      <th
                        className='bg2 text-white'
                        style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}
                      >
                        Date
                      </th>
                      <th
                        className='bg2 text-white'
                        style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}
                      >
                        User Name
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Details
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Approved By
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Request Type
                      </th>
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Amount
                      </th>
                      {/* <th className='bg2 text-white' style={{ width: '35%', textAlign: 'center' }}>
                        Bank Name
                      </th> */}
                      <th className='bg2 text-white' style={{ width: '10%', textAlign: 'center' }}>
                        Status
                      </th>
                      <th className='bg2 text-white' style={{ width: '35%', textAlign: 'center' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositStatement ? (
                      depositStatement.map((item: any) => (
                        <tr key={item._id}>
                          <td style={{ textAlign: 'center' }}>
                            {moment(item.createdAt).format('DD/MM/YYYY h:mm:ss A')}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.username}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              data-toggle='modal'
                              data-target='#bankModal'
                              onClick={() => handleClick(item)}
                            >
                              View
                            </button>
                          </td>
                          <td></td>
                          <td style={{ textAlign: 'center' }}>{item.type}</td>
                          <td style={{ textAlign: 'center' }}>{item.amount}</td>
                          <td style={{ textAlign: 'center' }}>
                            {' '}
                            {item.status == 'rejected' ? (
                              <p style={{ color: 'red', textTransform: 'capitalize' }}>
                                {item.status}
                              </p>
                            ) : item.status == 'pending' ? (
                              <p style={{ color: 'orange', textTransform: 'capitalize' }}>
                                {item.status}
                              </p>
                            ) : (
                              <p style={{ color: 'green', textTransform: 'capitalize' }}>
                                {item.status}
                              </p>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {item.status == 'pending' ? (
                              <div
                                style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
                              >
                                <button onClick={() => getDepositUpdateStatus(item, 'approved')}>
                                  Approved
                                </button>
                                <button onClick={() => getDepositUpdateStatus(item, 'rejected')}>
                                  Rejected
                                </button>
                              </div>
                            ) : (
                              <p>-</p>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className='text-center'>
                          No Result Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <ReactPaginate
                breakLabel='...'
                nextLabel='>>'
                // onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                breakClassName={'break-me'}
              />
            </div>
          </div>
          <BankDetailModal bankDetails={bankDetails} />
          <RejectedModal
            show={rejectedModal}
            close={() => setRejectedModal(!rejectedModal)}
            data={rejectedData}
          />
        </div>
      </div>
    </>
  )
}

export default DepositStatement
