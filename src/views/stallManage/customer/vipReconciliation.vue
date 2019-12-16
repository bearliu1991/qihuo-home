<template>
  <section class="app-container" id="reconciliation">
      <!--查询条-->
    <a id="tag" href="" download="" style="visibility: hidden"></a>
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="时间">
          <date-pick ref="dateFilter" :showBtn="false" isLimit :maxDays="dateMaxDays" 
            size="mini" defaultIndex="curMonth" :showArr="['curMonth']"></date-pick>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryData">查询</el-button>
          <!-- <el-button type="text" @click="clearSearch">清空筛选条件</el-button> -->
          <el-button type="danger" @click="downloadExcel">导出对账单</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <record-count :total="total">
    </record-count>
    <!-- <div class="table_records"><span class="icon">&#xe645;</span> 共<i> {{total}} </i>条记录</div> -->
    <el-table :data="users" @selection-change="selsChange" :border="false" highlight-current-row v-loading="loading" style="width: 100%;">
      <!-- <el-table-column type="selection" width="45">
      </el-table-column> -->
      <el-table-column label="日期" prop="orderCode" :formatter="formatTime">
      </el-table-column>
      <el-table-column label="销售" header-align="center">
        <el-table-column label="销售数量" prop="salesCount">
        </el-table-column>
        <el-table-column label="销售金额(元)" prop="salesAmount">
          <!-- <template slot="header" slot-scope="scope">
              <span>销售金额(元)</span>
              <el-tooltip :content="salesAmount" placement="top" :open-delay="300">
                <i class="icon fn18">&#xe657;</i>
              </el-tooltip>
          </template> -->
          <template slot-scope="scope">{{scope.row.salesAmount}}</template>
        </el-table-column>
        <el-table-column label="挂账(销售)" prop="salesCreditAmount">
        </el-table-column>
        <el-table-column label="现结(销售)" prop="salesSettledAmount">
        </el-table-column>
      </el-table-column>
      <el-table-column label="退货" header-align="center">
        <el-table-column label="退货数量" prop="returnCount">
        </el-table-column>
        <el-table-column label="退货金额(元)" prop="returnAmount">
          <!-- <template slot="header" slot-scope="scope">
            <span>退货金额(元)</span>
            <el-tooltip :content="retreatAmount" placement="top" :open-delay="300">
              <i class="icon fn18">&#xe657;</i>
            </el-tooltip>
          </template> -->
          <template slot-scope="scope">{{scope.row.returnAmount}}</template>
        </el-table-column>
        <el-table-column label="挂账(退货)" prop="returnCreditAmount">
        </el-table-column>
        <el-table-column label="现结(退货)" prop="returnSettledAmount"></el-table-column>
      </el-table-column>
      <el-table-column label="当日欠款" prop="finalCreditAmount">
        <template slot="header" slot-scope="scope">
          <span>当日欠款(元)</span>
          <el-tooltip :content="debtAmount" placement="top" :open-delay="300">
            <i class="icon fn18">&#xe657;</i>
          </el-tooltip>
        </template>
        <template slot-scope="scope">{{scope.row.finalCreditAmount}}</template>
      </el-table-column>
      <el-table-column label="备注">
        <template slot-scope="scope">
          <div class="editable_div">
            <!-- <div v-if="!scope.row.codeEdit">{{scope.row.remarks}}</div> -->
            <el-form :model="scope.row" :ref="'remarks' + scope.$index">
              <el-form-item prop="remarks">
                <el-input type="textarea" size="mini" @focus="focusEvent(scope.row, 'remarks', scope.$index)" 
                  @blur="handlePartSave(scope.row, 'remarks', scope.$index)" v-model="scope.row.remarks"></el-input>
              </el-form-item>
            </el-form>
            <!-- <i v-if="!scope.row.codeEdit" class="icon cursor fn20" @click="editCode(scope.row)">&#xea3d;</i>
            <i v-if="scope.row.codeEdit" class="icon cursor fn20" @click="handlePartSave(scope.$index, scope.row)">&#xe61f;</i> -->
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="page_toolbar">
      <el-pagination layout="prev, pager, next,  jumper, sizes, total" prev-text="上一页" next-text="下一页" background
        @current-change="handleCurrentChange" :current-page="pageNum" @size-change="handleSizeChange" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize" :total="total">
      </el-pagination>
    </div>
  </section>
</template>
<script>
  const maxDays = 31
  export default {
    name: '',
    data() {
      return {
        dateMaxDays: 366,
        loading: false,
        debtAmount: '当日欠款 = 挂账（销售）- 挂账（退货）',
        users: [],
        sels: [],
        pageNum: 1,
        pageSize: 10,
        total: 0,
        summaryObj: {}
      }
    },
    props: {
      curItem: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
      this.getUsers()
      this.queryData = this._debounce(this.queryData)
      this.handlePartSave = this._debounce(this.handlePartSave)
    },
    components: {},
    methods: {
      formatTime(row) {
        return this._formatTime(row.day)
      },
      queryData() {
        this.pageNum = 1
        this.getUsers()
        // this.getSumary()
      },
      // 局部修改
      editCode(row) {
        this.$set(row, 'codeEdit', true)
      },
      getSumary() {
        this.dateMaxDays = 366 
        this.$nextTick(() => {
          const arr = this.$refs.dateFilter.getParams()
          if (!arr) return false
          const startTime = arr[0]
          const endTime = arr[1]
          let param = {
            password: 'sunking098',
            stallId: this.getCookie('stallId') - 0,
            vipCustId: this.curItem.id
          }
          if (endTime) {
            param.startTime = startTime
            param.endTime = endTime
            this.$postJson(this._basePath.ajaxVipReconciliationSummary, param).then(res => {
              if (res.success) {
                res.data && (this.summaryObj = res.data)
              }
            })
          }
        })
      },
      focusEvent(row, validatorName) {
        if (!row[validatorName + 'Set']) {
          this.$set(row, [validatorName + 'Set'], true)
          this.$set(row, [validatorName + 'Old'], row[validatorName])
        }
      },
      handlePartSave(row, validatorName, index) {
        if (row[validatorName + 'Old'] === row[validatorName]) return false
        this.$refs[validatorName + index] && this.$refs[validatorName + index].validate(valid => {
          if (valid) {
            const param = {
              vipBillId: row.id,
              remarks: row.remarks
            }

            this.$postJson(this._basePath.ajaxReconciliationSaveRemark, param).then((res) => {
              if (res.success) {
                this.$message({type: 'success', message: '修改成功'})
                this.$set(row, validatorName + 'Old', false)
              }
            })
          }
        })
      },
      handleSizeChange(val) {
        this.pageNum = 1
        this.pageSize = val
        this.getUsers()
      },
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      selsChange(sels) {
        this.sels = sels
      },
      downFile (content, fileName) {
        var a = document.getElementById('tag')
        a.download = fileName
        var blob = new Blob([content])
        var url = window.URL.createObjectURL(blob)
        a.href = content
        a.click()
        window.URL.revokeObjectURL(url)
      },
      // 导出订单
      downloadExcel() {
        this.dateMaxDays = 92
        this.$nextTick(() => {
          const arr = this.$refs.dateFilter.getParams()
          if (!arr) return false
          let param = {
            stallId: this.getCookie('stallId') - 0,
            custId: this.curItem.id
          }
          param.startTime = this._formatTime(arr[0])
          param.endTime = this._formatTime(arr[1])
          this.$postJson(this._basePath.ajaxReconciliationVerify, param).then(res => {
            if (res.success) {
              param.token = res.data.token
              this.downFile(this._basePath.ajaxReconciliationDownload + '?' +  this.serializeParam(param), res.data.fileName)
            }
          })
        })
      },
      getUsers() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          custId: this.curItem.id
        }
        this.dateMaxDays = 366 
        this.$nextTick(() => {
          const timeArr = this.$refs['dateFilter'] && this.$refs['dateFilter'].getParams()
          if (!timeArr) return false
          para.startTime = timeArr[0]
          para.endTime = timeArr[1]

          this.$postJson(this._basePath.ajaxReconciliationByPage, {...para}).then(res => {
            this.loading = false
            if (res.success) {
              this.total = res.data.count
              this.users = res.data.datas
            }
          })
        }) 
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #reconciliation
    .editable_div
      .fn20
        color(text_color !important)
      .el-textarea
        height:100%
        textarea
          height:100%
    .el-table
      .el-form-item
        mb(0)
      thead.is-group
        th
          bgColor()
    .el-form-item__error
      left:30px

</style>