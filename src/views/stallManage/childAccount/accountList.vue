<template>
  <section class="app-container" id="account_list">
    <div v-show="!secShow">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <!-- <el-form-item>
            <el-input v-model="filters.phone" placeholder="手机号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="handleAdd">新增子账户</el-button>
            <el-button type="danger" @click="batchRemove()" :disabled="this.sels.length===0">批量删除</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      
      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row @selection-change="selsChange" style="width: 100%;">
        <el-table-column type="selection" width="45px">
        </el-table-column>
        <el-table-column prop="phone" label="手机号">
        </el-table-column>
        <el-table-column prop="userName" label="姓名">
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column prop="status" label="子账户状态" :formatter="formatStatus">
        </el-table-column>
        <el-table-column label="操作" width="250px">
          <template slot-scope="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <!-- <el-button size="small" type="primary" @click="rightEdit(scope.$index, scope.row)">权限分配</el-button> -->
            <el-button type="danger" size="small" @click="batchRemove(scope.row)">删除</el-button>
            <el-button type="danger" plain size="mini" v-if="scope.row.status === 1" @click="setCustomerStatus(scope.row)">禁用</el-button>
            <el-button type="success" plain size="mini" v-if="scope.row.status === 2" @click="setCustomerStatus(scope.row)">启用</el-button>
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

    <!--编辑界面-->
    <Secondary :title="textMap[dialogStatus]" v-model="secShow" @close="goback">
      <el-steps :active="activeStep" simple>
        <el-step title="子账号信息" icon="el-icon-edit"></el-step>
        <el-step title="分配权限" icon="el-icon-upload"></el-step>
      </el-steps>
      <template v-if="activeStep === 1 && secShow">
        <el-form :model="editForm" style="width:400px; height:500px; margin: auto; margin-top: 20px" label-width="150px" :rules="editFormRules" ref="editForm">
          <!-- <el-form-item label="用户名" prop="userName">
            <el-input v-model="editForm.userName" placeholder="用户登陆时使用, 如有重复, 可添加数字区分, 如'张三01'"></el-input>
          </el-form-item> -->
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="editForm.phone" placeholder="如: 18656123412"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" :class="[editForm.id !== undefined && 'no_star']">
            <el-input type="password" v-model="editForm.password" auto-complete="new-password" placeholder="6-16位字母或数字"></el-input>
          </el-form-item>
          <el-form-item label="重复密码" prop="repeatPsw" :class="[editForm.id !== undefined && 'no_star']">
            <el-input type="password" v-model="editForm.repeatPsw" auto-complete="new-password" placeholder="请重复密码"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="editForm.userName" placeholder="姓名"></el-input>
          </el-form-item>
          <!-- <el-form-item label="权限选择" prop="codeList">
            <el-checkbox-group v-model="editForm.codeList">
              <el-checkbox label="cashier">一体机</el-checkbox>
              <el-checkbox label="pcStallBackend">PC档口后台</el-checkbox>
              <el-checkbox label="pda">手持设备</el-checkbox>
              <el-checkbox label="boss">老板端小程序</el-checkbox>
            </el-checkbox-group>
          </el-form-item> -->
          <el-form-item label="子账户状态">
            <el-switch
              v-model="editForm.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="1"
              :inactive-value="2">
            </el-switch>
          </el-form-item>
        </el-form>
        <div class="btns">
          <el-button @click="goback">取消</el-button>
          <el-button type="primary" @click="goStep(1)">下一步</el-button>
        </div>
      </template>
      <template v-else>
        <rights-allocate ref="rights" :curItem="editForm"></rights-allocate>
        <div class="btns">
          <el-button type="primary" @click="goStep(-1)">上一步</el-button>
          <el-button type="primary" @click="createData">保存</el-button>
        </div>
      </template>
    </Secondary>
    <!-- <Secondary title="权限分配" v-model="rightSetShow">
      <NestCheckbox ref="nestCheckbox" :treeData="treeData" :checkedKeys="checkedKeys"></NestCheckbox>
      <div slot="footer" class="dialog-footer">
       <el-button @click.native="rightSetShow = false">取消</el-button>
        <el-button type="primary" @click="setRights">添加</el-button>
      </div>
    </Secondary> -->
  </section>
</template>
<script>
import RightsAllocate from './rightsAllocate'

export default {
  data() {
    return {
      editRole: {roleId: null},
      activeStep: 1,
      rightSetShow:false,
      secShow: false, // 是否展示二级编辑页面
      isJoin: false,
      userStatus: [
        // 0--未激活，1--正常，2--禁用
        {label: '未激活', value: 0},
        {label: '正常', value: 1},
        {label: '禁用', value: 2}
      ],
      dialogStatus: '',
      textMap: {
        update: '编辑子账户',
        create: '创建子账户'
      },
      dialogFormVisible: false,
      filters: {
        phone: ''
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      // 树数据
      treeData: [],
      checkedKeys: [],
      sels: [], // 列表选中列
      editFormRules: {
        phone: [
          { required: true, validator: this.noEmpty, message: '手机号不能为空', trigger: 'blur' },
          { required: true, validator: this.mobileReg, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        userName: [{ required: true, validator: this.noEmpty, message: '姓名不能为空', trigger: 'blur' }],
        password: [
          { required: true, validator: this.noEmpty, message: '密码不能为空', trigger: 'blur' },
          { required: true, validator: this._sixOrMore, message: '6至16位字母或数字', trigger: 'blur' }
        ],
        repeatPsw: [
          { required: true, validator: this.noEmpty, message: '密码不能为空', trigger: 'blur' },
          { required: true, validator: this._sixOrMore, message: '6至16位字母或数字', trigger: 'blur' },
          { required: true, validator: this.checkRepeatPsw, message: '两次密码不一致', trigger: 'blur' }
        ],
        codeList: [{ required: true, validator: this.moreThanOne, message: '至少选择一个系统', trigger: 'change' }]
      },
      // 编辑界面数据
      editForm: {
        userName: '',
        phone: '',
        password: '',
        repeatPsw: '',
        codeList:[],
        status: 1
      },
      ids: [],
      addFormVisible: false // 新增界面是否显示
    }
  },
  components: {RightsAllocate},
  created() {
    this.init()
    this.queryData = this._debounce(this.queryData)
    this.setCustomerStatus = this._debounce(this.setCustomerStatus)
    this.createData = this._debounce(this.createData)
  },
  methods: {
    init() {
      this.getUsers()
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    formatCreateTime(row) {
      return this._formatTime(row.createTime)
    },
    formatStatus: function(row) {
      const obj = this.userStatus.find(item => item.value === row.status)
      return obj ? obj.label : row.status
    },
    // 重复密码时验证密码
    checkRepeatPsw(rule, value, callback) {
      if (value !== this.editForm.password) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    moreThanOne(rule, value, callback) {
      if (!value || !value.length) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    // 禁用启用
    setCustomerStatus(row) {
      if (row.status === 1) {
        const self = this
        this.$confirm('确定禁用该客户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$postJson(this._basePath.ajaxUserEnable, {userId: row.id, status: 2}).then(res => {
            if (res.success) {
              this.$message.success('禁用成功！')
              self.getUsers()
            }
          })
        })
      } else if (row.status === 2) {
        this.$postJson(this._basePath.ajaxUserEnable, {userId: row.id, status: 1}).then(res => {
          if (res.success) {
            this.$message.success('启用成功！')
            this.getUsers()
          }
        })
      }
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    getUserRights() {
      const para = {
        userId: this.editForm.id
      }
      return new Promise(resolve => {
        this.$postJson(this._basePath.ajaxMenuByUserId, para).then(res => {
          const data = res.data
          data ? resolve(data.map(item => item.menuId)) : resolve([])
        })
      })
    },
    formatData(arrs) {
      if (arrs) {
        for (let item of arrs) {
          const idxs = arrs.filter((val) => {
            return item.id === val.parentId
          })
          for (let idx of idxs) {
            item.children ? item.children.push(idx) : item.children = [idx]
            idx.isDelete = true
          }
        }
        for (let i = arrs.length - 1; i >= 0; i--) {
          if (arrs[i].isDelete) arrs.splice(i, 1)
        }
      }
      return arrs || []
    },
    // 获取用户列表
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
      }
      let b = this.filters
      this.$postJson(this._basePath.ajaxUserByPage, {...para, ...b}).then(res => {
        if (res.success) {
          this.total = res.data.count
          this.users = res.data.datas
        }
      })
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = 'update'
      this.secShow = true
      this.editForm = Object.assign({}, row)
      this.$set(this.editForm, 'password', '')
      this.$set(this.editForm, 'repeatPsw', '')
      this.editFormRules = {
        phone: [
          { required: true, validator: this.noEmpty, message: '手机号不能为空', trigger: 'blur' },
          { required: true, validator: this.mobileReg, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        userName: [{ required: true, validator: this.noEmpty, message: '姓名不能为空', trigger: 'blur' }],
        password: [
          { required: true, validator: this._sixOrMore, message: '6至16位字母或数字', trigger: 'blur' }
        ],
        repeatPsw: [
          { required: true, validator: this._sixOrMore, message: '6至16位字母或数字', trigger: 'blur' },
          { required: true, validator: this.checkRepeatPsw, message: '两次密码不一致', trigger: 'blur' }
        ],
        codeList: [{ required: true, validator: this.moreThanOne, message: '至少选择一个系统', trigger: 'change' }]
      }
    },
    async rightEdit(index, row) {
      this.editForm = Object.assign({}, row)
      this.rightSetShow = true
      this.treeData = await this.getAllRights()
      this.checkedKeys = await this.getUserRights()
    },
    // 分配权限
    setRights() {
      const menuIdList = this.$refs['nestCheckbox'].getParams()
      const para = {
        userId: this.editForm.id,
        menuIdList: menuIdList
      }
      this.$post(this._basePath.ajaxAuthAuth, para).then(res => {
        if (res.success) {
          this.$message.success('分配成功')
          this.rightSetShow = false
        }
      })
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = 'create'
      this.secShow = true
      this.editForm = {
        userName: '',
        phone: '',
        password: '',
        repeatPsw: '',
        codeList:[],
        status: 1
      }
      this.editFormRules = {
        phone: [
          { required: true, validator: this.noEmpty, message: '手机号不能为空', trigger: 'blur' },
          { required: true, validator: this.mobileReg, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        userName: [{ required: true, validator: this.noEmpty, message: '姓名不能为空', trigger: 'blur' }],
        password: [
          { required: true, validator: this.noEmpty, message: '不能为空', trigger: 'blur' },
          { required: true, validator: this._sixOrMore, message: '6至16位字母或数字', trigger: 'blur' }
        ],
        repeatPsw: [
          { required: true, validator: this.noEmpty, message: '不能为空', trigger: 'blur' },
          { required: true, validator: this._sixOrMore, message: '6至16位字母或数字', trigger: 'blur' },
          { required: true, validator: this.checkRepeatPsw, message: '两次密码不一致', trigger: 'blur' }
        ]
        // codeList: [{ required: true, validator: this.moreThanOne, message: '至少选择一个系统', trigger: 'change' }]
      }
      this.$nextTick(() => {
        this.$refs.editForm.resetFields()
      })
    },
    // 新增
    createData: function() {
      const menuList = this.$refs.rights.getParams()
      if (!menuList) return false
      let param = {
        phone: this.editForm.phone,
        menuList: menuList,
        status: this.editForm.status,
        userId: this.editForm.id,
        userName: this.editForm.userName,
        password: this.editForm.password
      }
      this.$post(this._basePath.ajaxSaveUser, param).then(res => {
        if (res.success) {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.getUsers()
          this.goback()
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
          const para = { ids: ids.toString()}
          this.$postJson(this._basePath.ajaxSubAccountDel, para).then(res => {
            if (res.success) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.queryData()
            }
          })
        })
        .catch(() => {})
    },
    goStep(num) {
      if (this.activeStep === 1) {
        this.editForm.type === 1 && this.$set(this.editFormRules, 'routePath', [])
        this.$refs.editForm.validate(valid => {
          if (valid) {
            this.activeStep = 2
          }
        })
      } else {
        this.activeStep = 1
      }
    },
    goback() {
      this.activeStep = 1
      this.secShow = false
    }
  }
}
</script>

<style lang="stylus">
  @import '~@/assets/css/index'
  #account_list
    .no_star
      .el-form-item__label
        &:before
          content: '' !important
    .switch_ul
      setStart()
      li
        mr(20px)
        setStart()
        >span
          inline()
          alignR()
    .el-steps
      width:80%
      margin:20px auto
    .btns
      mt(30px)
      setMiddle()
</style>