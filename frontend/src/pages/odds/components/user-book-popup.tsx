import React from 'react'
import ReactModal from 'react-modal'
import bookService from '../../../services/book.service'
import { AxiosResponse } from 'axios'
import { useAppSelector, useAppDispatch } from '../../../redux/hooks'
import {
  FancyBook,
  selectBookMarketUser,
  setMarketBookUser,
} from '../../../redux/actions/bet/betSlice'

const UserBookPopup = () => {
  const bookMarketUser: FancyBook = useAppSelector(selectBookMarketUser)
  const dispatch = useAppDispatch()
  const [book, setBook] = React.useState<Array<0>>([])
  const [market, setMarketRunners] = React.useState<Array<0>>([])
  const [isOpen, setIsOpen] = React.useState(false)
  React.useEffect(() => {
    if (bookMarketUser.matchId) {
      bookService.getUserwiseBook(bookMarketUser).then((res: AxiosResponse) => {
        setBook(res.data.data.completeBookList)
        setMarketRunners(res.data.data.markets)
        setIsOpen(true)
      })
    }
  }, [bookMarketUser])
  const close = () => {
    dispatch(setMarketBookUser({} as FancyBook))
    setIsOpen(false)
  }
  return <>
 
    <ReactModal
      isOpen={isOpen}
      onRequestClose={(e: any) => {
        close()
      }}
      contentLabel='Fancy Book'
      className={'modal-dialog modal-lg'}
      ariaHideApp={false}
    >
      <div className='modal-content'>
        <div className='modal-header'>
          <h5>{bookMarketUser.marketName} Book</h5>
          <span onClick={close} className='float-right'>
            <i className='fa fa-times-circle'></i>
          </span>
        </div>
        <table className='table'>
          <tr>
            <th>Username</th>
            {market.map((Item: any, index: number) => {
              return <th key={index}>{Item.runnerName}</th>
            })}
          </tr>

          {book.length > 0 ? (
            book.map((Item: any, index: number) => {
              return (
                <tr key={index}>
                  <td>{Item.username}</td>
                  {market.map((ItemRunners: any, indexRunner: number) => {
                    return (
                      <td key={index + indexRunner}>
                        {Item[`${bookMarketUser.selectionId}_${ItemRunners.selectionId}`]?.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={5} className='text-center'>
                No Result Found
              </td>
            </tr>
          )}
        </table>
      </div>
    </ReactModal>
    </>
}

export default UserBookPopup
