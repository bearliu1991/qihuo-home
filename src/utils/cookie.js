import Cookies from 'js-cookie' // expiers 单位：天

export function getCookie(token) {
  return Cookies.get(token)
}

export function setCookie(tokenName, token, date) {
  return Cookies.set(tokenName, token, { expires: date }) // , path: '/stallManage/'
}

export function removeCookie(token) {
  return Cookies.remove(token) // , { path: '/stallManage/' }
}

export function getAuthCookie() {
  return Cookies.get('x-auth-token')
}
export function getIdCookie() {
  return Cookies.get('userId')
}
