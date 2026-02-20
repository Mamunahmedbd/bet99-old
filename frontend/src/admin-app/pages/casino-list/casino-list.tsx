import React, { MouseEvent } from 'react'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { isMobile } from 'react-device-detect'
import ICasinoMatch from '../../../models/ICasinoMatch'
import casinoService from '../../../services/casino.service'
import { AxiosResponse } from 'axios'

const CasinoList = () => {
  const [casinoList, setCasinoList] = React.useState<ICasinoMatch[]>([])

  React.useEffect(() => {
    casinoService.getCasinoList().then((res: AxiosResponse<{ data: ICasinoMatch[] }>) => {
      setCasinoList(res.data.data)
    })
  }, [])

  const onChecked = (e: MouseEvent<HTMLInputElement>, item: ICasinoMatch, index: number) => {
    const items = [...casinoList]
    items[index] = { ...item, isDisable: !item.isDisable }
    setCasinoList(items)
    casinoService
      .disableCasino(`${item.match_id}`)
      .then((res: AxiosResponse<{ data: ICasinoMatch[] }>) => {
        //
      })
  }

  const TransactionData = casinoList.length ? (
    casinoList.map((item: ICasinoMatch, index: number) => {
      return (
        <tr key={index}>
          <td className='text-center'>{item.title}</td>
          <td className='text-center wnwrap'>{item.slug}</td>
          <td className={`text-center wnwrap`}>
            <input
              type={'checkbox'}
              checked={item.isDisable}
              onClick={(e) => onChecked(e, item, index)}
            />
          </td>
        </tr>
      )
    })
  ) : (
    <tr>
      <td colSpan={8} style={{ textAlign: 'center' }}>
        No Result Found
      </td>
    </tr>
  )
  return (
    <>
      {mobileSubheader.subheaderdesktopadmin('Casino List')}
      <div className='container-fluid'>
        <div className='row'>
          <div className={!isMobile ? 'col-md-12 mt-1' : 'col-md-12 padding-custom'}>
            <div className=''>
              <div className='card-body'>
                <div className='table-responsive'>
                  <table id='customers1'>
                    <thead>
                      <tr>
                        <th className='text-center bg2 text-white wnwrap'>Name</th>
                        <th className='text-center bg2 text-white wnwrap'>Slug</th>
                        <th className='text-center bg2 text-white wnwrap'>Action</th>
                      </tr>
                    </thead>
                    <tbody>{TransactionData}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default CasinoList
