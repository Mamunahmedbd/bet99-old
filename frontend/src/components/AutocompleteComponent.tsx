import * as React from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import { AxiosResponse } from 'axios'
import { useAppSelector } from '../redux/hooks'
import { selectLoader } from '../redux/actions/common/commonSlice'
import { debounce } from '@mui/material'
interface AutoCompleteComponentProps<T> {
  optionKey: keyof T
  label: string
  className: string
  api: (request: { value: string }) => Promise<AxiosResponse<readonly T[]>>
  onClick: (data: T | null) => void
}

const AutoCompleteComponent = <T extends Record<string, any>>({
  optionKey = 'username',
  label = 'Search',
  api,
  onClick,
  ...rest
}: AutoCompleteComponentProps<T>) => {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<readonly T[]>([])
  const [value, setValue] = React.useState<T | null>(null)
  const [inputValue, setInputValue] = React.useState('')
  const [eventType, setEventType] = React.useState('')
  const loading = useAppSelector(selectLoader)

  const fetch = React.useMemo(
    () =>
      debounce((request: { input: string }, callback: (results?: readonly T[]) => void) => {
        api({ value: request.input }).then((res: AxiosResponse) => {
          callback(res.data.data)
        })
      }, 400),
    [],
  )

  React.useEffect(() => {
    let active = true

    if (inputValue === '') {
      setOptions(value ? [value] : [])
      return undefined
    }

    if (eventType === 'click') {
      onClick(value)
      return undefined
    }

    fetch({ input: inputValue }, (results?: readonly T[]) => {
      if (active) {
        let newOptions: readonly T[] = []

        if (value) {
          newOptions = [value]
        }

        if (results) {
          newOptions = [...newOptions, ...results]
        }

        setOptions(newOptions)
      }
    })

    return () => {
      active = false
    }
  }, [value, inputValue, fetch])

  return (
    <Autocomplete
      {...rest}
      value={value}
      id='asynchronous-demo'
      sx={{ width: 300 }}
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      isOptionEqualToValue={(option: T, value) => option[optionKey] === value[optionKey]}
      getOptionLabel={(option) => option[optionKey]}
      onChange={(event: any, newValue: T | null) => {
        setEventType(event.type)
        setOptions(options)
        setValue(newValue)
      }}
      options={options}
      loading={loading}
      onInputChange={(event, newInputValue) => {
        setEventType(event.type)
        setInputValue(newInputValue)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size='small'
          variant='filled'
          placeholder='Search event name'
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default AutoCompleteComponent
