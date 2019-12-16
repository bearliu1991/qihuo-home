<template>
    <section class="app-container" id="hang_bill">
      <div>
        <!--查询条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" :model="filters" @submit.native.prevent>
            <el-form-item label="查询">
              <el-input v-model="filters.nameOrPhoneOrCode" placeholder="客户名/手机号"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button type="text" @:click="clearSearch">清空筛选条件</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        
        <!--表格-->
        <record-count :total="total">
        </record-count>
        <!-- <div class="table_records"><span class="icon">&#xe645;</span> 共<i> {{total}} </i>条记录</div> -->
        <el-table :data="users" highlight-current-row v-loading="loading" style="width: 100%;">
          <el-table-column prop="name" label="VIP客户名" min-width="150">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="copyVipPrice(scope.row)">复制</el-button>
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
    </section>
  </template>
  <script>
    export default {
      data() {
        return {
          loading: false,
          users: [],
          filters: {
            nameOrPhoneOrCode: ''
          },
          curVip: {},
          pageNum: 1,
          pageSize: 10,
          total: 0
        }
      },
      props: {
        curCustomer: {
          type: Object,
          default: () => {}
        }
      },
      created() {
        this.getUsers()
        this.queryData = this._debounce(this.queryData)
      },
      methods: {
        queryData() {
          this.pageNum = 1
          this.getUsers()
        },
        clearSearch() {
          this.$set(this.filters, 'nameOrPhoneOrCode', '')
        },
        // 页脚显示转换
        handleCurrentChange(val) {
          this.pageNum = val
          this.getUsers()
        },
        // 复制价格体系
        copyVipPrice(row) {
          const param = {
            userId: this.curCustomer.userId,
            stallVipUserId: row.userId
          }
          this.$postJson(this._basePath.ajaxCopyCustomerPrice, param).then(res => {
            if (res.success) {
              this.$message.success('复制价格成功')
              this.$emit('close')
            }
          })
        },
        getUsers() {
          const para = {
            pageNum: this.pageNum,
            pageSize: this.pageSize
          }
          this.loading = true
          this.$postJson(this._basePath.ajaxCustomerByPage, {...para, ...this.filters}).then(res => {
            this.loading = false
            if (res.success) {
              this.total = res.data ? res.data.count : 0
              this.users = res.data ? res.data.datas : []
            }
          })
        }
      }
    }
  </script>
  <style lang="stylus">
    @import '~@/assets/css/index'
    #hang_bill
      .editable_div
        setStart()
        i
          ml(5px)
          color(text_color)
        .el-form-item
          mb(0)
      .switch_header
        mb(20px)
      .switch_tabs
        .el-tabs__item
          fn(16px)
      .el-tabs__content
        padding:0
        
  </style>