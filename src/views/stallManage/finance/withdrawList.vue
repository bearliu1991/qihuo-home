<template>
    <section class="app-container" id="areaList">
      <div>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" @submit.native.prevent>
            <el-form-item label="下单时间">
              <date-pick ref="dateFilter" isLimit :maxDays="366" 
                size="mini" defaultIndex="30" :showArr="['today', 'lastWeek', 'last30']"></date-pick>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <!-- <el-button type="text" @click="clearSearch">清空筛选条件</el-button> -->
            </el-form-item>
          </el-form>
          <filter-list :filterList="filterList" @filterChange="queryData" ref="filterBtn"></filter-list>
        </el-col>
  
        <!--列表-->
        <record-count :total="total"></record-count>
        <el-table :data="users" highlight-current-row style="width: 100%;">
          <el-table-column prop="modifyTime" label="申请时间" :formatter="formateModifyTime">
          </el-table-column>
          <el-table-column prop="orderCode" label="提现单据号">
          </el-table-column>
          <el-table-column prop="type" label="账户类型" :formatter="formatType">
          </el-table-column>
          <el-table-column prop="account" label="提现账户">
          </el-table-column>
          <el-table-column prop="amount" label="提现金额">
          </el-table-column>
          <el-table-column prop="serviceCharge" label="提现手续费">
          </el-table-column>
          <el-table-column prop="status" label="提现状态">
            <template slot-scope="scope">
              <span :class="formatStatus(scope.row, true)">{{formatStatus(scope.row)}}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" width="">
            <template slot-scope="scope">
              <el-button type="primary" plain size="medium" @click="getBusinessDetail(scope.row)">编辑</el-button>
              <el-button type="danger" plain size="medium" @click="disabledArea(scope.row)" v-if="scope.row.status === 1">禁用</el-button>
              <el-button type="success" plain size="medium" @click="disabledArea(scope.row)" v-if="scope.row.status === 0">启用</el-button>
            </template>
          </el-table-column> -->
        </el-table>
  
        <!--工具条-->
        <div class="page_toolbar">
          <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
            @current-change="handleCurrentChange" :current-page="pageNum" :page-size="pageSize" :total="total">
          </el-pagination>
        </div>
      </div>
      <!--二级分类操作-->
    </section>
  </template>
  
  <script>
  import axios from 'axios'
  export default {
    data() {
      return {
        secShow: false, // 是否展示二级编辑页面
        total: 0,
        pageNum: 1,
        pageSize: 10,
        filterList: [
          {name: '全部', filterVal: {status: null}},
          {name: '审核通过', filterVal: {status: 'PASS'}},
          {name: '处理中', filterVal: {status: 'SUBMIT'}},
          {name: '审核驳回', filterVal: {status: 'RETREAT'}}
        ],
        users: [], // 用户列表
      }
    },
    mounted() {
      this.getUsers()
      this.queryData = this._debounce(this.queryData)
    },
    methods: {
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      formatType(row) {
        return row.type === 'wx' ? '微信' : row.type === 'zfb' ? '支付宝' : row.type === 'bank' ? '银行' : '—'
      },
      formatStatus(row, isClass) {
        // "SUBMIT"; //申请提交
        // "PASS"; //审核通过
        // "RETREAT"; //驳回
        // "SUCCESS"; //提现成功
        // "FAIL"; //提现失败
        const status = row.status
        if (isClass) return status === 'SUBMIT' ? '' : status === 'FAIL' ? 'err_color' : status === 'SUCCESS' ? 'success_color' : status === 'RETREAT' ? 'err_color' : status === 'PASS' ? 'success_color' : ''
        return status === 'SUBMIT' ? '处理中' : status === 'FAIL' ? '提现失败' : status === 'SUCCESS' ? '提现成功' : status === 'RETREAT' ? '驳回' : status === 'PASS' ? '审核通过' : '—'
      },
      formateModifyTime(row) {
        return this._formatTime(row.modifyTime, true) || '—'
      },
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      // 获取交易列表
      getUsers() {
        const para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        }
        const timeArr = this.$refs['dateFilter'].getParams()
        if (!timeArr) return false
        const btnFilter = this.$refs['filterBtn'].getParams()
        para.startTime = timeArr[0]
        para.endTime = timeArr[1]
        para.status = btnFilter.status
  
        this.$postJson(this._basePath.ajaxWithdrawByPage, para).then(res => {
          if (res.success) {
            this.$bus.$emit('calcScrollHeight')
            this.total = res.data.count
            this.users = res.data.datas
          }
        })
      }
    }
  }
  </script>
  
  <style lang="stylus" scoped>
    #areaList
      .secondary_form
        .el-cascader
          width:100%
      .building_title
        // text-align:center
        margin-top:10px
        margin-bottom:20px
        i
          font-size:20px
          font-weight:bold
      .toolbar_process
        margin-top:20px
  </style>