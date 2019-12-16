<template>
	<section class="app-container" id="customerList">
    <div v-show="!secShow && !vipSecShow">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="查询">
            <el-input v-model="filters.nameOrPhoneOrCode" placeholder="客户名/手机号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
            <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <div class="process_btns">
          <el-button type="primary" @click="handleAdd">新增客户</el-button>
        </div>
      </el-col>

      <!--列表-->
      <record-count :total="total">
        <!-- <div class="bold fn16">总欠款金额(元):  <span class="err_color">{{}}</span></div> -->
      </record-count>
      <el-table :data="users" highlight-current-row @selection-change="selsChange" v-loading="loading" style="width: 100%;">
        <el-table-column type="selection" width="45">
        </el-table-column>
        <el-table-column prop="name" fixed label="客户名">
        </el-table-column>
        <el-table-column prop="phone" label="手机号">
        </el-table-column>
        <el-table-column prop="phone" label="备注名称" min-width="120">
          <template slot-scope="scope">
            <div class="editable_div">
              <el-form :model="scope.row" :ref="'remark' + scope.$index">
                <el-form-item
                  prop="remark"
                  :rules="[
                    {validator: lessThen50, message: '备注内容不超过50个字符', trigger: 'blur'}
                  ]"
                >
                  <el-input type="textarea" @focus="focusEvent(scope.row, 'remark')" @blur="modifyMark(scope.row, 'remark', scope.$index)" size="mini" v-model.trim="scope.row.remark"></el-input>
                </el-form-item>
              </el-form>
              <!-- <el-input size="mini" @focus="focusEvent(scope.row)" 
                @blur="modifyMark(scope.row)" v-model.trim="scope.row.remark"></el-input> -->
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="orderNum" label="订单数">
        </el-table-column> -->
        <el-table-column prop="debt" label="欠收金额(元)">
        </el-table-column>
        <el-table-column label="操作" width="320px" fixed="right">
          <template slot-scope="scope">
            <!-- <el-button size="small" type="primary" @click="compelDebt(scope.row)" v-if="scope.row.debt && scope.row.debt > 0">催款</el-button> -->
            <!-- <el-button size="small" type="primary" @click="showSettleDialog(scope.row)" v-if="scope.row.debt && scope.row.debt > 0">立即结算</el-button> -->
            <el-button size="small" type="primary" plain @click="debtInfo(scope.row)">欠款信息</el-button>
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑客户</el-button>
            <!-- <el-button size="small" type="primary" plain @click="openVipCustomer(scope.row)">编辑VIP价格</el-button> -->
            <!-- <el-button type="danger" size="small" plain @click="batchRemove(scope.row)">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
          @current-change="handleCurrentChange" :page-size="pageSize" :current-page="pageNum" :total="total">
        </el-pagination>
      </div>
    </div>

       <!-- 立即结算 -->
    <el-dialog
      title="立即结算"
      :visible.sync="settleDialog"
      center
      width="600px">
      <!-- <div>
        <span>欠收金额:</span><i>{{2000}}</i>
      </div> -->
      <el-form :model="settleForm" :inline="true" style="width:60%; margin:auto" ref="settleForm" @submit.native.prevent>
        <el-form-item label="欠收金额" class="err_color">
          ￥{{debtDetails.debt}}
        </el-form-item>
        <el-form-item label="结算金额" prop="settleAmount"
          :rules="[{ validator: this.mustNumber, message: '必须为数字', trigger: 'blur'}]"
        >
          <el-input v-model="settleForm.settleAmount" placeholder="请输入结算金额"></el-input>
        </el-form-item>
        <div class="fn12 light_color" style="line-height:20px">说明：若客户已经还款线下还款，请输入收到的金额，以便于统计该客户的欠收金额</div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="settleDialog = false">取消</el-button>
        <el-button type="primary" @click="settleImmdiate" :disabled="isConfirmSettle">确认结算</el-button> 
      </div>
    </el-dialog>

    <!--批量修改VIP-->
    <el-dialog
      title="修改VIP等级"
      :visible.sync="dialogVisible"
      width="600px">
      <el-radio-group v-model="modifyVip" class="el_group">
        <el-radio :label="item.value" v-for="(item, index) in levelTypes" :key="index" border>{{item.label}}</el-radio>
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialog">取 消</el-button>
        <el-button type="primary" @click="batchVip">确 定</el-button>
      </span>
    </el-dialog>

    <Secondary title="编辑VIP价格" v-model="vipSecShow">
      <VipPrice :curCustomer="curRow" type="mall" v-if="vipSecShow"></VipPrice>
    </Secondary>
		<!--编辑界面-->
		<Secondary :title="textMap[dialogStatus]" v-model="secShow">
      <div class="customer_detail boxshadow">
        <div>
          <div>
            <i class="fn18 bold">欠款结余(元)</i>
            <span>
              <el-tooltip class="item" effect="dark" :content="debtTip" :open-delay="300" placement="top-start">
                <span class="icon light_color tips">&#xe657;</span>
              </el-tooltip>
            </span>
          </div>
          <span class='err_color fn20'>￥{{debtDetails.debt}}</span>
          <el-button type="text" style="margin-left:20px" @click="checkTradeDetail">查看还款记录</el-button>
          <div class="light_color fn12">上次还款日2月19日</div>
        </div>
        <!-- <div>
          <span>待入账金额(元)</span>
          <i></i>
          <div>{{debtDetails.toDebt}}</div>
        </div> -->
        <div>
          <el-button type="primary" plain @click="compelDebt">催款</el-button>
          <el-button type="primary" plain @click="showSettleDialog">手动还款</el-button>
          <span>
            <el-tooltip class="item" effect="dark" :content="manualSettleTip" :open-delay="300" placement="top-start">
              <span class="icon light_color tips">&#xe657;</span>
            </el-tooltip>
          </span>
        </div>
      </div>
      <MallCustomerOrder @getOrderDetail="getOrderDetail" :id="debtDetails.id" v-if="secShow"></MallCustomerOrder>
		</Secondary>
    <Drawer v-model="showDrawer" :title="drawerTitle" width="800px">
      <OrderDetail :details="details" v-if="orderDetailShow"></OrderDetail>
      <TradeDetail :details="debtDetails" v-if="showTradeDetail"></TradeDetail>
    </Drawer>
    <Drawer v-model="showDrawer1" title="客户管理" class="drawer_cont">
      <!-- 新增客户-->
      <template v-if="addCustomerShow">
        <el-form :inline="true" :model="phoneForm" style="margin-top: 50px" class="set_middle" @submit.native.prevent ref="phoneForm">
          <el-form-item label="查找客户" prop="phone" 
            :rules="[
              { validator: this.noEmpty, message: '手机号不能为空', trigger: 'blur'},
              { validator: this.mobileReg, message: '请填写正确的手机号码', trigger: 'blur'}
            ]">
            <el-input v-model="phoneForm.phone" placeholder="请输入客户手机号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchCustormer">客户搜索</el-button>
          </el-form-item>
        </el-form>
        <div class="split_line" v-if="searchRes.phone"></div>
        <div class="custorm_info" v-if="searchRes.phone">
          <div class="left_p">
            <img :src="searchRes.userImage" width="50px" height="50px">
            <div>
              <span>{{searchRes.userName}}</span>
              <p>{{searchRes.phone}}</p>
            </div>
          </div>
          <el-button type="primary" size="mini" v-if="showAddBtn" @click="addCustorm">添加客户</el-button>
          <el-button type="primary" size="mini" v-else @click="editCustomer">去编辑</el-button>
        </div>
      </template>
      <template v-else>
        <div class="save_data">
          <el-form class="edit_form" :model="editForm" label-width="150px" ref="editForm">
            <el-form-item label="客户名" prop="name">
              {{editForm.name}}
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              {{editForm.phone}}
            </el-form-item>
            <el-form-item label="备注名称" prop="remark"
              :rules="[{validator: lessThen50, message: '备注内容不超过50个字符', trigger: 'blur'}]">
              <el-input type="textarea" v-model="editForm.remark"></el-input>
            </el-form-item>
            <!-- <el-form-item label="价格等级标签">
              <el-select v-model="editForm.vip">
                <el-option v-for="(item, index) in levelTypes" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item> -->
            <!-- <el-form-item label="是否赊账">
              <el-switch
                v-model="editForm.isDebt"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0">
              </el-switch>
            </el-form-item> -->
            <!-- <el-form-item label="欠收金额">
              <div class="oweMoney">
                <span>￥{{editForm.preRate}}</span>
                <i @click="showTrade">查看客户对账单</i> -->
              <!-- </div>
            </el-form-item> -->
            <!-- <el-form-item label="赊账预收款比例" prop="preRate" v-if="editForm.isDebt"
              :rules="[{ required: true, validator: mustNumber, message: '请输入有效数字', trigger: 'blur'}]"
            >
              <el-input class="pre_rate" v-model="editForm.preRate"></el-input> %&nbsp;&nbsp;
              <span>用于小程序结算和商城赊账，采购方支付预收款比例</span>
            </el-form-item> -->
          </el-form>
        </div>
        <el-button slot="footer" type="primary" @click="createData">保存</el-button>
      </template>
    </Drawer>
	</section>
</template>

<script>
import Const from './const'
import OrderDetail from '../order/orderDetail'
import TradeDetail from './tradeDetail'
import VipPrice from './vipPrice'
import MallCustomerOrder from './mallCustomerOrder'
export default {
  data() {
    return {
      loading: false,
      settleDialog: false,
      vipSecShow: false,
      dialogVisible: false,
      isConfirmSettle: false,
      // 用户级别类型
      levelTypes: Const.levelTypes,
      settleTypes: Const.settleTypes,
      secShow: false, // 是否展示二级编辑页面
      dialogStatus: '',
      // 侧边栏
      showDrawer: false,
      showDrawer1: false,
      orderDetailShow: false,
      tradeDetailShow: false,
      showAddBtn: true,
      drawerTitle: '',
      // 订单详情
      details: {},
      debts: [
        {label: '全部', value: ''},
        {label: '赊账', value: 1},
        {label: '不赊账', value: 0}
      ],
      textMap: {
        update: '编辑客户',
        create: '新增客户',
        customerInfo: '客户信息'
      },
      filters: {
        nameOrPhoneOrCode: '',
        vip: '',
        isDebt: ''
      },
      manualSettleTip: Const.manualSettleTip,
      debtTip: Const.debtTip,
      modifyVip: null,
      users: [],
      total: 0,
      curRow: {},
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      // 查找客户表单
      searchRes: {
        userName: "",
        phone: '',
        userImage: ''
      },
      addCustomerShow: false,
      phoneForm: {
        phone: ''
      },
      // 结算相关
      settleForm: {
        settleAmount: ''
      },
      settleFormRules: {
        settleAmount: [{ validator: this.mustNumber, message: '必须为数字', trigger: 'blur'}]
      },
      // editFormRules: {
      //   name: [{ required: true, validator: this.noEmpty, message: '请输入用户名', trigger: 'blur' }],
      //   phone: [
      //     { required: true, validator: this.noEmpty, message: '请输入手机号', trigger: 'blur' },
      //     { required: true, validator: this.mobileReg, message: '请输入正确的手机号码', trigger: 'blur' }
      //   ]
      // },
      // 编辑界面数据
      editForm: {
        name: '',
        phone: '',
        remark: '',
        // isDebt: false,
        // preRate: '',
        // vip: 0,
      },
      // 欠款信息
      debtDetails: {},
      showTradeDetail: false,
      infoDetail: false
    }
  },
  created () {
    this.getUsers()
    this.queryData = this._debounce(this.queryData)
    this.debtInfo = this._debounce(this.debtInfo)
    this.modifyMark = this._debounce(this.modifyMark)
    this.compelDebt = this._debounce(this.compelDebt)
    this.createData = this._debounce(this.createData)
  },
  components: {OrderDetail, TradeDetail, MallCustomerOrder, VipPrice},
  methods: {
    formatVip(row) {
      return this._formatVal(row.vip, this.levelTypes, 'value', 'label')
    },
    formatCreateTime(row) {
      return this._formatTime(row.createTime) || '—'
    },
    formatSettleType(val) {
      const status = val.isDebt
      /** 是否赊账，0，不赊账；1，赊账*/
      return status === 0 ? '不赊账' : status === 1 ? '赊账' : '—'
    },
    clearFilter() {
      this.filters = {
        nameOrPhoneOrCode: '',
        vip: '',
        isDebt: ''
      }
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    lessThen50(rule, value, callback) {
      if (this._isHasVal(value) && value.length > 50) {
        callback(new Error(rule.message));
      } else {
        callback()
      }
    },
    // 去编辑用户
    editCustomer() {
      this.addCustomerShow = false
      const item = this.users.filter(item => item.userId === this.searchRes.id)[0]
      this.editForm = Object.assign({}, item)
    },
    // 获取订单详情
    getOrderDetail(orderCode) {
      this.$postJson(this._basePath.ajaxOrderById, {orderCode: orderCode}).then(res => {
        if (res.success) {
          this.details = res.data
          this.drawerTitle = '订单详情'
          this.showTradeDetail = false
          this.showDrawer = true
          this.orderDetailShow = true
        }
      })
    },
    // 点击查看还款记录
    checkTradeDetail() {
      this.showDrawer = true
      this.orderDetailShow = false
      this.showTradeDetail = true
      this.drawerTitle = '客户对账'
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    // 备注名称置为编辑转台
    editName(row) {
      this.$set(row, 'codeEdit', true)
    },
    // 获取用户列表
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      let b = this.filters
      this.loading = true
      this.$postJson(this._basePath.ajaxCustomerByPage, {...para, ...b}).then(res => {
        this.loading = false
        if (res.success) {
          this.total = res.data ? res.data.count : 0
          this.users = res.data ? res.data.datas : []
        }
      })
    },
    // 展示订单详情
    showOrder(id) {
      this.$postJson(this._basePath.ajaxOrderById, {id: id}).then(res => {
        if (res.success) {
          this.details = res.data
          this.showDrawer = true
          this.orderDetailShow = true
          this.tradeDetailShow = false
        }
      })
    },
    // 展示交易详情
    // showTrade(id) {
    //   this.showDrawer = true
    //   this.orderDetailShow = false
    //   this.tradeDetailShow = true
    //   this.$postJson(this._basePath.ajaxOrderById, {id: id}).then(res => {
    //     if (res.success) {
    //       this.details = res.data
    //       this.showDrawer = true
    //       this.orderDetailShow = false
    //       this.tradeDetailShow = true
    //     }
    //   })
    // },
    // 
    openVipCustomer(row) {
      this.vipSecShow = true
      this.curRow = row
    },
    // 催账
    compelDebt() {
      this.$postJson(this._basePath.ajaxCustomerPay, {customerId: this.curRow.userId}).then(res => {
        if (res.success) {
          this.$message.success('催款消息成功发出！')
        }
      })
    },
    showSettleDialog() {
      this.settleDialog = true
      this.isConfirmSettle = false
      this.$refs.settleForm && this.$refs.settleForm.resetFields()
    },
    // 立即结算
    settleImmdiate() {
      this.isConfirmSettle = true
      this.$refs.settleForm.validate(valid => {
        if (valid) {
          const param = {
            stallCustomerId: this.curRow.id,
            amount: this.settleForm.settleAmount
          }
          this.$postJson(this._basePath.ajaxManualSettle, param).then(res => {
            this.isConfirmSettle = false
            if (res.success) {
              this.$message.success('操作成功')
              this.settleDialog = false
              this.debtInfo(this.curRow)
            }
          })
        }
      })
    },
    // 显示编辑界面
    handleEdit(row) {
      this.curRow = row
      this.$postJson(this._basePath.ajaxCustomerDetail, {id: row.id}).then(res => {
        if (res.success) {
          this.editForm = Object.assign({}, res.data)
          // this.$set(this.editForm, 'preRate', this.editForm.preRate * 100)
          this.dialogStatus = 'update'
          this.showDrawer1 = true
          this.addCustomerShow = false
        }
      })
    },
    debtInfo(row) {
      this.$postJson(this._basePath.ajaxCustomerDetail, {id: row.id}).then(res => {
        if (res.success) {
          this.debtDetails = res.data
          this.curRow = row
          this.secShow = true
          this.dialogStatus = 'customerInfo'
        }
      })
    },
    // 显示新增界面
    handleAdd() {
      this.addCustomerShow = true
      this.showDrawer1 = true
      this.showAddBtn = true
      this.searchRes = {}
      this.$set(this.phoneForm, 'phone', '')
    },
    focusEvent(row, validatorName) {
      if (!row[validatorName + 'Set']) {
        this.$set(row, [validatorName + 'Set'], true)
        this.$set(row, [validatorName + 'Old'], row[validatorName])
      }
    },
    // 修改备注名
    modifyMark(row, validatorName, index) {
      if (row[validatorName + 'Old'] === row[validatorName]) return false
      this.$refs[validatorName + index] && this.$refs[validatorName + index].validate(valid => {
        if (valid) {
          this.$post(this._basePath.ajaxCustomerSave, {id: row.id, userId: row.userId, remark: row.remark}, {}, true).then(res => {
            if (res.success) {
              this.$message({
                message: '修改成功',
                type: 'success'
              })
              this.$set(row, 'remarkOld', row.remark)
            }
          })
        }
      })
    },
    // 编辑
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          const form = this.editForm
          const para = {
            id: form.id,
            userId: form.userId,
            name: form.name,
            phone: form.phone,
            remark: form.remark,
            vip: form.vip,
            isDebt: form.isDebt,
            preRate: form.preRate ? form.preRate / 100 : 0
          }
          this.$post(this._basePath.ajaxCustomerSave, para, {}, true).then(res => {
            if (res.success) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.$refs['editForm'] && this.$refs['editForm'].resetFields()
              // this.addCustomerShow = true
              this.showDrawer1 = false
              this.getUsers()
            }
          })
        }
      })
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels
    },
    // 删除
    batchRemove(row) {
      let ids = row ? [row.id] : this.sels.map(item => item.id)
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { idList: ids.toString() }
          this.$postJson(this._basePath.ajaxCustomerDel, para).then(res => {
            if (res.success) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.getUsers()
            }
          })
        })
        .catch(() => {})
    },
    // 所搜客户
    searchCustormer() {
      this.$refs.phoneForm.validate(valid => {
        if (valid) {
          this.$postJson(this._basePath.ajaxCustomerSearch, {phone: this.phoneForm.phone}).then(res => {
            if (res.success) {
              this.searchRes = res.data
              this.showAddBtn = true
            }
          })
        }
      })
    },
    addCustorm() {
      this.$post(this._basePath.ajaxCustomerSave, {userId: this.searchRes.id}).then(res => {
        if (res.success) {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
          this.showAddBtn = false
          this.getUsers()
        }
      })
    },
    batchVip() {
      let ids = this.sels.map(item => item.id)
      const para = { idList: ids.toString() }
      this.$postJson(this._basePath.ajaxCustomerVIP, para).then(res => {
        if (res.success) {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.getUsers()
        }
      })
    },
    cancelDialog() {
      this.dialogVisible = false
      this.modifyVip = null
    }
  }
}
</script>

<style lang="stylus">
  @import '~@/assets/css/index'

  #customerList
    .drawer_cont
      .el-textarea__inner
        min-height:80px
    .tips
      fn(18px !important)
      color(#bbb)
      cursor()
    .edit_form
      .el-input
        width:300px
        &.pre_rate
          width:70px
    .customer_detail
      setAround()
      padding:20px
      mb(20px)
    .editable_div
      setStart()
      i
        ml(5px)
    .split_line
      border-bottom: 1px solid #ddd
    .custorm_info
      mt(50px)
      setAround()
      .left_p
        setStart()
        img
          mr(10px)
    .oweMoney
      setStart()
      fn(16px)
      span
        color(err_color)
      i
        ml(20px)
        color(text_color)
        cursor()
    .toolbar_process 
      margin-top:20px
    .el_group
      setColumn()
      .el-radio
        margin: 5px 0
        .el-radio__label
          padl(30px)
    .order_detail
      border_()
      padding:20px
      height:200px
      overflow-y:auto
      li
        vertical(24px)
        setStart()
        &:first-child
          span
            color(inherit)
        span
          width:150px
          color(text_color)
          cursor()
          
</style>