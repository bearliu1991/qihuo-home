<template>
  <div class="common-content" id="category_manage">
    <div class="process_btns" style="margin-bottom:20px">
      <el-button type="primary" @click="addCategory">添加分类</el-button>
    </div>
    <el-table :data="categoryList" border style="width: 100%;" size="medium" 
      :row-class-name="rowClassNameHandler" highlight-current-row>
      <el-table-column label="分类名称" width="460" align="left" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="icon" :style="{marginLeft: scope.row.level * 30 + 'px'}"></span>
          <i class="icon" v-if="scope.row.isSpread && scope.row.level === 1"
            :class="{'fa fa-folder-open':scope.row.isSpread, 'fa fa-file-o':!scope.row.hasChildren}" 
            @click="onExpand(scope.row)" :style="{cursor:scope.row.hasChildren ? 'pointer' : 'normal'}">&#xe601;</i>
          <i class="icon" v-if="!scope.row.isSpread && scope.row.level === 1" 
            :class="{'fa fa-folder':scope.row.hasChildren, 'fa fa-file-o':!scope.row.hasChildren}" 
            @click="onExpand(scope.row)" :style="{cursor:scope.row.hasChildren ? 'pointer' : 'normal'}">&#xe600;</i>
          <el-input v-if="!scope.row.isAdd" style="width:200px" size="mini" v-model="scope.row.name" />
          <!-- <el-button type="primary" plain size="mini" v-if="scope.row.isAdd" 
            @click="addRow(scope.$index, scope.row)">{{scope.row.name}}</el-button> -->
          <!-- <span :data-level="scope.row.level" :style="{marginLeft: 4 + 'px'}">{{ scope.row }}</span> -->
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.isAdd && (scope.row.id !== undefined)" type="danger" size="mini" @click="batchRemove(scope.row)">删除</el-button>
          <el-button v-if="!scope.row.isAdd && (scope.row.id === undefined)" type="primary" @click="saveData(scope.$index ,scope.row)" size="mini">保存</el-button>
          <el-button v-if="!scope.row.isAdd && (scope.row.id !== undefined)" type="primary" @click="saveData(scope.$index ,scope.row)" size="mini">修改</el-button>
          <el-button v-if="scope.row.parentId === 0 && scope.row.id !== undefined" type="primary" @click="addRow(scope.$index ,scope.row)" size="mini">添加子分类</el-button>
          <el-button v-if="scope.row.id !== undefined && moveIconShow(scope.$index ,scope.row, true)" type="info" size="mini" class="icon move_icon" @click="move(scope.$index ,scope.row, true)">&#xe637;</el-button>
          <el-button v-if="scope.row.id !== undefined && moveIconShow(scope.$index ,scope.row)" type="info" size="mini" class="icon move_icon" @click="move(scope.$index ,scope.row)">&#xe636;</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top:20px; text-align:center">
      <!-- <el-button type="primary" @click="saveData">保存</el-button> -->
    </div>
  </div>
</template>
<script>
export default {
  name: 'ContractStatistic',
  data() {
    return {
      categoryList: [],
      pastDays: 0
    }
  },
  created() {
    this.getUsers()
  },
  methods: {
    moveIconShow(index, row, isUp) {
      let list = this.categoryList.filter(item => item.parentId === row.parentId)
      if (list && list.length) {
        if (isUp) {
          if (row.order === list[0].order) return false
        } else {
          if (row.order === list[list.length - 1].order) return false
        }
        return true
      }
      return false
    },
    addRow(index, row) {
      if (row.id === undefined) {
        this.$message.error('添加子账号前先保存')
        return false
      }
      let obj = {}
      this.$set(row, 'isSpread', true)
      let temArr = this.categoryList.filter(item => item.parentId === row.id)
      if (temArr && temArr.length) {
        temArr.sort((a, b) => b.order - a.order)
        obj = {
          name: '',
          parentId: row.id,
          hasChildren: false,
          isSpread: true,
          level: 2,
          order: temArr[0].order + 1
        }
        this.categoryList.splice(index + temArr.length + 1, 0, obj)
      } else {
        obj = {
          name: '',
          parentId: row.id,
          hasChildren: false,
          isSpread: true,
          level: 2,
          order: 0
        }
        this.categoryList.splice(index + 1, 0, obj)
      }
    },
    _processLevelStatisticData(dataArray) {
      let resultArray = [] // 一级栏目
      let level = 1
      for (let i = 0; i < dataArray.length; i++) {
        let item = dataArray[i]
        // 查找一级分类
        if (item.parentId === 0) {
          item['level'] = level
          item['hasChildren'] = true
          resultArray.push(item)
          this._loadChildrenData(resultArray, dataArray, item, level + 1)
        }
      }
      return resultArray
    },
    _loadChildrenData(resultArray, originArray, item, level) {
      for (let i = 0; i < originArray.length; i++) {
        let originItem = originArray[i]
        // 判断是否是item项的子项
        if (originItem.parentId === item.id) {
          originItem['level'] = level
          originItem['isSpread'] = false
          resultArray.push(originItem)
        }
      }
      // resultArray.push({
      //   name: '添加子分类',
      //   parentId: item.id,
      //   isAdd: true,
      //   isSpread: false,
      //   hasChildren: false,
      //   level: 2
      // })
    },
    move(index, row, isUp) {
      // 同级别对象的列表
      let sameLevelList = []
      let param = {startId: row.id}
      if (row.parentId === 0) {
        sameLevelList = this.categoryList.filter(item => item.parentId === 0)
      } else {
        sameLevelList = this.categoryList.filter(item => item.parentId === row.parentId)
      }
      // 在同级别中的位置
      let sameLevelIndex = sameLevelList.findIndex(item => item.id === row.id)
      // 同级别的兄弟
      let sibling = isUp ? sameLevelList[sameLevelIndex - 1] : sameLevelList[sameLevelIndex + 1]
      param.endId = sibling.id
      this.$postJson(this._basePath.ajaxMoveCategory, param).then(res => {
        if (res.success) {
          this.$message.success('移动成功')
          if (row.parentId === 0) {
            // 找到兄弟节点在总列表中的位置
            let siblingIndex = this.categoryList.findIndex(item => item.id === sibling.id)
            // 找到自己子节点数组
            let children = this.categoryList.filter(item => item.parentId === row.id)
            // 找到兄弟自节点数组
            let siblingChildren = this.categoryList.filter(item => item.parentId === sibling.id)
            if (isUp) {
              this.categoryList.splice(siblingIndex, 0, row, ...children)
              this.categoryList.splice(index + children.length + 1, children.length + 1)
            } else {
              this.categoryList.splice(siblingIndex + siblingChildren.length + 1, 0, row, ...children)
              this.categoryList.splice(index, children.length + 1)
            }
          } else {
            if (isUp) {
              this.categoryList.splice(index - 1, 0, this.categoryList[index])
              this.categoryList.splice(index + 1, 1)
            } else {
              this.categoryList.splice(index, 0, this.categoryList[index + 1])
              this.categoryList.splice(index + 2, 1)
            }
          }
        }
      })
    },
    getUsers() {
      this.$post(this._basePath.ajaxCategoryGetPage).then((res) => {
        let arr = res.data
        if (arr && arr.length) {
          arr.sort((a, b) => { return a.order - b.order})
          let resultArray = this._processLevelStatisticData(arr)
          let temArr = resultArray.filter(item => item.parentId === 0)
          for (let n of temArr) {
            n.isSpread && resultArray.forEach((i) => { 
              i.parentId === n.id && (i.isSpread = true)
            })
          }
          this.categoryList = resultArray
        }
      })
    },
    // 添加父级分类
    addCategory() {
      let temArr = this._deepCopy(this.categoryList)
      let maxId = 0
      let maxOrder = 0
      if (temArr.length) {
        let arr = this.categoryList.filter(item => item.parentId === 0)
        temArr.sort((a, b) => b.id - a.id)
        maxId = temArr[0].id
        arr.sort((a, b) => b.order - a.order)
        maxOrder = arr[0].order
      }
      
      let concatArr = [
        {
          name: '',
          parentId: 0,
          order: maxOrder + 1,
          hasChildren: true,
          isSpread: false,
          level: 1
        }
      ]
      this.categoryList = this.categoryList.concat(concatArr)
    },
    saveData(index, row) {
      if (!row.name) {
        this.$message.error('分类名不能为空')
        return false
      }
      let temArr = this.categoryList
      let maxOrder = 0
      let maxObj = {}
      let arr = []
      if (temArr.length) {
        arr = this.categoryList.filter(item => item.parentId === row.parentId)
        arr.sort((a, b) => b.order - a.order)
        maxObj = arr[0]
        maxOrder = maxObj.order
      }
      let param = {
        isSpread: row.isSpread,
        name: row.name,
        parentId: row.parentId,
        order: maxOrder
      }
      if (row.id !== undefined) {
        param.id = row.id
        param.order = row.order
      }
      this.$post(this._basePath.ajaxCategoryPartSave, param).then((res) => {
        if (res.success) {
          this.$message({
            message: '保存成功',
            type: 'success'
          })
          // 添加自定义按钮数据集合
          let resRow = res.data
          resRow.level = row.parentId === 0 ? 1 : 2
          this.$set(this.categoryList, index, resRow)
        }
      })
    },
    // 删除
    batchRemove(row) {
      this.$confirm('删除该分类后将解除商品与该分类的关系，确定删除？', '提示', {
        type: 'warning'
      })
        .then(() => {
          let arr = this.categoryList
          const param = { idList: row.id.toString()}
          this.$postJson(this._basePath.ajaxCategoryDel, param).then(res => {
            if (res.success) {
              this.$message.success('删除成功')
              if (row.parentId === 0) {
                arr = arr.filter(item => {
                  return item.parentId !== row.id && item.id !== row.id
                })
              } else {
                let index = arr.findIndex(item => item.id === row.id)
                arr.splice(index, 1)
              }
              this.categoryList = arr
            }
          })
        })
        .catch(() => {})
    },
    rowClassNameHandler({ row, rowIndex }) {
      let className = 'pid-' + row.parentId
      if (row.parentId !== 0 && (row['isSpread'] !== true)) {
        className += ' hiddenRow'
      }
      return className
    },
    onExpand(row) {
      this.$set(row, 'isSpread', !row.isSpread)
      this.categoryList.forEach((item) => {
        item.parentId === row.id && (item.isSpread = row.isSpread)
      }) 
      this.categoryList = this.categoryList
    },
  }
}
</script>
<style lang="stylus">
  #category_manage
    padding: 10px
    .move_icon
      span
        font-size:1px
    .hiddenRow
      display: none
    .searchForm
      padding: 10px
      span.label
        margin-right: 10px
      span.attention
        color: #e50021
</style>