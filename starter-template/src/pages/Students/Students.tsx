import { useQuery } from '@tanstack/react-query'
import { getStudents } from 'apis/students.api'
import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Students as StudentsType } from 'types/students.type'
import { useQueryString } from 'utils/utils'

const LIMIT = 10

export default function Students() {
  // // Mình sẽ xài axios và lấy dữ liệu xuống
  // //lấy dữ liệu bằng useEffect call lần đầu
  // // state dùng để lưu dữ liệu
  // const [students, setStudents] = useState<StudentsType>([])
  // // state dùng để hiện trang thái loading
  // const [isLoading, setIsLoading] = useState<boolean>(true)

  // // useEffect chạy một lần để set dữ liệu vào state
  // useEffect(() => {
  //   getStudents(1, 10)
  //     .then((res) => {
  //       setStudents(res.data)
  //     })
  //     // Sau khi có dữ liệu rồi thì tắt loading
  //     .finally(() => {
  //       setIsLoading(false)
  //     })
  // }, [])

  // Nếu không dùng cách useEffect để lấy dữ liệu thì mình sẽ thông qua react-query

  // Đầu tiên thông qua useSearchParams để lấy thông tin trên đường dẫn
  const queryString: { page?: string } = useQueryString()
  // Nếu trường hợp chưa có trang nào hoặc chưa có gì thì Number(underfined) = NaN
  //lúc này mình sẽ cho mặc định là trang 1 luôn
  const page = Number(queryString.page) || 1

  // Cách call api bằng useQuery kết hợp cùng với axios
  //react-query sẽ giúp mình quản lí các state lưu trữ tốt hơn
  const { data, isLoading } = useQuery({
    // Các key 'students' sẽ giúp mình sau này có thể refetch hoặc nhận biết thằng nào đang chạy
    // Còn page thì sẽ giúp mình phân trang và truyền như vậy nó sẽ giúp nhận biết khi nào page thay đổi
    //thì nó sẽ chạy lại queryFunc
    queryKey: ['students', page],
    queryFn: () => getStudents(page, 10)
  })

  // Cách lấy số lượng student và từ đó biết được có bao nhiêu trang
  //mình sẽ lấy tròn lên chứ nếu tròn xuống sẽ không đủ trang để hiển thị số lượng sinh viên

  const totalStudentsCount = Number(data?.headers['x-total-count']) || 0

  return (
    <div>
      <h1 className='text-lg'>Students</h1>
      {isLoading && (
        <div role='status' className='mt-6 animate-pulse'>
          <div className='mb-4 h-4  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10 rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <span className='sr-only'>Loading...</span>
        </div>
      )}
      {!isLoading && (
        <Fragment>
          <div className='relative mt-6 overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-left text-sm text-gray-500 dark:text-gray-400'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='py-3 px-6'>
                    #
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Avatar
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Name
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Email
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    <span className='sr-only'>Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* render ra dữ liệu */}
                {data?.data.map((student) => (
                  <tr
                    key={student.id}
                    className='border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600'
                  >
                    <td className='py-4 px-6'>{student.id}</td>
                    <td className='py-4 px-6'>
                      <img
                        src={student.avatar} //
                        alt='student'
                        className='h-5 w-5'
                      />
                    </td>
                    <th scope='row' className='whitespace-nowrap py-4 px-6 font-medium text-gray-900 dark:text-white'>
                      {student.last_name}
                    </th>
                    <td className='py-4 px-6'>{student.email}</td>
                    <td className='py-4 px-6 text-right'>
                      <Link
                        to='/students/1'
                        className='mr-5 font-medium text-blue-600 hover:underline dark:text-blue-500'
                      >
                        Edit
                      </Link>
                      <button className='font-medium text-red-600 dark:text-red-500'>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-6 flex justify-center'>
            <nav aria-label='Page navigation example'>
              <ul className='inline-flex -space-x-px'>
                <li>
                  <span className='cursor-not-allowed rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                    Previous
                  </span>
                </li>
                <li>
                  <a
                    className='border border-gray-300 bg-white bg-white py-2 px-3 leading-tight text-gray-500 text-gray-500  hover:bg-gray-100 hover:bg-gray-100 hover:text-gray-700 hover:text-gray-700'
                    href='/students?page=8'
                  >
                    1
                  </a>
                </li>
                <li>
                  <a
                    className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    href='/students?page=1'
                  >
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </Fragment>
      )}
    </div>
  )
}
