const getters = {
  language: state => state.app.language,
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  isExpire: state => state.app.isExpire,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  allRights: state => state.permission.allRights,
  isSubAccount: state => state.permission.isSubAccount,
  website: state => state.common.website,
  isLock: state => state.user.isLock,
  lockPasswd: state => state.user.lockPasswd,
  isFullScren: state => state.common.isFullScren,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  browserHeaderTitle: state => state.user.browserHeaderTitle,
  userInfo: state => state.user.userInfo
}

export default getters
