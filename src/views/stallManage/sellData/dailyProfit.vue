<template>
    <section class="app-container" id="workList">
      <div>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" @submit.native.prevent>
            <el-form-item label="销售时间">
              <date-pick ref="dateFilter" isLimit :maxDays="366" 
                size="mini" defaultIndex="curMonth" :showArr="['lastWeek', 'last30', 'curMonth']"></date-pick>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <!--列表-->
        <record-count :total="total"></record-count>
        <el-table :data="users" highlight-current-row style="width: 100%;">
          <el-table-column prop="createTime" label="日期" :formatter="formatTime">
          </el-table-column>
          <el-table-column prop="totalNum" label="数量">
            <template slot="header" slot-scope="scope">
              <i>数量</i>
              <el-tooltip class="item" effect="dark" :content="numTip" :open-delay="300" placement="top-start">
                <span class="icon light_color tips">&#xe657;</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="salesTotalFee" label="收入（元）">
            <template slot="header" slot-scope="scope">
              <i>收入（元）</i>
              <el-tooltip class="item" effect="dark" :content="incomeTip" :open-delay="300" placement="top-start">
                <span class="icon light_color tips">&#xe657;</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="costTotalFee" label="成本（元）">
            <template slot="header" slot-scope="scope">
              <i>成本（元）</i>
              <el-tooltip class="item" effect="dark" :content="costTip" :open-delay="300" placement="top-start">
                <span class="icon light_color tips">&#xe657;</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="profitsTotalFee" label="利润（元）">
            <template slot="header" slot-scope="scope">
              <i>利润（元）</i>
              <el-tooltip class="item" effect="dark" :content="profitTip" :open-delay="300" placement="top-start">
                <span class="icon light_color tips">&#xe657;</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="showDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <Drawer v-model="showDrawer" :title="drawerTitle">
          <record-count :total="drawerTotal"></record-count>
          <el-table :data="drawerUsers" highlight-current-row style="width: 100%;">
            <el-table-column prop="imgUrl" label="图片" width="70px">
              <template slot-scope="scope">
                <img :src="scope.row.imgUrl" style="max-width:50px; max-height:50px" />
              </template>
            </el-table-column>
            <el-table-column prop="productCode" label="商品货号">
            </el-table-column>
            <el-table-column prop="totalNum" label="数量">
            </el-table-column>
            <el-table-column prop="salesTotalFee" label="收入（元）">
            </el-table-column>
            <el-table-column prop="costTotalFee" label="成本（元）">
            </el-table-column>
            <el-table-column prop="profitsTotalFee" label="利润（元）">
            </el-table-column>
            </el-table-column>
          </el-table>
          <div class="page_toolbar">
            <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
              @current-change="handleCurrentChangeDrawer" :current-page="drawerPageNum" :page-size="drawerPageSize" :total="drawerTotal">
            </el-pagination>
          </div>
        </Drawer>
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
        drawerTitle: '',
        showDrawer: false,
        drawerUsers: [],
        drawerPageNum: 1,
        drawerPageSize: 10,
        drawerTotal: 0,
        users: [],
        pageNum: 1,
        pageSize: 10,
        total: 0,
        curRow: {},
        numTip: '数量=当日销售数量-当日退货数量',
        incomeTip: '收入=当日销售金额-当日退货金额',
        costTip: '成本=当日销售数量*对应商品成本价',
        profitTip: '利润=收入-成本'
      }
    },
    mounted () {
      this.getUsers()
      this.queryData = this._debounce(this.queryData)
    },
    methods: {
      formatTime(row) {
        return this._formatTime(row.createTime)
      },
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      handleCurrentChangeDrawer(val) {
        this.drawerPageNum = val
        this.getDetails()
      },
      showDetail(row) {
        this.curRow = row
        this.showDrawer = true
        this.drawerTitle = `日利润详情 ~ ${this._formatTime(this.curRow.createTime)}`
        this.drawerPageNum = 1
        this.getDetails()
      },
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      getDetails() {
        let para = {
          pageNum: this.drawerPageNum,
          pageSize: this.drawerPageSize,
          startTime: this._formatTime(this.curRow.createTime),
          endTime: this._formatTime(this.curRow.createTime)
        }
        this.$postJson(this._basePath.ajaxGoodProfitByPage, para).then(res => {
          if (res.success) {
            this.drawerTotal = res.data ? res.data.count : 0
            this.drawerUsers = res.data ? res.data.datas : []
          }
        })
      },
      // 获取用户列表
      getUsers() {
        let para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
        const arr = this.$refs['dateFilter'].getParams()
        if (!arr) return false
        para.startTime = arr[0]
        para.endTime = arr[1]
        
        this.$postJson(this._basePath.ajaxDailyProfitByPage, {...para}).then(res => {
          if (res.success) {
            this.total = res.data ? res.data.count : 0
            this.users = res.data ? res.data.datas : []
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
