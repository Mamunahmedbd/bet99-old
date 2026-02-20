import React, { useState } from 'react'
import ResultListItem from './ResultListItem'
import mobileSubheader from '../../../../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import moment from 'moment'
import casinoService from '../../../../../services/casino.service'
import { AxiosResponse } from 'axios'
import { useParams } from 'react-router-dom'
import CasinoResultDetail from '../../../CasinoResultDetail'
import ReactPaginate from 'react-paginate'

const ResultList = (props: any) => {
  const [currentItems, setCurrentItems] = useState<any>({})
  const [filterdata, setfilterdata] = React.useState<any>({
    startDate: '',
    matchid: '',
    roundId: '',
  })
  const handleformchange = (event: any) => {
    const filterObj = filterdata
    filterObj[event.target.name] = event.target.value
    setfilterdata(filterObj)
  }
  const params = useParams()
  const [games, setCasinoGames] = React.useState<Array<any>>([])

  const [popupdata, setPopData] = React.useState<any>({})
  const [popupstatus, setPopStatus] = React.useState<any>(false)
  React.useEffect(() => {
    const filterObj = filterdata
    filterObj.startDate = moment().format('YYYY-MM-DD')
    filterObj.matchid = params.matchid
    setfilterdata(filterObj)
    casinoService.getCasinoList().then((res: AxiosResponse<any>) => {
      setCasinoGames(res.data.data)
    })
    getdata(1)
  }, [])

  const setPopupData = (Item: any) => {
    // eslint-disable-next-line camelcase
    setPopData({ slug: Item.gameType, mid: Item.mid, event_data: { title: params.matchid } })
    setPopStatus(true)
  }
  const getdata = (page: any) => {
    casinoService.getResultList(filterdata, page).then((res: AxiosResponse<any>) => {
      setCurrentItems(res.data.data)
    })
  }
  const handleSubmitform = (event: any) => {
    event.preventDefault()
    getdata(1)
  }
  const TransactionData = () => {
    return currentItems && currentItems.docs && currentItems.docs.length ? (
      currentItems.docs.map((item: any, index: number) => {
        return (
          <ResultListItem
            game_id={filterdata.matchid}
            key={index}
            item={item}
            index={index}
            offset={0}
            dateString={filterdata.startDate}
            setPopupData={setPopupData}
          />
        )
      })
    ) : (
      <tr>
        <td colSpan={9} style={{ textAlign: 'center' }}>
          No Result Found
        </td>
      </tr>
    )
  }

  const handlePageClick = (event: any) => {
    getdata(event.selected + 1)
  }
  return (
    <>
      {mobileSubheader.subheader('Casino Result')}
      <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
        <div className=''>
          {mobileSubheader.subheaderdesktop('Casino Result')}
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
                        <select
                          className='form-control'
                          name='matchid'
                          onChange={handleformchange}
                          defaultValue={filterdata.matchid}
                        >
                          <option value={''}>Select Game</option>
                          {games &&
                            games.length > 0 &&
                            games.map((Item: any, index: number) => {
                              return (
                                <option
                                  selected={filterdata.matchid == Item.slug}
                                  key={index}
                                  value={Item.slug}
                                >
                                  {Item.title}
                                </option>
                              )
                            })}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-6 col-lg-2 mbc-5'>
                  <div className='form-group mb-0'>
                    <div className='mx-datepicker'>
                      <div className='mx-input-wrapper'>
                        <input
                          name='roundId'
                          type='text'
                          autoComplete='off'
                          onChange={handleformchange}
                          defaultValue={filterdata.roundId}
                          placeholder='Round Id'
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
                    <th className='text-center bg2 text-white '>No</th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      Date Time
                    </th>
                    <th className='text-center bg2 text-white ' style={{ whiteSpace: 'nowrap' }}>
                      RoundId
                    </th>
                    <th className='text-center bg2 text-white '>Winner</th>
                  </tr>
                </thead>
                <tbody>{TransactionData()}</tbody>
              </table>
            </div>
            <div style={{ overflow: 'scroll' }}>
              <ReactPaginate
                breakLabel='...'
                nextLabel='>>'
                onPageChange={handlePageClick}
                pageRangeDisplayed={1}
                pageCount={currentItems.totalPages}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                breakClassName={'break-me'}
              />
            </div>
          </div>
        </div>
      </div>
      <CasinoResultDetail
        popupdata={popupdata}
        setPopStatus={setPopStatus}
        popupstatus={popupstatus}
      />
    </>
  )
}
export default React.memo(ResultList)
