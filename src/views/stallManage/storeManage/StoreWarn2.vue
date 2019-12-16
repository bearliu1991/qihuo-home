<template>
  <div id="store_warn">
    <el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      border
      style="width: 98%">
      <el-table-column prop="color" width="120px">
        <template slot="header" slot-scope="scope">
          <div class="header_title">颜色</div>
          <div class="header_cont">
            <el-select v-model="groupAdd.color" size="mini" placeholder="颜色">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="(item, index) in colors" :key="index" :value="item">{{item}}</el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="size" width="120px">
        <template slot="header" slot-scope="scope">
          <div class="header_title">尺码</div>
          <div class="header_cont">
            <el-select v-model="groupAdd.size" size="mini" placeholder="尺码">
              <el-option label="全部" value="">全部</el-option>
              <el-option v-for="(item, index) in sizes" :key="index" :value="item">{{item}}</el-option>
            </el-select>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" min-width="100px">
        <template slot="header" slot-scope="scope">
          <div class="header_title">库存</div>
          <div class="header_cont">
            <el-input size="mini" v-model.trim.number="groupAdd.quantity" placeholder="库存数量"/>
            <el-button type="primary" plain size="mini" @click='fillIn(true)'>批量填充</el-button>
          </div>
        </template>
        <template slot-scope="scope">
          <el-input class="total_input" :class="[scope.row.isStoreOk === false && 'err_color']" size="mini" 
            v-model='scope.row.quantity' :disabled="scope.$index === tableData.length - 1" @blur="fillIn(false, scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" min-width="100px">
        <template slot="header" slot-scope="scope">
          <div class="header_title">库存预警</div>
          <div class="header_cont">
            <el-input size="mini" v-model.trim.number="groupAdd.stockWarn" placeholder="预警库存"/>
            <el-button type="primary" plain size="mini" @click='fillInStore(true)'>批量填充</el-button>
          </div>
        </template>
        <template slot-scope="scope">
          <el-input size="mini"
            v-model='scope.row.stockWarn' @blur="fillInStore(false, scope.row)"></el-input>
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
          quantity: '',
          stockWarn: ''
        },
        isAddChange: false,
        changeType: '',
        modifyVal: null,
        objArr: []
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
          this.modifyVal && this.changeData()
        },
        deep: true
      },
      colors: {
        handler(newVal, oldVal) {
          this.changeType = 'color'
          this.modifyVal = this.getDiff(newVal, oldVal)
          this.modifyVal && this.changeData()
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
        if (temArr && temArr.length) {
          for (let item of temArr) {
            for (let n of item.skuVoList) {
              n.oldQuantity = n.quantity
              this.getWarnColor(n)
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
          this.isAddChange = false
          for (let i of oldArr) {
            !newArr.includes(i) && (value = i)
          }
        } else if (oldArr.length < newArr.length) {
          this.isAddChange = true
          for (let i of newArr) {
            !oldArr.includes(i) && (value = i)
          }
        }
        return value
      },
      changeData() {
        if (this.changeType === 'size') {
          // 增加尺寸
          if (this.isAddChange) {
            for (let item of this.objArr) {
              item.skuVoList.push({
                size: this.modifyVal,
                color: item.color,
                quantity: this.initNum
              })
            }
            this.tableData = this.init(this.objArr)
          } else { // 减少尺寸
            for (let item of this.objArr) {
              const idx = item.skuVoList.findIndex(n => n.size === this.modifyVal)
              idx > -1 && item.skuVoList.splice(idx, 1)
            }
            this.tableData = this.init(this.objArr)
          }
        }
        if (this.changeType === 'color') {
          // 增加颜色
          if (this.isAddChange) {
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
            this.tableData = this.init(this.objArr)
          } else { // 减少颜色
            const index = this.objArr.findIndex(item => item.color === this.modifyVal)
            index > -1 && this.objArr.splice(index, 1)
            this.tableData = this.init(this.objArr)
          }
        }
      },
      getTotal() {
        return this.tableData[this.tableData.length - 1].quantity
      },
      // 计算总库存
      calcQuantity(arr) {
        let quantity = 0
        arr.forEach(item => {
          this._isInteger(item.quantity) && (quantity += item.quantity - 0)
        })
        return quantity
      },
      getTable() {
        return this.tableData
      },
      // 组装成接口需要的数据
      getParams() {
        let arr = this.tableData.slice(0, this.tableData.length - 1)
        arr.forEach(item => {
          this.getWarnColor(item)
        })
        // if (arr.findIndex(item => item.isStoreOk === false) > -1) {
        //   this.$message.error('库存量需大于库存预警量')
        //   return false
        // }
        arr = arr.map(item => {
          item.productCode = this.curRow.productCode
          item.productId = this.curRow.id
          item.price = this.curRow.sellPrice
          return item
        })
        // arr.splice(this.tableData.length - 1, 1)
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
      getWarnColor(row) {
        if (this._isInteger(row.stockWarn) && this._isInteger(row.quantity) && (row.quantity - 0 <= row.stockWarn - 0)) {
          this.$set(row, 'isStoreOk', false)
        } else {
          this.$set(row, 'isStoreOk', true)
        }
      },
      fillIn(isBtn, row) {
        // 判断输入是否为整数
        if (isBtn) {
          if (!this._isInteger(this.groupAdd.quantity)) return false 
        } else {
          !this._isInteger(row.quantity) && this.$set(row, 'quantity', 0)
          this.getWarnColor(row)
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
            this.getWarnColor(item)
            // else {
            //   this.$set(item, 'quantity', this.initNum)
            // }
          })
          // this.groupAdd = {color: '', size: '', quantity: this.initNum}
        }
        arr.push({color: '总库存', size: '', quantity: this.calcQuantity(arr)})
        this.tableData = arr
      },
      fillInStore(isBtn, row) {
        // 判断输入是否为整数
        if (isBtn) {
          if (!this._isInteger(this.groupAdd.stockWarn)) return false 
        } else {
          !this._isInteger(row.stockWarn) && this.$set(row, 'stockWarn', '') 
          this.getWarnColor(row)
        }
        let colorArr, sizeArr
        let arr = this.tableData.slice(0, this.tableData.length - 1)
        if (isBtn) {
          colorArr = !this.groupAdd.color ? this.colors : [this.groupAdd.color]
          sizeArr = !this.groupAdd.size ? this.sizes : [this.groupAdd.size]
          this.tableData.forEach(item => {
            if (colorArr.includes(item.color) && sizeArr.includes(item.size)) {
              this.$set(item, 'stockWarn', this.groupAdd.stockWarn)
            }
            this.getWarnColor(item)
          })
        }
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
          if (rowIndex === this.tableData.length - 1) {
            if (columnIndex === 1 || columnIndex === 3) {
              return {
                rowspan: 0,
                colspan: 0
              }
            }
            if (columnIndex === 2) {
              return {
                rowspan: 1,
                colspan: 2
              }
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
  #store_warn
    .header_title
      fn(14px !important)
      center()
      width:100%
      mb(5px)
      color(#333)
      font-weight:normal
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
    .el-table
      th
        div
          line-height:20px
      .err_color
        input
          border-color:err_color
      .el-table__header
        .cell
          line-height:10px
          tr
            th
              div
                line-height:20px
        input
          padding:0 5px
    tr
      th
        .cell, .el-input
          padding: 0 3px
        .el-button
          padding: 7px 10px
      td
        center()
      &:last-child
        fn(18px)
        color(text_color)
</style>