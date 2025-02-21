import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getStudents } from 'apis/students.api'
import classNames from 'classnames'
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
    queryFn: () => getStudents(page, 10),
    // Note:
    // Mặc định staleTime sẽ là 0 và sẽ gọi api mỗi khi bấm vào
    //nghĩa là mới bấm vào thì nó sẽ hết hạn luôn
    //khi ta set thơi gian cho nó thì nó sẽ thay đổi và sẽ không fetch lại nữa. Nó gọi nhưng dữ liệu lưu trên cache chưa bị xóa do chưa hết thời gian
    //nghĩa là nếu mà set staleTime thì nó sẽ không fetch lại api(vì nó chưa hết hạn)

    //Nghĩa là khi bấm qua trang khác và bấm lại thì nó chưa hết thời gian liền mà sẽ còn thời gian
    //vì vậy là stale sẽ khác 0 và sẽ chưa bị fetch api lại
    // muốn nó xóa và lưu dữ liệu mới thì phải set thời gian xóa cache cụ thể là set gcTime(nghĩa là xóa dữ liệu cache)
    // staleTime: 60 * 1000,

    // Như mình biết khi nó chưa cũ nghĩa là còn staleTime khác 0 thì nó sẽ không gọi api
    // tuy nhiên do mình set thời gian xóa cache nhanh nên dẫn đến không còn bộ nhớ tạm
    // thì lúc này kiểu gì nó cũng phải fetch api lại

    // Nghĩa là dù staleTime vẫn còn thời gian nên chưa fetch lại tuy nhiên gcTime hay cacheTime hết nên sẽ xóa dữ liệu cache
    // và từ đó dẫn đến luôn luôn fetch api lại
    // gcTime: 5 * 1000

    // ***Thướng thì ngta sẽ set gcTime > staleTime

    // Điều này là tối ưu UX trải nghiệm người dùng
    // nó sẽ giúp cho nó không hiện skeleton lên khi chuyển trang(nghĩa là không giật)
    // Giải thích:
    //****Từ trang 1 chuyển sang trang hai thì data sẽ chưa có nghĩa là undefined
    //thì khi đó sẽ là isLoading(dành cho data) mà vì có nó nên skeleton sẽ giật vì data undefined`
    // keepPreviousData nó sẽ giúp cho isLoading vẫn là false và giữ data trước đó
    //khi nó fetch thành công data số 2 thì nó mới cập nhật ra cho chúng ta

    placeholderData: keepPreviousData
  })

  // Cách lấy số lượng student và từ đó biết được có bao nhiêu trang
  //mình sẽ lấy tròn lên chứ nếu tròn xuống sẽ không đủ trang để hiển thị số lượng sinh viên

  // Lúc chưa tính được số lượng trang thì cũng chẳng sao vì lúc đó đã có skeleton hiện ra nên mình không sợ
  //nó không hiện số lượng phân trang dưới
  const totalStudentsCount = Number(data?.headers['x-total-count']) || 0
  const totalPage = Math.ceil(totalStudentsCount / LIMIT)
  console.log(totalPage)

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
                  {page === 1 ? (
                    <span className='cursor-not-allowed rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Previous
                    </span>
                  ) : (
                    <Link
                      to={`/students?page=${page - 1}`}
                      className='rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    >
                      Previous
                    </Link>
                  )}
                </li>
                {/* Tạo cái mảng có số lượng phần tử totalPage để dễ dàng mmap ra */}
                {Array(totalPage)
                  .fill(0)
                  .map((_, index) => {
                    // Lấy index cộng thêm nữa mới ra số page chính xác
                    const pageNumber = index + 1
                    // Dựa vào page của url và pageNumber hiện tại để hiện actived
                    const isActive = page === pageNumber
                    return (
                      <li key={pageNumber}>
                        <Link
                          className={classNames(
                            'border border-gray-300 py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                            {
                              'bg-gray-100 text-gray-700': isActive,
                              'bg-white': !isActive
                            }
                          )}
                          to={`/students?page=${pageNumber}`}
                        >
                          {pageNumber}
                        </Link>
                      </li>
                    )
                  })}
                <li>
                  {/* check xem đường link có page là cuối cùng hay chưa */}
                  {page === totalPage ? (
                    <span className='cursor-not-allowed rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Next
                    </span>
                  ) : (
                    <Link
                      to={`/students?page=${page + 1}`}
                      className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    >
                      Next
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </Fragment>
      )}
    </div>
  )
}

/**
 * Khi đường link thay đổi thì nó sẽ lấy số liệu trên đường link để chạy getStudents
 * nó sẽ tự phát hiện sự thay đổi của đường link từ đó dẫn tới sự thay đổi của biến page
 * mà biến page được đặt trong mảng queryKey nên nó sẽ nhận biết sự thay đổi mà gọi lấy dữ liệu
 */
