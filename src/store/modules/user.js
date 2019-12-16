import { removeCookie } from '@/utils/cookie'
import Path from '@/api/basePath'
import {httpPost, httpPostJson} from '@/utils/common'

const user = {
  state: {
    name: '',
    avatar: '',
    roles: []
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_USERINFO:(state, val) => {
      state.userInfo = val
    } 
  },

  actions: {
    // 登录
    Login({ commit }, formData) {
      return new Promise((resolve, reject) => {
        const param = {
          phone: formData.phone,
          password: formData.password,
          userType: formData.userType
        }
        httpPostJson(Path.ajaxLogin, param).then(res => {
          commit('SET_USERINFO', res.data)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    LoginWithCode({ commit }, formData) {
      return new Promise((resolve, reject) => {
        const param = {
          phone: formData.phone,
          code: formData.code
        }
        httpPostJson(Path.ajaxLoginWithCode, param).then(res => {
          commit('SET_USERINFO', res.data)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        // logout(state.token).then(() => {
        //   commit('SET_TOKEN', '')
        //   commit('SET_ROLES', [])
        //   removeToken()
        //   resolve()
        // }).catch(error => {
        //   reject(error)
        // })
        httpPost(Path.ajaxLogout).then(res => {
          // removeCookie('userId')
          // // removeCookie('userType')
          // removeCookie('stallId')
          // removeCookie('x-auth-token')
          // removeCookie('phone')
          // removeCookie('bossName')
          resolve(res)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        // commit('SET_TOKEN', '')
        // removeToken()
        removeCookie('userId')
        removeCookie('x-auth-token')
        resolve()
      })
    },
  }
}

export default user
