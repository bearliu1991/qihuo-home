<template>
	<section class="app-container" id="good_list">
    <div v-show="!secShow">
      <!--查询条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="filters.productCode" placeholder="货号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="filters.categoryId" placeholder="货品Id"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="filters.userId" placeholder="用户Id"></el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.saleState" placeholder="销售状态">
              <el-option v-for="(item, index) in sellStates" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="getUsers">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAdd">新增</el-button>
          </el-form-item>
          <div>
            <el-button type="danger" @click="binShop">绑定淘宝店铺</el-button>
            <el-button type="danger" @click="uploadData">上传离线数据包</el-button>
          </div>
        </el-form>
      </el-col>

      <!--列表-->
      <el-table :data="users" highlight-current-row @selection-change="selsChange" style="width: 100%;">
        <el-table-column type="selection" width="45">
        </el-table-column>
        <el-table-column prop="imgUrl_main" label="图片" width="70px">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px">
          </template>
        </el-table-column>
        <el-table-column prop="title" label="名称">
        </el-table-column>
        <el-table-column prop="productCode" label="货号" width="150px">
          <template slot-scope="scope">
            <el-row :gutter="5">
              <el-col :span="24">
                <div v-if="!scope.row.codeEdit">{{scope.row.productCode}}</div>
                <el-input size="mini" v-if="scope.row.codeEdit" v-model="scope.row.productCode"></el-input>
              </el-col>
              <el-col :span="24">
                <i v-if="!scope.row.codeEdit" class="icon cursor" @click="editCode(scope.$index, scope.row)">&#xe6ad;</i>
                <i v-if="scope.row.codeEdit" class="icon cursor" @click="handlePartSave(scope.$index, scope.row)">&#xe715;</i>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="批发价/起批件数" width="200">
          <template slot-scope="scope">
            <div>
              <el-row>
                <el-col>
                  <div v-if="!scope.row.priceEdit">{{scope.row.wholesalePrice}}</div>
                  <el-input size="mini" v-if="scope.row.priceEdit" v-model="scope.row.wholesalePrice">{{scope.row.wholesalePrice}}</el-input>
                </el-col>
                <el-col class="whole_col">
                  <span v-if="!scope.row.priceEdit">{{scope.row.wholesaleNum}}</span>
                  <el-input size="mini" width="120px" v-if="scope.row.priceEdit" v-model="scope.row.wholesaleNum"/>件起批
                </el-col>
              </el-row>
              <div style="margin-left:5px">
                <i v-if="!scope.row.priceEdit" class="icon cursor" @click="editPrice(scope.$index, scope.row)">&#xe6ad;</i>
                <i v-if="scope.row.priceEdit" class="icon cursor" @click="handlePartSave(scope.$index, scope.row)">&#xe715;</i>
              </div>
            </div>
            <!-- <el-button type="primary" v-if="!scope.row.priceEdit" class="icon" size="small" @click="editPrice(scope.$index, scope.row)">modify</el-button>
            <el-button type="primary" v-if="scope.row.priceEdit" class="icon" size="small" @click="handlePartSave(scope.$index, scope.row)">save</el-button> -->
          </template>
        </el-table-column>
        <el-table-column prop="totalNum" label="库存">
          <template slot-scope="scope">
            <template v-if="!scope.row.isEditedSku">----</template>
            <template v-else>
              <div v-if="!scope.row.storeEdit">{{scope.row.totalNumber}}</div>
              <el-dialog title="设置精准库存" :visible.sync="scope.row.storeEdit" width="750px" :close-on-click-modal="false">
                <good-detail-set ref="goodSet" :allSku="allSku" :sizes="scope.row.skuMap.sizeSet" 
                  :colors="scope.row.skuMap.colorSet" :skuVoList="scope.row.skuMap.colorSkuVoList"></good-detail-set>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="$set(scope.row, 'storeEdit', false)">取 消</el-button>
                  <el-button type="primary" @click="dialogConfirm(scope.row)">确 定</el-button>
                </span>
              </el-dialog>
              <!-- <el-input v-if="scope.row.storeEdit" v-model="scope.row.totalNumber"></el-input> -->
              <i v-if="!scope.row.storeEdit" class="icon cursor" size="small" @click="editStore(scope.$index, scope.row)">&#xe6ad;</i>
              <i v-if="scope.row.storeEdit" class="icon cursor" size="small" @click="handlePartSave(scope.$index, scope.row)">&#xe715;</i>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="saleState" label="销售状态" :formatter="formatSellState">
        </el-table-column>
        <!-- <el-table-column prop="comeType" label="商品来源" :formatter="formatOrigin">
        </el-table-column>
        <el-table-column prop="productCodeValid" label="货号是否有效" :formatter="formatGoodNum">
        </el-table-column>
        <el-table-column prop="purchasePrice" label="采购成本价">
        </el-table-column>
        <el-table-column prop="saleTime" label="上架时间" :formatter="formatSaleTime">
        </el-table-column>
        <el-table-column prop="sellPrice" label="拿货价">
        </el-table-column>
        <el-table-column prop="packagePrice" label="打包价">
        </el-table-column>
        <el-table-column prop="weight" label="重量">
        </el-table-column>
        <el-table-column prop="totalNumber" label="总数量">
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column prop="createUserId" label="创建人Id">
        </el-table-column> -->
        <el-table-column label="操作" min-width="220px">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleDetail(scope.$index, scope.row)">修改</el-button>
            <el-button type="primary" size="small" @click="shelve(scope.$index, scope.row)" v-if="scope.row.saleState !== 1">上架</el-button>
            <el-button type="danger" size="small" @click="unshelve(scope.$index, scope.row)" v-if="scope.row.saleState && scope.row.saleState === 1">下架</el-button>
            <el-button type="danger" size="small" @click="batchRemove(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--工具条-->
      <el-col :span="24" class="toolbar_process">
        <el-button type="primary" @click="shelve" :disabled="this.unshelveArr.length===0">批量上架</el-button>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
        <el-button type="danger" @click="unshelve" :disabled="this.shelveArr.length===0">批量下架</el-button>
        <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
        </el-pagination>
      </el-col>
    </div>
    <Secondary :title="textMap[dialogStatus]" v-model="secShow" width="100%">
      <GoodEdit @getAllSku="getColorAndSize" :allSku="allSku" :dialogStatus="dialogStatus" :datas="datas" v-if="goodsEditShow && secShow" @close="closeSecPage"></GoodEdit>
      <AuthPage v-if="authrizeShow && secShow" :authLink="authLink"></AuthPage>
      <ExcelPage v-if="excelGoodsShow && secShow">我是批量上传</ExcelPage>
    </Secondary>
	</section>
</template>
<script>
import GoodEdit from './goodEdit'
import AuthPage from './authPage'
import ExcelPage from './excelPage'
export default {
  data() {
    return {
      secShow: false,
      datas: {},
      // 商品编辑/店铺授权/excel导入商品页面是否展示
      goodsEditShow: false,
      authrizeShow: false,
      excelGoodsShow: false,
      // 授权链接
      authLink: '',
      sellStates: [
        {value: 1, label: '销售中'},
        {value: 0, label: '已下架'}
      ],
      dialogStatus: '',
      allSku: {color:{}, size: {}},
      textMap: {
        update: '修改商品',
        create: '新增商品'
      },
      filters: {
        productCode: '',
        categoryId: '',
        userId: 1,
        saleState: ''
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      shelveArr: [], // 已经上架的产品id集合
      unshelveArr: [], // 已经下架的产品id集合
    }
  },
  created () {
    this.init()
  },
  components: {GoodEdit, AuthPage, ExcelPage},
  methods: {
    init() {
      this.getColorAndSize()
      this.getUsers()
      this.authrizeShop()
    },
    closeSecPage(isCancel) {
      this.secShow = false
      !isCancel && this.getUsers()
    },
    // sku调整
    dialogConfirm(row) {
      let param = {}
      param.productId = row.id
      param.productCode = row.productCode
      param.skuVoList = this.$refs.goodSet.getParams()
      this.$post(this._basePath.ajaxUpdateSku, param).then((res) => {
        if (res.success) {
          this.$set(row, 'totalNumber', this.$refs.goodSet.getTotal())
          this.$set(row, 'storeEdit', false)
        }
      })
    },
    // 显示店铺授权页面
    binShop() {
      this.secShow = true
      this.excelGoodsShow = false
      this.authrizeShow = true
    },
    // 显示批量上传数据页面
    uploadData() {
      this.secShow = true
      this.authrizeShow = false
      this.excelGoodsShow = true
    },
    goBack() {
      this.secShow = true
      this.goodsEditShow = false
      this.authrizeShow = false
      this.excelGoodsShow = false
    },
    // 显示编辑界面
    handleDetail(index, row) {
      this.$postJson(this._basePath.ajaxGetDetail, {productId: row.id}).then(res => {
        if (res.success) {
          this.dialogStatus = 'update'
          this.secShow = true
          this.goodsEditShow = true
          this.datas = res.data
        }
      })
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = 'create'
      this.secShow = true
      this.goodsEditShow = true
      this.datas = {}
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
    // 获取颜色和尺码初始值
    getColorAndSize() {
      this.$get(this._basePath.ajaxGoodColorSize).then((res) => {
        if (res.success) {
          this.$set(this.allSku, 'color',  res.data[0])
          this.$set(this.allSku, 'size',  res.data[1])
        }
      })
    },
    // 局部修改
    editCode(index, row) {
      this.$set(row, 'codeEdit', true)
    },
    editPrice(index, row) {
      this.$set(row, 'priceEdit', true)
    },
    editStore(index, row) {
      this.$set(row, 'storeEdit', true)
    },
    handlePartSave(index, row) {
      const param = {
        productId: row.id, 
        productCode: row.productCode,
        wholesalePrice: row.wholesalePrice,
        wholesaleNum: row.wholesaleNum,
        totalNumber: row.totalNumber
      }
      this.$postJson(this._basePath.ajaxSavePartGood, param).then((res) => {
        if (res.success) {
          this.$message({type: 'success', message: '修改成功'})
          this.getUsers()
        }
      })
    },
    // 商品上架
    shelve(index, row) {
      const ids = row ? [row.id] : this.unshelveArr
      this.$postJson(this._basePath.ajaxShelveGood, {idList: ids.toString()}).then((res) => {
        if (res.success) {
          this.$message({
            message: '上架成功',
            type: 'success'
          })
          this.getUsers()
        }
      })
    },
    // 商品下架
    unshelve(index, row) {
      const ids = row ? [row.id] : this.shelveArr
      this.$postJson(this._basePath.ajaxUnshelveGood, {idList: ids.toString()}).then((res) => {
        if (res.success) {
          this.$message({
            message: '下架成功',
            type: 'success'
          })
          this.getUsers()
        }
      })
    },
    formatOrigin(val) {
      switch (val.comeType) {
        case 0:
          return '自建商品'
        case 1:
          return '淘宝天猫'
        case 2:
          return '京东'
        case 3:
          return '网商园'
        default: 
          return '其他'
      }
    },
    formatSellState(val) {
      switch (val.saleState) {
        case 1:
          return '出售中'
        case 0:
          return '已下架'
        default: 
          return '其他'
      }
    },
    formatGoodNum(val) {
      switch (val.productCodeValid) {
        case 1:
          return '有效'
        case 0:
          return '无效'
        default: 
          return '其他'
      }
    },
    formatCreateTime(val) {
      // 'YYYY-MM-DD HH:mm:ss'
      return this.$dateFns.format(val.createTime, 'YYYY-MM-DD')
    },
    formatSaleTime(val) {
      return this.$dateFns.format(val.saleTime, 'YYYY-MM-DD')
    },
    formatBool: function(row, column) {
      return row.isShow === true ? '是' : '否'
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    // 获取用户列表
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
      }
      let b = this.filters
      this.$postJson(this._basePath.ajaxGoodByPage, {...para, ...b}).then(res => {
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
      this.shelveArr = []
      this.unshelveArr = []
      for (let item of sels) {
        item.saleState === 1 ? this.shelveArr.push(item.id) : this.unshelveArr.push(item.id)
      }
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
              this.getUsers()
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
    .link_btn
      a
        display:block
        height:100%
</style>