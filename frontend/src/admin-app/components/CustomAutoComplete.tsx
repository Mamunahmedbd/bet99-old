import { AxiosResponse } from 'axios'
import React, { forwardRef, useImperativeHandle } from 'react'
import Autosuggest from 'react-autosuggest'

const CustomAutoComplete = forwardRef(
  (
    { onSuggestionsFetchRequested, onSelectUser, placeHolder, onSuggestionsClear }: any,
    ref: any,
  ) => {
    const [value, setValue] = React.useState('')
    const [suggestions, setSuggestions] = React.useState([])

    const onChangeAuto = (event: any, { newValue }: any) => {
      setValue(newValue)
    }

    const onFetchData = ({ value }: any) => {
      setValue(value)
      onSuggestionsFetchRequested({ value: value }).then((res: AxiosResponse) => {
        setSuggestions(res.data.data)
      })
    }

    const getSuggestionValue = (suggestion: any) => {
      onSelectUser(suggestion)
      return suggestion.username
    }

    const renderSuggestion = (suggestion: any) => (
      <div className='dropdown-item'>{suggestion.username}</div>
    )

    const inputProps = {
      placeholder: placeHolder ? placeHolder : 'Search User',
      value,
      onChange: onChangeAuto,
    }
    const onSuggestionsClearRequested = () => {
      //setValue('')
      //setSuggestions([])
    }

    useImperativeHandle(
      ref,
      () => {
        return {
          resetValue() {
            setValue('')
            setSuggestions([])
          },
        }
      },
      [],
    )

    return <>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onFetchData}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        theme={{
          suggestionsList: 'dropdown-menu show',
          input: 'mx-input',
          suggestionsContainer: 'dropdown',
        }}
      />
    </>

  },
)

export default CustomAutoComplete
