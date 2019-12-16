import { filterNull, httpPost, httpGet, httpPostJson } from '@/utils/common'
import { noEmpty } from '../utils/common'

export default {
  httpGet: (url, params, options) => {
    return options ? httpGet(url, params, options) : httpGet(url, params)
  },
  httpPost: (url, params, options, noEmptyStr) => {
    return options ? httpPost(url, params, options, noEmptyStr) : httpPost(url, params)
  },
  $get: (url, params, options) => {
    return options ? httpGet(url, params, options) : httpGet(url, params)
  },
  $post: (url, params, options, noEmptyStr) => {
    return options ? httpPost(url, params, options, noEmptyStr) : httpPost(url, params)
  },
  $postJson: (url, params, options, noEmptyStr) => {
    return options ? httpPostJson(url, params, options, noEmptyStr) : httpPostJson(url, params)
  }
}
