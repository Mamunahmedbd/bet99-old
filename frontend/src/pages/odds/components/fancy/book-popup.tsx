import React from 'react'
import ReactModal from 'react-modal'
import bookService from '../../../../services/book.service'
import { AxiosResponse } from 'axios'
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks'
import { FancyBook, selectBookFancy, setBookFancy } from '../../../../redux/actions/bet/betSlice'

const BookPopup = () => {
  const bookFancy: FancyBook = useAppSelector(selectBookFancy)
  const dispatch = useAppDispatch()
  const [book, setBook] = React.useState<Record<string, number>>({})
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (bookFancy.matchId) {
      bookService.getFancyBook(bookFancy).then((res: AxiosResponse) => {
        setBook(res.data.data)
        setIsOpen(true)
      })
    }
  }, [bookFancy])
  const close = () => {
    dispatch(setBookFancy({} as FancyBook))
    setIsOpen(false)
  }
  return <>
    

    <ReactModal
      isOpen={isOpen}
      onRequestClose={(e: any) => {
        close()
      }}
      contentLabel='Fancy Book'
      className={'modal-dialog modal-sm'}
      ariaHideApp={false}
    >
      <div className='modal-content'>
        <div className='modal-header'>
          <h5>Run Position</h5>
          <span onClick={close} className='float-right'>
            X
          </span>
        </div>
        <table className='table'>
          {Object.keys(book).length > 0 &&
            Object.keys(book).map((itemKey) => (
              <tr key={itemKey} className={book[itemKey] < 0 ? 'lay' : 'back'}>
                <td>{itemKey}</td>
                <td className={book[itemKey] < 0 ? 'red' : 'green'}>{book[itemKey]}</td>
              </tr>
            ))}
        </table>
      </div>
    </ReactModal>
    </>
}

export default BookPopup
