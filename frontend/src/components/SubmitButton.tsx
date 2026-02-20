import React from 'react'
import { selectLoader } from '../redux/actions/common/commonSlice'
import { useAppSelector } from '../redux/hooks'

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    React.AriaAttributes {}

export const SubmitButton: React.FC<ButtonProps> = (props) => {
  const { children, ...rest } = props
  const loading = useAppSelector(selectLoader)

  return (
    <button disabled={loading} {...rest}>
      {children}
    </button>
  )
}

export default SubmitButton
