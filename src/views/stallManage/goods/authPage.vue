<template>
  <div id="auth_page">
  <section class="app-container">
    <div class="process_btns">
      <a :href="authLink" :loading="!authLink" class="link_a" target="_blank">添加授权店铺</a>
      <el-button type="primary" @click="getUsers">刷新店铺</el-button>
    </div>
    <div class="tips light_color">( 备注：一个档口可以管理多个店铺。目前只支持淘宝平台店铺绑定 )</div>
    <el-table :data="users" highlight-current-row v-loading="loading" style="width: 100%;">
      <el-table-column prop="title" label="序号">
        <template slot-scope="scope">{{scope.$index}}</template>
      </el-table-column>
      <el-table-column prop="storeSysType" label="平台类型">
      </el-table-column>
      <el-table-column prop="name" label="店铺名称">
      </el-table-column>
      <el-table-column prop="status" label="授权状态">
      </el-table-column>
      <el-table-column prop="createTime" label="授权时间" :formatter="formatAuthTime">
      </el-table-column>
      <el-table-column prop="lastSyncOrderTime" label="最近同步时间" :formatter="formatNewestTime">
      </el-table-column>
      <el-table-column prop="" label="操作" width="180px">
        <template slot-scope="scope">
          <el-button type="primary" plain size="mini" @click="setSync(scope.row)">同步商品</el-button>
          <el-button type="danger" plain size="mini" @click="removeShop(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </section>
  </div>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        // 已授权店铺列表
        users: [],
        loading: false,
        authLink: ''
      }
    },
    created() {
      this.getUsers = this._debounce(this.getUsers)
      this.getUsers()
      this.authrizeShop()
    },
    components: {},
    methods: {
      formatNewestTime(row) {
        return this._formatTime(row.lastSyncOrderTime, true) || '—'
      },
      formatAuthTime(row) {
        return this._formatTime(row.createTime, true) || '—'
      },
      // 添加授权商铺
      authrizeShop() {
        const param = {
          userId: 1,
          userType: 1
        }
        this.$postJson(this._basePath.ajaxAuthrize, param).then(res => {
          if (res.success) {
            this.authLink = res.data
          }
        })
      },
      // 设置商铺是否同步
      setSync(row) {
        const param = {
          webStoreId: row.id,
          userId: 1
        }
        this.$postJson(this._basePath.ajaxSyncGoods, param).then(res => {
          if (res.success) {
            this.$message.success('开始同步')
          }
        })
      },
      // 删除商铺
      removeShop(row) {
        const param = {
          idList: [row.id].toString()
        }
        this.$confirm('删除后，将不能再同步该淘宝店铺商品，确定删除？', '提示', {
          type: 'warning'
        })
          .then(() => {
            this.$postJson(this._basePath.ajaxAuthShopDel, param).then(res => {
              if (res.success) {
                this.$message.success('删除成功')
                this.getUsers()
              }
            })
          })
          .catch(() => {})
      },
      getUsers() {
        const para = {
          userId: 1,
          pageNum: 1,
          pageSize: 9999,
        }
        this.loading = true
        this.$postJson(this._basePath.ajaxGetShopByPage, para).then(res => {
          this.loading = false
          if (res.success) {
            this.total = res.data.count
            this.users = res.data && res.data.datas 
          }
        })
      },
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #auth_page
    .link_a
      inline()
      padding:12px 20px
      color: #fff
      background-color: #409EFF
      border-color: #409EFF
      radius(4px)
      mr(10px)
      font-weight:500
    .link_btn
      relative()
      padding:0
      width:120px
      a
        inline()
        width:120px
        vertical(40px)
    .tips
      inline()
      mt(10px)
      mb(20px)
</style>