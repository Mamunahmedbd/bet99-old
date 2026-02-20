import api from '../utils/api'

class PostService {
  getPosts() {
    return api.get('posts')
  }
}
export default new PostService()
