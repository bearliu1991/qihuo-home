<template>
  <div id="withdraw_page">
    <div class="tip">提现申请通过后将在1~3个工作日到账，双休、节假日不处理提现。提交申请后可通过“查看提现记录”查看提现申请是否通过。</div>
    <div class="sec_part">
      <div class="account_balance">
        <h3>当前账户余额: </h3>
        &nbsp;&nbsp;<i class="err_color">￥{{accountInfo.balance}}</i>
      </div>
      <ul class="account_choose">
        <li v-for="(item, index) in channelList" :key="index">
          <svg class="icon svg-icon" aria-hidden="true">
            <use :xlink:href="formatChannel(item.channel, 'icon')"></use>
          </svg>
          <div class="set_column">
            <h3>{{formatChannel(item.channel)}}</h3>
            <span class="first_span">今日剩余提现次数&nbsp;&nbsp;<i class="err_color">{{item.remainingTimes}}</i>&nbsp;&nbsp;次</span>
            <span>单笔提现限额&nbsp;&nbsp;<i class="err_color">{{item.personalSingleMax | _toThousand}}</i>&nbsp;&nbsp;元</span>
          </div>
          <div @click="showWithdraw(item)" class="process_btn" :class="{'light_color': item.remainingTimes <= 0 || item.status !== 1}">
            提现到{{formatChannel(item.channel)}}
            <!-- <el-tooltip placement="top" v-if="formatStatus(item)" :open-delay="300" effect="light">
              <div slot="content" class="err_color fn14">{{formatStatus(item)}}</div>
              <i class="icon fn18">&#xe657;</i>
            </el-tooltip> -->
          </div>
          <div v-if="formatStatus(item)" class="err_color fn12 err_msg">{{formatStatus(item)}}</div>
        </li>
      </ul>
      <el-dialog
        title="提现"
        :visible.sync="withdrawShow"
        width="600px"
        center>
        <div class="dialog_wrap specail_form">
          <el-form style="margin:0 auto" :inline="true" label-width="150px" :model="withdrawForm" 
            ref="withdrawForm" :rules="withdrawFormRules" @submit.native.prevent>
            <el-form-item prop="account" :label="`已绑定的${formatChannel(withdrawForm.channel)}:`">
              <el-select v-model="withdrawForm.account" placeholder="请选择">
                <el-option v-for="(item, index) in bindList.filter(n => n.type === channel)" :key="index" :value="item.account" 
                  :label="withdrawForm.channel === 'bank' ? `${item.bankName} ${item.account}` : withdrawForm.channel === 'wx' ? `微信 ${item.realName}` : `支付宝 ${item.account}`">
                  <i v-if="withdrawForm.channel === 'wx'">微信： {{item.realName}}</i>
                  <i v-if="withdrawForm.channel === 'zfb'">支付宝：{{item.account}}</i>
                  <i v-if="withdrawForm.channel === 'bank'">{{item.bankName}}：{{item.account}}</i>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="单笔提现限额:">
              <span class="light_color"><i class="err_color">{{withdrawForm.personalSingleMax}}</i>元(今日剩余提现次数：<i class="err_color">{{withdrawForm.remainingTimes}}</i>次)</span>
            </el-form-item>
            <el-form-item label="最小提现金额:">
              <span class="light_color"><i class="err_color">{{withdrawForm.personalSingleMin}}</i>元</span>
            </el-form-item>
            <el-form-item label="提现金额:" prop="amount">
              <el-input size="medium" @blur="calcServiceCharge" v-model="withdrawForm.amount" placeholder="请输入提现金额">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="手续费: ">
              <span class="err_color">{{(serviceCharge)}}</span> 元
              <span class="text_color cursor fr" style="margin-left:30px" @click="chargePolicy">收费标准？</span>
            </el-form-item>
            <el-form-item label="实际到账金额:">
              <span class="err_color">{{actualFee || 0}}</span> 元
            </el-form-item>
            <el-form-item label="支付密码:" prop="payPwd">
              <el-input size="medium" type="password" auto-complete="new-password" v-model="withdrawForm.payPwd" placeholder="请输入支付密码"></el-input>
            </el-form-item>
          </el-form>
          <div style="line-height:18px; width:80%;margin:auto;margin-top:10px"><h3 style="display:inline">注意:</h3>&nbsp;&nbsp;请认真核对提现金额及提现账户，确保户名与账户一致，以免造成提现失败甚至金额损失</div>
          <div class="btn_wrap">
            <el-button @click.native="goback">取消</el-button>
            <el-button type="primary" @click="withdrawMoney">确定</el-button>
          </div>
        </div>

        <el-dialog
          title="提现收费标准"
          :visible.sync="showDrawer"
          center
          width="600px"
          append-to-body>
          <div class="withdraw_specification" v-html="chargeStandard.value">
          </div>
          </el-dialog>
      </el-dialog>
    </div>
  </div>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        withdrawShow: false,
        withdrawForm: {},
        serviceCharge: 0,
        chargeStandard: {},
        showDrawer: false,
        actualFee: 0,
        withdrawFormRules: {
          account: [{ required: true, validator: this.noEmpty, message: '提现账户不能为空', trigger: 'blur'}],
          amount: [{ required: true, validator: this.validMoney, message: '提现金额输入有误', trigger: 'blur'}],
          payPwd: [{ required: true, validator: this.numberPsw, message: '支付密码为6位数字', trigger: 'blur'}]
        },
        channel: 'zfb',
        channelList: [
          {
            channel: "bank",
            personalDailyTimes: 0,
            personalSingleMax: 0,
            personalSingleMin: 0,
            platformDailyMax: 0,
            remainingTimes: 0,
            serviceChargeMax: 0,
            serviceChargeMin: 0,
            serviceChargeRate: 0,
          },
          {
            channel: "zfb",
            personalDailyTimes: 0,
            personalSingleMax: 0,
            personalSingleMin: 0,
            platformDailyMax: 0,
            remainingTimes: 0,
            serviceChargeMax: 0,
            serviceChargeMin: 0,
            serviceChargeRate: 0,
          },
          {
            channel: "wx",
            personalDailyTimes: 0,
            personalSingleMax: 0,
            personalSingleMin: 0,
            platformDailyMax: 0,
            remainingTimes: 0,
            serviceChargeMax: 0,
            serviceChargeMin: 0,
            serviceChargeRate: 0,
          }
        ]
      }
    },
    props: {
      bindList: {
        type: Array,
        default: () => []
      },
      accountInfo: {
        type: Object,
        default: () => {}
      }
    },
    created() {
      this.getChannelList()
      this.getDocuments()
      this.withdrawMoney = this._debounce(this.withdrawMoney)
    },
    components: {},
    methods: {
      // 提现通道状态status 1. '开启中'； 2.  自动关闭-余额不足 3. 手动关闭
      formatStatus(item) {
        if (item.status === 1 && item.remainingTimes - 0 !== 0) return ''
        return item.remainingTimes === 0 ? '今日提现次数已用完' : item.status === 2 ? '今日平台提现额度已用完' : '系统维护中，请耐心等待' 
      },
      // 获取提现标准
      getDocuments() {
        this.$postJson(this._basePath.ajaxGetChargeStandard, {code: 'chargeStandard'}).then(res => {
          if (res.success) {
            this.chargeStandard = res.data[0]
          }
        })
      },
      // 获取通道列表
      getChannelList() {
        this.$postJson(this._basePath.ajaxOperateChannelList, {userType: 'stall'}).then(res => {
          if (res.success) {
            const arr = res.data ? res.data : []
            if (arr.length) {
              for (let item of arr) {
                item.serviceChargeRate = item.serviceChargeRate * 100
                const index = this.channelList.findIndex(n => {
                  return n.channel === item.channel
                })
                index > -1 && this.$set(this.channelList, index, item)
              }
            }
          }
        })
      },
      chargePolicy() {
        this.showDrawer = true
      },
      // 提现弹框
      showWithdraw(item) {
        if (item.remainingTimes <= 0 || item.status !== 1) return false
        this.withdrawShow = true
        this.channel = item.channel
        this.withdrawForm = item
        this.serviceCharge = 0
        this.actualFee = 0
      },
      // 计算手续费
      calcServiceCharge() {
        if (this.isNumber(this.withdrawForm.amount) && this.withdrawForm.amount > 0) {
          const rateVal = this.withdrawForm.amount * this.withdrawForm.serviceChargeRate * 0.01
          this.serviceCharge = rateVal > this.withdrawForm.serviceChargeMin ? rateVal : this.withdrawForm.serviceChargeMin
          this.actualFee = this.withdrawForm.amount - this.serviceCharge > 0 ? this.withdrawForm.amount - this.serviceCharge : 0
        }
      },
      formatChannel(channel, type) {
        if (type === 'class') return channel === 'wx' ? {class: 'success_color', icon: '&#xe612;'} : channel === 'zfb' ? {class: 'text_color', icon: '&#xe605;'} : channel === 'bank' ? {class: 'warn_color', icon: '&#xe625;'} : {}
        if (type === 'icon') return channel === 'wx' ? '#iconweixin' : channel === 'zfb' ? '#iconzhifubao1' : channel === 'bank' ? '#iconyinhangka1' : '#iconyinhangka1'
        return channel === 'wx' ? '微信' : channel === 'zfb' ? '支付宝' : channel === 'bank' ? '银行' : ''
      },
      // 执行提现
      withdrawMoney() {
        if (this.actualFee <= 0) {
          this.$message.error('实际到账金额需大于0')
          return false
        }
        this.$refs.withdrawForm.validate(valid => {
          if (valid) {
            const param = {
              userType: 'stall',
              status: 'SUBMIT',
              account: this.withdrawForm.account,
              amount: this.withdrawForm.amount,
              payPwd: this.withdrawForm.payPwd,
              type: this.withdrawForm.channel,
              serviceCharge: this.serviceCharge
            }

            this.$post(this._basePath.ajaxStallWithdraw, param).then(res => {
              if (res.success) {
                this.$message.success('申请提交成功')
                this.withdrawShow = false
                this.getChannelList()
              }
            })
          }
        })
      },
      goback() {
        this.withdrawShow = false
        this.$refs.withdrawForm.resetFields()
      }
    }
  }
</script>
<style>
  .withdraw_specification h3{
    margin:10px 0;
    font-size:18px
  }
  .withdraw_specification p{
    line-height:20px
  }
</style>
<style lang="stylus">
  @import '~@/assets/css/index'
  #withdraw_page
    .specail_form
      .el-form-item
        mb(10px)
    .el-input
      width:300px !important
    .tips
      vertical(40px)
      bgColor()
      color(text_color)
      border_(1px solid text_color)
    .sec_part
      .account_balance
        boxShadow()
        height 100px
        setMiddle()
        fn(20px)
        margin:20px 0
      .account_choose
        boxShadow()
        setAround()
        padding:100px 20px
        li
          setStart()
          align-items:flex-start
          height:180px
          padding:30px 20px 10px 20px
          relative()
          border_()
          .err_msg
            absolute()
            left:0
            right:0
            center()
            bottom:-20px
          .svg-icon
            inline()
            square(50px)
            mr(10px)
          .set_column
            h3
              fn(20px)
            .first_span
              margin:10px 0
          .process_btn
            absolute()
            cursor()
            bottom:0
            left:1px
            vertical(35px)
            right:1px
            center()
            bort(1px solid #ddd)
            color(text_color)
            bgColor()
            &.light_color
              color(light_color)
              cursor: not-allowed
</style>