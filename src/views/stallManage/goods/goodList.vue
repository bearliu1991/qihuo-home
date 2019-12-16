<template>
    <section class="app-container" id="good_list">
      <div v-show="!secShow">
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
            <el-form-item label="商品名称">
              <el-input v-model="filters.title" placeholder="请输入商品名称"></el-input>
            </el-form-item>
            <!-- <el-form-item label="微商城出售状态">
              <el-select v-model="filters.mallState" placeholder="请选择销售状态">
                <el-option v-for="(item, index) in mallStates" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>-->
            <el-form-item>
              <el-button type="primary" @click="queryData">查询</el-button>
              <el-button type="text" plain @click="clearFilter">清空筛选条件</el-button>
            </el-form-item>
          </el-form>
          <div class="process_btns">
            <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
            <el-button type="danger" @click="unshelve" :disabled="this.sels.length===0">批量停售</el-button>
            <!-- <el-button type="primary" @click="print()" :disabled="this.sels.length===0">批量打印spu</el-button> -->
            <!-- <el-button type="primary" @click="printSku()" :disabled="this.sels.length===0">批量打印sku</el-button> -->
            <el-button type="primary" @click="handleAdd">手动添加商品</el-button>
          </div>
        </el-col>
  
        <!--列表-->
        <record-count :total="total">
          <!-- 可使用推荐到微商城首页次数&nbsp;&nbsp;&nbsp;<i class="text_color">{{usedNum}}</i>/<i class="text_color">{{totalNum}}</i> -->
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
            </template>
          </el-table-column>
          <el-table-column prop="title" label="商品名称" min-width="150"></el-table-column>
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
                    <el-input size="mini" @keyup.enter.native="handlePartSave(scope.row, 'productCode', scope.$index)"
                      @focus="focusEvent(scope.row, 'productCode', scope.$index)" @blur="handlePartSave(scope.row, 'productCode', scope.$index)"
                      v-model.trim="scope.row.productCode"></el-input>
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
          </el-table-column>
          <el-table-column prop="categoryName" label="商品分类" :formatter="formatCategory"></el-table-column>
          <!-- <el-table-column prop="mallState" label="微商城出售">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.mallState"
                @change='switchChange(scope.row)'
                active-color="#13ce66"
                :active-value="1"
                :inactive-value="0">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column prop="toHomePageTime" label="推荐到微商城首页" width="220px">
            <template slot-scope="scope">
              <div class="to_home" v-if="scope.row.mallState === 1">
                <el-button type="primary" plain size="mini" :disabled="timeCount <= 0"
                 @click="recomandToHome(scope.row)">推荐</el-button>
                <div class="recommend_time">
                  上次推荐时间:{{_formatTime(scope.row.toHomePageTime, true)}}
                </div>
              </div>
            </template>
          </el-table-column>-->
          <!-- <el-table-column prop="packagePrice" label="打包价">
          </el-table-column>
          <el-table-column prop="totalNumber" label="总数量">
          </el-table-column>
          -->
          <el-table-column label="操作" min-width="150px" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" plain size="mini" @click="handleDetail(scope.$index, scope.row)">编辑</el-button>
              <el-button type="danger" plain size="mini" @click="unshelve(scope.$index, scope.row)" 
                v-if="scope.row.saleState && scope.row.saleState === 1">停售</el-button>
              <!-- <el-button type="danger" plain size="mini" @click="batchRemove(scope.$index, scope.row)">删除</el-button> -->
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
      <Secondary :title="textMap[dialogStatus]" v-model="secShow" width="100%">
        <GoodEdit
          @getAllSku="getColorAndSize"
          :timeCount="timeCount"
          :allSku="allSku"
          :dialogStatus="dialogStatus"
          :datas="datas"
          v-if="secShow"
          @close="closeSecPage"
        ></GoodEdit>
      </Secondary>
      <!-- <Drawer v-model="showDrawer" title="编辑SKU">
        <good-detail-set
          ref="goodSet"
          :allSku="allSku"
          :sizes="curRow.skuMap.sizeSet"
          :isAccurate="true"
          :curRow="curRow"
          :colors="curRow.skuMap.colorSet"
          :skuVoList="curRow.skuMap.colorSkuVoList"
        ></good-detail-set>
        <span slot="footer" class="dialog-footer" slot-name="footer">
          <el-button type="primary" @click="dialogConfirm">确 定</el-button>
        </span>
      </Drawer> -->
      <!-- <Drawer minWidth="750px" v-model="showPrintDrawer" title="编辑sku条码打印数量">
        <SkuPrint
          slot="header"
          ref="skuPrint"
          :printIds="printIds"
        ></SkuPrint>
        <span slot="footer" class="dialog-footer" slot-name="footer">
          <el-button type="primary" @click="excutePrint">打印</el-button>
        </span>
      </Drawer> -->
      <!-- <leo-lodop :printData="printData" v-if="showLeoDialog" :printType="printType" v-model="showLeoDialog"></leo-lodop> -->
    </section>
  </template>
  <script>
  import GoodEdit from "./goodEdit";
  // import SkuPrint from "./skuPrint";
  export default {
    name: 'goodList',
    data() {
      return {
        secShow: false,
        timeCount: 0,
        lodopDownloadUrl: '',
        needUpdateTip: '',
        usedNum: 0,
        totalNum: 0,
        datas: {},
        dialogStatus: "",
        allSku: { color: {}, size: {} },
        textMap: {
          update: "修改商品",
          create: "新增商品"
        },
        curRow: {
          skuMap: { sizeSet: [], colorSkuVoList: [], colorSet: [] }
        },
        mallStates: [
          { label: "全部", value: "" },
          { label: "在售", value: 1 },
          { label: "停售", value: 0 }
        ],
        filters: {
          productCode: "",
          title: "",
          mallState: ""
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
        // showLeoDialog: false,
        // printData: [],
        // showPrintDrawer: false,
        // printIds: [],
        // printType: 'spu'
      };
    },
    mounted() {
      // !window.isLodopJs && this._loadJs(`${process.env.CHILD_ROUTE}/static/js/LodopFuncs.js`, () => { this.excuteRequest() })
      this.init();
      this.handlePartSave = this._debounce(this.handlePartSave)
      this.queryData = this._debounce(this.queryData)
    },
    components: { GoodEdit },
    methods: {
      // excuteRequest() {
      //   window.LODOP = window.getLodop()
      // },
      init() {
        this.getUsers(true);
        this.getColorAndSize(); // 获取颜色和尺码数组
      },
      // 清空筛选条件
      clearFilter() {
        this.filters = {
          productCode: "",
          title: "",
          mallState: ""
        };
      },
      queryData(isBool) {
        this.pageNum = 1;
        this.getUsers(isBool);
      },
      codeLimit(rule, value, callback) {
        if (value.length > 30) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      // 获取剩余推荐到首页的次数
      getRecommandCount() {
        this.$get(this._basePath.ajaxResTimeCount).then(res => {
          if (res.success) {
            this.totalNum = res.data.totalNum;
            this.usedNum = res.data.usedNum;
            this.timeCount = this.totalNum - this.usedNum;
          }
        });
      },
      // 推荐到首页
      recomandToHome(row) {
        const param = {
          productId: row.id,
          isHomePage: !row.isHomePage,
          toHomePageTop: !!row.isHomePage
        };
        this.$postJson(this._basePath.ajaxRecomandToHome, param).then(res => {
          if (res.success) {
            this.$message.success("推荐成功！");
            this.getUsers(true);
          }
        });
      },
      closeSecPage(isCancel) {
        this.secShow = false
        !isCancel && this.queryData(true)
      },
      // sku调整
      // dialogConfirm() {
      //   let param = {};
      //   param.productId = this.curRow.id
      //   param.productCode = this.curRow.productCode
      //   param.skuVoList = this.$refs.goodSet.getParams();
      //   param.totalNumber = null;
      //   this.$post(this._basePath.ajaxUpdateSku, param).then(res => {
      //     if (res.success) {
      //       this.showDrawer = false;
      //       this.getUsers();
      //     }
      //   });
      // },
      // 显示新增界面
      handleAdd() {
        this.dialogStatus = "create";
        this.secShow = true;
        this.datas = {};
      },
      // 显示编辑界面
      handleDetail(index, row) {
        this.$postJson(this._basePath.ajaxGetDetail, { productId: row.id }).then(
          res => {
            if (res.success) {
              this.dialogStatus = "update";
              this.secShow = true;
              this.datas = res.data;
            }
          }
        );
      },
      // 处理自定义的颜色或尺码
      handleArr(arr) {
        if (!arr) return [];
        return arr.map(item => {
          item.isSelfDefine = true;
          return item;
        });
      },
      // 获取颜色和尺码初始值
      getColorAndSize() {
        this.$get(this._basePath.ajaxGoodColorSize).then(res => {
          if (res.success) {
            const colors = res.data[0];
            const sizes = res.data[1];
            let ownerColor = this.handleArr(colors.ownerValueList);
            let ownerSize = this.handleArr(sizes.ownerValueList);
            const allColor = colors
              ? (colors.sysValueList || []).concat(ownerColor)
              : [];
            const allSize = sizes
              ? (sizes.sysValueList || []).concat(ownerSize)
              : [];
            this.$set(this.allSku, "color", this._uniqueArr(allColor, 'name'))
            this.$set(this.allSku, "size", this._uniqueArr(allSize, 'name'))
          }
        });
      },
      // 局部修改
      editCode(index, row) {
        this.$set(row, 'originProductCode', row.productCode)
        this.$set(row, "codeEdit", true)
      },
      editPrice(index, row) {
        this.$set(row, 'originWholesalePrice', row.wholesalePrice)
        this.$set(row, 'originWholesaleNum', row.wholesaleNum)
        this.$set(row, "priceEdit", true)
      },
      editCost(index, row) {
        this.$set(row, 'originCost', row.cost)
        this.$set(row, "costEdit", true)
      },
      // editTotal(index, row) {
      //   this.$set(row, 'originTotalNumber', row.totalNumber)
      //   this.$set(row, "totalEdit", true);
      // },
      // 取消编辑
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
      // editStore(index, row) {
      //   this.$postJson(this._basePath.ajaxGoodSku, { productId: row.id }).then(
      //     res => {
      //       this.curRow = row
      //       this.$set(
      //         this.curRow,
      //         "skuMap",
      //         res.data || { colorSet: [], colorSkuVoList: [], sizeSet: [] }
      //       );
      //       this.showDrawer = true
      //     }
      //   );
      // },
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
      // 微商城状态改变
      switchChange(row) {
        if (row.mallState === 0) {
          this.$confirm(
            '关闭"微商城出售"后，商品将不会出现在微商城中，确定关闭 ？',
            "提示",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          )
            .then(() => {
              this.$postJson(this._basePath.ajaxMinappUnshelve, {
                idList: [row.id].toString()
              }).then(res => {
                if (res.success) {
                  this.$message({
                    message: "微商城关闭成功",
                    type: "success"
                  });
                  this.$set(row, "mallState", 0);
                }
              });
            })
            .catch(() => {
              this.$set(row, "mallState", 1);
            });
        } else {
          this.$postJson(this._basePath.ajaxMinappShelve, {
            idList: [row.id].toString()
          }).then(res => {
            if (res.success) {
              this.$message({
                message: "微商城开启成功",
                type: "success"
              });
              this.$set(row, "mallState", 1);
            } else {
              this.$set(row, "mallState", 0);
            }
          });
        }
      },
      // 商品停售
      unshelve(index, row) {
        this.$confirm("点击停售后，商品将从一体机中停售，确定停售？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          const ids = row ? [row.id] : this.sels.map((item) => item.id);
          this.$postJson(
            this._basePath.ajaxUnshelveGood,
            { idList: ids.toString() },
            { timeout: 5000 }
          ).then(res => {
            if (res.success) {
              this.$message({
                message: "停售成功",
                type: "success"
              });
              this.getUsers();
            }
          });
        });
      },
      // isLodopExist() {
      //   if (window.downloadLodopVersion) {
      //     this.lodopDownloadUrl = window.downloadLodopVersion.downloadUrl
      //     this.needUpdateTip = window.downloadLodopVersion && window.downloadLodopVersion.isUpdate ? '打印插件需升级' : '未检测到打印所需插件'
      //   }
      // },
      // print(row) {
      //   this.isLodopExist()
      //   if (!window.LODOP || !window.LODOP.VERSION) {
      //     this.$confirm(
      //       `${this.needUpdateTip}，是否下载？(若已安装，请刷新页面)`,
      //       "提示",
      //       {
      //         confirmButtonText: "确定",
      //         cancelButtonText: "取消",
      //         type: "warning"
      //       }
      //     ).then(() => {
      //       document.getElementById("plugin").click();
      //     });
      //   } else {
      //     this.showLeoDialog = true
      //     let arr = row ? [row] : this.sels
      //     this.printType = 'spu'
      //     this.printData = arr.map(item => {
      //       return {
      //         stallName: this.getCookie('stallName'),
      //         id: item.id,
      //         url: item.skuBarcodeUrl,
      //         productCode: item.productCode
      //       };
      //     });
      //   }
      // },
      // excutePrint() {
      //   let printArr = this.$refs.skuPrint.getParams()
      //   let arr = []
      //   this.printType = 'sku'
      //   printArr.forEach(item => {
      //     if (this.isPositiveInt(item.printNum - 0)) {
      //       for (let i = 0; i < item.printNum; i++) {
      //         arr.push({
      //           stallName: this.getCookie('stallName'),
      //           id: item.id,
      //           url: item.barcodeUrl,
      //           productCode: item.productCode,
      //           color: item.color,
      //           size: item.size
      //         })
      //       }
      //     }
      //   })
      //   if (!arr.length) {
      //     this.$message.error('请填写打印数量')
      //     return false
      //   } else {
      //     this.showLeoDialog = true
      //     this.printData = arr
      //   }
      // },
      // 批量设置打印数量
      // printSku(row) {
      //   this.isLodopExist()
      //   if (!window.LODOP || !window.LODOP.VERSION) {
      //     this.$confirm(
      //       `${this.needUpdateTip}，是否下载？(若已安装，请刷新页面)`,
      //       "提示",
      //       {
      //         confirmButtonText: "确定",
      //         cancelButtonText: "取消",
      //         type: "warning"
      //       }
      //     ).then(() => {
      //       document.getElementById("plugin").click();
      //     });
      //   } else {
      //     this.showPrintDrawer = true
      //     this.printIds = row ? [row.id] : this.sels.map(item => item.id)
      //   }
      // },
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
      getUsers(isTimesRefresh) {
        const para = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          saleState: 1,
          orderByUpdateTime: true
        };
        let b = this.filters;
        this.loading = true;
        this.$postJson(this._basePath.ajaxGoodByPage, { ...para, ...b }).then(
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
              isTimesRefresh && this.getRecommandCount(); // 获取推荐到首页次数
            }
          }
        );
      },
      // 全选单选多选
      selsChange(sels) {
        this.sels = sels;
      },
      // 删除
      batchRemove(index, row) {
        let ids = row ? [row.id] : this.sels.map(item => item.id);
        this.$confirm("确认删除选中记录吗？", "提示", {
          type: "warning"
        })
          .then(() => {
            const para = { idList: ids.toString() };
            this.$postJson(this._basePath.ajaxGoodDel, para).then(res => {
              if (res.success) {
                this.$message({
                  message: "删除成功",
                  type: "success"
                });
                this.getUsers();
              }
            });
          })
          .catch(() => {});
      },
      formatCategory(row) {
        return row.categoryName || "—";
      }
    }
  };
  </script>
  
  <style lang="stylus">
  @import '~@/assets/css/index';
  
  #good_list
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
        display: block
        height: 100%
  </style>