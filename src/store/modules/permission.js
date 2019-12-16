import { constantRouterMap } from '@/router'
import { asyncRoute, defaultRoute, asyncIcon } from '@/router/asyncRoute'
import {httpPostJson, httpPost} from '@/utils/common'
import {getIdCookie, getCookie} from '@/utils/cookie'
import Path from '@/api/basePath'
import { promise } from 'when';
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

function formatData(arrs) {
  for (let item of arrs) {
    const idxs = arrs.filter((val) => {
      return item.id === val.parentId
    })
    for (let idx of idxs) {
      item.children ? item.children.push(idx) : item.children = [idx]
      idx.isDelete = true
    }
  }
  for (let i = arrs.length - 1; i >= 0; i--) {
    if (arrs[i].isDelete) arrs.splice(i, 1)
  }
}

function iterator (arr) {
  if (arr.length) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].children) {
        arr[i].children.push({
          path: '',
          redirect: arr[i].children[0].path
        })
        iterator(arr[i].children)
      }
    }
  }
}

let route = ''
function firstIterator (arr, isRoot) {
  let nothing = []
  if (arr.length) {
    for (let i = 0; i < arr.length; i++) {
      route = arr[i].routePath
      let obj = {
        path: route,
        name: arr[i].name,
        component: asyncRoute[route],
        meta: { roles: [arr[i].role], title: arr[i].name }
      }
      if (arr[i].children) {
        if (isRoot) {
          obj.redirect = route + '/' + arr[i].children[0].routePath
          obj.meta.icon = asyncIcon[route]
        }
        obj.children = firstIterator(arr[i].children)
      }
      nothing.push(obj)
    }
  }
  return nothing
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    isSubAccount: null
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_SUBACCOUNT: (state, isSubAccount) => {
      state.isSubAccount = isSubAccount
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      const token = getIdCookie()
      return new Promise(resolve => {
        httpPostJson(Path.ajaxAllocateRights, {systems: [1].toString()}).then((res) => {
          let pathsArr = []
          let resArr = res.data
          let filterArr = []
          let routeArr
          if (res.success) {
            // 查看是否为子账号
            httpPost(Path.ajaxAccountIsSub).then((subData) => {
              if (subData.success) {
                if (subData.data === 1) {
                  commit('SET_SUBACCOUNT', 1)
                  httpPostJson(Path.ajaxGetRightsMenu, {system: 1, userId: getCookie('userId') - 0}).then((result) => {
                    if (result.success) {
                      for (let n of result.data) {
                        let val = resArr.find(item => item.id === n.menuId)
                        val && filterArr.push(val)
                      }
                      const index1 = filterArr.findIndex(item => item.code === 'childAccount')
                      const index6 = filterArr.findIndex(item => item.code === 'staff')
                      const index7 = filterArr.findIndex(item => item.code === '/shop')
                      const index8 = filterArr.findIndex(item => item.code === 'workShift')
                      let routes = [index1, index6, index7, index8]
                      routes.sort((a, b) => { return b - a })
                      routes.forEach(item => {
                        item >= 0 && filterArr.splice(item, 1)
                      })
                      routeArr = filterArr.filter(item => item.parentId !== -1 && item.type === 1)
                      formatData(routeArr)
                      pathsArr = firstIterator(routeArr, true)
                      commit('SET_ROUTERS', pathsArr.concat(defaultRoute))
                      resolve()
                    }
                  })
                } else if (subData.data === 0) {
                  commit('SET_SUBACCOUNT', 0)
                  const index6 = res.data.findIndex(item => item.code === 'staff')
                  const index7 = res.data.findIndex(item => item.code === '/shop')
                  const index8 = res.data.findIndex(item => item.code === 'workShift')
                  let routes = [index6, index7, index8]
                  routes.sort((a, b) => { return b - a })
                  routes.forEach(item => {
                    item >= 0 && res.data.splice(item, 1)
                  })
                  routeArr = res.data.filter(item => item.parentId !== -1 && item.type === 1)
                  formatData(routeArr)
                  pathsArr = firstIterator(routeArr, true)
                  commit('SET_ROUTERS', pathsArr.concat(defaultRoute))
                  resolve()
                }
              }
            })
          }
        })
      })
    }
  }
}

export default permission
