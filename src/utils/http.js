import { IP, TIMEOUT, routeWhiteList } from '@/common/utils/config.js'
import { showToast } from '@/common/utils/util.js'
import { useMemberStore } from '@/stores'
const request = ({ method, url, param }) => {
  const memberStore = useMemberStore()
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '加载中' })
    let header
    method === 'GET' || method === 'DELETE' || routeWhiteList.get(url)
      ? (header = {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${memberStore?.userInfo?.accessToken}`,
        })
      : (header = { Authorization: `Bearer ${memberStore?.userInfo?.accessToken}` })
    uni.request({
      url: IP + url,
      method,
      data: param,
      header,
      timeout: TIMEOUT,
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode !== 200) {
          /* empty */
        }
        let {
          data,
          data: { code, msg },
        } = res
        if (code === 0) {
          resolve(data)
        } else if (code === 401 || code === 403) {
          uni.hideLoading()
          uni.showModal({
            title: '提示',
            content: '当前用户未登陆，请前往登录页进行登陆',
            success: (res) => {
              if (res.confirm) {
                //跳转至授权页面
                uni.reLaunch({ url: '/pages/login/login' })
              } else {
                uni.reLaunch({ url: '/pages/index/index' })
              }
            },
          })
        } else if (code === 1002000000) {
          uni.hideLoading()
          //业务错误
          showToast('error', '账号密码错误')
          reject(data)
        } else {
          showToast('error', msg)
          reject(data)
        }
      },
      fail: (error) => {
        console.log(error, 'request')
        let { errMsg } = error
        uni.hideLoading()
        if (errMsg === 'request:fail timeout') {
          showToast('error', '网络请求超时')
          reject('timeout')
        } else if (errMsg === 'request:fail HTTP错误') {
          showToast('error', '请检查网络')
          reject('newwork')
        } else {
          showToast('error', errMsg)
          reject(errMsg)
        }
      },
    })
  })
}

export function $post(url, param) {
  return request({
    method: 'POST',
    url,
    param,
  })
}

export function $get(url, param) {
  return request({
    method: 'GET',
    url,
    param,
  })
}
export function $put(url, param) {
  return request({
    method: 'PUT',
    url,
    param,
  })
}
export function $delete(url, param) {
  return request({
    method: 'DELETE',
    url,
    param,
  })
}
