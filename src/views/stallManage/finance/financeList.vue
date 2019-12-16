<template>
	<section class="app-container" id="good_list">
    <div>
      <!--查询条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" @submit.native.prevent>
          <!-- <el-form-item label="类型">
            <el-select v-model="filters.online" @change="queryData" placeholder="交易方式">
              <el-option v-for="(item, index) in tradeWays" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="日期范围">
            <date-pick ref="dateFilter"  isLimit :maxDays="31" 
              size="mini" defaultIndex="30" :showArr="['today', 'lastWeek', 'last30']"></date-pick>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
            <!-- <el-button type="text" @click="clearSearch">清空筛选条件</el-button> -->
          </el-form-item>
        </el-form>
        <filter-list :filterList="filterList" @filterChange="queryData" ref="filterBtn"></filter-list>
      </el-col>

      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row style="width: 100%;" v-loading="loading">
        <el-table-column prop="id" label="交易流水号">
        </el-table-column>
        <el-table-column prop="tradeTime" label="交易时间" :formatter="formatTradeTime">
        </el-table-column>
        <el-table-column prop="tradeAmount" label="金额(元)">
        </el-table-column>
        <el-table-column prop="accountTypeCode" label="结算方式" :formatter="formatSettleType">
        </el-table-column>
        <el-table-column prop="remainingAmount" v-if="online === 1" label="账户余额(元)">
        </el-table-column>
        <el-table-column prop="tradeUserName" label="客户名">
          <template slot-scope="scope">
            {{scope.row.category === 'vipOrder' && scope.row.tradeUserName !== '散客' ? 'VIP客户: ' : ''}}{{scope.row.tradeUserName}}
          </template>
        </el-table-column>
        <el-table-column prop="tradeName" label="标题" width="200px">
          <template slot-scope="scope">
            <div style="font-weight:bold">{{scope.row.tradeName}}</div>
            <div class="fn12" v-if="scope.row.category !== 'manualRepayment'">{{formatType(scope.row.category)}}: {{scope.row.category === 'repayment' ? scope.row.tradeUserName : scope.row.bizTradeNo}}</div>
          </template>
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
      loading: false,
      online: 1, // 默认线上
      filterList: [
        {name: '账户余额明细', filterVal: {online: 1}},
        {name: '线下交易明细', filterVal: {online: 2}}
      ],
      // tradeWays: [
      //   {label: '账户余额明细', value: 1},
      //   {label: '线下交易明细', value: 2}
      // ],
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
    }
  },
  mounted () {
    this.getUsers()
    this.queryData = this._debounce(this.queryData)
  },
  components: {},
  methods: {
    formatTradeTime(row) {
      return this._formatTime(row.tradeTime, true) || '—'
    },
    formatAccountType(row) {
      return row.category
    },
    formatSettleType(row) {
      // 支付方式：0--未选择，1--现金，2--微信，3--支付宝, 4--赊账，5--余额, 6--微信+余额
      // cash(现金)、debt(赊账)、zfb（支付宝）、wx(微信)、 wx_balance(余额+微信)、balance（账户余额）
      if (this.online === 2) return '线下结算'
      const payWay = row.accountTypeCode
      return payWay === 'zfb' ? '支付宝' : payWay === 'wx' ? '微信' : payWay === 'balance' ? '账户余额' : payWay === 'cash' ? '现金' : payWay === 'wx_balance' ? '余额+微信' : '—'
    },
    formatType(category) {
      /** 账目类型 1.order: 订单 2.withdraw: 提现 3.repayment: 客户名 4.撤销:retreat 6.vipOrder: vip订单 */ 
      return category === 'order' || category === 'vipOrder' ? '订单编号' : category === 'withdraw' ? '提现单据号' :  ''
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    queryData(value) {
      value.online !== undefined && (this.online = value.online)
      this.pageNum = 1
      this.getUsers()
    },
    // 获取用户列表
    getUsers() {
      const timeArr = this.$refs['dateFilter'].getParams()
      if (!timeArr) return false
      const btnFilter = this.$refs['filterBtn'] && this.$refs['filterBtn'].getParams()
      let para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        startTime: timeArr[0],
        endTime: timeArr[1]
      }
      this.loading = true
      this.$postJson(this._basePath.ajaxTradeRecord, {...para, ...btnFilter}).then(res => {
        this.loading = false
        if (res.success) {
          this.total = res.data.count
          let data = res.data.datas
          data.forEach((item) => {
            item.codeEdit = false
            item.priceEdit = false
            item.storeEdit = false
          })
          this.users = data
        }
      })
    }
  }
}
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #good_list
    .img_form
      height:auto
</style>