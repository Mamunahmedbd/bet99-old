import React from 'react'
// import { isMobile } from 'react-device-detect'
// import AutoCompleteComponent from '../../../../components/AutocompleteComponent'
import IMatch from '../../../../models/IMatch'
import matchService from '../../../../services/match.service'
const Marqueemessge = (props: any) => {
  const [showAuto, setShowAuto] = React.useState<boolean>(false)

  const suggestion = ({ value }: any) => {
    return matchService.getMatchListSuggestion({ name: value })
  }

  const onMatchClick = (match: IMatch | null) => {
    if (match) {
      window.location.href = `/odds/${match.matchId}`
    }
  }
  return (
    <div className='marqueeheader'>
      {/* {isMobile ? (
        <span className='search float-left'>
          <a
            href='#'
            className='search-input'
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              setShowAuto(!showAuto)
            }}
          >
            <i className='fas fa-search-plus' style={{ fontSize: '24px' }} />
          </a>

          <AutoCompleteComponent<IMatch>
            className={`search-input-show col-md-10 ${showAuto ? 'show' : ''}`}
            label={'Search'}
            optionKey={'name'}
            api={suggestion}
            onClick={onMatchClick}
          />
        </span>
      ) : (
        ''
      )} */}
      <div className='marqueeN' style={{ color: "#fff" }}>
        {/* <p>{props.message}</p> */}
      </div>
    </div>
  )
}
export default Marqueemessge
