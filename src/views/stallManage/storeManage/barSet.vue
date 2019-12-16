<template>
    <div id="skuPrint">
      <!--列表-->
      <record-count :total="len">
        <span class="fn12">支持大小写字母、数字、常用标点符号，32位以内</span>
      </record-count>
      <el-table
        :data="users"
        highlight-current-row
        v-loading="loading"
        style="width: 100%">
        <!-- <el-table-column prop="productName" label="商品名称" min-width="200px"></el-table-column> -->
        <el-table-column prop="id" label="SKU编码"></el-table-column>
        <el-table-column prop="productCode" label="商品货号"></el-table-column>
        <el-table-column prop="color" label="颜色"></el-table-column>
        <el-table-column prop="size" label="尺寸"></el-table-column>
        <el-table-column prop="corProd" label="关联条码" min-width="230px">
          <template slot-scope="scope">
            <el-form :model="scope.row" :ref="'printNum' + scope.$index">
              <el-form-item prop="corProd"
                :rules = "{ required: true, validator: barcodeRule, message: '支持大小写字母、数字、常用标点符号，32位以内', trigger: 'blur'}"
                >
                <el-input size="mini" @blur="valueJudge(scope.row, 'printNum' + scope.$index)" v-model.trim="scope.row.corProd"></el-input>
              </el-form-item>
            </el-form>
          </template>
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
      props: ['curRow'],
      created() {
        this.getUsers()
      },
      components: {},
      methods: {
        clearFilter() {
          this.filters = {
            productName: '',
            productCode: ''
          }
        },
        getUsers() {
          const para = {
            productId: this.curRow.id
          }
          this.loading = true
          this.$postJson(this._basePath.ajaxGetSkuBarcodeById, para).then(
            res => {
              this.loading = false
              if (res.success) {
                this.users = res.data
                this.users && this.users.length && this.users.forEach(item => {
                  item.oldValue = item.corProd
                })
                this.len = this.users ? this.users.length : 0
              }
            }
          )
        },
        getParams() {
          let isValid = true
          for (let key in this.$refs) {
            this.$refs[key].validate(valid => {
              !valid && (isValid = false)
            })
          }
          if (!isValid) return false
          let arr = []
          this.users.forEach(item => item.corProd !== item.oldValue && arr.push({id: item.id, corProd: item.corProd}))
          return arr
        },
        barcodeRule(rule, value, callback) {
          if (!this._isHasVal(value)) {
            callback()
          } else {
            !/^[\s\S]{0,32}$/.test(value.trim()) && callback(new Error(rule.message))
            let allTrue = true
            for (let item of value) {
              (!this._nonnegativeInt(item.charCodeAt()) || (this._nonnegativeInt(item.charCodeAt()) && 
                item.charCodeAt() > 127)) && (allTrue = false)
            }
            if (!allTrue) {
              callback(new Error(rule.message))
            } else {
              callback()
            }
          }
        },
        valueJudge(row, refName) {
          this.$refs[refName].validate(valid => {
            this.$set(row, 'isValid', valid)
          })
          // if (row.corProd && row.corProd.length > 100) {
          //   this.$message.error('条码长度不超过100')
          //   this.$set(row, 'corProd', '')
          //   return false
          // }
        }
      }
    }
  </script>
  <style lang="stylus">
    @import '~@/assets/css/index'
    #skuPrint
      height:100%
      .el-form-item__error
        padt(0)
      .el-form-item
        mb(10px)
      .el-table
        tr.hidden
          display:none
  </style>