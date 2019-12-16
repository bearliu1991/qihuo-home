<template>
    <section class="app-container" id="hang_bill">
      <div class="switch_header">
        <el-tabs v-model="switchStatus" class="switch_tabs" @tab-click="queryData">
          <el-tab-pane label="商品列表" name="0"></el-tab-pane>
          <el-tab-pane label="展示中" name="1"></el-tab-pane>
        </el-tabs>
      </div>
      <div>
      <!--查询条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="商品货号">
            <el-input v-model="filters.productCode" placeholder="商品货号"></el-input>
          </el-form-item>
          <el-form-item label="所属档口">
            <el-input v-model="filters.title" placeholder="档口名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"  @click="queryData">查询</el-button>
            <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <div class="process_btns">
          <el-button type="primary" @click="batchSet()" v-if="switchStatus === '0'" :disabled="this.sels.length===0">批量设为尾货</el-button>
        </div>
      </el-col>
  
        <!--表格-->
        <record-count :total="total">
          <div v-if="switchStatus === '0'">
            已设为尾货的商品数/最多可设为尾货的商品数
            <el-tooltip :content="`最多可申请${tailRule.tailHandleNumber}款商品作为尾货`" placement="top" :open-delay="300">
              <i class="icon">&#xe657;</i>
            </el-tooltip>
            <span class="err_color">
              （{{tailRule.hasSetCount}}/{{tailRule.tailHandleNumber}}）
            </span>
          </div>
        </record-count>
        <el-table :data="users" @selection-change="selsChange" highlight-current-row v-loading="loading" style="width: 100%;">
          <el-table-column type="selection" width="45">
          </el-table-column>
          <el-table-column prop="imgUrl_main" label="图片">
            <template slot-scope="scope">
              <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px">
            </template>
          </el-table-column>
          <el-table-column label="商品货号" prop="productCode">
          </el-table-column>
          <el-table-column label="商品名称" prop="title" min-width="150px">
          </el-table-column>
          <el-table-column label="操作" v-if="switchStatus === '0'" fixed="right" key="process">
            <template slot-scope="scope">
              <div class="process_td">
                <el-button type="primary" plain size="small" @click="batchSet(scope.row)">设为尾货</el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" v-else prop="status" key="status">
            <template slot-scope="scope">
              <span :class="[formatStatus(scope.row, true)]">{{formatStatus(scope.row)}}</span>
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
    </section>
  </template>
  <script>
    export default {
      data() {
        return {
          loading: false,
          users: [],
          switchStatus: '0',
          dialogShow: false,
          details: {},
          sels: [],
          filters: {
            productCode: '',
            title: ''
          },
          pageNum: 1,
          pageSize: 10,
          total: 0,
          editForm: {
            rule: ''
          }
        }
      },
      props: {
        curItem: {
          type: Object,
          default: () => {}
        },
        tailRule: {
          type: Object,
          default: () => {}
        }
      },
      mounted() {
        this.getUsers()
      },
      methods: {
        queryData() {
          this.pageNum = 1
          this.getUsers()
        },
        // 清空筛选条件
        clearFilter() {
          this.filters = {
            productCode: '',
            title: ''
          }
        },
        formatStatus(row, isClass) {
          if (isClass) return row.status === 1 ? 'success_color' :  'err_color'
          return row.status === 0 ? '审核中' : row.status === 1 ? '展示中' : '—'
        },
        selsChange(sels) {
          this.sels = sels
        },
        // 页脚显示转换
        handleCurrentChange(val) {
          this.pageNum = val
          this.getUsers()
        },
        // 批量申请为尾货
        batchSet(row, isCancel) {
          if (this.tailRule.hasSetCount - this.tailRule.tailHandleNumber < 0) {
            let ids = row ? [row.id] : this.sels.map(item => item.id)
            const para = { 
              ids: ids.toString(),
            }
            if (isCancel) {
              this.$confirm('确认取消设置吗？', '提示', {
                type: 'warning'
              })
                .then(() => {
                  this.$postJson(this._basePath.ajaxStallTailGoodsApply, para).then(res => {
                    if (res.success) {
                      this.$message({
                        message: '取消成功',
                        type: 'success'
                      })
                      this.queryData()
                      this.$emit('refreshRule')
                    }
                  })
                })
                .catch(() => {})
            } else {
              this.$postJson(this._basePath.ajaxStallTailGoodsApply, para).then(res => {
                if (res.success) {
                  this.$message({
                    message: '设置成功',
                    type: 'success'
                  })
                  this.queryData()
                  this.$emit('refreshRule')
                }
              })
            }
          } else {
            this.$message.error('尾数商品数已超过总限制')
          }
        },
        // 获取用户列表
        getUsers() {
          const para = {
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            isTailHandle: this.switchStatus !== '0'
          }
          this.loading = true
          this.$postJson(this._basePath.ajaxStallTailGoodsGet, {...para, ...this.filters}).then(res => {
            this.loading = false
            if (res.success) {
              this.total = res.data.count
              let data = res.data.datas
              this.users = data
            }
          })
        }
      }
    }
  </script>
  <style lang="stylus">
    @import '~@/assets/css/index'
    #hang_bill
      .switch_header
        mb(20px)
      .switch_tabs
        .el-tabs__item
          fn(16px)
      .el-tabs__content
        padding:0
        
  </style>