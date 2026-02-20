const MemoOdds = (props: any) => {
    const {marketData } = props;
  return (
        <>
          <td>
            <button className='back'>
              <span className='odd'>{marketData && marketData[0]}</span>
            </button>
          </td>
          <td>
            <button className='lay'>
              <span className='odd'>{marketData && marketData[1]}</span>
            </button>
          </td>
          <td>
            <button className='back'>
              <span className='odd'>{marketData && marketData[2]}</span>
            </button>
          </td>
          <td>
            <button className='lay'>
              <span className='odd'>{marketData && marketData[3]}</span>
            </button>
          </td>
          <td>
            <button className='back'>
              <span className='odd'>{marketData && marketData[4]}</span>
            </button>
          </td>
          <td>
            <button className='lay'>
              <span className='odd'>{marketData && marketData[5]}</span>
            </button>
          </td>
        </>
      )
}
export default MemoOdds
