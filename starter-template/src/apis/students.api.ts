// file lưu các hàm call api
// Vì json-server hỗ trợ phân trang nên mình truyền thêm 2 param là page và limit

import { Students } from 'types/students.type'
import http from 'utils/http'

export const getStudents = (page: string | number, limit: string | number) =>
  http.get<Students>('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })
