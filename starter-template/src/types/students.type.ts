// Khi code ts thì nên có những định nghĩa đầu vào cũng như đầu ra của dữ liệu
// Định nghĩa cho riêng 1 student
export interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: string
  country: string
  avatar: string
  btc_address: string
}

// Đối với StudentList thì các key của mỗi item lại khác nên cần fix lại
//Pick của ts giữ lại các key cần thiết của interface
export type Students = Pick<Student, 'id' | 'email' | 'avatar' | 'last_name'>[]
