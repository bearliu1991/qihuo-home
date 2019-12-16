<template>
  <div id="good_edit">
    <el-form :model="editForm" label-width="150px" :rules="editFormRules" ref="editForm">
      <div class="good_eidt_wrap">
        <h3>基本信息</h3>
        <div class="info_wrap">
          <el-form-item label="商品分类" prop="categoryId">
            <el-cascader
              :options="options"
              :props="props"
              class="long_input"
              v-model="editForm.categoryId"
              @active-item-change="getCategory2" @focus="getCategory1">
            </el-cascader>
          </el-form-item>
          <el-form-item label="商品标题" prop="title">
            <el-input class="long_input" v-model="editForm.title" placeholder="请输入名称，如: 2018长款热销羽绒服"></el-input>
          </el-form-item>
          <el-form-item label="商品货号" prop="productCode">
            <el-input class="single_input" v-model="editForm.productCode" placeholder="请输入商品货号"></el-input>
          </el-form-item>
          <el-form-item label="商品颜色" prop="checkedColor">
            <el-checkbox-group v-model="editForm.checkedColor" @change="colorChange" class="checkbox_select">
              <el-checkbox v-for="(item, index) in allSku.color" :label="item.name" :class="{'isSelfDefine': item.isSelfDefine}" :key="index">
                <i v-if="item.isSelfDefine" class="el-icon-circle-close delete_sku fn18" @click.stop.prevent="deleteSku(item, 'color')"></i>
                <span>{{item.name}}</span>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item style="margin-top:-15px">
            <div class="add_more_color">
              <i>找不到合适的颜色，可添加自己想要的颜色</i>
              <div class="add_sku">
                <el-form :model="newAddForm" :rules="colorFormRules" ref="formColor">
                  <el-form-item prop="color">
                    <el-input v-model="newAddForm.color" size="mini" class="single_input" placeholder="请输入自定义颜色"></el-input>
                  </el-form-item>
                </el-form>
                <el-button type="text" size="mini" @click="addSku(1, newAddForm.color, 'formColor')">添加颜色</el-button>
              </div>
            </div>
            <div class="size_sort">
              <el-button :disabled="editForm.checkedColor.length < 2" @click="skuOrderSort('color')" type="primary" size="mini">颜色排序</el-button>
            </div>
          </el-form-item>
          <el-form-item label="商品尺码" prop="checkedSize">
            <el-checkbox-group v-model="editForm.checkedSize" @change="sizeChange" class="checkbox_select">
              <el-checkbox v-for="(item, index) in allSku.size" :label="item.name" :class="{'isSelfDefine': item.isSelfDefine}" :key="index">
                <i v-if="item.isSelfDefine" class="el-icon-circle-close delete_sku fn18" @click.stop.prevent="deleteSku(item, 'size')"></i>
                <span>{{item.name}}</span>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item style="margin-top:-15px">
            <div class="add_more_color">
              <i>找不到合适的尺码，可添加自己想要的尺码</i>
              <div class="add_sku">
                <el-form :model="newAddForm" :rules="sizeFormRules" ref="formSize">
                  <el-form-item prop="size">
                    <el-input v-model="newAddForm.size" size="mini" class="single_input" placeholder="请输入自定义尺码"></el-input>
                  </el-form-item>
                </el-form>
                <el-button type="text" size="mini" @click="addSku(2, newAddForm.size, 'formSize')">添加尺寸</el-button>
              </div>
            </div>
            <div class="size_sort">
              <el-button :disabled="editForm.checkedSize.length < 2" @click="skuOrderSort('size')" type="primary" size="mini">尺寸排序</el-button>
            </div>
          </el-form-item>
          
          <!-- <el-form-item v-if="!isAccurateStore">
            <el-button type="primary" size="mini" plain @click="isAccurateStore = true">编辑精准库存</el-button>
          </el-form-item> -->
          <el-form-item :label="datas.id === undefined ? '初始库存' : '商品规格'">
            <!-- <el-button type="primary" size="mini" style="margin-bottom:20px" plain @click="isAccurateStore = false">取消编辑精准库存</el-button> -->
            <el-row>
              <el-col>
                <good-detail-set ref="goodDetailSet" :allSku="allSku" :isAccurate="isAccurateStore" :sizes="editForm.checkedSize" 
                  :skuVoList="skuVoList" :colors="editForm.checkedColor" :curRow="editForm"></good-detail-set>
              </el-col>
            </el-row>
          </el-form-item>
          <!-- <el-form-item label="总库存量" prop="totalNumber">
            <el-input class="single_input" v-model="editForm.totalNumber" placeholder="请输入总库存量"></el-input>
          </el-form-item> -->
          <ul class="horizontal_item">
            <li>
              <el-form-item label="批发价格" prop="wholesalePrice">
                <el-input class="single_input" v-model="editForm.wholesalePrice" placeholder="请输入批发价格，类型为数字"></el-input>
              </el-form-item>
            </li>
            <li>
              <el-form-item label="起批件数" prop="wholesaleNum">
                <el-input class="single_input" v-model.number="editForm.wholesaleNum" placeholder="请输入起批件数，类型为数字"></el-input>
              </el-form-item>
            </li>
          </ul>
          <el-form-item class="no_star" label="成本价格" prop="cost">
            <el-input class="single_input" v-model="editForm.cost" placeholder="请输入成本价格，不小于零"></el-input>
          </el-form-item>
          <!-- <ul class="horizontal_item no_star">
            <li>
              <el-form-item label="打包价格" prop="packagePrice">
                <el-input class="single_input" v-model.number="editForm.packagePrice" placeholder="请输入打包价格，类型为数字"></el-input>
              </el-form-item>
            </li>
            <li>
              <el-form-item label="打包件数" prop="packageNum">
                <el-input class="single_input" v-model.number="editForm.packageNum" placeholder="请输入打包件数，类型为数字"></el-input>
              </el-form-item>
            </li>
          </ul> -->
          <el-form-item label="" style="margin-bottom:0">
            <span class="text_color fn12">注: VIP4等级最高，VIP等级越高，价格应该越低</span>
          </el-form-item>
          <ul class="horizontal_item no_star">
            <li>
              <el-form-item label="VIP1价格" prop="vip1Price">
                <el-input v-model.number="editForm.vip1Price" placeholder="vip1价格"></el-input>
              </el-form-item>
            </li>
            <li>
              <el-form-item label="VIP2价格" prop="vip2Price" label-width="100px">
                <el-input v-model.number="editForm.vip2Price" placeholder="vip2价格"></el-input>
              </el-form-item>
            </li>
            <li>
              <el-form-item label="VIP3价格" prop="vip3Price" label-width="100px">
                <el-input v-model.number="editForm.vip3Price" placeholder="vip3价格"></el-input>
              </el-form-item>
            </li>
            <li>
              <el-form-item label="VIP4价格" prop="vip4Price" label-width="100px">
                <el-input v-model.number="editForm.vip4Price" placeholder="vip4价格"></el-input>
              </el-form-item>
            </li>
          </ul>
          <el-form-item label="商品图片:" class="img_form" prop="imgUrl_main">
            <span style="color:#909399">宝贝主图大小不能超过2MB</span>
            <img-upload ref="goodImg" @uploadImg="setImgList" :imgUrl_main="editForm.imgUrl_main" :imgList="imgList"></img-upload>
          </el-form-item>
        </div>
        <div slot="footer" class="good_foot" v-show="showMore">
          <!-- <el-button type="primary" v-if="isWeiOpen" @click="showMore = false" plain>展开更多信息<i class="icon">&#xe601;</i></el-button> -->
          <div class="set_middle light_color" style="margin-bottom:10px">注： 商品保存后，需在开单设备中执行刷新或同步商品的操作，才可显示更新后的商品内容</div>
          <div class="set_middle"><el-button style="display:block" type="primary" @click="createData">保存</el-button></div>
        </div>
      </div>
      <div class="good_eidt_wrap" v-if="false"> 
        <h3>商城信息</h3>
        <div class="info_wrap">
          <template>
            <el-form-item label="自定义属性" class="self_property">
              <span style="color:#909399">您最多可添加5组自定义属性，可参考如下2组示例：版型：宽松；薄厚：加绒</span>
              <el-form :inline="true" class="disabled_form" v-for="(item, index) in existedProperty" :key="index">
                <el-form-item>
                  <el-input v-model="item.name" :disabled="true" size="mini"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-input v-model="item.val" :disabled="true" size="mini"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="text" class="err_color" size="mini" @click="delProperty(index)">删除</el-button>
                </el-form-item>
              </el-form>
              
              <el-form :model="selfProperty" :inline="true" :rules="propertyFormRules" ref="formProperty">
                <el-form-item prop="name">
                  <el-input size="mini" v-model="selfProperty.name" placeholder="请输入属性名"></el-input>
                </el-form-item>
                <el-form-item prop="val">
                  <el-input size="mini" v-model="selfProperty.val" placeholder="请输入属性值"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="text" size="mini" @click="addProperty">添加属性</el-button>
                </el-form-item>
              </el-form>
            </el-form-item>
            
            <!-- <el-form-item label="商品重量" prop="weight">
              <el-input class="single_input" v-model="editForm.weight" placeholder="请输入商品重量"></el-input>
            </el-form-item> -->
            <el-form-item label="商品详情描述" prop="description">
              <Editor ref="vueEditor" :initialHtml="editForm.description"></Editor>
              <!-- <VueEditor ref="vueEditor" :description="editForm.description"></VueEditor> -->
            </el-form-item>
            <!-- <ul class="item_center">
              <li> -->
                <el-form-item label="上架商品至微商城" prop="mallState" label-width="150px">
                  <el-switch
                    v-model="editForm.mallState"
                    :active-value="1"
                    active-color="#13ce66"
                    :inactive-value="0">
                  </el-switch>
                </el-form-item>
              <!-- </li> -->
              <!-- <li> -->
                <!-- <el-form-item label="版式保护" prop="saleState" label-width="150px">
                  <el-switch
                    v-model="editForm.saleState"
                    :active-value="1"
                    active-color="#13ce66"
                    :inactive-value="0">
                  </el-switch>
                </el-form-item> -->
                <el-form-item label="推荐至微商城首页: " v-if="editForm.mallState === 1" prop="mallState">
                  <el-switch
                    v-model="editForm.isHomePage"
                    @change="recomandChange"
                    :disabled="!counts || counts <= 0"
                    active-color="#13ce66"
                    :active-value="true"
                    :inactive-value="false">
                  </el-switch>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <!-- v-if="dialogStatus !== 'update'" -->
                  <span>今日可推荐次数剩余 <i class="err_color">{{counts || 0}}</i> 次</span> 
                </el-form-item>
              <!-- </li>
            </ul> -->
            <el-form-item class="center">
              <div class="good_foot">
                <el-button type="primary" @click="createData">保存</el-button>
              </div>
            </el-form-item>
          </template>
        </div>
      </div>
    </el-form>
    <el-dialog :title="processType === 'color' ? '颜色排序' : '尺寸排序'" :visible.sync="dragDialog" center width="600px">
      <SlickList v-model="orderArr" class="size_list" @input="dragEnd" 
         axis="xy" :hideSortableGhost="false">
        <SlickItem v-for="(item, idx) in orderArr" :item="item" class="slick_item" helperClass="move_color" :index="idx" :key="idx">
          {{item}}
        </SlickItem>
      </SlickList>
      <el-button type="text" @click="resetOrder">重置排序</el-button>
      <span slot="footer" class="dialog-footer">
        <div class="btns" style="text-align: center">
          <el-button @click="dragDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmSort">确定排序</el-button>
        </div>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        // 微商城是否开启
        isWeiOpen: false,
        dragDialog: false,
        // sku排序相关
        maxCheckboxLen: 400,
        // 保存初始数据，方便重置排序
        orderArr: [],
        sizeArr: [],
        processType: '',
        // 是否展示更多
        showMore:true,
        existedProperty: [],
        isFirstShow: true,
        isEdit: false,
        imgList: [],
        isAccurateStore: true, // 是否编辑精准库存
        selfProperty: {name: '', val: ''},
        editForm: {
          categoryId: [],
          title: '',
          productCode: '',
          skuMap: {
            colorSet: [],
            sizeSet: [],
            colorSkuVoList: []
          },
          cost: '',
          checkedColor: [],
          checkedSize: [],
          wholesalePrice: '',
          wholesaleNum: '',
          totalNumber: '',
          imgUrl_main: '',
          picList: [],
          vip1Price: '',
          vip2Price: '',
          vip3Price: '',
          vip4Price: '',
          propertyMap: {},
          packagePrice: '',
          packageNum: '',
          description: '',
          saleState: 1,
          mallState: 1,
          isHomePage: 0,
          // weight:''
        },
        editFormRules: {
          categoryId: [{ required: true, validator: this.noEmptyArr, message: '请选择类别', trigger: 'blur'}],
          title: [
            { required: true, validator: this.noEmpty, message: '商品标题不能为空', trigger: 'blur'},
            { required: true, validator: this.lessThanLen, message: '商品标题长度不能超过60个字符', trigger: 'blur'},
          ],
          productCode: [
            { required: true, validator: this.noEmpty, message: '商品货号不能为空', trigger: 'blur'},
            { required: true, validator: this.codeLimit, message: '不大于30个字符', trigger: 'blur'}
          ],
          checkedColor: [{ required: true, validator: this.skuRest, message: '至少选择一个商品颜色'}],
          checkedSize: [{ required: true, validator: this.skuRest1, message: '至少选择一个商品尺码'}],
          // totalNumber: [
          //   { required: true, validator: this.noEmpty, message: '不能为空', trigger: 'blur'},
          //   { required: true, validator: this._positiveInt, message: '总库存需为有效数字', trigger: 'blur'}
          // ],
          packagePrice: [
            { required: true, validator: this._validPrice, message: '打包价格需为有效数字', trigger: 'blur'},
            { required: true, validator: this.smallPackagePrice, message: '打包价格需小于批发价格', trigger: 'blur'}
          ],
          packageNum: [
            { required: true, validator: this._positiveInt, message: '打包件数需为有效数字', trigger: 'blur'},
            { required: true, validator: this.smallPackageNum, message: '打包件数应大于起批件数', trigger: 'blur'}
          ],
          wholesalePrice: [
            { required: true, validator: this.validMoney, message: '批发价格需为有效数字', trigger: 'blur'},
            { required: true, validator: this._decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
            { required: true, validator: this._maxJudge, message: '不大于99999', trigger: 'blur'}
          ],
          wholesaleNum: [
            { required: true, validator: this.noEmpty, message: '批发件数需为有效数字', trigger: 'blur'},
            { required: true, validator: this._positiveInt, message: '批发件数需为有效数字', trigger: 'blur'}
          ],
          imgUrl_main: [{ required: true, validator: this.noEmpty, message: '宝贝主图不能为空'}],
          cost: [
            { required: true, validator: this._nonnegativeNum, message: '成本需为有效数字', trigger: 'blur'},
            { required: true, validator: this._decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
            { required: true, validator: this._maxJudge, message: '不大于99999', trigger: 'blur'}
          ],
          vip1Price: [
            { required: true, validator: this._validPrice, message: 'ViP价格需为有效数字', trigger: 'blur'},
            { required: true, validator: this._decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
            { required: true, validator: this._maxJudge, message: '不大于99999', trigger: 'blur'}
          ],
          vip2Price: [
            { required: true, validator: this._validPrice, message: 'ViP价格需为有效数字', trigger: 'blur'},
            { required: true, validator: this._decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
            { required: true, validator: this._maxJudge, message: '不大于99999', trigger: 'blur'},
            { required: true, validator: this.smallVip2, message: '需小于VIP1价格', trigger: 'blur'}
          ],
          vip3Price: [
            { required: true, validator: this._validPrice, message: 'ViP价格需为有效数字', trigger: 'blur'},
            { required: true, validator: this._decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
            { required: true, validator: this._maxJudge, message: '不大于99999', trigger: 'blur'},
            { required: true, validator: this.smallVip3, message: '需小于VIP1, VIP2价格', trigger: 'blur'}
          ],
          vip4Price: [
            { required: true, validator: this._validPrice, message: 'ViP价格需为有效数字', trigger: 'blur'},
            { required: true, validator: this._decimalJudge, message: '小数位不超过2位', trigger: 'blur'},
            { required: true, validator: this._maxJudge, message: '不大于99999', trigger: 'blur'},
            { required: true, validator: this.smallVip4, message: '需小于VIP1, VIP2, VIP3价格', trigger: 'blur'}
          ]
        },
        sizeFormRules: {
          size: [
            { required: true, validator: this.noEmpty, message: '自定义尺寸不能为空', trigger: 'blur'},
            { required: true, validator: this.lessThan16, message: '自定义尺寸不能超过16个字符', trigger: 'blur'}
          ]
        },
        colorFormRules: {
          color: [
            { required: true, validator: this.noEmpty, message: '自定义颜色不能为空', trigger: 'blur'},
            { required: true, validator: this.lessThan16, message: '自定义颜色不能超过16个字符', trigger: 'blur'}
          ]
        },
        propertyFormRules: {
          name: [{ required: true, validator: this.noEmpty, message: '属性名不能为空', trigger: 'blur'}],
          val: [{ required: true, validator: this.noEmpty, message: '属性值不能为空', trigger: 'blur'}]
        },
        newAddForm: {
          color: '',
          size: '',
        },
        categoryForm: {
          selfCategory: '',
          childCategory: ''
        },
        categoryFormRules: {
          selfCategory: [{ required: true, validator: this.noEmpty, message: '请输入自定义类目', trigger: 'blur' }]
        },
        // 商品颜色
        colors: [],
        skuVoList: [],
        // 商品尺码
        sizes: [],
        skuList: [],
        // cascader级联props
        props: {
          value: 'id',
          label: 'name',
          children: 'children'
        },
        options: [],
        defaultOptions: [{name: '', id: ''}],
        counts: 0
      }
    },
    props: ['dialogStatus', 'datas', 'allSku', 'timeCount'],
    // watch: {
    //   'editForm.checkedSize' (newVal, oldVal) {
    //     const volist = this.$refs['goodDetailSet'].getParams()
    //     volist && volist.length > this.maxCheckboxLen && this.$message.error(`sku总数不超过${this.maxCheckboxLen}个`)
    //   },
    //   'editForm.checkedColor' (newVal, oldVal) {
    //     const volist = this.$refs['goodDetailSet'].getParams()
    //     volist && volist.length > this.maxCheckboxLen && this.$message.error(`sku总数不超过${this.maxCheckboxLen}个`)
    //   }
    // },
    created() {
      this.init()
      this.counts = this.timeCount
      this.createData = this._debounce(this.createData)
      this.addSku = this._debounce(this.addSku)
    },
    methods: {
      init() {
        this.options = [{name: this.datas.categoryName, id: this.datas.categoryId}]
        this.isEdit = this.datas.id !== undefined
        if (this.isEdit) {
          let obj = Object.assign({}, this.datas)
          obj.categoryId = [this.datas.categoryId]
          obj.checkedColor = (this.datas.skuMap && this.datas.skuMap.colorSet) || []
          obj.checkedSize = (this.datas.skuMap && this.datas.skuMap.sizeSet) || []
          this.skuVoList = (this.datas.skuMap && this.datas.skuMap.colorSkuVoList) || []
          this.existedProperty = this.handleProperty(this.datas.propertyMap)
          this.editForm = obj
          this.imgList = !obj.picList ?  [] : obj.picList.length > 4 ? obj.picList.slice(0,4) : obj.picList
          // 编辑精准SKU的时候放开
          // this.isAccurateStore = this.editForm.isEditedSku
        }
      },
      smallVip2(rule, value, callback) {
        if (value && this.isPositive(this.editForm.vip1Price) && (value - this.editForm.vip1Price) > 0) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      smallVip3(rule, value, callback) {
        if (value && ((this.isPositive(this.editForm.vip1Price) && (value - this.editForm.vip1Price) > 0) || 
          (this.isPositive(this.editForm.vip2Price) && (value - this.editForm.vip2Price) > 0))) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      smallVip4(rule, value, callback) {
        if (value && ((this.isPositive(this.editForm.vip1Price) && (value - this.editForm.vip1Price) > 0) || 
          (this.isPositive(this.editForm.vip2Price) && (value - this.editForm.vip2Price) > 0) || 
          (this.isPositive(this.editForm.vip3Price) && (value - this.editForm.vip3Price) > 0))) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      smallPackagePrice(rule, value, callback) {
        if (value && (this.isPositive(this.editForm.packagePrice) && (value - this.editForm.wholesalePrice >= 0))) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      smallPackageNum(rule, value, callback) {
        if (value && (this.isPositive(this.editForm.packageNum) && (value - this.editForm.wholesaleNum <= 0))) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      lessThanLen(rule, value, callback) {
        if (value.length > 60) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      codeLimit(rule, value, callback) {
        if (value.length > 30) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      handleProperty(obj) {
        let arr = []
        for (let key in obj) {
          arr.push({name: key, val: obj[key]})
        }
        return arr
      },
      deleteSku(item, type) {
        this.$confirm('确认删除该选项？', '提示', {
          type: 'warning'
        })
          .then(() => {
            this.$postJson(this._basePath.ajaxSkuDel, {propertyValueId: item.id}).then(res => {
              if (res.success) {
                this.updateDelSku(item, type)
                this.$message.success('删除成功')
                this.$emit('getAllSku')
              }
             })
          })
      },
      updateDelSku(item, type) {
        if (type === 'color') {
          const idx = this.editForm.checkedColor.findIndex(n => n === item.name)
          idx > -1 && this.editForm.checkedColor.splice(idx, 1)
        } else if (type === 'size') {
          const idx = this.editForm.checkedSize.findIndex(n => n === item.name)
          idx > -1 && this.editForm.checkedSize.splice(idx, 1)
        }
        this.$bus.$emit('deleteSku', {name: item.name, type:type})
      },
      // 上传图片
      setImgList(data) {
        this.$set(this.editForm, 'imgUrl_main', data.imgUrl_main)
      },
      // 获取商品分类一级数据
      getCategory1() {
        if (this.isFirstShow) {
          this.$post(this._basePath.ajaxGoodCategory1).then((res) => {
            if (res.success) {
                let arr = []
                for (let item of res.data) {
                  !item.isChildren && (item.children = [])
                  arr.push(item)
                }
                this.options = arr
                this.isFirstShow = false
            }
          })
        }
      },
      // 级联选择变化，获取商品分类二级数据
      getCategory2(value) {
        const obj = this.options.find(item => {
          return item.id === value[0]
        })
        if (!obj.isChildren && obj.children.length === 0) {
          this.$postJson(this._basePath.ajaxGoodCategory2, {parentId: value[value.length - 1]}).then((res) => {
            if (res.success) {
              let item = this.iteratorCascader(value[value.length - 1], this.options)
              if (res.data.length) {
                !item.isChildren && (item.children = [])
                this.$set(item, 'children', res.data)
              } else {
                return true
              }
            }
          })
        }
      },
      iteratorCascader(val, arr, filterChild) {
        let obj = {}
        function iterater(val, arr) {
          for (let item of arr) {
            if (filterChild) {
              item.id === val && (item.parentId !== undefined) && (obj = item)
            } else {
              item.id === val && (obj = item)
            }
            item.children && iterater(val, item.children)
          }
        }
        iterater(val, arr)
        return obj
      },
      formProperty(arr) {
        let obj = {}
        arr.forEach((item) => {
          obj[item.name] = item.val
        })
        return obj
      },
      skuRest(rule, value, callback, type) {
        const timer = setTimeout(() => {
          const arrs = this.$refs['goodDetailSet'].getSku().colors
          const volist = this.$refs['goodDetailSet'].getParams()
          if ((!arrs || !arrs.length) && (!volist || !volist.length)) {
            callback(new Error(rule.message))
          } else {
            callback()
          }
        }, 100)
      },
      skuRest1(rule, value, callback, type) {
        const timer = setTimeout(() => {
          const arrs = this.$refs['goodDetailSet'].getSku().sizes
          const volist = this.$refs['goodDetailSet'].getParams()
          if ((!arrs || !arrs.length) && (!volist || !volist.length)) {
            callback(new Error(rule.message))
          } else {
            callback()
          }
        }, 100)
      },
      // 新增商品数据
      createData: function() {
        this.$refs.editForm.validate(valid => {
          const form = this.editForm
          if (valid) {
            const {imgUrl_main, picList} = this.$refs['goodImg'].getParams()
            const skuVoList = this.$refs['goodDetailSet'].getParams()
            const description = this.$refs['vueEditor'] ? this.$refs['vueEditor'].getParams() : ''
            const propertyMap = this.formProperty(this.existedProperty)
            const item = this.iteratorCascader(form.categoryId[form.categoryId.length - 1], this.options, true)
            const categoryId = item.cId || form.categoryId[0]
            let para = {
              categoryId: categoryId,
              imgUrl_main: imgUrl_main,
              picList: picList,
              smallCategoryChildId: item.id,
              skuVoList: skuVoList,
              propertyMap: propertyMap,
              description: description,
              toHomePageTop: !!form.isHomePage,
              totalNumber: null,
              orderedSkuPropsJson: {sizeSet: this.editForm.checkedSize, colorSet: this.editForm.checkedColor},
              orderedSkuProps: null,
              checkedColor: null,
              checkedSize: null,
              skuMap: null
            }
            this.$post(this._basePath.ajaxSave, {...{}, ...form, ...para}, {timeout: 8000}).then(res => {
              if (res.success) {
                this.$message({
                  message: '保存成功',
                  type: 'success'
                })
                this.$emit('close')
                this.$emit('getAllSku')
              }
            })
          }
        })
      },
      // 添加新颜色
      addSku(type, name, formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.$post(this._basePath.ajaxSaveSku, {propertyId: type, name: name}).then((res) => {
              if (res.success) {
                this.$message({message: '保存成功', type: 'success'})
                type === 1 ? this.$set(this.newAddForm, 'color', '') : this.$set(this.newAddForm, 'size', '')
                this.$emit('getAllSku')
              }
            })
          }
        })
      },
      // 删除属性
      delProperty(index) {
        this.existedProperty.splice(index, 1)
      },
      // 推荐到首页
      recomandChange(val) {
        val ? this.counts-- : this.counts++
      },
      addProperty() {
        this.$refs.formProperty.validate(valid => {
          if (valid) {
            this.existedProperty.push(this.selfProperty)
            this.selfProperty = {name: '', val: ''}
          }
        })
      },
      // 级联选择变化事件
      handleItemChange(val) {
        this.$postJson(this._basePath.ajaxGoodByPage, {val}).then(res => {
          if (res.success) {
            this.total = res.data.count
            this.users = res.data.datas
          }
        })
      },
      // 打开排序弹框
      skuOrderSort(type) {
        this.processType = type
        this.dragDialog = true
        if (type === 'color') {
          this.orderArr = this.editForm.checkedColor.slice()
        } else {
          this.orderArr = this.editForm.checkedSize.slice()
        }
      },
      dragEnd() {
        // console.error(this.editForm.checkedSize)
      },
      // 重置排序
      resetOrder() {
        this.orderArr = this.processType === 'color' ? this.editForm.checkedColor.slice() : this.editForm.checkedSize.slice()
      },
      // 排序确定
      confirmSort() {
        this.dragDialog = false
        this.$set(this.editForm, this.processType === 'color' ? 'checkedColor' : 'checkedSize', this.orderArr.slice())
      },
      sizeChange(val) {
        if (val.length * this.editForm.checkedColor.length > this.maxCheckboxLen || val.length > this.maxCheckboxLen || this.editForm.checkedColor.length > this.maxCheckboxLen) {
          this.$message.error(`sku总数不超过${this.maxCheckboxLen}个`)
          this.$set(this.editForm, 'checkedSize', val.slice(0, val.length - 1))
        } else {
          this.$set(this.editForm, 'checkedSize', this.sortByArr(this.editForm.checkedSize, this.allSku.size, '', 'name'))
        }
      },
      colorChange(val) {
        if (val.length * this.editForm.checkedSize.length > this.maxCheckboxLen || val.length > this.maxCheckboxLen || this.editForm.checkedSize.length > this.maxCheckboxLen) {
          this.$message.error(`sku总数不超过${this.maxCheckboxLen}个`)
          this.$set(this.editForm, 'checkedColor', val.slice(0, val.length - 1))
        } else {
          this.$set(this.editForm, 'checkedColor', this.sortByArr(this.editForm.checkedColor, this.allSku.color, '', 'name'))
        }
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #good_edit
    .el-dialog
      .size_list
        overflow:hidden
        .slick_item
          cursor()
          fl()
          padding:10px
          border:1px solid #ddd
          margin: 10px
          boxShadow()
          bgColor()
    .delete_sku
      absolute()
      right:-7px
      top:-7px
      fn(18px !important)
      visibility: hidden
      color(text_color)
    .el-checkbox.isSelfDefine
      relative()
      border:1px dashed #fff
      margin: 5px
      padding:0 5px
      radius(3px)
      &:hover
        border-color:text_color
        .delete_sku
          visibility:visible
    .item_center
      setMiddle()
    .el-form.disabled_form
      .el-form-item
        mb(0)
        .el-input.is-disabled
          .el-input__inner
            bgColor()
            color(#999)
    .no_star
      /* .el-form-item.is-required:not(.is-no-asterisk) */
      .el-form-item__label:before
        content: ''
    .horizontal_item
      setStart()
      &.no_star
        overflow-x:auto
        li
          inline()
          // fl()
          .el-input
            min-width:100px
          /* .el-form-item.is-required:not(.is-no-asterisk)
            >.el-form-item__label:before
              content: '' */
    .good_eidt_wrap
      h3
        fn(20px)
        padding:0 10px
        vertical(50px)
        bgColor(#aaa)
      .info_wrap
        border-top:1px solid #ddd
        padding:20px
    .add_more_color
      setBetween()
      .add_sku
        setEnd()
        .el-form
          mr(15px)
          .el-form-item
            mb(0)
    .el-form
      relative()
      .show_more
        absolute()
        z-index:9
        height:300px
        setMiddle()
        width:100%
        bottom:-30px
        background-image:linear-gradient(-180deg,rgba(255,255,255,0) 0%,#fff 50%)
        .el-form-item__content
          setColumn()
      .self_property
        .el-row
          margin: 10px 0
    .ql-editor
      min-height:200px
    .long_input
      width:600px
    .single_input
      width:240px
    .checkbox_select
      border_()
      padding:10px
    .good_foot
      /* setMiddle() */
      mt(30px)
      button
        width:150px
</style>