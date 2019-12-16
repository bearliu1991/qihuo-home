<template>
	<section class="app-container" id="vip_custormer">
    <div v-if="!secShow && !vipSecShow && !goodsBuySecShow">
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="查询">
            <el-input v-model="filters.keyword" placeholder="VIP客户名/手机号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
            <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <div class="process_btns">
          <el-button type="primary" @click="handleAdd">新增VIP客户</el-button>
        </div>
      </el-col>
      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row @selection-change="selsChange" style="width: 100%;">
        <!-- <el-table-column type="selection" width="45">
        </el-table-column> -->
        <el-table-column prop="userName" label="VIP客户名">
        </el-table-column>
        <el-table-column prop="phone" label="手机号">
        </el-table-column>
        <el-table-column prop="phone" label="挂账客户">
          <template slot-scope="scope">
            {{scope.row.creditStatus === 'on' ? '是' : '否'}}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="客户状态">
          <template slot-scope="scope">
            <span :class="[scope.row.status === 'on' ? 'success_color' : 'err_color']">{{scope.row.status === 'on' ? '启用' : '禁用'}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注">
          <template slot-scope="scope">
            <span v-html="scope.row.remarks && scope.row.remarks.replace(/\n/g, '<br>')"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="460px">
          <template slot-scope="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button type="success" size="small" v-if="scope.row.status === 'off'" plain @click="setCustomerStatus(scope.row, 'on')">启用</el-button>
            <el-button type="danger" size="small" v-if="scope.row.status === 'on'" plain @click="setCustomerStatus(scope.row, 'off')">禁用</el-button>
            <!-- <el-button type="primary" size="small" plain @click="showHangup(scope.row)">挂账信息</el-button> -->
            <el-button type="primary" size="small" plain @click="goodsBuyClick(scope.row)">商品购买量</el-button>
            <el-button type="primary" size="small" plain @click="showReconciliation(scope.row)">对账单</el-button>
            <el-button size="small" type="primary" plain @click="openVipCustomer(scope.row)">编辑VIP价格</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
          @current-change="handleCurrentChange" :current-page="pageNum" :page-size="pageSize" :total="total">
        </el-pagination>
      </div>
    </div>
    <Secondary title="编辑VIP价格" v-model="vipSecShow">
      <VipPrice :curCustomer="curRow" v-if="vipSecShow"></VipPrice>
    </Secondary>
    <secondary :title="title" v-model="secShow">
      <vip-reconciliation v-if="secShow" :curItem="curItem"></vip-reconciliation>
      <!-- <HangupBill v-if="secShow" :curItem="curItem"></HangupBill> -->
    </secondary>
    <Secondary :title="title" v-model="goodsBuySecShow">
      <GoodsBuy :curCustomer="curItem" v-if="goodsBuySecShow"></GoodsBuy>
    </Secondary>
		<!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogShow"
      width="600px">
      <el-form :model="editForm" style="width: 60%; margin: auto;" label-width="120px" :rules="editFormRules" ref="editForm">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="editForm.userName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" class="phone_input">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remarks" class="textarea_input">
          <el-input v-model="editForm.remarks" type="textarea" placeholder="请输入备注"></el-input>
        </el-form-item>
        <el-form-item label="是否为挂账客户">
          <el-switch
            v-model="editForm.creditStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="on"
            inactive-value="off">
          </el-switch>
        </el-form-item>
        <el-form-item label="客户状态">
          <el-switch
            v-model="editForm.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-value="on"
            inactive-value="off">
          </el-switch>
        </el-form-item>
			</el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogShow = false">取 消</el-button>
        <el-button type="primary" @click="createData">确 定</el-button>
      </span>
    </el-dialog>
	</section>
</template>

<script>
import HangupBill from './hangupBill'
import GoodsBuy from './goodsBuy'
import VipPrice from './vipPrice'
import VipReconciliation from './VipReconciliation'
export default {
  data() {
    return {
      // 用户级别类型
      secShow: false,
      goodsBuySecShow: false,
      title: '',
      vipSecShow: false,
      dialogShow: false, // 是否展示二级编辑页面
      dialogStatus: '',
      curRow: {},
      curItem: {},
      textMap: {
        update: '编辑VIP客户',
        create: '新增VIP客户'
      },
      filters: {
        keyword: ''
      },
      users: [],
      sels: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      editFormRules: {
        userName: [
          { required: true, validator: this.noEmpty, message: '请输入用户名', trigger: 'blur' },
          { required: true, validator: this.lessThen, message: '用户名不超过15个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: this.mobileReg, message: '手机号格式有误', trigger: 'blur' }
        ],
        remarks: [{ validator: this.lessThen50, message: '备注内容不超过50个字符', trigger: 'blur' }]
      },
      // 编辑界面数据
      editForm: {
        userName: '',
        phone: '',
        creditStatus: 'off',
        status: 'on',
        remarks: ''
      }
    }
  },
  created () {
    this.getUsers()
    this.queryData = this._debounce(this.queryData)
    this.createData = this._debounce(this.createData)
    this.setCustomerStatus = this._debounce(this.setCustomerStatus)
  },
  components: {HangupBill, VipReconciliation, VipPrice, GoodsBuy},
  methods: {
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    clearFilter() {
      this.filters = {
        keyword: ''
      }
    },
    // 显示挂账信息
    showHangup(row) {
      this.secShow = true
      this.curItem = row
      this.title = `挂账信息-${row.userName}`
    },
    // 显示对账单信息
    showReconciliation(row) {
      this.secShow = true
      this.curItem = row
      this.title = `对账单-${row.userName}`
    },
    goodsBuyClick(row) {
      this.goodsBuySecShow = true
      this.curItem = row
      this.title = `商品购买量-${row.userName}`
    },
    // 用户名验证规则
    lessThen(rule, value, callback) {
      if (value.length > 15) {
        callback(new Error(rule.message));
      } else {
        callback()
      }
    },
    lessThen50(rule, value, callback) {
      if (this._isHasVal(value) && value.length > 50) {
        callback(new Error(rule.message));
      } else {
        callback()
      }
    },
    openVipCustomer(row) {
      this.vipSecShow = true
      this.curRow = row
    },
    // 获取用户列表
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        keyword:this.filters.keyword
      }
      this.$postJson(this._basePath.ajaxStallVipGetByPage, para).then(res => {
        if (res.success) {
          this.total = res.data.count
          this.users = res.data.datas
        }
      })
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = 'update'
      this.dialogShow = true
      this.$nextTick(() => {
        this.$refs['editForm'].resetFields()
        this.editForm = Object.assign({}, row)
      })
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = 'create'
      this.dialogShow = true
      this.$nextTick(() => {
        this.$refs['editForm'].resetFields()
        this.editForm = {
          userName: '',
          remarks: '',
          phone: '',
          creditStatus: 'off',
          status: 'on'
        }
      })
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          let param = Object.assign({}, this.editForm)
          param.stallId = this.getCookie('stallId')
          this.$post(this._basePath.ajaxStallVipSave, param).then(res => {
            if (res.success) {
              this.$message({
                message: '保存成功',
                type: 'success'
              })
              this.$refs['editForm'].resetFields()
              this.dialogShow = false
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
    // 设置客户状态
    setCustomerStatus(row, status) {
      if (status === 'off') {
        const self = this
        this.$confirm('确定禁用该客户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$postJson(this._basePath.ajaxStallVipEnable, {id: row.id, status: 'off'}).then(res => {
            if (res.success) {
              this.$message.success('禁用成功！')
              self.getUsers()
            }
          })
        })
      } else if (status === 'on') {
        this.$postJson(this._basePath.ajaxStallVipEnable, {id: row.id, status: 'on'}).then(res => {
          if (res.success) {
            this.$message.success('启用成功！')
            this.getUsers()
          }
        })
      }
    },
  }
}
</script>
<style>
  #vip_custormer .phone_input.el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before {
    content: ''
  }
  #vip_custormer .el-dialog .el-textarea__inner{
    height:100px
  }
</style>
<style lang="stylus" scoped>
  @import '~@/assets/css/index'
  #vip_custormer
    .el-dialog
      .el-switch
        mt(10px)
    .toolbar_process 
      margin-top:20px
    .order_detail
      border_()
      padding:20px
      height:200px
      overflow-y:auto
      li
        vertical(24px)
        setStart()
        span
          width:150px
          color(text_color)
          cursor()
</style>