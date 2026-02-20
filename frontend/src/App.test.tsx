import { shallow, ShallowWrapper } from 'enzyme'
import App from './App'

describe('App Component', () => {
  let wrapper: ShallowWrapper

  beforeEach(() => {
    wrapper = shallow(<App />)
  })

  it('should render app', () => {
    expect(wrapper).toBeTruthy()
  })
})
