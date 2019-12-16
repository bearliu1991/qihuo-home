<template>
	<section class="app-container" id="hang_bill">
    <div class="switch_header">
      <el-tabs v-model="status" class="switch_tabs">
        <el-tab-pane label="已设置VIP价格" name="0"></el-tab-pane>
        <el-tab-pane label="全部" name="1"></el-tab-pane>
      </el-tabs>
    </div>
    <div>
    <!--查询条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" @submit.native.prevent>
        <el-form-item label="商品货号">
          <el-input v-model="filters.productCode" placeholder="请输入商品货号"></el-input>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="filters.title" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryData">查询</el-button>
          <el-button type="text" @click="clearSearch">清空筛选条件</el-button>
        </el-form-item>
      </el-form>
      <div class="process_btns" v-if="type !== 'cashier'">
        <el-button type="primary" @click="showDrawer = true">复制VIP客户价格模板</el-button>
      </div>
    </el-col>
    <!--表格-->
    <record-count :total="total">
    </record-count>
    <!-- <div class="table_records"><span class="icon">&#xe645;</span> 共<i> {{total}} </i>条记录</div> -->
    <el-table :data="users" highlight-current-row v-loading="loading" style="width: 100%;">
      <el-table-column prop="imgUrl_main" label="图片" width="70px">
        <template slot-scope="scope">
          <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px">
        </template>
      </el-table-column>
      <el-table-column prop="title" label="商品名称" min-width="150">
      </el-table-column>
      <el-table-column prop="productCode" label="商品货号" min-width="110px">
      </el-table-column>
      <el-table-column prop="wholesalePrice" label="批发价(元)" width="200">
      </el-table-column>
      <!-- <el-table-column prop="packagePrice" label="打包价(元)">
      </el-table-column> -->
      <el-table-column label="设置VIP价格(元)" min-width="200px" fixed="right">
        <template slot-scope="scope">
          <div class="editable_div">
            <!-- <div v-if="!scope.row.priceEdit">{{scope.row.stallVipPrice}}</div> -->
            <el-form :model="scope.row" :ref="'stallVipPrice' + scope.$index" @submit.native.prevent>
              <el-form-item prop="stallVipPrice" :rules="[
                { validator: noEmpty, message: 'VIP价格不能为空', trigger: 'blur'},
                { validator: _validPrice, message: '需为有效数字', trigger: 'blur'},
                { required: true, validator: _decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
                { required: true, validator: _maxJudge, message: '不大于99999', trigger: 'blur'}
              ]">
                <el-input size="mini" @focus="focusEvent(scope.row, 'stallVipPrice', scope.$index)" @keyup.enter.native="handlePartSave(scope.row, 'stallVipPrice', scope.$index)"
                  @blur="handlePartSave(scope.row, 'stallVipPrice', scope.$index)" v-model="scope.row.stallVipPrice"></el-input>
              </el-form-item>
            </el-form>
            <!-- <i v-if="!scope.row.priceEdit" class="icon cursor fn20" @click="editCode(scope.row)">&#xea3d;</i>
            <i v-if="scope.row.priceEdit" class="icon cursor fn20" @click="setPrice(scope.row, `vipPriceForm${scope.$index}`)">&#xe61f;</i>
            <i v-if="scope.row.priceEdit" class="icon cursor" style="font-size:18px; color: #999" @click="cancelEdit(scope.row, 'priceEdit')">&#xe663;</i> -->
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--工具条-->
    <div class="page_toolbar">
      <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background
        @current-change="handleCurrentChange" :current-page="pageNum" :page-size="pageSize" :total="total">
      </el-pagination>
    </div>
    <Drawer v-model="showDrawer" minWidth="750px" title="复制VIP客户价格模板">
      <VipChoose :curCustomer="curCustomer" @close="closeDrawer"></VipChoose>
    </Drawer>
    </div>
  </section>
</template>
<script>
  import VipChoose from './vipChoose'
  export default {
    data() {
      return {
        loading: false,
        users: [],
        status: '0',
        showDrawer: false,
        filters: {
          productCode: '',
          title: ''
        },
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    },
    props: {
      curCustomer: {
        type: Object,
        default: () => {}
      },
      type: {
        type: String,
        default: 'cashier'
      }
    },
    components: {VipChoose},
    watch: {
      status() {
        this.queryData()
      }
    },
    created() {
      this.getUsers()
      this.queryData = this._debounce(this.queryData)
      this.handlePartSave = this._debounce(this.handlePartSave)
    },
    methods: {
      queryData() {
        this.pageNum = 1
        this.getUsers()
      },
      focusEvent(row, validatorName) {
        if (!row[validatorName + 'Set']) {
          this.$set(row, [validatorName + 'Set'], true)
          this.$set(row, [validatorName + 'Old'], row[validatorName])
        }
      },
      handlePartSave(row, validatorName, index) {
        if (row[validatorName + 'Old'] === row[validatorName]) return false
        this.$refs[validatorName + index] && this.$refs[validatorName + index].validate(valid => {
          if (valid) {
            let param = {price: row.stallVipPrice}
            let path = ''
            if (this.type === 'cashier') {
              param.stallVipUserId = this.curCustomer.id
              path = this._basePath.ajaxStallVipPriceSave
              param.productId = row.productId
            } else {
              param.userId = this.curCustomer.id
              path = this._basePath.ajaxVipPriceEdit
              param.productId = row.id
            }
            this.status === '1' && (param.productId = row.id)
            this.$postJson(path, param).then((res) => {
              if (res.success) {
                this.$message({type: 'success', message: '修改成功'})
                this.$set(row, validatorName + 'Old', row[validatorName])
              }
            })
          }
        })
      },
      // 取消编辑
      // cancelEdit(row, name) {
      //   this.$set(row, 'price', row.originPrice)
      //   this.$set(row, name, false)
      // },
      // 关闭抽屉
      closeDrawer() {
        this.showDrawer = false
        this.status = '0'
        this.queryData()
      },
      // 局部修改
      // editCode(row) {
      //   this.$set(row, 'priceEdit', true)
      //   this.$set(row, 'originPrice', row.price)
      // },
      clearSearch() {
        this.$set(this.filters, 'productCode', '')
        this.$set(this.filters, 'title', '')
      },
      // 页脚显示转换
      handleCurrentChange(val) {
        this.pageNum = val
        this.getUsers()
      },
      getUsers() {
        let param = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          // saleState: 1,
          productCode: this.filters.productCode,
          title: this.filters.title,
        }
        let path = ''
        if (this.status === '1') {
          path = this._basePath.ajaxGetAllPriceSettledGoods
          param.stallVipUserId = this.curCustomer.id
        } else {
          if (this.type === 'cashier') {
            path = this._basePath.ajaxStallVipPriceByPage
            param.stallVipUserId = this.curCustomer.id
          } else {
            path = this._basePath.ajaxVipPriceSettledByPage
            param.userId = this.curCustomer.userId
          }
        }
        
        this.loading = true
        this.$postJson(path, param).then(res => {
          this.loading = false
          if (res.success) {
            this.total = res.data.count
            this.users = res.data.datas
          }
        })
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #hang_bill
    .el-table 
      .cell
        overflow:visible !important
    .editable_div
      setStart()
      .el-input
        width:100px
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