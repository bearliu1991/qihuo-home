<template>
  <div id="shop_tips">
    <div class="order_type">
      <el-radio-group v-model="orderType" @change="orderTypeChange">
        <el-radio-button v-for="item in orderTypeList" :label="item.value" 
          :key="item.value">{{item.name}}</el-radio-button>
      </el-radio-group>
    </div>
    <el-tabs v-model="tabsType" tab-position="left" style="height: 500px;" @tab-click="tabClick" :class="[orderType === const_num && 'visibilityHide']">
      <el-tab-pane :label="tabs.label" :name="tabs.value + ''"
        v-for="tabs in tabsList" :key="tabs.label">
        <template v-if="orderType !== const_num">
          <div class="textarea">
            <el-radio-group v-model="choosedId" size="big">
              <el-radio v-for="(tag, idx) in users"
                :key="idx" :label="tag.id" border>
                <span v-html="tag.remark ? tag.remark.replace(/\n/g, '</br>') : ''"></span>
                <div v-if="tag.id === defaultObj.id" class="triangle icon">&#xe717;</div>
              </el-radio>
            </el-radio-group>
          </div>
        </template>
        <template v-else>
          <div class="top_tip">
            <span class="icon text_color">&#xe645;</span>输入支付宝、微信收款码链接，系统将自动生成收款二维码，在纸质订单上显示。
          </div>
          <el-form :model="linkForm" class="link_form" style="width: 80%; min-width:500px" label-width="200px" ref="linkForm">
            <el-form-item label="支付宝收款二维码链接" prop="name">
              <div v-html="aliCont" class="tooltip"></div>
              <el-input v-model="linkForm.alipay" placeholder="支付宝收款二维码链接"></el-input>
            </el-form-item>
            <el-form-item label="微信收款二维码链接" prop="phone">
              <div v-html="wxCont" class="tooltip"></div>
              <el-input v-model="linkForm.wx" placeholder="微信收款二维码链接"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveTag">保存</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-tab-pane>
    </el-tabs>
    <div>
    <template v-if="orderType !== const_num">
      <el-form :model="editForm" ref="editForm" class="edit_form">
        <el-form-item class="input_btn" prop="inputVal" :rules="[
          {validator: noEmpty, message: '不能为空', trigger: 'blur'},
          {validator: onlySemicolon, message: '分号分隔的内容不能全为空', trigger: 'blur'},
          {validator: maxLen, message: '单个备注字数不能超过70个', trigger: 'blur'}
        ]">
          <el-input type="textarea" placeholder="可输入多个标签，请用；号隔开，如;断货；大码；尾货" v-model="editForm.inputVal">
          </el-input>
          <el-button type="primary" class="slot_input" @click="saveTag">添加备注</el-button>
        </el-form-item>
      </el-form>
    </template>
    </div>
    <div class="center" v-if="orderType !== const_num">
      <el-button :type="defaultObj.id !== undefined && defaultObj.id === choosedId ? 'danger' : 'primary'" :disabled="choosedId === -1" @click="setDefault" v-if="tabsType === '2'">
        {{defaultObj.id !== undefined && defaultObj.id === choosedId ? '取消' : '设为'}}默认备注</el-button>
      <el-button type="danger" @click="delTip" :disabled="choosedId === -1">删除</el-button>
    </div>
  </div>
</template>
<script>
  const CONST_VAL = 3
  export default {
    name: '',
    data() {
      return {
        orderTypeList: [
          {name: '销售备注', value: 1},
          {name: '退货备注', value: 2},
          {name: '收款码', value: 3}
        ],
        showToolTip: true,
        aliCont: '如何查看支付宝收款二维码链接？</br>使用微信扫一扫支付宝的收款码，复制页面内的链接。</br>页面展示的链接为支付宝收款码链接',
        wxCont: '如何查看微信收款二维码链接？</br>使用QQ扫一扫微信的收款码，复制页面内的链接。</br>页面展示的链接为支付宝收款码链接',
        defaultObj: {},
        choosedId: -1,
        orderType: 1,
        editForm: {
          inputVal: '',
        },
        const_num: CONST_VAL,
        tabsList: [{label: '单品备注', value: '1'}, {label: '整单备注', value: '2'}],
        tabsType: '1', // 1, 单品备注 2, 整单备注
        editFormRules: {
          inputVal: [{ required: true, validator: this.noEmpty, message: '输入框不能为空', trigger: 'blur' }],
        },
        users: [{}],
        linkForm: {
          alipay: '',
          wx: '',
          alipayId: null,
          wxId: null
        }
      }
    },
    created() {
      this.getUsers()
      this.delTip = this._debounce(this.delTip)
      this.setDefault = this._debounce(this.setDefault)
      this.saveTag = this._debounce(this.saveTag)
    },
    components: {},
    methods: {
      getUsers() {
        if (this.orderType !== CONST_VAL) {
          this.$postJson(this._basePath.ajaxTipGetByPage, {type: this.tabsType - 0, orderType: this.orderType}).then(res => {
            if (res.success) {
              res.data && (this.users = res.data)
              this.defaultObj = this.users.find(item => item.isDefault === 1) || {}
            }
          })
        } else {
          this.$postJson(this._basePath.ajaxTipGetByPage, {type: 3, orderType: 3}).then(res => {
            if (res.success) {
              this.$set(this.linkForm, 'alipay', res.data && res.data.length ? res.data[res.data.length - 1].remark : '')
              this.$set(this.linkForm, 'alipayId', res.data && res.data.length ? res.data[res.data.length - 1].id : '')
            }
          })
          this.$postJson(this._basePath.ajaxTipGetByPage, {type: 3, orderType: 4}).then(res => {
            if (res.success) {
              this.$set(this.linkForm, 'wx', res.data && res.data.length ? res.data[res.data.length - 1].remark : '')
              this.$set(this.linkForm, 'wxId', res.data && res.data.length ? res.data[res.data.length - 1].id : '')
            }
          })
        }
      },
      saveTag() {
        if (this.orderType !== CONST_VAL) {
          this.$refs.editForm.validate(valid => {
            if (valid) {
              let param = {
                type: this.tabsType - 0,
                remarkList: this.strToArr(this.editForm.inputVal).toString(),
                orderType: this.orderType
              }
              this.$postJson(this._basePath.ajaxTipSave, param).then(res => {
                if (res.success) {
                  this.editForm.inputVal = ''
                  this.$message.success('操作成功')
                  this.$refs['editForm'].resetFields()
                  this.getUsers()
                }
              })
            }
          })
        } else {
          // this.$refs.linkForm.validator(valid => {
          //   if (valid) {
            let param = []
            this.linkForm.alipay && param.push({orderType: 3, remark: this.linkForm.alipay, type: 3})
            this.linkForm.wx && param.push({orderType: 4, remark: this.linkForm.wx, type: 3})
            
            this.$post(this._basePath.ajaxTipSaveQrcode, param).then(res => {
              if (res.success) {
                this.$message.success('保存成功')
              }
            })
          //   }
          // })
        }
      },
      delTip() {
        if (this.choosedId === -1) {
          this.$message.error('请先选择标签')
          return false
        }
        this.$postJson(this._basePath.ajaxTipDel, {remarkId:this.choosedId}).then(res => {
          if (res.success) {
            this.$message.success('删除备注成功')
            this.choosedId = -1
            this.getUsers()
          }
        })
      },
      setDefault() {
        if (this.choosedId === -1) {
          this.$message.error('请先选择标签')
          return false
        }
        if (this.defaultObj.id === this.choosedId) {
          this.$confirm('确认取消设置默认吗？', '提示', {
            type: 'warning'
          })
            .then(() => {
              const para = {remarkId: this.choosedId, isDefault: 0}
              this.$postJson(this._basePath.ajaxTipSetDefault, para).then(res => {
                if (res.success) {
                  this.$message.success('取消成功')
                  this.getUsers()
                }
              })
            })
            .catch(() => {})
        } else {
          this.$postJson(this._basePath.ajaxTipSetDefault, {remarkId: this.choosedId, isDefault: 1 }).then(res => {
            if (res.success) {
              this.$message.success('设置成功')
              this.getUsers()
            }
          })
        }
      },
      // 验证是否只有分号
      onlySemicolon(rule, value, callback) {
        if (value && /^[;；]$/.test(value.trim())) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      maxLen(rule, value, callback) {
        const arr = value.trim().split(';')
        let isAllOk = true
        if (arr.length) {
          for (let item of arr) {
            item.length > 70 && (isAllOk = false)
          }
        }
        if (!isAllOk) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      // 销售和退货切换
      orderTypeChange() {
        this.getUsers()
      },
      strToArr(str) {
        if (str) {
          const arr = str.trim().split(/;|；/g)
          return arr.filter(item => item)
        }
        return []
      },
      tabClick() {
        this.choosedId = -1
        this.getUsers()
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #shop_tips
    margin:20px
    mt(50px)
    padding:20px
    box-shadow 0 0 20px 5px #ddd
    .visibilityHide
      .el-tabs__header
        display:none
    .edit_form
      ml(110px)
      mt(-70px)
    .top_tip
      vertical(40px)
      padl(20px)
      margin:20px 0
      setStart()
      bgColor(#BAE7FF)
      span
        mr(5px)
    .el-radio-group
      setStart()
      flex-wrap: wrap
    .link_form
      padt(40px)
      .el-form-item
        padt(40px)
        relative()
        mb(60px)
        .tooltip
          absolute()
          fn(12px)
          color()
          padding:10px
          radius(3px)
          bgColor(rgba(0,0,0,0.8))
          top:-80px
          line-height:16px
          z-index:100
    .input_btn
      .el-form-item__content
        setMiddle()
    .el-radio
      mb(10px)
      height:auto
      &.is-bordered
        padding: 12px 30px 12px 30px !important
      .triangle
        position:absolute
        right:-6px
        top:-6px
        fn(50px)
    .el-radio__input
      display:none
    .el-radio__label
      padl(0)
    .order_type
      margin: 20px 0
    .textarea
      border_()
      radius(5px)
      padding:10px
      margin:10px 0
      mb(20px)
      height:400px
      .el-tag
        margin: 10px
    .slot_input
      cursor()
      padding:19px 30px
    .el-button--success
      border-color:#67c23a
      bgColor(#67c23a)
      color()
    
</style>