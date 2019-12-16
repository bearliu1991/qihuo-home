<template>
    <section class="app-container" id="workList">
      <a id="tag" href="" download=""></a>
      <div>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" @submit.native.prevent>
            <el-form-item label="销售时间">
              <date-pick ref="dateFilter" size="mini" :showBtn="false" isLimit :maxDays="31" 
               defaultIndex="curMonth" :showArr="['curMonth']"></date-pick>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <!-- <el-button type="text" @click="clearSearch">清空搜索</el-button> -->
            </el-form-item>
          </el-form>
        </el-col>
        <!--列表-->
        <record-count :total="total"></record-count>
        <el-table :data="users" highlight-current-row style="width: 100%;">
          <el-table-column prop="date" label="日期" :formatter="formatTime">
          </el-table-column>
          <el-table-column prop="orderTotalAmount" label="销售金额(元)">
            <template slot-scope="scope">
              <span class="bold err_color">{{scope.row.orderTotalAmount}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderCount" label="销售单数">
          </el-table-column>
          <el-table-column prop="productSaleNumber" label="销售数量">
          </el-table-column>
          <el-table-column prop="returnOrderTotalAmount" label="退货金额(元)">
            <template slot-scope="scope">
              <span class="bold err_color">{{scope.row.returnOrderTotalAmount}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="returnOrderCount" label="退货单数">
          </el-table-column>
          <el-table-column prop="productReturnNumber" label="退货数量">
          </el-table-column>
          <!-- <el-table-column label="操作" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="primary"
                plain
                size="mini"
                @click="downloadExcel(scope.row)"
              >导出</el-button>
            </template>
          </el-table-column> -->
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
        pageSize: 10
      }
    },
    mounted () {
      this.getUsers()
      this.queryData = this._debounce(this.queryData)
    },
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
      formatTime(row) {
        return this._formatTime(row.date)
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
      // 导出查询结果
      downloadExcel(row) {
        this.$nextTick(() => {
          if (!arr) return false
          let param = {
            stallId: this.getCookie('stallId') - 0
          }
          this.$postJson(this._basePath.ajaxExportDailySellQuery, param).then(res => {
            if (res.success) {
              param.token = res.data.token
              this.downFile(this._basePath.ajaxExportDailySell + '?' +  this.serializeParam(param), res.data.fileName)
            }
          })
        })
      },
      // 获取用户列表
      getUsers() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
        }
        const arr = this.$refs['dateFilter'].getParams()
        if (!arr) return false
        para.startTime = arr[0]
        para.endTime = arr[1]
        
        this.$postJson(this._basePath.ajaxDailySellByPage, para).then(res => {
          if (res.success) {
            this.total = res.data.count
            this.users = res.data.datas
          }
        })
      }
    }
  }
  </script>
  
  <style lang="stylus" scoped>
    @import '~@/assets/css/index'
    #workList
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
