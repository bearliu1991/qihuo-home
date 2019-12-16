<template>
  <el-form class="login-form" id="code_login" status-icon :rules="loginRules" ref="loginForm" :model="loginForm" label-width="0">
    <el-form-item prop="phone">
      <el-input size="small" @keyup.enter.native="handleLogin" v-model="loginForm.phone" auto-complete="off" placeholder="请输入手机号码">
        <i slot="prefix" class="icon-shouji"></i>
      </el-input>
    </el-form-item>
    <el-form-item prop="code">
      <el-input size="small" :class="[{display:msgKey}]" @keyup.enter.native="handleLogin" v-model="loginForm.code" auto-complete="off" placeholder="请输入验证码">
        <i slot="prefix" class="icon-yanzhengma yanzhengma"></i>
        <template slot="append">
          <span @click="handleSend" class="msg-text">{{msgText}}</span>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" @click.native.prevent="handleLogin" class="login-submit">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
const MSGINIT = '发送验证码'
// const MSGERROR = '验证码发送失败'
const MSGSCUCCESS = '${time}秒后重发'
const MSGTIME = 60
const validateCode = (rule, value, callback) => {
  if (value.length !== 4) {
    callback(new Error('请输入4位数的验证码'))
  } else {
    callback()
  }
}

export default {
  name: 'codelogin',
  data() {
    return {
      msgText: MSGINIT,
      msgTime: MSGTIME,
      msgKey: false,
      loginForm: {
        phone: '',
        code: ''
      },
      loginRules: {
        phone: [
          { required: true, trigger: 'blur', validator: this.noEmpty, message: '手机号不能为空' },
          { required: true, trigger: 'blur', validator: this.mobileReg, message: '手机号格式不正确' }
        ],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      }
    }
  },
  methods: {
    handleSend() {
      if (this.msgKey || !this._testPhone(this.loginForm.phone)) return
      
      this.$postJson(this._basePath.ajaxLoginSendCode, {phone: this.loginForm.phone, templateCode: 'SMS_160856438'}).then((res) => {
        if (res.success) {
          this.$message.success('发送验证码成功')
        }
      })
      this.msgText = MSGSCUCCESS.replace('${time}', this.msgTime)
      this.msgKey = true
      const time = setInterval(() => {
        this.msgTime--
        this.msgText = MSGSCUCCESS.replace('${time}', this.msgTime)
        if (this.msgTime === 0) {
          this.msgTime = MSGTIME
          this.msgText = MSGINIT
          this.msgKey = false
          clearInterval(time)
        }
      }, 1000)
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$store.dispatch('LoginWithCode', this.loginForm).then(res => {
            if (res.success) {
              const data = res.data
              this.$message.success('登陆成功')
              this.setCookie('userId', data.id)
              this.setCookie('userType', data.userType)
              this.setCookie('stallId', data.stallId)
              this.setCookie('phone', data.phone)
              this.setCookie('bossName', data.userName)
              this.setCookie('GQSJ', data.currentStallExpire)
              const exitUrl = this.getCookie('exitUrl')
              this.$bus.$emit('loginSuccess')
              exitUrl ? location.href = exitUrl : this.$router.push({ path: '/welcome'})
            }
          })
        }
      })
    }
  }
}
</script>

<style>
.yanzhengma{
  display:block;
  margin-top: 8px;
}
#code_login .el-input-group__append{
  background: #E6A23C
}
.msg-text {
  display: block;
  width: 60px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  color:#fff
}
#code_login .display .el-input-group__append{
  background: #f5f7fa
}
.display .msg-text{
  color: #ccc;
}
</style>
