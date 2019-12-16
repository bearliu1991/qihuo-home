<template>
	<section id="customerOrder">
    <div>
      <!--查询条-->
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-form-item>
          <date-pick ref="dateFilter" :showBtn="false" isLimit :maxDays="366" 
            size="mini" defaultIndex="30" :showArr="['last30']"></date-pick>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="type" @change="radioChange" size="medium">
            <el-radio-button :label="1">赊账订单</el-radio-button>
            <el-radio-button :label="2">待入账</el-radio-button>
            <span>
              <el-tooltip class="item" effect="dark" :open-delay="300" placement="top-start">
                <div slot="content" class="tips_cont"> 
                  物流、自提订单: 交易完成前属于待入账订单
                  <br/>
                  <br/>
                  现取: 交易完成后1小时内, 属于待入账订单
                </div>
                <span class="icon light_color tips">&#xe657;</span>
              </el-tooltip>
            </span>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="queryData">查询</el-button>
        </el-form-item>
      </el-form>

      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row style="width: 100%;" v-loading="loading">
        <el-table-column prop="id" label="订单编号">
          <template slot-scope="scope">
            <el-button type="text" @click="getEmit(scope.row.orderCode)">{{scope.row.orderCode}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column prop="actualFee" label="订单金额(元)">
        </el-table-column>
        <el-table-column prop="customerId" label="来源" :formatter="formatOrigin">
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
export default {
  data() {
    return {
      filters: {
        online: 1
      },
      type:1, // 1，赊账单；2，待入账 
      users: [],
      radio: '赊账订单',
      total: 0,
      loading: false,
      pageNum: 1,
      pageSize: 10,
    }
  },
  props: ['id'],
  mounted () {
    this.getUsers()
    this.queryData = this._debounce(this.queryData)
  },
  components: {},
  methods: {
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    formatCreateTime(row) {
      return this._formatTime(row.createTime, true)
    },
    formatOrigin(row) {
      // PC:pc端；WX:微信小程序；POS:收银机
      const status = row.origin
      return status === 'PC' ? 'pc端' : status === 'WX' ? '线上商城' : status === 'POS' ? '线下门店' : '—'
    },
    formatSettleType(row) {
      const payWay = row.accountTypeCode
      return payWay === 'zfb' ? '支付宝' : payWay === 'wx' ? '微信' : payWay === 'balance' ? '账户余额' : '现金'
    },
    radioChange() {
      this.queryData()
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    getEmit(orderCode) {
      this.$emit('getOrderDetail', orderCode)
    },
    // 获取用户列表
    getUsers() {
      const timeArr = this.$refs['dateFilter'].getParams()
      if (!timeArr) return false
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        customerId: this.id,
        type:this.type,
        startTime: timeArr[0],
        endTime: timeArr[1]
      }
      let b = this.filters
      this.loading = true
      this.$postJson(this._basePath.ajaxCustomerTradeOrders, para).then(res => {
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
<style lang="stylus">
  @import '~@/assets/css/index'
  #customerOrder
    boxShadow()
    padding:20px
    .tips
      fr()
      mt(8px)
      ml(5px)
      line-height:20px
</style>