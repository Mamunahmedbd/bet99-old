export interface Paginate<T> {
  docs: T
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
  nextPage: number
  offset: number
  page: number
  pagingCounter: number
  prevPage: number | null
  totalDocs: number
  totalPages: number
}
