<template>
  <section class="app-container" id="store_manage">
    <div v-show="!secShow">
      <a
        id="plugin"
        style="height:0"
        :href="`http://www.lodop.net/demolist/${lodopDownloadUrl}.zip`"
      ></a>
      <a id="tag" style="height:0"></a>
      <!--查询条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="商品货号">
            <el-input v-model="filters.productCode" placeholder="请输入商品货号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
            <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <el-tabs v-model="saleState" class="switch_tabs" @tab-click="queryData">
          <el-tab-pane label="出售中的商品" name="1"></el-tab-pane>
          <el-tab-pane label="仓库中的商品" name="-1"></el-tab-pane>
          <span class="good_tips">提示：若商品库存到达预警值，则商品会出现提示，可点击查看详细的库存情况。</span>
        </el-tabs>
        <transition name="fade" mode="out-in">
          <div class="process_btns fl" v-show="saleState === '1'">
            <el-button type="primary" @click="print()" :disabled="this.sels.length===0">批量打印spu</el-button>
            <el-button type="primary" @click="printSku()" :disabled="this.sels.length===0">批量打印sku</el-button>
          </div>
        </transition>
        <transition name="fade" mode="out-in">
          <div class="process_btns fr" v-show="saleState === '1'">
            <div>
              <div class="process_btns">
                <p>
                  <el-button type="primary" @click="openUploadDialog('bar')">导入条码</el-button>
                  <el-button type="text" @click="downloadTemplate('bar')">下载条码模板</el-button>
                </p>
                <p style="margin-left:50px">
                  <el-button type="primary" @click="openUploadDialog('goods')">批量新增入库</el-button>
                  <el-button type="text" @click="downloadTemplate('goods')">下载入库模板</el-button>
                </p>
              </div>
              <div class="err_color fn10 fr" style="margin-top:-10px">提示: 导入文件前，请先下载模板（只包含出售中的商品）</div>
            </div>
          </div>
        </transition>
      </el-col>

      <!--列表-->
      <record-count :total="total">
      </record-count>
      <el-table
        :data="users"
        highlight-current-row
        @selection-change="selsChange"
        v-loading="loading"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="45"></el-table-column>
        <el-table-column prop="imgUrl_main" label="图片" width="70px">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px" />
            <div class="good_tip" v-if="scope.row.stockWarn">
              <i>缺</i>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="商品货号" min-width="150px">
        </el-table-column>
        <el-table-column prop="totalNumber" label="当前库存" min-width="110px">
        </el-table-column>
        <el-table-column label="操作" min-width="320px" fixed="right">
          <template slot-scope="scope">
            <!-- <el-button type="primary" plain size="mini" v-show="saleState === '1'" @click="print(scope.row)">打印spu</el-button> -->
            <!-- <el-button type="primary" plain size="mini" v-show="saleState === '1'" @click="printSku(scope.row)">打印sku</el-button> -->
            <el-button type="primary" plain size="mini" @click="handleStoreWarn(scope.row, 'inventory')">盘点库存</el-button>
            <el-button type="primary" plain size="mini" @click="handleStoreWarn(scope.row, 'add')">新增入库</el-button>
            <el-button type="primary" plain size="mini" @click="handleStoreWarn(scope.row, 'warn')">库存预警</el-button>
            <el-button type="primary" plain size="mini" @click="handleBarSet(scope.row)" v-if="saleState === '1'">条码设置</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination
          layout="prev, pager, next,  jumper, sizes, total"
          prev-text="上一页"
          next-text="下一页"
          background
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          :total="total"
        ></el-pagination>
      </div>
    </div>
    <Drawer v-model="showDrawer" :title="drawerTitle">
      <store-warn
        ref="goodSet"
        :allSku="allSku"
        :sizes="curRow.skuMap ? curRow.skuMap.sizeSet : []"
        :isAccurate="true"
        :curRow="curRow"
        :storeType="storeType"
        minWidth="780px"
        :colors="curRow.skuMap ? curRow.skuMap.colorSet : []"
        :skuVoList="curRow.skuMap ? curRow.skuMap.colorSkuVoList : []"
      ></store-warn>
      <span slot="footer" class="dialog-footer" slot-name="footer">
        <el-button type="primary" @click="stockManage">确 定</el-button>
      </span>
    </Drawer>
    <Drawer minWidth="750px" v-model="showPrintDrawer" title="编辑sku条码打印数量">
      <SkuPrint
        slot="header"
        ref="skuPrint"
        :printIds="printIds"
      ></SkuPrint>
      <span slot="footer" class="dialog-footer" slot-name="footer">
        <el-button type="primary" @click="excutePrint">打印</el-button>
      </span>
    </Drawer>
    <Drawer minWidth="750px" v-model="barSetDrawer" title="条码设置">
      <BarSet ref="barset" :curRow="curRow"></BarSet>
      <span slot="footer" class="dialog-footer" slot-name="footer">
        <el-button type="primary" @click="saveBarSet">确定</el-button>
      </span>
    </Drawer>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="uploadExcelshow"
      center
      width="600px">
      <div v-loading="dialogLoading"
          :element-loading-text="loadingText"
          element-loading-spinner="el-icon-loading">
        <div class="center">请确保表格内已填入需要{{category === 'bar' ? '导入的商品条码' : '新增入库商品数量'}}</div>
        <div class="submit_btn">
          <!-- <div class="submit_title">采购需求文件</div> -->
          <UploadFile @uploadSuccess="uploadSuccess" :uploadUrl="uploadUrl"></UploadFile>
        </div>
        <div class="info_wrap">
          <p>最近导入结果：</p>
          <ul class="info_list">
            <li v-for="(item, index) in importInfoArr" :key="index" v-html="item.msg.replace(/\n/g, '<br>')">}</li>
          </ul>
        </div>
      </div>
    </el-dialog>
    <leo-lodop :printData="printData" v-if="showLeoDialog" :printType="printType" v-model="showLeoDialog"></leo-lodop>
  </section>
</template>
<script>
import SkuPrint from "./skuPrint"
import BarSet from "./barSet"
import StoreWarn from "./StoreWarn"

export default {
  name: 'goodList',
  data() {
    return {
      category: '',
      dialogTitle: '',
      storeType: '',
      secShow: false,
      barSetDrawer: false,
      saleState: '1',
      lodopDownloadUrl: '',
      needUpdateTip: '',
      uploadExcelshow: false,
      dialogLoading: false,
      loadingText: false,
      uploadUrl: '',
      usedNum: 0,
      totalNum: 0,
      datas: {},
      drawerTitle: '',
      allSku: { color: {}, size: {} },
      curRow: {
        skuMap: { sizeSet: [], colorSkuVoList: [], colorSet: [] }
      },
      filters: {
        productCode: ""
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      loading: false,
      // 左边栏
      showDrawer: false,
      // 打印相关
      showLeoDialog: false,
      printData: [],
      showPrintDrawer: false,
      printIds: [],
      printType: 'spu',
      // 导入条码结果信息
      importInfoArr: [],
      timer: null,
      // 批量新增入库
      stockInfoArr: []
    }
  },
  watch: {
    uploadExcelshow() {
      if (this.uploadExcelshow === false) {
        this.importInfoArr = []
        this.dialogLoading = false
        this.loadingText = ''
        clearInterval(this.timer)
      }
    }
  },
  mounted() {
    window.LODOP ? this.excuteRequest() : this._loadJs(`${process.env.CHILD_ROUTE}/static/js/LodopFuncs.js`, () => {this.excuteRequest()})
    this.init()
    this.queryData = this._debounce(this.queryData)
  },
  components: { SkuPrint,StoreWarn,BarSet },
  methods: {
    excuteRequest() {
      window.LODOP = getLodop()
    },
    init() {
      this.getUsers(true)
      this.getColorAndSize() // 获取颜色和尺码数组
    },
    // 清空筛选条件
    clearFilter() {
      this.filters = {
        productCode: "",
        title: "",
        mallState: ""
      }
    },
    // excel上传成功
    uploadSuccess(msg) {
      this.loadingText = msg
      this.dialogLoading = true
      this.timer = setInterval(this.getReadInfo, 3000)
    },
    openUploadDialog(category) {
      this.uploadExcelshow = true
      this.category = category
      this.uploadUrl = category === 'bar' ? this._basePath.ajaxUploadGoodBarExcel : this._basePath.ajaxUploadSkuStockExcel
      this.dialogTitle = category === 'bar' ? '导入商品条码' : '批量新增入库'
      clearInterval(this.timer)
      this.getReadInfo()
      this.timer = setInterval(this.getReadInfo, 3000)
    },
    // 查询最近导入结果
    getReadInfo() {
      let param = {biz: this.category === 'bar' ? 1 : 2, program: 'pcStallBackend'}
      this.$post(this._basePath.ajaxQueryExcelUploadResult, param).then(res => {
        if (res.success) {
          if (res.data) {
            if (!res.data.length) {
              this.dialogLoading = false
              clearInterval(this.timer)
            } else {
              if (res.data[0].finish === 1) {
                this.dialogLoading = false
                clearInterval(this.timer)
              } else {
                this.dialogLoading = true
              }
              this.loadingText = res.data[0].msg
            }
          }
          this.importInfoArr = res.data
        }
      })
    },
    downloadTemplate(category) {
      let param = {stallId: this.getCookie('stallId')}
      const checkPath = category === 'bar' ? this._basePath.ajaxCheckDownloadGoodTemplate : this._basePath.ajaxCheckDownloadStoreTemplate
      const downloadPath = category === 'bar' ? this._basePath.ajaxDownloadGoodTemplate : this._basePath.ajaxDownloadStoreTemplate
      this.$postJson(checkPath, param).then(res => {
        if (res.success) {
          param.token = res.data.token
          this.downFile(downloadPath + '?' +  this.serializeParam(param), res.data.fileName)
        }
      })
    },
    downFile (content, fileName) {
      var a = document.getElementById('tag')
      a.download = fileName
      var blob = new Blob([content])
      var url = window.URL.createObjectURL(blob)
      a.href = content
      a.click()
      window.URL.revokeObjectURL(url)
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    // 库存修改
    stockManage() {
      let param = {}
      param.productId = this.curRow.id
      param.stockWarnVoList = this.$refs.goodSet.getParams()
      param.type = this.storeType === 'inventory' ? 1 : this.storeType === 'add' ? 2 : this.storeType === 'warn' ? 3 : ''
      if (!param.stockWarnVoList) return false
      param.totalNumber = null
      this.$post(this._basePath.ajaxStallStockManage, param).then(res => {
        if (res.success) {
          this.$message.success('保存成功')
          this.showDrawer = false
          this.getUsers()
        }
      })
    },
    handleBarSet(row) {
      this.curRow = row
      this.barSetDrawer = true
    },
    // 关联条码
    saveBarSet(row) {
      let arr = this.$refs.barset.getParams()
      if (!arr) return false
      this.$post(this._basePath.ajaxUpdateSkuBarcodeById, arr).then(
        res => {
          if (res.success) {
            this.barSetDrawer = false
            this.$message.success('设置成功')
          }
        }
      )
    },
    // 处理自定义的颜色或尺码
    handleArr(arr) {
      if (!arr) return [];
      return arr.map(item => {
        item.isSelfDefine = true
        return item;
      })
    },
    // 获取颜色和尺码初始值
    getColorAndSize() {
      this.$get(this._basePath.ajaxGoodColorSize).then(res => {
        if (res.success) {
          const colors = res.data[0]
          const sizes = res.data[1]
          let ownerColor = this.handleArr(colors.ownerValueList)
          let ownerSize = this.handleArr(sizes.ownerValueList)
          const allColor = colors
            ? (colors.sysValueList || []).concat(ownerColor)
            : [];
          const allSize = sizes
            ? (sizes.sysValueList || []).concat(ownerSize)
            : [];
          this.$set(this.allSku, "color", allColor)
          this.$set(this.allSku, "size", allSize)
        }
      });
    },
    // 设置库存
    handleStoreWarn(row, type) {
      this.$postJson(this._basePath.ajaxGoodSku, { productId: row.id }).then(
        res => {
          this.curRow = row
          this.$set(
            this.curRow,
            "skuMap",
            res.data || { colorSet: [], colorSkuVoList: [], sizeSet: [] }
          )
          this.showDrawer = true
          this.drawerTitle = type === 'inventory' ? '盘点库存' : type === 'add' ? '新增库存' : type === 'warn' ? '库存预警' : '' 
          this.storeType = type
        }
      )
    },
    isLodopExist() {
      if (window.downloadLodopVersion) {
        this.lodopDownloadUrl = window.downloadLodopVersion.downloadUrl
        this.needUpdateTip = window.downloadLodopVersion && window.downloadLodopVersion.isUpdate ? '打印插件需升级' : '未检测到打印所需插件'
      }
    },
    print(row) {
      this.isLodopExist()
      if (!window.LODOP || !window.LODOP.VERSION) {
        this.$confirm(
          `${this.needUpdateTip}，是否下载？(若已安装，请刷新页面)`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).then(() => {
          document.getElementById("plugin").click();
        });
      } else {
        this.showLeoDialog = true
        let arr = row ? [row] : this.sels
        this.printType = 'spu'
        this.printData = arr.map(item => {
          return {
            stallName: this.getCookie('stallName'),
            id: item.id,
            url: item.skuBarcodeUrl,
            productCode: item.productCode
          };
        });
      }
    },
    excutePrint() {
      let printArr = this.$refs.skuPrint.getParams()
      let arr = []
      this.printType = 'sku'
      printArr.forEach(item => {
        if (this.isPositiveInt(item.printNum - 0)) {
          for (let i = 0; i < item.printNum; i++) {
            arr.push({
              stallName: this.getCookie('stallName'),
              id: item.id,
              url: item.barcodeUrl,
              productCode: item.productCode,
              color: item.color,
              size: item.size
            })
          }
        }
      })
      if (!arr.length) {
        this.$message.error('请填写打印数量')
        return false
      } else {
        this.showLeoDialog = true
        this.printData = arr
      }
    },
    // 打印sku
    printSku(row) {
      this.isLodopExist()
      if (!window.LODOP || !window.LODOP.VERSION) {
        this.$confirm(
          `${this.needUpdateTip}，是否下载？(若已安装，请刷新页面)`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).then(() => {
          document.getElementById("plugin").click();
        });
      } else {
        this.showPrintDrawer = true
        this.printIds = row ? [row.id] : this.sels.map(item => item.id)
      }
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getUsers();
    },
    handleSizeChange(val) {
      this.pageNum = 1;
      this.pageSize = val;
      this.getUsers();
    },
    // 获取用户列表
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        saleState: this.saleState - 0,
        orderByUpdateTime: true
      };
      let b = this.filters;
      this.loading = true;
      this.$postJson(this._basePath.ajaxStoreGoodListByPage, { ...para, ...b }).then(
        res => {
          this.loading = false;
          if (res.success) {
            this.total = res.data.count;
            let data = res.data.datas;
            data.forEach(item => {
              item.codeEdit = false;
              item.priceEdit = false;
              item.storeEdit = false;
            });
            this.users = data;
          }
        }
      );
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels;
    }
  }
};
</script>

<style lang="stylus">
@import '~@/assets/css/index';

#store_manage
  .info_wrap
    setStart()
    align-items: flex-start
    p
      bold()
      flex-basis: 110px
      inline()
    .info_list
      height:120px
      line-height:18px
      flex:1
      text-align:left
      word-break:break-all
      overflow-y:auto
  .submit_btn
    mt(40px)
    mb(30px)
    setMiddle()
    .submit_title
      mr(50px)
      mb(20px)
      fn(16px)
  .submit_need
    setEnd()
    margin:10px
  .switch_tabs
    relative()
    .el-tabs__content
      overflow:visible
      .good_tips
        absolute()
        left: 250px
        width:600px
        top:-40px
        fn(12px)
        color(light_color)
  .leo-dialog, .to_home
    relative()
    .recommend_time
      absolute()
      fn(10px)
      white-space: nowrap
      overflow: visible
      z-index: 1
  .el-table 
    .cell 
      overflow: visible
  .editable_div 
    setStart()
    i
      ml(5px)
    .el-form-item 
      mb(0)
    .editable_ul
      .el-input
        max-width: 80px
      .el-form-item__error 
        top: 30px
        fn(12px)
  .fn20 
    fn(20px)
    color(text_color)
  .fn24 
    fn(24px)
  .link_btn 
    a
      display: block
      height: 100%
  .good_tip
      position:absolute
      left:-45px
      top:0
      height: 0px
      width: 0px
      border-left: 35px solid #D81E06
      border-bottom: 35px solid transparent
      i
        position:absolute
        top:-1px
        right:20px
        fn(8px)
        color()
</style>