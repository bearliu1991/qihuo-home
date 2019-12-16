import axios from '@/api/axios'
import {removeCookie} from './cookie'
import * as dateFns from 'date-fns'
import {matchSearch} from '@/utils/bankInfo'

export const $dateFns = dateFns
export const _bankLogoSearch = matchSearch
export function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
export function filterNull(o, isUrl, noEmptyStr) {
  for (var key in o) {
    if (o[key] === undefined || o[key] === null || (!noEmptyStr && o[key] === '')) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = isUrl ? window.encodeURI(o[key].trim()) : o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}

export function _differInDays(sDate1, sDate2) {    // sDate1和sDate2是2006-12-18格式  
  var dateSpan,
      tempDate,
      iDays;
  sDate1 = Date.parse(sDate1);
  sDate2 = Date.parse(sDate2);
  dateSpan = sDate2 - sDate1;
  dateSpan = Math.abs(dateSpan);
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  return iDays + 1
}

export function _subDayTime(days) {
  var curTime = new Date().getTime();
  var startDate = curTime - (days * 3600 * 24 * 1000);
  return new Date(startDate)
}

// 防抖
/**
* 函数节流和防抖
* 防抖：一定时间内，只执行一次
* 节流：一定时间内，只执行最后一次
*/

// 把手机号格式化为137****1234
export function _formatPhone(val) {
  if (!val) return ''
  if (/^1[3|4|5|7|8|9][0-9]{9}$/.test(val)) {
    let arr = val.split('')
    arr.splice(3, 4, '****')
    return arr.join('')
  }
  return val
}
// 包含数字和字母，6-16位
export function _pswValid(rule, value, callback) {
  if (!value || value.length < 6 || !/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/.test(value)) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
export function _debounce(fn, delay = 500, immediate) {
  let timer = null;

  return function () {
    const context = this;
    const args = arguments;

    return new Promise((resolve, reject) => {
      timer && clearTimeout(timer);

      if (immediate) {
        const doNow = !timer;

        timer = setTimeout(() => {
          timer = null;
        }, delay);

        doNow && resolve(fn.apply(context, args));
      } else {
        timer = setTimeout(() => {
          resolve(fn.apply(context, args));
        }, delay);
      }
    })
  }
}

/**
 * 动态插入css
 */
export const loadStyle = url => {
  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = url
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(link)
}
/**
 * 设置浏览器头部标题
 */
export const setTitle = function (title) {
  title = title ? `${title}` : '齐货'
  window.document.title = title
}

// 深拷贝
export const _deepCopy = function (data) {
  if (data) return JSON.parse(JSON.stringify(data))
  return data
}

// 判断是否为数组
export const _isArray = function (arr) {
  return Array.isArray(arr)
}

// 判断值是否为空
export function isEmpty(value) {
  return /^\s*$/.test(value)
}

export function _isHasVal(value) {
  if (value === undefined || value === null) return false
  return !/^\s*$/.test(value)
}

export function isBankCard(value) {
  return /^([1-9]{1})(\d{14}|\d{15}|\d{18})$/.test(value)
}

export function _formatTime(value, format) {
  if (!isNumber(value) && !(value instanceof Date)) return value || ''
  if (format === true) {
    return $dateFns.format(value, 'YYYY-MM-DD HH:mm:ss')
  }
  return $dateFns.format(value, format || 'YYYY-MM-DD')
}

/**
 * 根据数组排序数据
 * originArr 需要排序的对象数组
 * sortArr 排序规则数组
 * key 排序对象的key
 * noAddKey 如果sortArr中存在，但是originArr中的对象不存在该值，则不增加key值
 * obj originArr对象格式的默认值
 */
export function sortByArr(originArr, sortArr, key, sortKey) {
  let arr = []
  let temArr = _deepCopy(originArr)
  for (let n of sortArr) {
    if (sortKey !== undefined) {
      if (!this._isHasVal(key)) {
        temArr.forEach(item => {
          if (this._isHasVal(item) && item === n[sortKey]) {
            arr.push(item)
          }
        })
      } else {
        temArr.forEach(item => {
          if (this._isHasVal(item[key]) && item[key] === n[sortKey]) {
            arr.push(item)
          }
        })
      }
    } else {
      if (!this._isHasVal(key)) {
        temArr.forEach(item => {
          if (this._isHasVal(item) && item === n) {
            arr.push(item)
          }
        })
      } else {
        temArr.forEach(item => {
          if (this._isHasVal(item[key]) && item[key] === n) {
            arr.push(item)
          }
        })
      }
    }
  }
  return arr
}
export function noEmptyArr(rule, value, callback) {
  if (!value || (value && !value.length)) {
    callback(new Error(rule.message))
  } else {
    callback();
  }
}

export function lessThan16(rule, value, callback) {
  if (!value.length || value.length > 16) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

export function lessThan18(rule, value, callback) {
  if (!value.length || value.length > 18) {
    callback(new Error(rule.message))
  } else {
    callback();
  }
}

export function _decimalJudge(rule, value, callback) {
  const reg = /^\d{0,8}\.{0,1}(\d{1,2})?$/
  if (value && isNumber(value) && !reg.test(value)) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

export function _maxJudge(rule, value, callback) {
  if (value && isNumber(value) && value > 99999) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

export function noEmpty(rule, value, callback) {
  if (!_isHasVal(value) || /^\s*$/.test(value)) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

export function _isAllNumber(rule, value, callback) {
  if (value && !/^\d+$/.test(value)) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

export function noBankCard(rule, value, callback) {
  if (!value || !isBankCard(value)) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

export function isIdCard(rule, value, callback) {
  if (!value || !IdCardValid(value.trim())) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

export function IdCardValid(ID) {
  var city = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江 ",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北 ",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏 ",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外"
  }
  var birthday = ID.substr(6, 4) + '/' + Number(ID.substr(10, 2)) + '/' + Number(ID.substr(12, 2))
  var d = new Date(birthday)
  var newBirthday = d.getFullYear() + '/' + Number(d.getMonth() + 1) + '/' + Number(d.getDate())
  var currentTime = new Date().getTime()
  var time = d.getTime()
  var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  var sum = 0
  var i
  var residue

  if (!/^\d{17}(\d|x)$/i.test(ID)) return false
  if (city[ID.substr(0, 2)] === undefined) return false
  if (time >= currentTime || birthday !== newBirthday) return false
  for (i = 0; i < 17; i++) {
    sum += ID.substr(i, 1) * arrInt[i]
  }
  residue = arrCh[sum % 11]
  if (residue !== ID.substr(17, 1)) return false
  return true
}

export function mustNumber(rule, value, callback) {
  if (!isNumber(value)) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

export function numberOrEmpty(rule, value, callback) {
  if (!isEmpty(value) && !isNumber(value)) {
    callback(new Error(rule.message))
  } else {
    callback();
  }
}

export function numberPsw(rule, value, callback) {
  if (!value || !/^\d{6}$/.test(value.trim())) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

// 6到16位，字母或数字，或组合
export function _sixOrMore(rule, value, callback) {
  if (value && !/^[a-zA-Z\d]{6,16}$/.test(value.trim())) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

export function _toThousand(num) {
  let value = (num || 0).toString()
  let temp = value.length % 3
  switch (temp) {
      case 1:
        value = '00' + value;
        break
      case 2:
        value = '0' + value;
        break
  }
  return value.match(/\d{3}/g).join(',').replace(/^0+/, '');
}

export function validMoney(rule, value, callback) {
  if (!isNumber(value) || value <= 0) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

export function _validPrice(rule, value, callback) {
  if (value && (!isNumber(value) || value <= 0)) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

export function _nonnegativeNum(rule, value, callback) {
  if (value && (!isNumber(value) || value < 0)) {
    callback(new Error(rule.message))
  } else {
    callback();
  }
}

export function isPositive(val) {
  return isNumber(val) && val > 0
}

export function _positiveInt(rule, value, callback) {
  if (_isHasVal(value) && !isPositiveInt(value)) {
    callback(new Error(rule.message));
  } else {
    callback()
  }
}

export function _isHave(val, arr) {
  return arr.includes(val)
}

export function _isWithout(val, arr) {
  return !arr.includes(val)
}

export function _formatVal(val, arr, filterKey, reuturnKey) {
  let obj = arr.find(item => item[filterKey] === val)
  if (obj) return obj[reuturnKey]
  return val
}

export function _clearVal(obj, exceptArr) {
  for (let key in obj) {
    !exceptArr.includes(key) && (obj[key] = null)
  }
  return obj
}

export function mobileReg(rule, value, callback) {
  if (value && !_testPhone(value)) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}

export function _testPhone(value) {
  return (/^1[3|4|5|7|8|9][0-9]{9}$/.test(value.trim()))
}

export function trim(o) {
  for (var key in o) {
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}
// 非负整数
export function _nonnegativeInt(val) {
  return /^[1-9]+[0-9]*$|^0$/.test(val)
}
// 正整数
export function isPositiveInt(val) {
  return /^[1-9]+[0-9]*]*$/.test(val)
}
// 是否为数字
export function isNumber(val) {
  return /^\d+(\.\d+)?$/.test(val)
}
// 是否为小数
export function _isFloat(val) {
  return /^\d+\.\d+$/.test(val)
}
// 是否为整数
export function _isInteger(val) {
  return /^-?[1-9]+[0-9]*$|^0$/.test(val)
}
export function serializeParam(obj, prefix) {
  let str = []
  let p
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      let k = prefix ? prefix + "[" + p + "]" : p
      let v = obj[p]
      str.push((v !== null && typeof v === "object") ? serializeParam(v, k) : k + "=" + v)
    }
  }
  return str.join("&")
}
export function httpGet(url, paramsData, options) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: paramsData
    }, options).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      const res = err.response
      if (res) {
        reject(err)
      }
    })
  })
}
// let urlUse = 'https://www.easy-mock.com/mock/59e9b251c0c35056478ea94c/base/hello' // 'http://192.168.1.54:8776/image/test.do'
export function httpPost(url, paramsData, options, noEmptyStr) {
  return new Promise((resolve, reject) => {
    const param = filterNull(paramsData,false,noEmptyStr)
    axios.post(url, param, options).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      const res = err.response
      if (res) {
        reject(err)
      }
    })
  })
}

export function _addFilterProperty(paramObj, filterObj) {
  for (let key in filterObj) {
    paramObj[key] = filterObj[key]
  }
  return paramObj
}

export function httpPostJson(url, paramsData, options, noEmptyStr) {
  return new Promise((resolve, reject) => {
    let urlPath = url + '?'
    let idx = 0
    const param = filterNull(paramsData, true, noEmptyStr)
    const strParam = serializeParam(param)
    // for (const key of Object.keys(param)) {
    //   urlPath += idx === 0 ? `${key}=${param[key]}` : `&${key}=${param[key]}`
    //   idx++
    // }
    axios.post(urlPath + strParam, '', options).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      if (err) {
        const cuo = err.response
        if (cuo) {
          reject(cuo)
        }
      } else {
        reject()
      }
    })
  })
}

export function strParamToObj(href) {
  var params = href.split("?")[1];
  var paramArr = params.split('&');
  var res = {};
  for (var i = 0; i < paramArr.length; i++) {
      var str = paramArr[i].split('=');
      res[str[0]] = str[1];
  }
  return res
}

export function _isIE() {
  let ua = navigator.userAgent
  return !!(ua.match(/MSIE/i)) || !!(ua.match(/Trident/i))
}

export function _loadJs(url, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = 'async';
  script.src = url;
  document.body.appendChild(script);
  if (script.readyState) {   // IE
    script.onreadystatechange = function() {
      if (script.readyState === 'complete' || script.readyState === 'loaded') {
        script.onreadystatechange = null;
        callback();
      }
    }
  } else { // 非IE
    script.onload = function() {
      callback()
    }
  }
}

export function logoutClearCookie(url, paramsData, options) {
  removeCookie('userId')
  removeCookie('x-auth-token')
  removeCookie('userType')
  removeCookie('stallId')
  removeCookie('phone')
  removeCookie('bossName')
  removeCookie('stallName')
  removeCookie('exitUrl')
  removeCookie('GQSJ')
}

// 字符数组去重
export function _uniqueArr(arr, property) {
  // ES6新语法
  if (property === undefined) return new Set(arr)
  let temArr = []
  arr.forEach(item => {
    temArr.filter(n => n[property] === item[property]).length === 0 && temArr.push(item)
  })
  return temArr
}

export function _toFixed(num) {
  return Math.round(num * 100) / 100
}

// 对象数组去重
export function _uniqueObjArr(arr) {
  return new Set(arr)
}

export function _last3Month() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // 0-11表示1-12月
    let day = now.getDate();
    let dateObj = {};
    if (parseInt(month) < 10) {
      month = "0" + month;
    }
    if (parseInt(day) < 10) {
      day = "0" + day;
    }
    dateObj.now = year + '-' + month + '-' + day;
    if (parseInt(month) === 1) { // 如果是1月份，则取上一年的10月份
      dateObj.last = (parseInt(year) - 1) + '-10-' + day;
      return dateObj;
    }
    if (parseInt(month) === 2) { // 如果是2月份，则取上一年的11月份
      dateObj.last = (parseInt(year) - 1) + '-11-' + day;
      return dateObj;
    }
    if (parseInt(month) === 3) { // 如果是3月份，则取上一年的12月份
      dateObj.last = (parseInt(year) - 1) + '-12-' + day;
      return dateObj;
    }
 
    let preSize = new Date(year, parseInt(month) - 3, 0).getDate(); // 开始时间所在月的总天数
    if (preSize < parseInt(day)) { // 开始时间所在月的总天数<本月总天数，比如当前是5月30日,在2月中没有30,则取下个月的第一天(3月1日)为开始时间
      let resultMonth = parseInt(month) - 2 < 10 ? ('0' + parseInt(month) - 2) : (parseInt(month) - 2);  
      dateObj.last = year + '-' + resultMonth + '-01';  
      return dateObj;
    }
    if (parseInt(month) <= 10) {
      dateObj.last = year + '-0' + (parseInt(month) - 3) + '-' + day;
      return dateObj;
    } else {
      dateObj.last = year + '-' + (parseInt(month) - 3) + '-' + day;
      return dateObj;
    }
}

export function _last6Month() {
  let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // 0-11表示1-12月
    let day = now.getDate();
    let dateObj = {};
    if (parseInt(month) < 10) {
      month = "0" + month;
    }
    if (parseInt(day) < 10) {
      day = "0" + day;
    }
    dateObj.now = year + '-' + month + '-' + day;
    if (parseInt(month) === 1) { // 如果是1月份，则取上一年的10月份
      dateObj.last = (parseInt(year) - 1) + '-7-' + day;
      return dateObj;
    }
    if (parseInt(month) === 2) { // 如果是2月份，则取上一年的11月份
      dateObj.last = (parseInt(year) - 1) + '-8-' + day;
      return dateObj;
    }
    if (parseInt(month) === 3) { // 如果是3月份，则取上一年的12月份
      dateObj.last = (parseInt(year) - 1) + '-9-' + day;
      return dateObj;
    }

    if (parseInt(month) === 4) { // 如果是3月份，则取上一年的12月份
      dateObj.last = (parseInt(year) - 1) + '-10-' + day;
      return dateObj;
    }

    if (parseInt(month) === 5) { // 如果是3月份，则取上一年的12月份
      dateObj.last = (parseInt(year) - 1) + '-11-' + day;
      return dateObj;
    }

    if (parseInt(month) === 6) { // 如果是3月份，则取上一年的12月份
      dateObj.last = (parseInt(year) - 1) + '-12-' + day;
      return dateObj;
    }
 
    let preSize = new Date(year, parseInt(month) - 6, 0).getDate(); // 开始时间所在月的总天数
    if (preSize < parseInt(day)) { // 开始时间所在月的总天数<本月总天数，比如当前是5月30日,在2月中没有30,则取下个月的第一天(3月1日)为开始时间
      let resultMonth = parseInt(month) - 5 < 10 ? ('0' + parseInt(month) - 5) : (parseInt(month) - 5);  
      dateObj.last = year + '-' + resultMonth + '-01';  
      return dateObj;
    }
    if (parseInt(month) <= 10) {
      dateObj.last = year + '-0' + (parseInt(month) - 6) + '-' + day;
      return dateObj;
    } else {
      dateObj.last = year + '-' + (parseInt(month) - 6) + '-' + day;
      return dateObj;
    }
}