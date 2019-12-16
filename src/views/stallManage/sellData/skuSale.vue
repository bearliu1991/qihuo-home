<template>
    <div id="skuSale">
      <!--列表-->
      <record-count :total="len">
      </record-count>
      <el-table
        :data="users"
        highlight-current-row
        v-loading="loading"
        style="width: 100%;">
        <!-- <el-table-column prop="productName" label="商品名称" min-width="200px"></el-table-column> -->
        <el-table-column prop="skuId" label="SKU编码"></el-table-column>
        <el-table-column prop="color" label="颜色"></el-table-column>
        <el-table-column prop="size" label="尺码"></el-table-column>
        <el-table-column prop="salesNum" label="销售量">
          <template slot-scope="scope">
            <span class="bold err_color">{{scope.row.salesNum}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="returnNum" label="退货量">
        </el-table-column>
        <el-table-column prop="salesTotalFee" label="销售金额(不包含减免金额)">
          <template slot-scope="scope">
            <span class="bold err_color">{{scope.row.salesTotalFee}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="returnTotalFee" label="退货金额(不包含减免金额)">
        </el-table-column>
      </el-table>
    </div>
  </template>
  <script>
    export default {
      name: '',
      data() {
        return {
          loading: false,
          users: [],
          len: 0
        }
      },
      props: ['curRow', 'timeArr'],
      mounted() {
        this.getUsers()
      },
      components: {},
      methods: {
        getUsers() {
          this.loading = true
          if (!this.timeArr) return false
          let param = {
            startTime: this.timeArr[0],
            endTime: this.timeArr[1],
            productId: this.curRow.productId,
            pageNum: 1,
            pageSize: 999
          }
          this.$postJson(this._basePath.ajaxGoodSkuSale, param).then(
            res => {
              this.loading = false
              if (res.success) {
                this.users = res.data.datas
                this.len = this.users ? this.users.length : 0
              }
            }
          )
        }
      }
    }
  </script>
  <style lang="stylus">
    @import '~@/assets/css/index'
    #skuSale
      height:100%
      .el-form-item__error
        padt(0)
      .el-form-item
        mb(10px)
      .el-table
        tr.hidden
          display:none
  </style>