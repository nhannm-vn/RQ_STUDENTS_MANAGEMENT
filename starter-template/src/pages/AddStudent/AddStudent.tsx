import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addStudent, getStudent, updateStudent } from 'apis/students.api'
import { useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Student } from 'types/students.type'
import { isAxiosError } from 'utils/utils'

// Tạo type riêng cho form
type FormStateType = Omit<Student, 'id'>

// Tạo initialState
const initialFormState: FormStateType = {
  avatar: '',
  email: '',
  btc_address: '',
  country: '',
  first_name: '',
  gender: 'Other',
  last_name: ''
}

// Tạo type cho Error
type FormError =
  | {
      [key in keyof FormStateType]: string
    }
  | null

export default function AddStudent() {
  const queryClient = useQueryClient()
  // Tạo state để lưu dữ liệu khi submit form
  const [formState, setFormState] = useState<FormStateType>(initialFormState)

  // Đây là một hook của react-router giúp mình biết được url matches với param nào trên đường dẫn
  const addMatch = useMatch('/students/add')
  // Mình sẽ sử dụng /add thay vì /:id vì nó sẽ handle tốt hơn
  //nếu sử dụng /:id thì nó bao luôn /add. Còn nếu ngược lại thì tốt hơn

  // Biến check xem đang ở mode nào
  //nếu ở mode add thì sẽ có data còn nếu ở mode edit thì không có data
  const isAddMode = Boolean(addMatch)

  // Dùng useParam để lấy id của đường dẫn
  //hook này của react-router sẽ dùng để lấy param dạng này :id/
  const { id } = useParams()
  // **Mỗi lần bấm vào nút edit thì sẽ get thằng đó bằng useQuery
  const studentQuery = useQuery({
    // id để nó nhận biết phân biệt giữ các student có id khác nhau
    queryKey: ['student', id],
    // Ở đây nó sẽ báo đỏ vì id có thể là undefined để fix thì cần xài cơ chế enable
    //nghĩa là có id thỏa thì mới làm. Nghĩa là từ đường dẫn lấy được param thì mới chạy

    //**Để kết hợp với việc hover vào thì dữ liệu sẽ refetch nhằm khi người
    //dùng bấm edit thì có luôn data thì cần staleTime khác để cho nó hiểu là dữ liệu
    //chưa cũ giúp nó không refetch lại
    // Nếu quá 10s thì nó mới gọi api lại
    staleTime: 10 * 1000,

    queryFn: () => getStudent(id as string),
    // .then((data) => {
    //     // Vì không còn onSuccess nên phải xài cách này
    //     //Khi fetch thì sẽ lấy cái đó hiển thị lên màn hình
    //     setFormState(data.data)
    //     // queryFn yêu cầu phải trả về cái gì nên cần return ở đây
    //     return data.data
    //   }),
    enabled: id !== undefined
  })

  // ***Vấn đề là khi xài refetchData bên kia nó sẽ không set được state và dữ liệu không hiển thị lên form
  //nghĩa là queryFn đâu có chạy đâu. Mà nếu không chạy thì lấy gì có dữ liệu hiện lên form
  //****Nghĩa là bên kia chạy preFretch api với queryFn khác với queryFn bên này. Nên onSuccess cũng khác nhau
  useEffect(() => {
    if (studentQuery.data) {
      setFormState(studentQuery.data.data)
    }
  }, [studentQuery.data])

  // Dùng useMutation để add dữ liệu lên
  //{ mutate, data, error, reset, mutateAsync }
  const addStudentMutation = useMutation({
    mutationFn: (body: FormStateType) => {
      return addStudent(body)
    }
  })

  // updateStudentMutation
  // id này được lấy từ đường dẫn ở trên
  const updateStudentMutation = useMutation({
    mutationFn: (_) => updateStudent(id as string, formState),
    // Khi update thành công thì mình mong muốn sẽ cập nhật lại trên giao diện liền luôn
    //vì vậy mà mình sẽ cập nhật trong cache thông qua queryClient
    onSuccess: (data) => {
      queryClient.setQueryData(['student', id], data)
    }
  })

  // Dùng useMemo để hạn chế tính toán lỗi mỗi lần re-render component
  const errorForm = useMemo(() => {
    // Vì mình sử dụng chung một server và lỗi khá giống nhau nên mình sẽ config ở đây
    //sẽ có hai chế độ là add và update
    const error = isAddMode ? addStudentMutation.error : updateStudentMutation.error
    if (isAxiosError<{ error: FormError }>(error) && error.response?.status === 422) {
      return error.response.data.error
    }
    return null
  }, [addStudentMutation.error, updateStudentMutation.error, isAddMode])

  //currying
  // Mình không sợ nó chạy liền vì nó gọi một hàm khác bên trong
  const handleChange = (name: keyof FormStateType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prevState) => ({
      ...prevState,
      // Viết như này nó mới hiểu là một trong các key của mảng keyof FormStateType
      [name]: event.target.value
    }))
    // Khi thay đổi thì sẽ reset data và error bằng method reset lấy từ useMutation
    //điều này sẽ giúp cho dòng báo lỗi bị mất sau khi hiển thị lỗi
    if (addStudentMutation.data || addStudentMutation.error) addStudentMutation.reset()
  }

  // Với btn có kiểu submit thì ta sẽ khai báo cho nó một func có chức năng lấy hết các thông tin từ các ô và bấm nút submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Sau submit thành công thì clear cái form
    //tuy nhiên cẩn thận nó bất đồng bộ
    //**C2 là sử dụng mutateAsync

    // Khi submit có 2 chế độ là add hoặc edit. Điều này phụ thuộc vào chế độ

    if (isAddMode) {
      addStudentMutation.mutate(formState, {
        onSuccess: () => {
          setFormState(initialFormState)
          toast.success('Add thành công')
        }
      })
    } else {
      updateStudentMutation.mutate(undefined, {
        onSuccess: (_) => {
          // Khi thành công thì báo lên
          toast.success('Update thành công')
        }
      })
    }
  }

  return (
    <div>
      <h1 className='text-lg'>{isAddMode ? 'Add' : 'Edit'} Student</h1>
      <form className='mt-6' onSubmit={handleSubmit}>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            // type='email'
            name='floating_email'
            id='floating_email'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm
             text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-900 dark:focus:border-blue-500'
            placeholder=' '
            required
            value={formState.email}
            // Nó chạy hàm khác bên trong nên không sợ hàm mình gọi bị chạy liền
            onChange={handleChange('email')}
          />
          <label
            htmlFor='floating_email'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Email address
          </label>
          {errorForm && (
            <p className='mt-2 text-sm text-red-700'>
              <span className='font-medium'>Lỗi!</span>
              {errorForm.email}
            </p>
          )}
        </div>

        <div className='group relative z-0 mb-6 w-full'>
          <div>
            <div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-1'
                  type='radio'
                  name='gender'
                  value='Male'
                  // Checked khi mà value nó bằng với giá trị trong state form
                  checked={formState.gender === 'Male'}
                  onChange={handleChange('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
                <label htmlFor='gender-1' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Male
                </label>
              </div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-2'
                  type='radio'
                  name='gender'
                  value='Female'
                  checked={formState.gender === 'Female'}
                  onChange={handleChange('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
                <label htmlFor='gender-2' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Female
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  id='gender-3'
                  type='radio'
                  name='gender'
                  value='Other'
                  checked={formState.gender === 'Other'}
                  onChange={handleChange('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
                <label htmlFor='gender-3' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='text'
            name='country'
            id='country'
            value={formState.country}
            // Nó chạy hàm khác bên trong nên không sợ hàm mình gọi bị chạy liền
            onChange={handleChange('country')}
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-900 dark:focus:border-blue-500'
            placeholder=' '
            required
          />
          <label
            htmlFor='country'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Country
          </label>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='tel'
              // pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
              name='first_name'
              id='first_name'
              value={formState.first_name}
              onChange={handleChange('first_name')}
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-900 dark:focus:border-blue-500'
              placeholder=' '
              required
            />
            <label
              htmlFor='first_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              First Name
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='last_name'
              id='last_name'
              value={formState.last_name}
              onChange={handleChange('last_name')}
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-900 dark:focus:border-blue-500'
              placeholder=' '
              required
            />
            <label
              htmlFor='last_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Last Name
            </label>
          </div>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='avatar'
              id='avatar'
              value={formState.avatar}
              onChange={handleChange('avatar')}
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-900 dark:focus:border-blue-500'
              placeholder=' '
              required
            />
            <label
              htmlFor='avatar'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Avatar Base64
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='btc_address'
              id='btc_address'
              value={formState.btc_address}
              onChange={handleChange('btc_address')}
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-900 dark:focus:border-blue-500'
              placeholder=' '
              required
            />
            <label
              htmlFor='btc_address'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              BTC Address
            </label>
          </div>
        </div>

        {isAddMode && (
          <button
            type='submit'
            className='me-2 mb-2 rounded-lg bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-800'
          >
            Add
          </button>
        )}
        {!isAddMode && (
          <button
            type='submit'
            className='me-2 mb-2 rounded-lg bg-gradient-to-r from-green-400 via-green-500 to-green-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800'
          >
            Update
          </button>
        )}
      </form>
    </div>
  )
}
