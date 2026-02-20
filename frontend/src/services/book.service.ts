import { FancyBook } from '../redux/actions/bet/betSlice'
import api from '../utils/api'

class BookService {
  getFancyBook(fancyBook: FancyBook) {
    return api.post('get-fancy-position', fancyBook)
  }

  getUserwiseBook(fancyBook: FancyBook) {
    return api.post('get-user-wise-book', fancyBook)
  }
}
export default new BookService()
