import React from "react"

const ResultListItem = (props: any) => {
  const { item, index, dateString, setPopupData } = props
  const getround = (ro: string) => {
    const sp = ro.split('.')
    return sp[1]
  }
  return (
    <>
      <tr key={index}>
        <td className='text-center'>{index + 1}</td>
        <td className='text-center'>
          {dateString}
        </td>
        <td className='text-center'>
          <a
            href='javascript:void(0);'
            style={{ color: 'blue' }}
            onClick={() => {
              setPopupData(item)
            }}
          >
            {item.mid ? getround(item.mid) : null}
          </a>
        </td>

        <td className='text-center'>
        {item?.data?.winnerName} - {item.gameType}
        </td>
      </tr>
    </>
  )
}
export default React.memo(ResultListItem)