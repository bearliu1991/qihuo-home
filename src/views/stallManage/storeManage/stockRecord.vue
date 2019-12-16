<template>
    <section class="app-container" id="stockRecord">
      <div>
        <!--查询条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" :model="filters" @submit.native.prevent>
            <el-form-item label="商品货号">
              <el-input v-model="filters.productCode" placeholder="请输入商品货号"></el-input>
            </el-form-item>
            <el-form-item label="颜色">
              <el-input v-model="filters.color" placeholder="请输入颜色"></el-input>
            </el-form-item>
            <el-form-item label="尺码">
              <el-input v-model="filters.size" placeholder="请输入尺码"></el-input>
            </el-form-item>
            <el-form-item label="操作时间">
              <date-pick ref="dateFilter" :showBtn="false" isLimit :maxDays="31"
                size="mini" defaultIndex="1" :showArr="['today']"></date-pick>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
            </el-form-item>
          </el-form>
          <filter-list :filterList="filterList" size="mini" @filterChange="queryData" ref="filterBtn"></filter-list>
        </el-col>
  
        <!--列表-->
        <record-count :total="total"></record-count>
        <el-table :data="users" highlight-current-row @selection-change="selsChange" v-loading="loading" style="width: 100%;">
          <el-table-column prop="stockType" label="类型" :formatter="formatType">
          </el-table-column>
          <el-table-column prop="skuId" label="sku编码">
          </el-table-column>
          <el-table-column prop="productCode" label="商品货号">
          </el-table-column>
          <el-table-column prop="color" label="颜色">
          </el-table-column>
          <el-table-column prop="size" label="尺码">
          </el-table-column>
          <el-table-column prop="number" label="数量">
            <template slot-scope="scope">
              <span :class="[_isHave(scope.row.stockType, [1,3,4,5]) ? 'err_color' 
              : _isHave(scope.row.stockType, [2,6,7,8,9]) ? 'success_color' : '']">
                {{(_isHave(scope.row.stockType, [1,3,4,5]) ? '-' 
                  : _isHave(scope.row.stockType, [2,6,7,8,9]) ? '+' : '') + scope.row.number}}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="stockNumber" label="变更后库存">
          </el-table-column>
          <el-table-column prop="orderCode" label="订单编号">
            <template slot-scope="scope">
              {{scope.row.orderCode && _isWithout(scope.row.stockType, [9, 10, 11]) ? scope.row.orderCode : '—'}}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="操作时间" :formatter="formatTime">
          </el-table-column>
          <el-table-column prop="operatorPhone" label="操作账号">
          </el-table-column>
        </el-table>
        <!--工具条-->
        <div class="page_toolbar">
          <el-pagination layout="prev, pager, next,  jumper, sizes, total" prev-text="上一页" next-text="下一页" background
            @current-change="handleCurrentChange" :current-page="pageNum" @size-change="handleSizeChange" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize" :total="total">
          </el-pagination>
        </div>
      </div>
    </section>
  </template>
  <script>
  export default {
    data() {
      return {
        loading: false,
        datas: {},
        filters: {
          productCode: '',
          color: '',
          size: ''
        },
        users: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
        sels: [], // 列表选中列
        filterList: [ 
          // 1：出库-销售 2：入库-退货 3: 出库-退单  5:出库-退货作废
          // 6：入库-退单 9：入库-新增入库 10：盘点库存 11：初始化库存
          {name: '全部', filterVal: {stockType: ''}},
          {name: '出库-销售', filterVal: {stockType: 1}},
          {name: '入库-退货', filterVal: {stockType: 2}},
          {name: '出库-退单', filterVal: {stockType: 3}},
          {name: '出库-退货作废', filterVal: {stockType: 5}},
          {name: '入库-退单', filterVal: {stockType: 6}},
          {name: '入库-新增入库', filterVal: {stockType: 9}},
          {name: '盘点库存', filterVal: {stockType: 10}},
          {name: '初始化库存', filterVal: {stockType: 11}}
        ]
      }
    },
    mounted () {
      this.init()
      this.queryData = this._debounce(this.queryData)
    },
    methods: {
      init() {
        this.getUsers(true)
      },
      // 清空筛选条件
      clearFilter() {
        this.filters = {
          productCode: '',
          color: '',
          size: ''
        }
      },
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      // 1：出库-销售单 2：出库-补货单 3：出库-零售单 4：出库-vip客户单 5:出库-退货作废 
      // 6：入库-退单 7：入库-快捷退货单 8：入库-退货单 9：入库-新增入库 10：盘点库存 11：初始化库存

      // 最新 
      // 1：出库-销售 2：入库-退货  5:出库-退货作废
      // 6：入库-退单 9：入库-新增入库 10：盘点库存 11：初始化库存
      formatType(row) {
        switch (row.stockType) {
          case 1: 
            return '出库-销售'
          case 2: 
            return '入库-退货'
          case 3: 
            return '出库-退单'
          case 5: 
            return '出库-退货作废'
          case 6: 
            return '入库-退单'
          case 9: 
            return '入库-新增入库'
          case 10: 
            return '盘点库存'
          case 11: 
            return '初始化库存'
          default:
            return ''
        }
      },
      formatTime(row) {
        return this._formatTime(row.createTime, true) || '—'
      },
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      handleSizeChange(val) {
        this.pageNum = 1
        this.pageSize = val
        this.getUsers()
      },
      // 获取用户列表
      getUsers(isRefresh) {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
        }
        const btnFilter = this.$refs.filterBtn.getParams()
        const timeArr = this.$refs.dateFilter.getParams()
        if (!timeArr) return false
        para = {...para, ...this.filters, ...btnFilter}
        para.startTime = timeArr[0]
        para.endTime = timeArr[1]
        this.loading = true
        this.$postJson(this._basePath.ajaxStallStockRecordByPage, para).then(res => {
          this.loading = false
          if (res.success) {
            this.total = res.data.count
            let data = res.data.datas
            data.forEach((item) => {
              item.codeEdit = false
              item.priceEdit = false
              item.storeEdit = false
            })
            this.users = data
          }
        })
      },
      // 全选单选多选
      selsChange(sels) {
        this.sels = sels
      }
    }
  }
  </script>
  
  <style lang="stylus">
    @import '~@/assets/css/index'
    #stockRecord
      .el-table
        .cell
          overflow:visible
      .editable_div
        setStart()
        i
          ml(5px)
        .el-form-item
          mb(0)
        .editable_ul
          .el-form-item__error
            top:30px
            fn(12px)
      .fn20
        fn(20px)
        color(text_color)
      .fn24
        fn(24px)
      .link_btn
        a
          display:block
          height:100%
  </style>