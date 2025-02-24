// Tạo thằng chuyên dùng phân tích các param của đường dẫn

import axios, { AxiosError } from 'axios'
import { useSearchParams } from 'react-router-dom'

export const useQueryString = () => {
  const [searchParams] = useSearchParams()
  const searchParamsObject = Object.fromEntries([...searchParams])
  return searchParamsObject
}

// check axios error
// Ở Đây mình sẽ dùng thêm kĩ thuật type predicate
// nghĩa là nếu có error thì chắc chắn error đó sẽ là AxiosError<T>
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}
