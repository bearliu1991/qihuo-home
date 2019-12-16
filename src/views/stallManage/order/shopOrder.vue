<template>
	<section class="app-container" id="order_list">
    <div v-show="!secShow">
      <!--查询条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="查询" v-if="_isHave(filters.orderType, [1, 2, 3])">
            <el-input v-model="filters.orderCode" placeholder="订单号"></el-input>
          </el-form-item>
          <!-- <el-form-item>
            <el-select v-model="filters.orderType" placeholder="订单类型">
              <el-option v-for="(item, index) in orderTypes" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item v-if="_isHave(filters.orderType, [1, 2])">
            <el-select v-model="filters.payType" placeholder="支付方式">
              <el-option v-for="(item, index) in payWays" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="_isHave(filters.orderType, [1, 2])">
            <el-select v-model="filters.settleStatus" placeholder="结算状态">
              <el-option v-for="(item, index) in settleStatusList" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="_isHave(filters.orderType, [1, 2])">
            <el-select v-model="filters.orderStatus" placeholder="订单状态">
              <el-option v-for="(item, index) in orderStatus" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="下单时间">
            <date-pick ref="dateFilter" v-model="reset"></date-pick>
          </el-form-item>
          <el-form-item prop="查询">
            <el-button type="primary" v-on:click="getUsers()">查询</el-button>
            <el-button type="text" v-on:click="clearSearch">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <div>
          <filter-list :filterList="filterList" @filterEmit="filterEmit"></filter-list>
        </div>
      </el-col>

      <!--列表-->
      <div class="table_records"><span class="icon">&#xe645;</span> 共<i> {{total}} </i>条记录</div>
      <el-table :data="tableArr" highlight-current-row v-loading="loading" style="width:100%">
        <el-table-column prop="orderCode" :label="columnLabel">
        </el-table-column>
        <el-table-column prop="createTime" label="开单时间" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column prop="customerName" label="客户名">
        </el-table-column>
        <el-table-column prop="finalAcount" label="交易状态">
        </el-table-column>
        <el-table-column prop="finalAcount" label="实收款">
        </el-table-column>
        <el-table-column prop="finalAcount" label="备货状态">
        </el-table-column>
        <el-table-column prop="" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini">查看</el-button>
            <el-button type="danger" plain size="small" @click="retreatOrder(scope.row)">退单</el-button>
            <el-button type="primary" size="mini" @click="stockUp(scope.row)">备货</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--工具条-->
      <el-col :span="24" class="toolbar_process">
        <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
        <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
        </el-pagination>
      </el-col>
    </div>

    <!-- 修改价格弹窗 -->
    <el-dialog
      title=""
      :visible.sync="shipVisible"
      width="600px">
      <el-form :inline="true" :model="billChangeForm" :rules="billChangeFormRules" ref="billChangeForm" @submit.native.prevent>
        <el-form-item prop="expressCode" label="订单总价为：">
          {{5500}}
        </el-form-item>
        <el-form-item label="修改后订单总价为：" prop="expessComp">
          <el-input @change="settleAmountChange(settleForm.settleAmount)" v-model="settleForm.settleAmount" placeholder=""></el-input>元
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="shipVisible=false">取消</el-button>
        <el-button type="primary" @click="shipImmediate">立即发货</el-button>
      </div>
    </el-dialog>

    <Drawer v-model="showDrawer">
      <el-form>
        <el-form-item>
          <el-table :data="users"  style="width: 100%;">
            <el-table-column prop="orderCode" label="图片">
              <template slot-scope="scope">
                <!-- <img :src="scope.row.imgurl" width="100px" height="100px"> -->
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="商品标题">
            </el-table-column>
            <el-table-column prop="orderCode" label="数量">
            </el-table-column>
            <el-table-column prop="orderCode" label="实际备货总数">
              <el-input></el-input><el-button type="primary" plain>已备齐</el-button>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-switch
            v-model="isEditSku"
            :active-value="1"
            active-color="#13ce66"
            :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="isEditSku">
          <!-- <el-table :data="transformData(scope.row)" border class="inner_table">
            <el-table-column label="" prop="color"></el-table-column> -->
            <!-- from orderDetail -->
            <!-- <el-table-column v-for="(item, index) in sizeSet" :label="item" :key="index" :prop="item"></el-table-column> -->
          <!-- </el-table> -->
        </el-form-item>
      </el-form>
    </Drawer>
    <Secondary title="订单详情" v-model="secShow">
      <OrderDetail :details="details" v-if="secShow"></OrderDetail>
    </Secondary>
	</section>
</template>
<script>
import Const from './const'
import OrderDetail from './orderDetail'
export default {
  data() {
    return {
      reset: false,
      isEditSku: false,
      showDrawer:false,
      loading: false,
      columnLabel: '订单编号',
      orderStatus:Const.orderStatus,
      settleStatusList: [
        {label: '未结清', value: 0},
        {label: '已结清', value: 1}
      ],
      filterList: [
        {name: '全部订单', filterVal: {}},
        {name: '待付款', filterVal: {settleStatus: 0}, num: 0},
        {name: '未备货', filterVal: {stockStatus: 1}, num: 0},
        {name: '待签收', filterVal: {distributionStatus: 3}, num: 0},
        {name: '已完成', filterVal: {status: 1}},
        {name: '交易关闭', filterVal: {status: 2}},
        {name: '退款管理', filterVal: {status: 3}}
      ],
      payWays:Const.payWays,
      settleTypes:Const.settleTypes,
      orderTypes:Const.orderTypes,
      secShow: false,
      tableArr: Const.tableArrs,
      filters: {
        orderCode: '',
        timeType: null,
        orderCodeOrCustomerNameOrCustomerPhone: '',
        orderType: 1,
        userId: 0,
        status: null
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      ids: [],
      details: {},
      // 正在操作的row
      curRow: {},
      // 弹框 设置未出货为出货
      outSendConfirm: false,
      // 弹窗 设置未发货为发货
      shipVisible: false,
      billChangeForm: {
        expressCode: '',
        expessComp: ''
      },
      billChangeFormRules: {
        expessComp: [{ required: true, validator: this.noEmpty, message: '请输入物流公司', trigger: 'blur'}]
      },
      // 未结算弹窗
      settleVisible: false,
      settleForm: {
        settleAmount: ''
      },
      settleFormRules: {
        settleAmount: [{ validator: this.mustNumber, message: '必须为数字', trigger: 'blur'}]
      },
      settleStatus: -1,
      settleType: null
    }
  },
  mounted() {
    this.init()
    this.getUsers()
  },
  components: {OrderDetail},
  methods: {
    init() {
      switch (this.$route.name) {
        case 'replenish':
          this.$set(this.filters, 'orderType', 2)
          break
        case 'retail':
          this.$set(this.filters, 'orderType', 4)
          break
        case 'refund':
          this.$set(this.filters, 'orderType', 3)
          break
        default:
          break
      }
    },
    // 获取订单详情
    getDetail(index, row) {
      this.$postJson(this._basePath.ajaxOrderById, {id: row.id}).then((res) => {
        if (res.success) {
          this.details = res.data
          this.secShow = true
        }
      })
    },
    // 筛选条件查询
    filterEmit(item) {
      this.getUsers(item)
    },
    formatOrderStatus(val, isClass) {
      const status = val.distributionStatus
      if (isClass) return status === 1 ? 'text_color cursor' : status === 2 ? 'text_color cursor' : status === 3 ? "err_color cursor" : ''
      // 1 未出货、4 已签收(扫码取货之后)（自提）， 4 已签收（现取）， 2 未发货、3 已发货（扫码录入快递单号之后）、4 已签收（采购商／档口手动确认）（物流）
      return status === 1 ? '未出货' : status === 2 ? '未发货' : status === 3 ? "待签收" : '已签收'
    },
    formatPayWay(val) {
      // 0--现金，1--微信，2--支付宝，3--赊账
      return val === 0 ? '现金' : val === 1 ? '微信' : val === 2 ? '支付宝' : '赊账'
    },
    formatCreateTime(val) {
      return this.$dateFns.format(val.createTime, 'YYYY-MM-DD HH:mm:ss')
    },
    formatSettleType(val) {
      const obj = this.settleTypes.find(item => { return item.value === val.settleType})
      return obj ? obj.label : ''
    },
    formatBool: function(row, column) {
      return row.isShow === true ? '是' : '否'
    },
    // 立即发货
    shipImmediate() {
      this.$refs.billChangeForm.validate(valid => {
        if (valid) {
          const param = {
            orderId: this.curRow.id,
            expressCode: this.billChangeForm.expressCode,
            expessComp: this.billChangeForm.expessComp
          }
          this.$postJson(this._basePath.ajaxOrderSendout, param).then(res => {
            if (res.success) {
              this.$message.success('操作成功')
              this.getUsers()
              this.shipVisible = false
            }
          })
        }
      })
    },
    settleAmountChange(val) {
      if (this.isNumber(val)) {
        if (val > this.curRow.shouldFee) {
          this.$set(this.settleForm, 'settleAmount', this.curRow.shouldFee)
        } else {
          if (this._isFloat(val)) {
            this.$set(this.settleForm, 'settleAmount', (val - 0).toFixed(2))
          }
        }
      }
    },
    // 备货
    stockUp() {

    },
    // 退单
    retreatOrder(row) {
      this.$confirm('退单后，此订单将作废（扫码支付金额将原路返回，现金支付金额需线下退回），确定退单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$postJson(this._basePath.ajaxOrderRetreatOrder, {orderCode: row.orderCode}).then(res => {
          if (res.success) {
            this.$message.success('操作成功')
            this.getUsers(true)
          }
        })
      }).catch(() => {
        
      })
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    clearSearch() {
      this.$bus.$emit('clearDate')
      this.filters = this._clearVal(this.filters, ['orderType', 'userId'])
    },
    // 获取用户列表
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
      }
      this.$set(this.filters, 'timeType', this.$refs['dateFilter'].getParams())
      let b = this.filters
      this.loading = true
      this.$postJson(this._basePath.ajaxOrderByPage, {...para, ...b}).then(res => {
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
  // .el-table__body
    // border-collapse:separate

  .header_row
    mt(20px)
    td
      padt(60px)
      position:static
      

  .row_header
    absolute()
    right:0
    left:0
    .header_wrap
      absolute()
      padl(20px)
      top:-77px
      vertical(40px)
      bgColor(#EAF8FF)
      width:100%
      span
        &:first-child
          mr(20px)

  #order_list
    .big_btn
      display:block
      label
        margin:10px
        display:block
        .el-radio-button__inner
          display:block
          radius(4px)
          ml(-1px)
          border-left:1px solid #dcdfe6
        &.is-active
          .el-radio-button__inner
            border-left:0
</style>