<template>
  <div id="app">
    <el-dialog title="提示" :visible.sync="visible" :close-on-click-modal="false" @close="close" width="30%">
      <div slot="title" class="slot_title">
        <span class="err_color icon fn20">&#xe669;</span>提示
      </div>
      <div class="buy_tip">
        该档口已被禁用或已到期<a target="_blank" href="https://item.taobao.com/item.htm?spm=a2oq0.12575281.0.0.2f171debsw6a5r&ft=t&id=603173819356">（立即续费）</a>，
        如有疑问，请及时联系客服：17367087609 目前该档口只可以使用齐货管理后台以及齐货老板端小程序
      </div>
    </el-dialog>
    <router-view></router-view>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  let WS
  const wsUrl = process.env.WEBSOCKET_URL
  var lockReconnect = false // 避免重复连接
  var tt
  export default {
    name: 'App',
    data() {
      return {
        visible: false
      }
    },
    computed: {
      ...mapGetters([
        'isExpire'
      ])
    },
    watch: {
      isExpire() {
        this.visible = this.isExpire
      }
    },
    created() {
      this.visible = this.isExpire

      let _self = this
      function buildConnection() {
        if ('WebSocket' in window) {
          WS = new WebSocket(wsUrl)      
        } else if ('MozWebSocket' in window) {
          WS = MozWebSocket(wsUrl)
        } else {
          window.alert("浏览器不支持WebSocket")
        }
      }

      function createWebSocket() {
        try {
          buildConnection()
          init()
        } catch (e) {
          reconnect();
        }
      }

      function init() {
        WS.onclose = function (e) {
          // console.log('链接关闭');
          reconnect();
        };
        WS.onerror = function() {
          // console.log('发生异常了');
          reconnect();
        };
        WS.onopen = function () {
          const param = {
            'clientUuid': `${_self.getCookie('userId')}-${_self.getCookie('stallId')}`,
            'type': 'LOGIN',
            'from': 'pc',
            'token': _self.getCookie('x-auth-token')
          }
          WS.send(JSON.stringify(param))
          // 心跳检测重置
          heartCheck.start()
        };
        WS.onmessage = function (res) {
          // 拿到任何消息都说明当前连接是正常的
          const data = JSON.parse(res.data)
          // console.log(data)
          if (data.type === 'LOGIN_RESPONSE') {
            if (!data.success) {
              _self.$message.error(data.msg)
              closeWS()
            }
          }
          if (data.type === 'PUSH') {
            const content = JSON.parse(data.content)
            const param = {
              'clientUuid': `${_self.getCookie('userId')}-${_self.getCookie('stallId')}`,
              'type': 'PUSH_RESPONSE',
              'success': true,
              'pushUuid': content.pushUuid
            }
            WS.send(JSON.stringify(param))
            if (content.opCode === 101) {
              _self.setCookie('GQSJ', 1)
              _self.$store.commit('SET_EXPIRE')
            } else if (content.opCode === 102) {
              _self.setCookie('GQSJ', 0)
              _self.$store.commit('SET_EXPIRE')
            }
          }
          heartCheck.start()
        }
      }

      function reconnect() {
        if (lockReconnect) {
          return
        }
        lockReconnect = true
        // 没连接上会一直重连，设置延迟避免请求过多
        tt && clearTimeout(tt);
        tt = setTimeout(() => {
          createWebSocket()
          lockReconnect = false
        }, 3000)
      }

      // 心跳检测
      var heartCheck = {
        timeout: 30000,
        timeoutObj: null,
        serverTimeoutObj: null,
        start: function() {
          // console.error('start')
          var self = this
          this.timeoutObj && clearTimeout(this.timeoutObj)
          this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
          this.timeoutObj = setTimeout(() => {
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            WS.send(JSON.stringify({type: 'HEART_BEAT', clientUuid: _self.getCookie('userId')}))
            self.serverTimeoutObj = setTimeout(function() {
              WS.close()
            }, self.timeout);
          }, this.timeout)
        }
      }
      this.$bus.$on('loginSuccess', () => {
        createWebSocket(wsUrl)
      })
      this.$bus.$on('logout', () => {
        closeWS()
      })
      function closeWS() {
        clearTimeout(heartCheck.timeoutObj)
        clearTimeout(heartCheck.serverTimeoutObj)
        heartCheck.timeoutObj = null
        heartCheck.serverTimeoutObj = null
        clearTimeout(tt)
        WS = null
      }

      if (this.getCookie('x-auth-token')) {
        createWebSocket(wsUrl)
      }
    },
    methods: {
      close() {
        this.$store.commit('SET_EXPIRE_FALSE')
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #app
    .slot_title
      setStart()
      .err_color
        color(red)
      span
        mr(8px)
    .buy_tip
      line-height:30px
      letter-spacing: 1px
      a
        color(text_color)
</style>
