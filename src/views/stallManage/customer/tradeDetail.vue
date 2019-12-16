<template>
	<section class="app-container" id="good_list">
    <div>
      <!--查询条-->
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-form-item>
          <date-pick ref="dateFilter"></date-pick>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="queryData">查询</el-button>
        </el-form-item>
      </el-form>
      <div style="margin-bottom:10px" class="fn16 bold">客户名: {{details.name}}</div>
      <div style="margin-bottom:10px">
        <el-radio-group v-model="type" size="medium" @change="radioChange">
          <el-radio-button :label="1">还款</el-radio-button>
          <el-radio-button :label="-1">赊账</el-radio-button>
        </el-radio-group>
      </div>
      <!--列表-->
      <record-count :total="total">
      </record-count>
      <el-table :data="users" highlight-current-row style="width: 100%;" v-loading="loading">
        <el-table-column prop="tradeTime" label="时间" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column prop="amount" label="金额">
        </el-table-column>
        <el-table-column prop="category" label="账目类型">
        </el-table-column>
        <!-- <el-table-column prop="online" label="来源" :formatter="formatOnline">
        </el-table-column> -->
        <el-table-column prop="debt" label="欠款结余">
        </el-table-column>
      </el-table>
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
          @current-change="handleCurrentChange" :page-size="pageSize" :current-page="pageNum" :total="total">
        </el-pagination>
      </div>
    </div>
	</section>
</template>
<script>
import Const from './const'
export default {
  data() {
    return {
      filters: {
        online: 1
      },
      type: 1,
      users: [],
      loading: false,
      total: 0,
      pageNum: 1,
      pageSize: 10,
    }
  },
  props: ['details'],
  mounted () {
    this.getUsers()
    this.queryData = this._debounce(this.queryData)
  },
  components: {},
  methods: {
    formatCreateTime(row) {
      return this._formatTime(row.tradeTime, true)
    },
    formatSettleType(row) {
      const payWay = row.accountTypeCode
      return payWay === 'zfb' ? '支付宝' : payWay === 'wx' ? '微信' : payWay === 'balance' ? '账户余额' : '现金'
    },
    formatOnline(row) {
      // 1，线上；2，线下
      return row.online === 1 ? '线上' : row.online === 2 ? "线下门店" : '——'
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    radioChange() {
      this.queryData()
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    // 获取用户列表
    getUsers() {
      const timeArr = this.$refs['dateFilter'].getParams()
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        customerId: this.details.id,
        startTime: timeArr[0],
        endTime: timeArr[1],
        type: this.type
      }
      let b = this.filters
      this.loading = true
      this.$postJson(this._basePath.ajaxCustomerTradeList, para).then(res => {
        this.loading = false
        if (res.success) {
          this.users = res.data.datas
          this.total = res.data.count
        }
      })
    }
  }
}
</script>

<style>
  .whole_col .el-input{
    width:110px
  }
  body>.slick_item>img{
    display:none
  }
  .toolbar_process {
    margin-top:20px
  }
  .inner_dialog{
    position:relative
  }
  .inner_dialog p{
    width:30px;
    height:30px;
    line-height:28px;
    text-align:center;
    border-radius:50%;
    position: absolute;
    top:50%;
    cursor:pointer;
    color:#fff;
    background-color:rgb(43, 134, 170);
    border:1px solid #ddd
  }
  .inner_dialog p:first-child{
    left:-30px
  }
  .inner_dialog p:last-child{
    right:-30px
  }
</style>
<style lang="stylus">
  @import '~@/assets/css/index'
  #good_list
    .img_form
      height:auto
</style>