<template>
	<section class="app-container" id="hang_bill">
    <div class="switch_header">
      <el-tabs v-model="settleStatus" class="switch_tabs" @tab-click="queryData">
        <el-tab-pane label="未结清" name="0"></el-tab-pane>
        <el-tab-pane label="已结清" name="1"></el-tab-pane>
      </el-tabs>
    </div>
    <div>
      <!--查询条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="查询">
            <el-input v-model="filters.orderCode" placeholder="订单编号"></el-input>
          </el-form-item>
          <el-form-item label="开单时间">
            <date-pick ref="dateFilter" v-model="reset"></date-pick>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
            <el-button type="text" @:click="clearSearch">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <div class="process_btns">
          <el-button type="primary" v-if="settleStatus === '0'" @click="switchChange()" :disabled="this.sels.length===0">批量设为已结清</el-button>
        </div>
      </el-col>

      <!--表格-->
      <record-count :total="total">
        <template v-if="settleStatus === '0'">挂账金额： <h3 class="err_color">￥{{info ? info.totalDebt || 0 : 0}}</h3></template>
      </record-count>
      <!-- <div class="table_records"><span class="icon">&#xe645;</span> 共<i> {{total}} </i>条记录</div> -->
      <el-table :data="users" @selection-change="selsChange" highlight-current-row v-loading="loading" style="width: 100%;">
        <el-table-column type="selection" width="45">
        </el-table-column>
        <el-table-column label="VIP客户订单编号" prop="orderCode" width="180px">
          <template slot-scope="scope">
            <el-button type="text" @click="getDetail(scope.row)">{{scope.row.orderCode}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="开单时间" prop="createTime" :formatter="formatTime">
        </el-table-column>
        <el-table-column label="应收金额" prop="shouldFee">
        </el-table-column>
        <el-table-column label="订单状态" prop="status">
          <template slot-scope="scope">
            <span :class="[formatStatus(scope.row, true)]">{{formatStatus(scope.row)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否结账" prop="settleStatus">
          <template slot-scope="scope">
            <span v-if="scope.row.settleType === 2" style="margin-right:10px" :class="[scope.row.settleStatus === 0 ? 'err_color' : 'success_color']">{{scope.row.settleStatus === 0 ? '否' : '是'}}</span>
            <span v-if="scope.row.settleType === 1" style="margin-right:10px" class="success_color">是</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template slot-scope="scope">
            <div class="process_td">
              <template>
                <el-button type="primary" plain size="small" @click="switchChange(scope.row)" v-if="scope.row.settleStatus === 0">设为已结清</el-button>
                <el-button type="primary" plain size="small" @click="switchChange(scope.row)" v-if="scope.row.settleStatus === 1">设为未结清</el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Drawer v-model="showDrawer" minWidth="750px" title="订单详情">
        <OrderDetail :details="details"></OrderDetail>
      </Drawer>
      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
          @current-change="handleCurrentChange" :page-size="pageSize" :current-page="pageNum" :total="total">
        </el-pagination>
      </div>
    </div>
  </section>
</template>
<script>
  import OrderDetail from '../order/orderDetail'
  export default {
    data() {
      return {
        loading: false,
        reset: false,
        users: [],
        info: {},
        settleStatus: '0',
        showDrawer: false,
        details: {},
        sels: [],
        filters: {
          orderCode: ''
        },
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    },
    props: {
      curItem: {
        type: Object,
        default: () => {}
      }
    },
    watch: {
      settleStatus() {
        this.settleStatus === '0' && this.getHangupInfo()
      }
    },
    components: {OrderDetail},
    mounted() {
      this.getUsers()
      this.getHangupInfo()
    },
    methods: {
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      formatTime(row) {
        return this._formatTime(row.createTime, true)
      },
      formatStatus(row, isClass) {
        // 订单状态：-1, 订单异常 0，未确认；1，进行中（已确认）；2，驳回；3，待付款；4，待出货（自提单才有）；" 
        // "5，待发货（物流单才有）；6，待签收（物流单才有）；7，交易完成；8，交易关闭（档口退单） 9，交易关闭（支付超时）; 10,交易关闭（作废关闭）
        const status = row.status
        if (isClass) {
          return (status === -1 ? 'warn_color' : status === 0 ? 'warn_color' : status === 1 ? '' : status === 2 ? 'err_color' 
          : status === 3 ? '' : status === 4 ? 'text_color' : status === 5 ? 'text_color'
          : status === 6 ? '' : status === 7 ? 'success_color' : status === 8 ? 'err_color' : status === 9 ? 'err_color' : status === 10 ? 'err_color' : '—')
        }

        return (status === -1 ? '订单异常' : status === 0 ? '待确认' : status === 1 ? '已确认' : status === 2 ? '订单驳回' 
          : status === 3 ? '待付款' : status === 4 ? '待出货' : status === 5 ? '待发货' 
          : status === 6 ? '待签收' : status === 7 ? '交易完成' : status === 8 ? '交易关闭-档口退单' : status === 9 ? '交易关闭-支付超时' : status === 10 ? '交易关闭-退货作废' : '—')
      },
      getDetail(row, isDrawer) {
        this.showDrawer = true
        this.$postJson(this._basePath.ajaxOrderById, {orderCode: row.orderCode}).then((res) => {
          if (res.success) {
            this.details = res.data || {}
            this.drawerDetail = res.data || {}
          }
        })
      },
      clearSearch() {
        this.reset = true
      },
      selsChange(sels) {
        this.sels = sels
      },
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      // vip客户是否结算
      switchChange(row) {
        // 批量的id
        let ids = row ? [row.orderCode] : this.sels.map(item => item.orderCode)
        let param = {
          orderCodeList: ids.toString(),
          vipCustId: this.curItem.id
        }
        if ((!row && ids.length) || row.settleStatus === 0) {
          const self = this
          this.$confirm('确定该客户已结清？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            param.settleStatus = 1
            this.$postJson(this._basePath.ajaxStallCustomerBatchEnable, param).then(res => {
              if (res.success) {
                this.$message.success('状态修改成功！')
                self.getUsers(true)
                this.getHangupInfo()
              }
            })
          })
        } else if (row.settleStatus === 1) {
          this.$confirm('将结账状态设为未结清？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            param.settleStatus = 0
            this.$postJson(this._basePath.ajaxStallCustomerBatchEnable, param).then(res => {
              if (res.success) {
                this.$message.success('状态修改成功！')
                this.getUsers(true)
              }
            })
          })
        }
      },
      // 获取挂账金额
      getHangupInfo() {
        let param = {
          customerId: this.curItem.id,
          settleStatus: this.settleStatus - 0
        }
        const timeArr = this.$refs['dateFilter'] && this.$refs['dateFilter'].getParams()
        this.$set(this.filters, 'startTime', timeArr[0])
        this.$set(this.filters, 'endTime', timeArr[1])

        this.$postJson(this._basePath.ajaxVipHangupDebt, {...param, ...this.filters}).then(res => {
          if (res.success) {
            this.info = res.data
          }
        })
      },
      getUsers(isRefreshCount) {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          customerId: this.curItem.id,
          settleStatus: this.settleStatus - 0
        }
        const timeArr = this.$refs['dateFilter'] && this.$refs['dateFilter'].getParams()
        this.$set(this.filters, 'startTime', timeArr[0])
        this.$set(this.filters, 'endTime', timeArr[1])

        this.$postJson(this._basePath.ajaxVipHangupBill, {...para, ...this.filters}).then(res => {
          this.loading = false
          if (res.success) {
            this.total = res.data.count
            this.users = res.data.datas
          }
        })
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #hang_bill
    .switch_header
      mb(20px)
    .switch_tabs
      .el-tabs__item
        fn(16px)
    .el-tabs__content
      padding:0
      
</style>