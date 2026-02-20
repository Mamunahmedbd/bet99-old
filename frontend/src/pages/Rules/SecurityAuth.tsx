import React, { useState } from 'react'
import mobileSubheader from '../_layout/elements/mobile-subheader'
import { useAppSelector } from '../../redux/hooks'
import { selectRules } from '../../redux/actions/common/commonSlice'

const SecurityAuth = (props: any) => {
  const { classData } = props
  const [activeTab, setActiveTab] = useState<string>('')
  const activeRules = useAppSelector(selectRules)

  return (
    <>
      {mobileSubheader.subheader('Secure Auth Verification')}
      <div className='mtc-5'>
        <div className=''>
          {mobileSubheader.subheaderdesktop('Secure Auth Verification')}
          <div className="card-body security-auth" style={{border:"1px solid #ccc", marginBottom:"0px"}}>
   <div className="row justify-content-center mt-5 mb-5">
      <div className="col-6">
         <div className="setting-box"><span className="mr-3">Secure Auth Verification Status:</span>
            <span className="badge badge-success">Enabled</span>
         </div>
         <div className="mt-2 text-center">
            <fieldset className="form-group">
               <legend className="bv-no-focus-ring col-form-label pt-0" id="__BVID__45__BV_label_">
                  Please select below option to enable secure auth verification</legend>
               <div role="group" className="bv-no-focus-ring">
                  <div id="radio-group-1" role="radiogroup"
                     className="btn-group-toggle btn-group btn-group-lg bv-no-focus-ring">
                     <label className={`btn btn-lg btn-outline-success ${activeTab=='mobileapp'?'active':''}`} onClick={() => setActiveTab('mobileapp')}>
                        <input type="radio" name="auth-options" className="" value="2" />
                        <span>Enable Using Mobile App</span>
                     </label>
                     <label className={`btn btn-lg btn-outline-success ${activeTab=='telegram'?'active':''}`} onClick={() => setActiveTab('telegram')}>
                        <input type="radio" name="auth-options" className="" value="2" />
                        <span>Enable Using Telegram</span>
                     </label>
                  </div>
               </div>
            </fieldset>
         </div>
         {activeTab=='mobileapp' && <div className="text-center mt-3">
            <h6 className="mb-2">Please enter below auth code in your Secure Auth Verification App.</h6>
            <div className="text-center row mt-2 mb-2 align-items-center">
               <div className="col-12 d-flex justify-content-center align-items-center">
                  <div className="verify-code d-inline-block">990776</div>
               </div>
            </div>
            <h4 className="mb-2">If you havent downloaded,<br /> please download Secure Auth Verification App from
               below link. </h4>
            <h6 className="mb-2">Using this app you will receive auth code during login authentication</h6>
            <a href="https://dzm0kbaskt4pv.cloudfront.net/v2/static/img/SecureAuthApp-1.7.apk"
               className="btn btn-download btn-lg mt-3">
               <div className="row5 row align-items-center">
                  <div className="col-4 text-center"><i className="fab fa-android"></i></div>
                  <div className="col-8 text-left">
                     <h4 className="mb-0">Download</h4>
                     <div className="mt-0 dtext">on the android</div>
                  </div>
               </div>
            </a>
         </div>}
         {activeTab=='telegram' && <div className="text-center mt-3">
            <div>
               <p className="mb-3">Please enter your login password to continue</p>
               <form className="form-inline">
                  <label className="sr-only">Password</label>
                  <input id="inline-form-input-name" type="password" name="masterPassword"
                     placeholder="Enter Your Login Password" className="mb-2 mr-sm-2 mb-sm-0 form-control" />
                  <button type="submit" className="btn btn-primary" style={{width:"auto"}}>Get Connection Id</button>
               </form>

               {/* <div className="mt-3 small-box">
                  <h4>Please follow below instructions for the telegram 2-Step veriication:</h4>
                  <p>Find <a href="https://t.me/demo?start" className="text-primary">@demo</a> in your
                     telegram and type <kbd>/start</kbd> command. Bot will respond you.</p>
                  <p className="text-dark">After this type <kbd>/connect</kbd> and send it to BOT.</p>
                  <p>Now your telegram account will be linked with your website account and 2-Step veriication will be
                     enabled.</p>
                  <hr />
                  <div className="font-hindi mt-4">
                     <h4>कृपया टेलीग्राम 2-Step verification के लिए नीचे दिए गए निर्देशों का पालन करें:</h4>
                     <p>अपने टेलीग्राम में <a href="https://t.me/demo?start"
                           className="text-primary">@demo</a> खोजें और कमांड <kbd>/start</kbd> टाइप करें. BOT आपको जवाब
                        देगा.</p>
                     <p className="text-dark">इसके बाद <kbd>/connect</kbd> टाइप करें और इसे BOT पर भेजें.</p>
                     <p>अब आपका टेलीग्राम account आपके वेबसाइट account से जुड़ जाएगा और 2-Step veriication चालू हो
                        जाएगा.</p>
                  </div>
               </div> */}
            </div>
         </div>}
      </div>
      {/* <div className="col-8">
         <div className="setting-box">
            <h3 className="mr-3">Secure Auth Verification Status:</h3>
            <a href="javascript:void(0)"
               title="Click here to disable secure auth verification" className="btn btn-success">Enabled</a>
         </div>
         <div className="text-center mt-3">
            <div className="otp">
               <div className="loginInner1 authentication">
                  <div className="featured-box-login featured-box-secundary default">
                     <h3 className="text-center">Security Code Verification using Telegram</h3>
                     <div className="my-3 text-center">Enter 6-digit code received in
                        <span><a href="https://t.me/demo?start">@</a></span>
                        Bot
                     </div>
                     <form>
                        <div className="input-otp-flex">
                           <div className="input-login">
                              <input type="number" className="otp-input" />
                           </div>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </div> */}
   </div>
</div>
        </div>
      </div>
    </>
  )
}
export default React.memo(SecurityAuth)
