<template>
    <section class="app-container" id="workList">
      <div v-show="!secShow">
        <a id="tag" href="" download=""></a>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" :model="filters" @submit.native.prevent>
            <el-form-item label="商品货号">
              <el-input v-model="filters.productCode" placeholder="商品货号"></el-input>
            </el-form-item>
            <el-form-item label="销售时间">
              <date-pick ref="dateFilter" isLimit :maxDays="92" 
                size="mini" defaultIndex="30" @dateChange="dateChange" :showArr="['lastWeek', 'last30', 'last90']"></date-pick>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button type="text" @click="clearSearch">清空搜索</el-button>
              <el-button type="danger" @click="downloadExcel">导出查询结果</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <!--列表-->
        <record-count :total="total"></record-count>
        <el-table :data="users" highlight-current-row style="width: 100%;" @sort-change="sortChange"
          sortable="custom" :default-sort="sortOrder">
          <el-table-column prop="productCode" label="商品货号">
          </el-table-column>
          <!-- <el-table-column prop="title" min-width="200px" label="商品名称">
          </el-table-column> -->
          <el-table-column prop="salesNum" sortable :sort-orders="['ascending', 'descending']" label="销售量">
            <template slot-scope="scope">
              <span class="bold err_color">{{scope.row.salesNum}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="returnNum" sortable :sort-orders="['ascending', 'descending']" label="退货量">
          </el-table-column>
          <el-table-column prop="salesTotalFee" min-width="180px" sortable :sort-orders="['ascending', 'descending']" label="销售金额(不包含减免金额)">
            <template slot-scope="scope">
              <span class="bold err_color">{{scope.row.salesTotalFee}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="returnTotalFee" sortable :sort-orders="['ascending', 'descending']" min-width="180px" label="退货金额(不包含减免金额)">
          </el-table-column>
          <el-table-column label="操作" min-width="310px" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="primary"
                plain
                size="mini"
                @click="handleSaleTrend(scope.row)"
              >销量趋势</el-button>
              <el-button
                type="primary"
                plain
                size="mini"
                @click="handleVipSale(scope.row)"
              >VIP客户销量</el-button>
              <el-button
                type="primary"
                plain
                size="mini"
                @click="handleSkuSale(scope.row)"
              >SKU销量</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="page_toolbar">
          <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
            @current-change="handleCurrentChange" :current-page="pageNum" :page-size="pageSize" :total="total">
          </el-pagination>
        </div>
      </div>
      <Secondary v-model="secShow" :title="secTitle">
        <vip-sale :curRow="curRow" v-if="secShow && vipSaleShow"></vip-sale>
        <sale-trend :curRow="curRow" v-if="secShow && saleTrendShow"></sale-trend>
      </Secondary>
      <Drawer v-model="showDrawer" :title="drawerTitle">
        <SkuSale
          slot="header"
          v-if="showDrawer"
          ref="skuPrint"
          :timeArr="timeArr"
          :curRow="curRow"
        ></SkuSale>
      </Drawer>
    </section>
  </template>
  <script>
  import VipSale from './vipSale'
  import SkuSale from './skuSale'
  import SaleTrend from './saleTrend'
  export default {
    data() {
      return {
        users: [],
        drawerTitle: '',
        total: 0,
        timeArr: [],
        showDrawer: false,
        pageNum: 1,
        pageSize: 10,
        secShow: false,
        secTitle: '',
        sortOrder: {prop: 'salesNum', order: 'descending'},
        vipSaleShow: false,
        saleTrendShow: false,
        curRow: {},
        filters: {productCode: ''}
      }
    },
    mounted () {
      this.getUsers()
      this.queryData = this._debounce(this.queryData)
      this.dateChange()
    },
    components: { VipSale, SaleTrend, SkuSale },
    methods: {
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      clearSearch() {
        this.filters = {productCode: ''}
      },
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      dateChange() {
        this.timeArr = this.$refs['dateFilter'].getParams()
      },
      sortChange(row) {
        this.sortOrder = {prop: row.prop, order: row.order}
        this.getUsers()
      },
      handleSaleTrend(row) {
        this.curRow = row
        this.secShow = true
        this.vipSaleShow = false
        this.saleTrendShow = true
        this.secTitle = `单品销售趋势图-${row.productCode}`
      },
      handleVipSale(row) {
        this.curRow = row
        this.secShow = true
        this.vipSaleShow = true
        this.saleTrendShow = false
        this.secTitle = `VIP客户销售报表-${row.productCode}`
      },
      handleSkuSale(row) {
        this.curRow = row
        this.showDrawer = true
        this.drawerTitle = 'SKU销量 | ' + row.productCode
      },
      // 获取用户列表
      getUsers() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
        const arr = this.$refs['dateFilter'].getParams()
        if (!arr || !this.sortOrder.prop || !this.sortOrder.order) return false
        para.startTime = arr[0]
        para.endTime = arr[1]
        
        this.$postJson(this._basePath.ajaxGoodSaleList, {...para, ...this.filters, ...this.sortOrder}).then(res => {
          if (res.success) {
            this.total = res.data.count
            this.users = res.data.datas
          }
        })
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
      downloadExcel() {
        this.$nextTick(() => {
          const arr = this.$refs.dateFilter.getParams()
          if (!arr) return false
          let param = {
            startTime: arr[0],
            endTime: arr[1],
            stallId: this.getCookie('stallId') - 0
          }
          this.$postJson(this._basePath.ajaxExportDailySellQuery, param).then(res => {
            if (res.success) {
              param.token = res.data.token
              this.downFile(this._basePath.ajaxExportDailySell + '?' +  this.serializeParam(param), res.data.fileName)
            }
          })
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
