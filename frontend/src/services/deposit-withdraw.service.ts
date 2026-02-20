import api from '../utils/api'

class DepositWithdrawService {
  addBankAccount(payload: any) {
    return api.post(`add-bank-account`, payload)
  }
  addUpiAccount(payload: any) {
    return api.post(`add-upi`, payload)
  }
  deleteUpiBank(payload: any) {
    return api.post(`delete-upi-bank`, payload)
  }
  addDepositWithdraw(obj: any) {
    return api.post(`add-deposit-withdraw`, obj, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })
  }
  getDepositWithdrawLists(obj: {
    type: string
    username?: string
    startDate?: string
    endDate?: string
    reportType?: string
  }) {
    return api.post(`get-deposit-withdraw-list`, obj)
  }
  getBankAndUpiLists() {
    return api.get('get-bank-and-upi-list')
  }
  getSettingList() {
    return api.get('get-setting-list')
  }
  getPaymentSetting() {
    return api.get('get-payment-list')
  }
  updateDepositWithdrawStatus(obj: {
    id?: string
    narration?: string
    balanceUpdateType?: string
    status?: string
  }) {
    return api.post(`update-deposit-withdraw-status`, obj)
  }
}
export default new DepositWithdrawService()
