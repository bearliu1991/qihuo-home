<template>
  <section class="app-container" id="pswSet">
    <el-form label-width="100px" :model="pswForm" ref="pswForm" :rules="pswFormRules" >
      <el-form-item prop="phone" label="手机号">
        {{phone}}
      </el-form-item>
      <el-form-item label="验证码" prop="verifyCode" style="text-align:left">
        <el-input size="medium" v-model="pswForm.verifyCode" class="verify_input" placeholder="请输入验证码"></el-input>
        <count-down @getCode="getCode"></count-down>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input size="medium" @keyup.enter.native="save" v-model="pswForm.password" placeholder="请输入新密码"></el-input>
        <span class="light_color">密码为6至16位字母数字组合</span>
      </el-form-item>
      <div class="set_middle">
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-form>
  </section>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        // 设置密码相关
        pswForm: {
          verifyCode: '',
          password: '',
        },
        phone: '',
        pswFormRules: {
          // verifyCode: [{ validator: this.noEmpty, message: '不能为空', trigger: 'blur'}],
          password: [{ validator: this._pswValid, message: '6至16位字母数字组合', trigger: 'blur'}],
        }
      }
    },
    created() {
      this.phone = this.getCookie('phone')
      this.$refs.pswForm && this.$refs.pswForm.resetFields()
      this.save = this._debounce(this.save)
    },
    components: {},
    methods: {
      // 获取验证码
      getCode() {
        this.$postJson(this._basePath.ajaxGetVerifyCode, {phone: this.phone, templateCode: 'SMS_160856442'}).then(res => {
          if (res.success) {
            this.$message.success('获取验证码成功')
          }
        })
      },
      save() {
        this.$refs.pswForm.validate(valid => {
          if (valid) {
            const para = {
              password: this.pswForm.password,
              phone: this.phone,
              code: this.pswForm.verifyCode
            }
            this.$postJson(this._basePath.ajaxBossPswReset, para).then(res => {
              if (res.success) {
                this.$message.success('修改密码成功!')
                this.$store.dispatch('LogOut').then(() => {
                  location.reload() // In order to re-instantiate the vue-router object to avoid bugs
                })
                this.$emit('close')
              }
            })
          }
        })
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #pswSet
    setStart()
    .el-form
      margin: 0 auto
      .el-input
        width:230px
</style>