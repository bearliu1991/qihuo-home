<template>
  <div id="skuPrint">
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-form-item label="商品名称">
          <el-input size="mini" v-model="filters.productName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品货号">
          <el-input size="mini" v-model="filters.productCode" placeholder="请输入商品货号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="queryData">查询</el-button>
          <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true" class="fr" :model="fillForm" ref="fillForm" @submit.native.prevent>
        <el-form-item label="" prop="wholeNum" :rules="[
          { required: true, validator: noEmpty, message: '不能为空', trigger: 'blur'},
          { required: true, validator: _positiveInt, message: '需为有效数字', trigger: 'blur'}
        ]">
          <el-input size="mini" v-model="fillForm.wholeNum" placeholder="请输入填充数量"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="fillNum">批量填充数量</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <record-count :total="len">
    </record-count>
    <ScrollBar style="clear:both;height:calc(100% - 160px)">
      <el-table
        :data="users"
        highlight-current-row
        v-loading="loading"
        :row-class-name="tableRowClassName"
        style="width: 100%;">
        <!-- <el-table-column prop="productName" label="商品名称" min-width="200px"></el-table-column> -->
        <el-table-column prop="id" label="skuId"></el-table-column>
        <el-table-column prop="productCode" label="商品货号"></el-table-column>
        <el-table-column prop="color" label="颜色"></el-table-column>
        <el-table-column prop="size" label="尺寸"></el-table-column>
        <el-table-column prop="printNum" label="打印数量">
          <template slot-scope="scope">
            <el-form :model="scope.row" :ref="'printNum' + scope.$index">
              <el-form-item
                prop="printNum"
                :rules="[
                  { required: true, validator: _positiveInt, message: '非有效数字，不会打印', trigger: 'blur'}
                ]"
              >
                <el-input size="mini" v-model="scope.row.printNum"></el-input>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
    </ScrollBar>
  </div>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        filters: {
          productName: '',
          productCode: ''
        },
        fillForm: {
          wholeNum:''
        },
        loading: false,
        users: [],
        len: 0
      }
    },
    props: ['printIds', 'printType'],
    created() {
      this.getUsers()
      this.queryData()
    },
    components: {},
    methods: {
      queryData() {
        if (this.filters.productName || this.filters.productCode) {
          this.users.forEach(item => {
            let condition1 = this.filters.productName ? item.productName.includes(this.filters.productName) : true
            let condition2 = this.filters.productCode ? item.productCode.includes(this.filters.productCode) : true
            if (condition1 && condition2) {
              this.$set(item, 'isShow', true)
            } else {
              this.$set(item, 'isShow', false)
            }
          })
        } else {
          this.users.forEach(item => {
            this.$set(item, 'isShow', true)
          })
        }
        this.len = this.users.filter(item => item.isShow === undefined || item.isShow).length
        this.$bus.$emit('calcScrollHeight')
      },
      clearFilter() {
        this.filters = {
          productName: '',
          productCode: ''
        }
        this.queryData()
      },
      fillNum() {
        this.$refs.fillForm.validate(valid => {
          if (valid) {
            this.users.forEach(item => {
              (item.isShow || item.isShow === undefined) && this.$set(item, 'printNum', this.fillForm.wholeNum)
            })
          }
        })
      },
      getUsers() {
        const para = {
          productIdList: this.printIds.toString()
        };
        this.loading = true;
        this.$postJson(this._basePath.ajaxGoodsPrintSku, para).then(
          res => {
            this.loading = false
            if (res.success) {
              this.users = res.data
              this.len = this.users ? this.users.length : 0
              this.$nextTick(() => {
                this.$bus.$emit('calcScrollHeight')
              })
            }
          }
        )
      },
      tableRowClassName({row, rowIndex}) {
        if (row.isShow === false) return 'hidden'
      },
      getParams() {
        return this.users
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