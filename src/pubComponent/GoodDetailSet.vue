<template>
  <div id="good_detail_set">
    <el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      border
      style="width: 98%">
      <el-table-column prop="color" min-width="200px">
        <template slot="header" slot-scope="scope">
          <div class="header_title">颜色</div>
          <div class="header_cont" v-if="curRow.id === undefined">
            <el-select v-model="groupAdd.color" size="mini" placeholder="颜色">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="(item, index) in colors" :key="index" :value="item">{{item}}</el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="size" min-width="200px">
        <template slot="header" slot-scope="scope">
          <div class="header_title">尺码</div>
          <div class="header_cont" v-if="curRow.id === undefined">
            <el-select v-model="groupAdd.size" size="mini" placeholder="尺码">
              <el-option label="全部" value="">全部</el-option>
              <el-option v-for="(item, index) in sizes" :key="index" :value="item">{{item}}</el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" min-width="240px" v-if="curRow.id === undefined">
        <template slot="header" slot-scope="scope">
          <div class="header_title">库存</div>
          <div class="header_cont">
            <el-input size="mini" v-model.trim.number="groupAdd.quantity" placeholder="*请输入数量"/>
            <el-button type="primary" plain size="mini" @click='fillIn(true, groupAdd.quantity)'>批量填充</el-button>
          </div>
        </template>
        <template slot-scope="scope">
          <el-input class="total_input" :disabled="scope.$index === tableData.length - 1"
           size="mini" v-model='scope.row.quantity' @blur="fillIn(false, scope.row)"></el-input>
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
        tableData: [],
        initNum: 0,
        groupAdd: {
          color: '',
          size: '',
          quantity: 0
        },
        isAddChange: false,
        changeType: '',
        modifyVal: null,
        objArr: [],
        originVolist: []
      }
    },
    props: {
      isAccurate: {
        type: Boolean,
        default: () => true
      },
      colors: {
        type: Array,
        default: () => []
      },
      skuVoList: {
        type: Array,
        default: () => []
      },
      sizes: {
        type: Array,
        default: () => []
      },
      allSku: {
        type: Object,
        default: () => {}
      },
      curRow: {
        type: Object,
        default: () => {}
      }
    },
    watch: {
      sizes: {
        handler(newVal, oldVal) {
          this.changeType = 'size'
          this.modifyVal = this.getDiff(newVal, oldVal)
          this.changeData()
          this._isHasVal(this.modifyVal) && (this.changeType = 'sortOrder') 
        },
        deep: true
      },
      colors: {
        handler(newVal, oldVal) {
          this.changeType = 'color'
          this.modifyVal = this.getDiff(newVal, oldVal)
          this.changeData()
          this._isHasVal(this.modifyVal) && (this.changeType = 'sortOrder') 
        },
        deep: true
      }
    },
    created() {
      this.objArr = this.skuVoList.slice()
      this.tableData = this.init(this.objArr)
      this.$bus.$on('deleteSku', ({name, type}) => {
        this.modifyVal = name
        this.isAddChange = false
        this.changeType = type
        this.changeData()
      })
    },
    components: {},
    methods: {
      init(temArr) {
        let arr = []
        temArr = this.sortByArr(temArr, this.colors, 'color')
        temArr.forEach(item => {
          item.skuVoList = this.sortByArr(item.skuVoList, this.sizes, 'size')
        })
        if (temArr && temArr.length) {
          for (let item of temArr) {
            for (let n of item.skuVoList) {
              n.oldQuantity = n.quantity
              arr.push(n)
            }
          }
        }
        arr.push({color: '总库存', size: '', quantity: this.calcQuantity(arr)})
        return arr
      },
      getDiff(newArr, oldArr) {
        let value
        if (oldArr.length > newArr.length) {
          this.isAddChange = 'reduce'
          for (let i of oldArr) {
            !newArr.includes(i) && (value = i)
          }
        } else if (oldArr.length < newArr.length) {
          this.isAddChange = 'add'
          for (let i of newArr) {
            !oldArr.includes(i) && (value = i)
          }
        } else {
          this.isAddChange = 'equal'
        }
        return value
      },
      changeData() {
        if (this.changeType === 'size') {
          // 增加尺寸
          if (this.isAddChange === "add") {
            for (let item of this.objArr) {
              item.skuVoList.push({
                size: this.modifyVal,
                color: item.color,
                quantity: this.initNum
              })
            }
          } else if (this.isAddChange === "reduce") { // 减少尺寸
            for (let item of this.objArr) {
              const idx = item.skuVoList.findIndex(n => n.size === this.modifyVal)
              idx > -1 && item.skuVoList.splice(idx, 1)
            }
          }
        }
        if (this.changeType === 'color') {
          // 增加颜色
          if (this.isAddChange === "add") {
            const arr = []
            for (let item of this.sizes) {
              arr.push({
                size: item,
                color: this.modifyVal,
                quantity: this.initNum
              })
            }
            const obj = {color: this.modifyVal, skuVoList: arr}
            this.objArr.push(obj)
          } else  if (this.isAddChange === "reduce") { // 减少颜色
            const index = this.objArr.findIndex(item => item.color === this.modifyVal)
            index > -1 && this.objArr.splice(index, 1)
          }
        }
        if (this.changeType !== 'sortOrder') {
          this.tableData.slice(0, this.tableData.length - 1).forEach(item => {
            let bigObj = this.objArr.find(n => n.color === item.color)
            let smallObj = bigObj && bigObj.skuVoList && bigObj.skuVoList.find(i => i.size === item.size)
            smallObj && this.$set(smallObj, 'quantity', item.quantity)
          })
        }
        this.tableData = this.init(this.objArr)
      },
      getTotal() {
        return this.tableData[this.tableData.length - 1].quantity
      },
      // 计算总库存
      calcQuantity(arr) {
        let quantity = 0
        arr.forEach(item => {
          this.isPositiveInt(item.quantity) && (quantity += item.quantity - 0)
        })
        return quantity
      },
      getTable() {
        return this.tableData
      },
      // 组装成接口需要的数据
      getParams() {
        // 编辑精准库存时放开
        let arr = this.tableData.map(item => {
          item.productCode = this.curRow.productCode
          item.productId = this.curRow.id
          item.price = this.curRow.sellPrice
          return item
        })
        arr.splice(this.tableData.length - 1, 1)
        return arr
      },
      getSku() {
        return {colors:this.colors, sizes: this.sizes}
      },
      getId(name, type) {
        let allColor = this.allSku.color
        let allSize = this.allSku.size
        if (type === 'color') {
          const color = allColor.find(item => item.name === name)
          return color ? color.id : null
        }
        const size = allSize.find(item => item.name === name)
        return size ? size.id : null
      },
      fillIn(isBtn, row) {
        // 判断输入是否为正整数
        const temObj = isBtn ? this.groupAdd : row
        if (this.isEmpty(temObj.quantity)) return false
        if (!this._nonnegativeInt(temObj.quantity)) {
          this.$set(temObj, 'quantity', 0)
          this.$message.error('库存需为正整数或0')
          return false
        }
        let colorArr, sizeArr
        let arr = this.tableData.slice(0, this.tableData.length - 1)
        if (isBtn) {
          colorArr = !this.groupAdd.color ? this.colors : [this.groupAdd.color]
          sizeArr = !this.groupAdd.size ? this.sizes : [this.groupAdd.size]
          arr.forEach(item => {
            if (colorArr.includes(item.color) && sizeArr.includes(item.size)) {
              this.$set(item, 'quantity', this.groupAdd.quantity)
            } 
          })
        }
        arr.push({color: '总库存', size: '', quantity: this.calcQuantity(arr)})
        this.tableData = arr
      },
      filterQuantity(color, size) {
        if (this.skuVoList.length) {
          for (let n of this.skuVoList) {
            if (n.color === color) {
              const arr = n.skuVoList.filter(i => i.size === size)
              return arr.length ? arr[0].quantity : this.initNum
            }
          }
        } 
        return this.initNum
      },
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (!this.sizes.length) {
          return [0,0]
        } else {
          if (rowIndex === this.tableData.length - 1 && columnIndex === 1) {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
          if (columnIndex === 0) {
            if (rowIndex === this.tableData.length - 1) {
              return {
                rowspan: 1,
                colspan: 2
              }
            }
            if (rowIndex % this.sizes.length === 0) {
              return {
                rowspan: this.sizes.length,
                colspan: 1
              }
            }
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      },
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #good_detail_set
    .header_title
      fn(14px !important)
      center()
      width:100%
      mb(5px)
      color(#333)
      font-weight:bold
      line-height:20px !important
    .el-table 
      th 
        div
          padding:0
    .header_cont
      margin:0 10px
      setMiddle()
      .el-button
        ml(10px)
    .total_input.el-input.is-disabled 
      .el-input__inner
        color(inherit)
    tr
      td
        center()
      &:last-child
        fn(18px)
        color(text_color)
</style>