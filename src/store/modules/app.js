import * as Cookies from '../../utils/cookie'

const app = {
  state: {
    // 中英文
    language: Cookies.getCookie('language') || 'zh',
    sidebar: {
      opened: !+Cookies.getCookie('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    isExpire: false
  },
  mutations: {
    SET_EXPIRE: state => {
      state.isExpire = Cookies.getCookie('x-auth-token') && Cookies.getCookie('GQSJ') === '1'
    },
    SET_EXPIRE_FALSE: state => {
      state.isExpire = false
    },
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.setCookie('sidebarStatus', 1)
      } else {
        Cookies.setCookie('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    // 中英文
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.setCookie('language', language)
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.setCookie('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    // 中英文
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    }
  }
}

export default app
