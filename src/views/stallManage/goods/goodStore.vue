<template>
	<section class="app-container" id="good_list">
    <div v-show="!secShow">
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
            <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
          </el-form-item>
          <div class="process_btns">
            <el-button type="primary" @click="shelve" :disabled="this.sels.length===0">批量启售</el-button>
            <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
            <el-button type="primary" @click="queryData(true)">刷新</el-button>
          </div>
        </el-form>
        <filter-list :filterList="filterList" @filterChange="queryData" ref="filterBtn"></filter-list>
      </el-col>

      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row @selection-change="selsChange" v-loading="loading" style="width: 100%;">
        <el-table-column type="selection" width="45">
        </el-table-column>
        <el-table-column prop="imgUrl_main" label="图片" width="70px">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px">
          </template>
        </el-table-column>
        <el-table-column prop="title" label="商品名称" min-width="150">
        </el-table-column>
        <el-table-column prop="productCode" label="商品货号" min-width="150px">
            <template slot-scope="scope">
              <div class="editable_div">
                <!-- <div v-if="!scope.row.codeEdit">{{scope.row.productCode}}</div> -->
                <el-form :model="scope.row" :ref="'productCode' + scope.$index" @submit.native.prevent>
                  <el-form-item
                    prop="productCode"
                    :rules="[
                      { validator: noEmpty, message: '不能为空', trigger: 'blur'},
                      { required: true, validator: codeLimit, message: '不大于30个字符', trigger: 'blur'}
                    ]"
                  >
                    <el-input size="mini" @focus="focusEvent(scope.row, 'productCode', scope.$index)" @keyup.enter.native="handlePartSave(scope.row, 'productCode', scope.$index)"
                      @blur="handlePartSave(scope.row, 'productCode', scope.$index)" v-model.trim="scope.row.productCode"></el-input>
                  </el-form-item>
                </el-form>
              </div>
            </template>
        </el-table-column>
        <el-table-column prop label="批发价(元)/起批件数" width="200">
          <template slot-scope="scope">
            <div class="editable_div no_flex">
              <!-- <div v-if="!scope.row.priceEdit">
                <div>{{scope.row.wholesalePrice}}</div>
                <div>{{scope.row.wholesaleNum}}<span>件起批</span></div>
              </div> -->
              <el-form :model="scope.row" class="editable_ul" :ref="'wholesalePrice' + scope.$index" @submit.native.prevent>
                <el-form-item prop="wholesalePrice" :rules="[
                  { required: true, validator: validMoney, message: '需为有效数字', trigger: 'blur'},
                  { required: true, validator: _decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
                  { required: true, validator: _maxJudge, message: '不大于99999', trigger: 'blur'}
                ]">
                  <el-input @focus="focusEvent(scope.row, 'wholesalePrice', scope.$index)" @blur="handlePartSave(scope.row, 'wholesalePrice', scope.$index)" 
                    size="mini" v-model="scope.row.wholesalePrice" @keyup.enter.native="handlePartSave(scope.row, 'wholesalePrice', scope.$index)"></el-input>
                </el-form-item>
                <span class="fn12">元</span>
              </el-form>
              <el-form :model="scope.row" class="editable_ul" :ref="'wholesaleNum' + scope.$index" @submit.native.prevent>
                <el-form-item prop="wholesaleNum"
                  :rules="[
                    { required: true, validator: noEmpty, message: '不能为空', trigger: 'blur'},
                    { required: true, validator: _positiveInt, message: '需为有效数字', trigger: 'blur'}
                  ]"
                >
                  <el-input @focus="focusEvent(scope.row, 'wholesaleNum', scope.$index)" @blur="handlePartSave(scope.row, 'wholesaleNum', scope.$index)" 
                    size="mini" v-model="scope.row.wholesaleNum" @keyup.enter.native="handlePartSave(scope.row, 'wholesaleNum', scope.$index)"/>
                </el-form-item>
                <span class="fn12">件起批</span>
              </el-form>
              <!-- <i v-if="!scope.row.priceEdit" class="icon cursor fn20" @click="editPrice(scope.$index, scope.row)">&#xea3d;</i>
              <i v-if="scope.row.priceEdit" class="icon cursor fn20" @click="handlePartSave(scope.row, 'wholesale', scope.$index)">&#xe61f;</i>
              <i v-if="scope.row.priceEdit" class="icon cursor" style="font-size:22px" @click="cancelEdit(scope.row, 'priceEdit')">&#xe663;</i> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本" min-width="150px">
          <template slot-scope="scope">
            <div class="editable_div">
              <!-- <div v-if="!scope.row.costEdit">{{scope.row.cost}}</div> -->
              <el-form :model="scope.row" :ref="'cost' + scope.$index" @submit.native.prevent>
                <el-form-item
                  prop="cost"
                  :rules="[
                    { required: true, validator: _nonnegativeNum, message: '成本需为有效数字', trigger: 'blur'},
                    { required: true, validator: _decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
                    { required: true, validator: _maxJudge, message: '不大于99999', trigger: 'blur'}
                  ]"
                >
                  <el-input @focus="focusEvent(scope.row, 'cost', scope.$index)" @blur="handlePartSave(scope.row, 'cost', scope.$index)"
                   size="mini" v-model.trim="scope.row.cost" @keyup.enter.native="handlePartSave(scope.row, 'cost', scope.$index)"></el-input>
                </el-form-item>
              </el-form>
              <!-- <i
                v-if="!scope.row.costEdit"
                class="icon cursor fn20"
                @click="editCost(scope.$index, scope.row)"
              >&#xea3d;</i>
              <i
                v-if="scope.row.costEdit"
                class="icon cursor fn20"
                @click="handlePartSave(scope.row, 'cost', scope.$index)"
              >&#xe61f;</i>
              <i
                v-if="scope.row.costEdit"
                class="icon cursor"
                style="font-size:22px"
                @click="cancelEdit(scope.row, 'costEdit')"
              >&#xe663;</i> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalNumber" label="总库存量" min-width="110px">
          <template slot-scope="scope">
            <div class="editable_div">
              <!-- <div v-if="!scope.row.totalEdit">{{scope.row.totalNumber}}</div>
              <el-form v-else :model="scope.row" ref="totalNumber">
                <el-form-item prop="totalNumber"
                  :rules="[{ validator: noEmpty, message: '不能为空', trigger: 'blur'},
                    { validator: _positiveInt, message: '需为有效数字', trigger: 'blur'}]"
                >
                  <el-input size="mini" v-if="scope.row.totalEdit" v-model="scope.row.totalNumber"></el-input>
                </el-form-item>
              </el-form>
              <i v-if="!scope.row.totalEdit" class="icon cursor fn20" @click="editTotal(scope.$index, scope.row)">&#xea3d;</i>
              <i v-if="scope.row.totalEdit" class="icon cursor fn20" @click="handlePartSave(scope.row, 'totalNumber')">&#xe61f;</i> -->
              <!-- 精准SKU -->
              <div v-if="!scope.row.storeEdit">{{scope.row.totalNumber}}</div>
              <!-- <i v-if="!scope.row.storeEdit" class="icon cursor fn20" size="small" 
                @click="editStore(scope.$index, scope.row)">&#xea3d;</i> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="商品分类" :formatter="formatCategory">
        </el-table-column>
        <el-table-column label="操作" min-width="150px" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="handleDetail(scope.$index, scope.row)">编辑</el-button>
            <el-button type="primary" plain size="mini" @click="shelve(scope.$index, scope.row)" v-if="scope.row.saleState !== 1">启售</el-button>
            <!-- <el-button type="danger" plain size="mini" @click="batchRemove(scope.$index, scope.row)">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next,  jumper, sizes, total" prev-text="上一页" next-text="下一页" background
          @current-change="handleCurrentChange" :current-page="pageNum" @size-change="handleSizeChange" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize" :total="total">
        </el-pagination>
      </div>
    </div>
    <Drawer v-model="showDrawer">
      <good-detail-set ref="goodSet" :allSku="allSku" :sizes="curRow.skuMap.sizeSet" :isAccurate="true"
        :colors="curRow.skuMap.colorSet" :skuVoList="curRow.skuMap.colorSkuVoList" :curRow="curRow"></good-detail-set>
      <span slot="footer" class="dialog-footer" slot-name="footer">
        <el-button type="primary" @click="dialogConfirm(curRow)">确 定</el-button>
      </span>
    </Drawer>
    <Secondary :title="textMap[dialogStatus]" v-model="secShow" width="100%">
      <GoodEdit @getAllSku="getColorAndSize" :allSku="allSku" :dialogStatus="dialogStatus"
       :datas="datas" v-if="secShow" @close="closeSecPage"></GoodEdit>
    </Secondary>
	</section>
</template>
<script>
import GoodEdit from './goodEdit'
export default {
  data() {
    return {
      loading: false,
      showDrawer: false,
      secShow: false,
      datas: {},
      // 商品编辑/店铺授权/excel导入商品页面是否展示
      curRow: {
        skuMap:{sizeSet: [],colorSkuVoList: [],colorSet: []},
      },
      dialogStatus: '',
      allSku: {color:{}, size: {}},
      textMap: {
        update: '修改商品',
        create: '新增商品'
      },
      filters: {
        productCode: '',
        title: ''
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      filterList: [ // 上架状态，1:出售中 0:已下架 2:待上架,仓库中 // 1 无货号，2无起批件数/起批价格，3无精准库存
        {name: '全部', filterVal: {saleState: -1}},
        {name: '信息完整商品', filterVal: {noneType: 4}},
        {name: '无货号', filterVal: {noneType: 1}, num: 0},
        {name: '无批发价', filterVal: {noneType: 2}, num: 0},
        {name: '我停售的', filterVal: {saleState: 0}},
        {name: '从未启售', filterVal: {saleState: 2}}
      ]
    }
  },
  mounted () {
    this.init()
    this.queryData = this._debounce(this.queryData)
    this.handlePartSave = this._debounce(this.handlePartSave)
  },
  components: {GoodEdit},
  methods: {
    init() {
      this.getColorAndSize()
      this.getUsers(true)
    },
    // 清空筛选条件
    clearFilter() {
      this.filters = {
        productCode: '',
        title: '',
        saleState: -1
      }
    },
    queryData(isBool) {
      this.pageNum = 1
      this.getUsers(isBool)
    },
    codeLimit(rule, value, callback) {
      if (value.length > 30) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    closeSecPage() {
      this.secShow = false
      this.queryData(true)
    },
    ajaxGoodFilterNum() {
      this.$get(this._basePath.ajaxGoodFilterNum).then(res => {
        if (res.success) {
          const data = res.data
          this.$set(this.filterList, [2], {...this.filterList[2], ...{num: data.noProductCount}})
          this.$set(this.filterList, [3], {...this.filterList[3], ...{num: data.noWholesaleCount}})
        }
      })
    },
    // sku调整
    dialogConfirm(curRow) {
      let param = {}
      param.productId = curRow.id
      param.productCode = curRow.productCode
      param.skuVoList = this.$refs.goodSet.getParams()
      param.totalNumber = null
      this.$post(this._basePath.ajaxUpdateSku, param).then((res) => {
        if (res.success) {
          this.showDrawer = false
          this.getUsers(true)
        }
      })
    },
    formatCategory(row) {
      return row.categoryName || '—'
    },
    // 显示编辑界面
    handleDetail(index, row) {
      this.$postJson(this._basePath.ajaxGetDetail, {productId: row.id}).then(res => {
        if (res.success) {
          this.dialogStatus = 'update'
          this.secShow = true
          this.datas = res.data
        }
      })
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = 'create'
      this.secShow = true
      this.datas = {}
    },
    // 获取颜色和尺码初始值
    getColorAndSize() {
      this.$get(this._basePath.ajaxGoodColorSize).then((res) => {
        if (res.success) {
          const colors = res.data[0]
          const sizes = res.data[1]
          let ownerColor = this.handleArr(colors.ownerValueList)
          let ownerSize = this.handleArr(sizes.ownerValueList)
          const allColor = colors ? (colors.sysValueList || []).concat(ownerColor) : []
          const allSize = sizes ? (sizes.sysValueList || []).concat(ownerSize) : []
          this.$set(this.allSku, 'color', this._uniqueArr(allColor, 'name'))
          this.$set(this.allSku, 'size', this._uniqueArr(allSize, 'name'))
        }
      })
    },
    // 局部修改
    handleArr (arr) {
      if (!arr) return []
      return arr.map(item => {
        item.isSelfDefine = true
        return item
      })
    },
    // 局部修改
    editCode(index, row) {
      this.$set(row, 'originProductCode', row.productCode)
      this.$set(row, "codeEdit", true);
    },
    editPrice(index, row) {
      this.$set(row, 'originWholesalePrice', row.wholesalePrice)
      this.$set(row, 'originWholesaleNum', row.wholesaleNum)
      this.$set(row, "priceEdit", true);
    },
    editCost(index, row) {
      this.$set(row, 'originCost', row.cost)
      this.$set(row, "costEdit", true)
    },
    // editTotal(index, row) {
    //   this.$set(row, 'originTotalNumber', row.totalNumber)
    //   this.$set(row, "totalEdit", true);
    // },
    cancelEdit(row, name) {
      name === "codeEdit" && this.$set(row, 'productCode', row.originProductCode)
      if (name === "priceEdit") {
        this.$set(row, 'wholesalePrice', row.originWholesalePrice)
        this.$set(row, 'wholesaleNum', row.originWholesaleNum)
      }
      name === "totalEdit" && this.$set(row, 'totalNumber', row.originTotalNumber)
      name === "costEdit" && this.$set(row, 'cost', row.originCost)
      this.$set(row, name, false)
    },
    // 设置精准库存
    editStore(index, row) {
      this.$postJson(this._basePath.ajaxGoodSku, {productId: row.id}).then(res => {
        this.curRow = row
        this.$set(this.curRow, 'skuMap', res.data || {colorSet: [], colorSkuVoList: [], sizeSet: []})
        this.showDrawer = true
        this.ajaxGoodFilterNum()
      })
    },
    focusEvent(row, validatorName) {
      if (!row[validatorName + 'Set']) {
        this.$set(row, [validatorName + 'Set'], true)
        this.$set(row, [validatorName + 'Old'], row[validatorName])
      }
    },
    // 局部保存数据
    handlePartSave(row, validatorName, index) {
      if (row[validatorName + 'Old'] === row[validatorName]) return false
      this.$refs[validatorName + index] && this.$refs[validatorName + index].validate(valid => {
        if (valid) {
          const param = {
            productId: row.id,
            productCode: validatorName === "productCode" ? row.productCode : null,
            wholesalePrice: validatorName === "wholesalePrice" ? row.wholesalePrice : null,
            wholesaleNum: validatorName === "wholesaleNum" ? row.wholesaleNum : null,
            cost: validatorName === "cost" ? row.cost : null
          }
          this.$postJson(this._basePath.ajaxSavePartGood, param).then(res => {
            if (res.success) {
              this.$message({ type: "success", message: "修改成功" })
              this.$set(row, validatorName + 'Old', row[validatorName])
            }
          })
        }
      })
    },
    // 商品上架
    shelve(index, row) {
      const ids = row ? [row.id] : this.sels.map(item => item.id)
      if (row) {
        if (!row.productCode) {
          this.$message.error('请先设置货号')
          return false
        }
        if (!row.wholesalePrice ||  row.wholesalePrice - 0 === 0) {
          this.$message.error('请先设置批发价格')
          return false
        }
      } else {
        if (!(this.sels.every(item => item.productCode && item.wholesalePrice && item.wholesalePrice > 0))) {
          this.$message.error('商品信息不全，无法启售，请重新选择')
          return false
        }
      }
      
      this.$postJson(this._basePath.ajaxShelveGood, {idList: ids.toString()}, {timeout: 5000}).then((res) => {
        if (res.success) {
          this.$message({
            message: '上架成功',
            type: 'success'
          })
          this.getUsers(true)
        }
      })
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
        saleState: -1,
        orderByUpdateTime: true
      }
      const btnFilter = this.$refs.filterBtn.getParams()
      para = {...para, ...this.filters, ...btnFilter}
      this.loading = true
      isRefresh && this.ajaxGoodFilterNum()
      this.$postJson(this._basePath.ajaxGoodByPage, para).then(res => {
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
    },
    // 删除
    batchRemove(index, row) {
      let ids = row ? [row.id] : this.sels.map(item => item.id)
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { idList: ids.toString() }
          this.$postJson(this._basePath.ajaxGoodDel, para).then(res => {
            if (res.success) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.getUsers(true)
            }
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="stylus">
  @import '~@/assets/css/index'
  #good_list
    .el-table
      .cell
        overflow:visible
    .editable_div 
      setStart()
      &.no_flex
        block()
      i
        ml(5px)
      .el-form-item 
        mb(0)
      .editable_ul
        setStart()
        .el-form-item
          mr(5px)
        .el-form-item__error 
          top: 30px
          fn(12px)
        input
          width:100px
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