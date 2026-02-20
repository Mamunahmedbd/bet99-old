const Footer = () => {
  return (
    <footer>
      <div className='modal fade' id='modal-user-detail'>
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title'>User Detail</h4>
              <button type='button' className='close' data-dismiss='modal'>
                ×
              </button>
            </div>
            <div className='modal-body' id='search-user-details' />
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer
