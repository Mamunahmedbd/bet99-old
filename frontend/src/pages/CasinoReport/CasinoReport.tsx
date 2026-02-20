import React from 'react'
import ReactPaginate from 'react-paginate'
import { toast } from 'react-toastify'
import UserService from '../../services/user.service'
import moment from 'moment'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'

const CasinoReport = () => {
  const [bethistory, setbethistory] = React.useState<any>({})
  const [filterdata, setfilterdata] = React.useState<any>({
    startDate: '',
    endDate: '',
    status: 'pending',
  })
  const [page, setPage] = React.useState(1)
  const [isLoading, setloading] = React.useState<any>(false)
  React.useEffect(() => {
    const filterObj = filterdata
    filterObj.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    filterObj.endDate = moment().format('YYYY-MM-DD')
    setfilterdata(filterObj)
    getbethistory(1)
  }, [])

  const getbethistory = (page: number) => {
    UserService.getUsercompletedbets(page, filterdata)
      .then((res) => {
        setbethistory(res.data.data)
      })
      .catch((e) => {
        const error = e.response.data.message
        toast.error(error)
      })
  }
  const createSrNo = (index: number) => {
    return (page - 1) * bethistory.limit + index + 1
  }
  const trrepeat = (Item: any, index: number) => {
    const classdata = Item.isBack ? 'back' : 'lay'
    return (
      <>
        <tr key={index} className={classdata}>
          <td>{createSrNo(index)}</td>
          <td className='text-center'>{Item.matchName}</td>
          <td className='text-center'>{Item.selectionName}</td>
          <td className='text-center'>{Item.sportId}</td>
          <td className='text-center'>{Item.marketName}</td>
          <td className='text-center'>{Item.odds}</td>
          <td className='text-center'>{Item.stack}</td>
          <td className='text-center'>
            {moment(Item.createdAt.replace('T', ' ').replace('Z', '')).format(
              'YYYY-MM-DD HH:mm:ss',
            )}
          </td>
        </tr>
      </>
    )
  }
  const handleformchange = (event: any) => {
    const filterObj = filterdata
    filterObj[event.target.name] = event.target.value
    setfilterdata(filterObj)
  }
  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getbethistory(1)
  }
  const handlePageClick = (event: any) => {
    getbethistory(event.selected + 1)
  }

  const TransactionData =
    bethistory && bethistory.result && bethistory.result.length ? (
      bethistory.result.map((item: any, index: number) => {
        return trrepeat(item, index)
      })
    ) : isLoading ? (
      <tr>
        <td colSpan={8} style={{ textAlign: 'center' }}>
          Please wait
        </td>
      </tr>
    ) : (
      <tr>
        <td colSpan={8} style={{ textAlign: 'center' }}>
          No Result Found
        </td>
      </tr>
    )

  return (
    <>
      {mobileSubheader.subheader('Casino Bet History')}
      <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
        <div className=''>
          {mobileSubheader.subheaderdesktop('Casino Bet History')}
          <div className='card-body p0'>
            <form
              className='ng-pristine ng-valid ng-touched mb-0'
              method='post'
              onSubmit={handleSubmitform}
            >
              <div className='row row5'>
                <div className='col-6 col-lg-2 mbc-5'>
                  <div className='form-group mb-0'>
                    <div className='mx-datepicker'>
                      <div className='mx-input-wrapper'>
                        <input
                          name='startDate'
                          type='date'
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
                    <div className='mx-datepicker'>
                      <div className='mx-input-wrapper'>
                        <input
                          name='endDate'
                          type='date'
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
                <div className='col-12 col-lg-2 mbc-5'>
                  <div className='form-group mb-0'>
                    <select
                      name='reportType'
                      onChange={handleformchange}
                      className='custom-select ng-untouched ng-pristine ng-valid'
                    >
                      <option value='ALL'>All </option>
                    </select>
                  </div>
                </div>
                <div className='col-12 col-lg-1 mbc-5'>
                  <button type='submit' className='btn btn-primary btn-block'>
                    Submit
                  </button>
                </div>
              </div>
            </form>
            <div className='table-responsive'>
              <table id='customers1'>
                <thead>
                  <tr>
                    <th
                      scope='col'
                      className='text-center bg2 text-white'
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <span>Amount</span>
                    </th>
                    <th
                      scope='col'
                      className='text-center bg2 text-white'
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <span>Game Id</span>
                    </th>
                    <th
                      scope='col'
                      className='text-center bg2 text-white'
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <span>Game Name</span>
                    </th>
                    <th scope='col' className='text-center bg2 text-white'>
                      <span>Balance</span>
                    </th>
                    <th scope='col' className='text-center bg2 text-white'>
                      <span>Remark</span>
                    </th>
                    <th scope='col' className='text-center bg2 text-white wnwrap'>
                      <span>Date & Time</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className='text-center'>
                      No Result Found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ReactPaginate
              breakLabel='...'
              nextLabel='>>'
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={bethistory.totalPages}
              containerClassName={'pagination'}
              activeClassName={'active'}
              previousLabel={'<<'}
              breakClassName={'break-me'}
            />
          </div>
        </div>
      </div>
    </>
  )
}
export default CasinoReport
