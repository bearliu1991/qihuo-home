<template>
    <section class="app-container" id="workList">
      <div>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" @submit.native.prevent>
            <el-form-item label="商品货号">
              <el-input v-model="filters.productCode" placeholder="商品货号"></el-input>
            </el-form-item>
            <!-- <el-form-item label="商品名称">
              <el-input v-model="filters.title" placeholder="商品名称"></el-input>
            </el-form-item> -->
            <el-form-item label="销售时间">
              <date-pick ref="dateFilter" isLimit :maxDays="366" 
                size="mini" defaultIndex="30" :showArr="['today', 'lastWeek', 'last30']"></date-pick>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button type="text" @click="clearSearch">清空搜索</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <!--列表-->
        <record-count :total="total"></record-count>
        <el-table :data="users" highlight-current-row style="width: 100%;">
          <!-- <el-table-column prop="title" min-width="200px" label="商品名称">
          </el-table-column> -->
          <el-table-column prop="productCode" label="商品货号">
          </el-table-column>
          <el-table-column prop="salesNum" label="销售量">
            <template slot-scope="scope">
              <span class="bold err_color">{{scope.row.salesNum}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="salesTotalFee" min-width="200px" label="销售金额(不包含减免金额)">
            <template slot-scope="scope">
              <span class="bold err_color">{{scope.row.salesTotalFee}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="returnNum" label="退货量">
          </el-table-column>
          <el-table-column prop="returnTotalFee" min-width="200px" label="退货金额(不包含减免金额)">
          </el-table-column>
          <el-table-column prop="remarks" min-width="200px" label="备注">
            <template slot-scope="scope">
              <div class="editable_div">
                <!-- <div v-if="!scope.row.codeEdit" v-html="scope.row.remarks && scope.row.remarks.replace(/\n/g, '<br>')"></div> -->
                <el-form :model="scope.row" :ref="'remarks' + scope.$index">
                  <el-form-item
                    prop="remarks"
                    :rules="[
                      { required: true, validator: codeLimit, message: '不大于200个字符', trigger: 'blur'}
                    ]"
                  >
                    <el-input size="mini" type="textarea" @focus="focusEvent(scope.row, 'remarks', scope.$index)" 
                      @blur="handlePartSave(scope.row, 'remarks', scope.$index)" v-model="scope.row.remarks"></el-input>
                  </el-form-item>
                </el-form>
                <!-- <i
                  v-if="!scope.row.codeEdit"
                  class="icon cursor fn20"
                  @click="editCode(scope.row)"
                >&#xea3d;</i> -->
                <!-- <i
                  v-if="scope.row.codeEdit"
                  class="icon cursor fn20"
                  @click="handlePartSave(scope.row, 'remarks', scope.$index)"
                >&#xe61f;</i> -->
                <!-- <i
                  v-if="scope.row.codeEdit"
                  class="icon cursor"
                  style="font-size:22px"
                  @click="cancelEdit(scope.row, 'remarks')"
                >&#xe663;</i> -->
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="page_toolbar">
          <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
            @current-change="handleCurrentChange" :current-page="pageNum" :page-size="pageSize" :total="total">
          </el-pagination>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    data() {
      return {
        users: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
        filters: {
          productCode: '',
          title: ''
        }
      }
    },
    props: ['curCustomer'],
    mounted () {
      this.getUsers()
    },
    methods: {
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      clearSearch() {
        this.filters = {
          productCode: '',
          title: ''
        }
      },
      editCode(row) {
        this.$set(row, 'originRemarks', row.remarks)
        this.$set(row, "codeEdit", true);
      },
      focusEvent(row, validatorName) {
        if (!row[validatorName + 'Set']) {
          this.$set(row, [validatorName + 'Set'], true)
          this.$set(row, [validatorName + 'Old'], row[validatorName])
        }
      },
      // 局部保存
      handlePartSave(row, validatorName, index) {
        if (row[validatorName + 'Old'] === row[validatorName]) return false
        this.$refs[validatorName + index] && this.$refs[validatorName + index].validate(valid => {
          if (valid) {
            const param = {
              productId: row.productId,
              remarks: row.remarks,
              vipCustomerId: this.curCustomer.id
            }
            this.$postJson(this._basePath.ajaxVipGoodBuyRemark, param).then(res => {
              if (res.success) {
                this.$message({ type: "success", message: "保存成功" })
                this.$set(row, validatorName + 'Old', row.remarks)
              }
            })
          }
        })
      },
      cancelEdit(row) {
        this.$set(row, 'remarks', row.originRemarks)
        this.$set(row, 'codeEdit', false)
      },
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      codeLimit(rule, value, callback) {
        if (value && value.length > 200) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      // 获取用户列表
      getUsers() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          stallVipUserId: this.curCustomer.id
        }
        const arr = this.$refs['dateFilter'].getParams()
        if (!arr) return false
        para.startTime = arr[0]
        para.endTime = arr[1]
        
        this.$postJson(this._basePath.ajaxVipBoughtGoods, {...para, ...this.filters}).then(res => {
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
    #workList
      .el-table
        .cell
          overflow: visible
      .editable_div
        setStart()
        i
          ml(5px)
        .el-form-item
          mb(0)
        .el-input
          max-width:80px
        .el-form-item__error
          fn(12px)
      .fn20
        fn(20px)
        color(text_color)
      .el-row
        mb(10px)
      .mt20
        mb(20px)
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
