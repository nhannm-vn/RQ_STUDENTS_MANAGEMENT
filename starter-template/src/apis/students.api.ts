// file lưu các hàm call api
// Vì json-server hỗ trợ phân trang nên mình truyền thêm 2 param là page và limit

import { Student, Students } from 'types/students.type'
import http from 'utils/http'

export const getStudents = (page: string | number, limit: string | number) =>
  http.get<Students>('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })

// Viết riêng method dành riêng cho gọi http và post addStudent
// Ở đây mình sẽ không có truyền cho nó id vì khi thêm mới một student thì id nó sẽ tự tạo cho mình
//trên server database
export const addStudent = (student: Omit<Student, 'id'>) => http.post<Student>('/students', student)
