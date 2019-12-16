<template>
  <section class="app-container" id="workList">
    <div>
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="商品货号">
            <el-input v-model="filters.productCode" placeholder="请输入商品货号"></el-input>
          </el-form-item>
          <el-form-item label="销售时间">
            <date-pick ref="dateFilter" v-model="reset" :showArr="['today', 'curMonth']"></date-pick>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
            <el-button type="text" v-on:click="clearSearch">清空搜索</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row style="width: 100%;">
        <el-table-column prop="productCode" label="商品货号">
        </el-table-column>
        <el-table-column prop="title" min-width="200px" label="商品名称">
        </el-table-column>
        <el-table-column prop="salesNum" label="销售量">
          <template slot-scope="scope">
            <span class="bold err_color">{{scope.row.salesNum}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salesTotalFee" label="销售金额(不包含减免金额)">
          <template slot-scope="scope">
            <span class="bold err_color">{{scope.row.salesTotalFee}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="returnNum" label="退货量">
          </el-table-column>
        <el-table-column prop="returnTotalFee" label="退货金额">
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
      filters: {
        productCode: ''
      },
      // 交班人
      shifts: [],
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      reset: false
    }
  },
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
      this.reset = true
      this.filters = {
        productCode: ''
      }
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    // 获取用户列表
    getUsers() {
      let para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        productCode: this.filters.productCode
      }
      const arr = this.$refs['dateFilter'].getParams()
      para.startTime = arr[0]
      para.endTime = arr[1]
      
      this.$postJson(this._basePath.ajaxGoodSaleList, para).then(res => {
        if (res.success) {
          this.total = res.data.count
          this.users = res.data.datas
          this.shifts = res.data.datas.map(item => item.name)
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
