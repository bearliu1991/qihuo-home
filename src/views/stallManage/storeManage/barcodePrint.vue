<template>
  <section class="app-container" id="barcodePrint">
    <div>
      <a
        id="plugin"
        style="height:0"
        :href="`http://www.lodop.net/demolist/${lodopDownloadUrl}.zip`"
      ></a>
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
        <div class="process_btns">
          <el-button type="primary" @click="printConfirm('', 'spu')" :disabled="this.sels.length===0">批量打印spu</el-button>
          <el-button type="primary" @click="printConfirm('', 'sku')" :disabled="this.sels.length===0">批量打印sku</el-button>
          <el-button type="primary" @click="printConfirm('', 'certificate')" :disabled="this.sels.length===0">批量打印合格证</el-button>
        </div>
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
        <el-table-column prop="imgUrl_main" label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px" />
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="商品货号">
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="430px">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" @click="printConfirm(scope.row, 'spu')">打印spu</el-button>
            <el-button type="primary" plain size="mini" @click="printConfirm(scope.row, 'sku')">打印sku</el-button>
            <el-button type="primary" plain size="mini" @click="editCertificate(scope.row)">编辑合格证</el-button>
            <el-button type="primary" plain size="mini" @click="printConfirm(scope.row, 'certificate')">打印合格证</el-button>
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
    <Drawer minWidth="750px" v-model="showPrintDrawer" :title="drawerTitle">
      <SkuPrint
        slot="header"
        ref="skuPrint"
        :printIds="printIds"
        :printType="printType"
      ></SkuPrint>
      <span slot="footer" class="dialog-footer" slot-name="footer">
        <el-button type="primary" @click="excutePrint">打印</el-button>
      </span>
    </Drawer>
    <el-dialog title="编辑合格证" :visible.sync="dialogShow" center width="600px" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" style="width: 80%;margin:auto" :rules="editFormRules" ref="editForm">
        <el-form-item label="货号" prop="name">
          {{editForm.productCode}}
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          动态填充
        </el-form-item>
        <el-form-item label="尺寸" prop="size">
          动态填充
        </el-form-item>
        <el-form-item label="成分" prop="composition">
          <el-input v-model="editForm.composition" placeholder="商品成分"></el-input>
        </el-form-item>
        <el-form-item label="等级" prop="grade">
          <el-input v-model="editForm.grade" placeholder="商品等级" ></el-input>
        </el-form-item>
        <el-form-item label="洗涤" prop="wash">
          <el-input v-model="editForm.wash" placeholder="洗涤方式"></el-input>
        </el-form-item>
        <el-form-item label="执行标准" prop="standard">
          <el-input v-model="editForm.standard" placeholder="执行标准"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" placeholder="地址"></el-input>
        </el-form-item>
        <el-form-item label="商品条码">
          <img src="@/assets/images/barcode.png" height="40px">
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogShow = false">取消</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </div>
    </el-dialog>
    <leo-lodop :printData="printData" :directtion="printDirection" :part1="part1" :part2="part2" :part3="part3" :templates="templates"
      v-if="showLeoDialog" v-model="showLeoDialog" :printType="printType"></leo-lodop>
  </section>
</template>
<script>
import SkuPrint from "./skuPrint"
export default {
  name: 'goodList',
  data() {
    return {
      part1: '',
      part2: '',
      part3: '',
      curRow: '',
      lodopDownloadUrl: '',
      templates: [],
      needUpdateTip: '',
      filters: {
        productCode: ""
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      loading: false,
      drawerTitle: '',
      // 打印相关
      showLeoDialog: false,
      printData: [],
      showPrintDrawer: false,
      printIds: [],
      printType: 'spu',
      // 编辑合格证
      editForm: {
        productCode: '',
        composition: '',
        grade: '',
        wash: '',
        standard: '',
        address: '',
        barcodeUrl: ''
      },
      editFormRules: {
        composition: [{ required: true, validator: this.lessThan30, message: '字段不超过30位', trigger: 'blur' }],
        grade: [{ required: true, validator: this.lessThan10, message: '字段不超过10位', trigger: 'blur' }],
        wash: [{ required: true, validator: this.lessThan30, message: '字段不超过30位', trigger: 'blur' }],
        standard: [{ required: true, validator: this.lessThan30, message: '字段不超过30位', trigger: 'blur' }],
        address: [{ required: true, validator: this.lessThan30, message: '字段不超过30位', trigger: 'blur' }]
      },
      dialogShow: false,
      printDirection: 'horizontal'
    }
  },
  mounted() {
    !window.isLodopJs && this._loadJs(`${process.env.CHILD_ROUTE}/static/js/LodopFuncs.js`, () => { this.excuteRequest() })
    this.init()
    this.handlePartSave = this._debounce(this.handlePartSave)
    this.queryData = this._debounce(this.queryData)
  },
  components: {SkuPrint},
  methods: {
    excuteRequest() {
      window.LODOP = window.getLodop()
    },
    init() {
      this.getUsers(true)
    },
    lessThan30(rule, value, callback) {
      if (this._isHasVal(value) && value.length > 30) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    lessThan10(rule, value, callback) {
      if (this._isHasVal(value) && value.length > 10) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    // 编辑合格证
    editCertificate(row) {
      this.dialogShow = true
      this.$refs.editForm && this.$refs.editForm.resetFields()
      this.editForm = Object.assign({}, row.productDetailVo) 
      this.curRow = row
      this.editForm.productCode = row.productCode
      this.editForm.productId = row.id
    },
    saveData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          const param = {
            productId: this.editForm.productId,
            composition: this.editForm.composition,
            grade: this.editForm.grade,
            wash: this.editForm.wash,
            standard: this.editForm.standard,
            address: this.editForm.address,
            id: this.editForm.id
          }
          this.$post(this._basePath.ajaxSkuCertificateSave, param, {}, true).then(res => {
            if (res.success) {
              this.$message.success('保存成功')
              this.dialogShow = false
              this.getUsers()
            }
          })
        }
      })
    },
    // 清空筛选条件
    clearFilter() {
      this.filters = {
        productCode: "",
        title: "",
        mallState: ""
      };
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    isLodopExist() {
      if (window.downloadLodopVersion) {
        this.lodopDownloadUrl = window.downloadLodopVersion.downloadUrl
        this.needUpdateTip = window.downloadLodopVersion && window.downloadLodopVersion.isUpdate ? '打印插件需升级' : '未检测到打印所需插件'
      }
    },
    excutePrint() {
      let printArr = this.$refs.skuPrint.getParams()
      let arr = []
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
        if (this.printType === 'certificate') {
          this.printDirection = 'vertical'
          if (this.curRow) {
            this.printData = arr.map(item => {
              item = Object.assign({}, this.curRow.productDetailVo, item)
              item.barcodeUrl = item.url
              return item
            })
          } else {
            this.printData = arr.map(item => {
              const obj = this.sels.find(n => n.productCode === item.productCode)
              item = Object.assign({}, obj.productDetailVo, item)
              item.barcodeUrl = item.url
              return item
            })
          }
          this.templates = [
            {
              id: 0,
              width: 40,
              height:68,
              label: "40 * 70"
            }
          ]
          // this.part3 = 
          //   ' <div class="absolute bold"  style="top:1%;height:8%; width:100%;font-size:110%">合格证</div>' +
          //   ' <div class="absolute bold medium alignRight"  style="top:10%; right:64%;height:8%">货号：</div>' +
          //   ' <div class="absolute bold medium alignLeft"  style="top:10%; left:36%;height:8%">{{=v.productCode}}</div>' +
          //   ' <div class="absolute bold medium alignRight"  style="top:21%; right:64%;height:8%">颜色：</div>' +
          //   ' <div class="absolute bold medium alignLeft"  style="top:21%; left:36%;height:8%">{{=v.color}}</div>' +
          //   ' <div class="absolute bold medium alignRight"  style="top:32%; right:64%;height:8%">尺码：</div>' +
          //   ' <div class="absolute bold medium alignLeft"  style="top:32%; left:36%;height:8%">{{=v.size}}</div>' +
          //   ' <div class="absolute bold mini alignRight"  style="top:43%; right:64%;height:8%">成分：</div>' +
          //   ' <div class="absolute bold mini alignLeft"  style="top:43%; left:36%;height:8%">{{=(v.composition || "")}}</div>' +
          //   ' <div class="absolute bold mini alignRight"  style="top:50%; right:64%;height:8%">等级：</div>' +
          //   ' <div class="absolute bold mini alignLeft"  style="top:50%; left:36%;height:8%">{{=(v.grade || "")}}</div>' +
          //   ' <div class="absolute bold mini alignRight"  style="top:57%; right:64%;height:8%">洗涤：</div>' +
          //   ' <div class="absolute bold mini alignLeft"  style="top:57%; left:36%;height:8%">{{=(v.wash || "")}}</div>' +
          //   ' <div class="absolute bold mini alignRight"  style="top:64%; right:64%;height:8%">执行标准：</div>' +
          //   ' <div class="absolute bold mini alignLeft"  style="top:64%; left:36%;height:8%">{{=(v.standard || "")}}</div>' +
          //   ' <div class="absolute bold mini alignRight"  style="top:70%; right:64%;height:8%">地址：</div>' +
          //   ' <div class="absolute bold mini alignLeft"  style="top:70%; left:36%;height:8%">{{=(v.address || "")}}</div>' +
          //   ' <img class="absolute bold " width="100%"      style="top:84%;height:10%" src="{{=v.barcodeUrl}}" />' +
          //   ' <div class="absolute bold mini"            style="top:94%;width:100%;">{{=v.id}}</div>'
          this.part3 = 
            ' <div class="bold center"  style="width:100%;font-size:110%">合格证</div>' +
            '<div class="set_middle bold">' +
            ' <div class="big alignRight leftP">货号：</div>' +
            ' <div class=" big alignLeft rightP">{{=v.productCode}}</div>' +
            '</div>' +
            '<div class="set_middle bold">' +
            ' <div class=" big alignRight leftP">颜色：</div>' +
            ' <div class=" big alignLeft rightP">{{=v.color}}</div>' +
            '</div>' +
            '<div class="set_middle bold">' +
            ' <div class=" big alignRight leftP">尺码：</div>' +
            ' <div class=" big alignLeft rightP">{{=v.size}}</div>' +
            '</div>' +
            '<div class="set_middle bold" style="display:{{=(v.composition ? "flex" : "none")}}">' +
            ' <div class=" mini alignRight leftP">成分：</div>' +
            ' <div class=" mini alignLeft rightP">{{=(v.composition || "")}}</div>' +
            '</div>' +
            '<div class="set_middle bold" style="display:{{=(v.grade ? "flex" : "none")}}">' +
            ' <div class=" mini alignRight leftP">等级：</div>' +
            ' <div class=" mini alignLeft rightP">{{=(v.grade || "")}}</div>' +
            '</div>' +
            '<div class="set_middle bold" style="display:{{=(v.wash ? "flex" : "none")}}">' +
            ' <div class=" mini alignRight leftP">洗涤：</div>' +
            ' <div class=" mini alignLeft rightP">{{=(v.wash || "")}}</div>' +
            '</div>' +
            '<div class="set_middle bold" style="display:{{=(v.standard ? "flex" : "none")}}">' +
            ' <div class=" mini alignRight leftP">执行标准：</div>' +
            ' <div class=" mini alignLeft rightP">{{=(v.standard || "")}}</div>' +
            '</div>' +
            '<div class="set_middle bold" style="display:{{=(v.address ? "flex" : "none")}}">' +
            ' <div class=" mini alignRight leftP">地址：</div>' +
            ' <div class=" mini alignLeft rightP">{{=(v.address || "")}}</div>' +
            '</div>' +
            ' <img width="100%" class="absolute"  style="top:84%;height:10%" src="{{=v.barcodeUrl}}" />' +
            ' <div class="absolute bold center mini"  style="top:94%;width:100%;">{{=v.id}}</div>'
        } else {
          this.printData = arr
        }
      }
    },
    printConfirm(row, printType) {
      this.printDirection = 'horizontal'
      this.curRow = row
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
          document.getElementById("plugin").click()
        });
      } else {
        this.printType = printType
        if (printType === 'spu') {
          this.showLeoDialog = true
          let arr = row ? [row] : this.sels
          this.printData = arr.map(item => {
            return {
              stallName: this.getCookie('stallName'),
              id: item.id,
              url: item.skuBarcodeUrl,
              productCode: item.productCode
            }
          })
        } else {
          this.showPrintDrawer = true
          this.printIds = row ? [row.id] : this.sels.map(item => item.id)
          if (printType === 'sku') {
            this.drawerTitle = '编辑sku条码打印数量'
          } else if (printType === 'certificate') {
            this.drawerTitle = '编辑sku合格证打印数量'
          }
        }
      }
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
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        saleState: 1,
        orderByUpdateTime: true
      };
      let b = this.filters
      this.loading = true
      this.$postJson(this._basePath.ajaxGoodByPage, { ...para, ...b }).then(
        res => {
          this.loading = false
          if (res.success) {
            this.total = res.data.count
            let data = res.data.datas
            data.forEach(item => {
              item.codeEdit = false
              item.priceEdit = false
              item.storeEdit = false
            });
            this.users = data
          }
        }
      );
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels
    },
    formatCategory(row) {
      return row.categoryName || "—"
    }
  }
};
</script>

<style lang="stylus">
@import '~@/assets/css/index';

#barcodePrint
  .el-dialog
    .el-form-item__label:before
      content: ''
    .el-form-item
      mb(20px)
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
</style>