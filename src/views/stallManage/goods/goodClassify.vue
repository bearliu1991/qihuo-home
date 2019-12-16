<template>
	<section class="app-container" id="customerList">
    <div>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item label="商品编号">
            <el-input v-model="filters.productCode" size="medium" placeholder="请输入商品编号"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="filters.categoryStoreType" @change="selectChange" size="medium" placeholder="请选择商品分类">
              <el-option v-for="(item, index) in classifyList" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="filters.categoryStoreType === 1" label="宝贝类别">
            <el-cascader
              :options="cascaderList"
              :props="cascaderProps"
              expand-trigger="hover"
              size="medium"
              v-model="filters.categoryOptions">
            </el-cascader>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="queryData">查询</el-button>
            <el-button type="text" plain size="medium" @click="clearFilter">清空筛选条件</el-button>
          </el-form-item>
        </el-form>
        <div class="process_btns">
          <el-button type="primary" size="medium" @click="dialogVisible = true" :disabled="this.sels.length === 0">批量设置分类</el-button>
        </div>
      </el-col>
      
      <!--列表-->
      <record-count :total="total"></record-count>
      <el-table :data="users" highlight-current-row @selection-change="selsChange" v-loading="loading" style="width: 100%;">
        <el-table-column type="selection" width="50">
        </el-table-column>
        <el-table-column prop="productCode" label="商品编号">
        </el-table-column>
        <el-table-column prop="name" label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.imgUrl_main" style="max-width:50px; max-height:50px">
          </template>
        </el-table-column>
        <el-table-column prop="title" label="商品名称">
        </el-table-column>
        <el-table-column prop="detailAddress" label="所属分类">
          <template slot-scope="scope">
            <el-popover
              placement="bottom-start"
              width="100%"
              v-if="scope.row.categoryStoreVos.length"
              trigger="click">
              <span slot="reference" class="cursor">
                <span>{{scope.row.categoryStoreVos[0] && scope.row.categoryStoreVos[0].name}}</span> <!--{{formatSelectData(scope.row.categoryStoreVos)[0] && formatSelectData(scope.row.categoryStoreVos)[0].fullName}}-->
                <i class="el-icon-caret-bottom"></i>
              </span>
              <ul>
                <li v-for="(item, index) in scope.row.categoryStoreVos" :key="index">{{item && item.name}}</li> <!--formatSelectData(scope.row.categoryStoreVos)  {{item && item.fullName}}-->
              </ul>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="创建时间" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="showDialog(scope.row)">设置分类</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
          @current-change="handleCurrentChange" :page-size="pageSize" :current-page="pageNum" :total="total">
        </el-pagination>
      </div>
    </div>

    <!--批量修改VIP-->
    <el-dialog
      title="设置分类"
      :visible.sync="dialogVisible"
      width="600px">
      <el-tree
        ref="tree"
        v-if="dialogVisible"
        :data="categoryList"
        @check="handleChange"
        check-strictly
        show-checkbox
        default-expand-all
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedKeys">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="addCategory">添加</el-button>
      </div>
    </el-dialog>
	</section>
</template>

<script>
import OrderDetail from '../order/orderDetail'
export default {
  data() {
    return {
      dialogVisible: false,
      // 用户级别类型
      classifyList: [
        {label: '全部宝贝', value: ''},
        {label: '未分类宝贝', value: 0},
        {label: '已分类宝贝', value: 1}
      ],
      options: [],
      dialogStatus: '',
      textMap: {
        update: '编辑客户',
        create: '新增客户'
      },
      filters: {
        productCode: '',
        categoryOptions: [],
        categoryStoreType: ''
      },
      cascaderProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      // 类别列表
      categoryList: [],
      cascaderList: [],
      checkedKeys: [],
      loading: false,
      sels: [] // 列表选中列
    }
  },
  created () {
    this.init()
  },
  components: {OrderDetail},
  methods: {
    init() {
      this.getUsers()
      this.getCategorys()
    },
    handleChange() {
      // const idList = this.$refs.tree.getCheckedKeys(true)
      // console.error(idList)
    },
    formatCreateTime(row) {
      return this._formatTime(row.createTime)
    },
    // 清空筛选条件
    clearFilter() {
      this.filters = {
        productCode: '',
        categoryStoreType: '',
        categoryOptions: []
      }
    },
    queryData() {
      this.pageNum = 1
      this.getUsers()
    },
    // 页脚显示转换
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUsers()
    },
    // 获取所有商品
    getUsers() {
      const para = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        userId: 1,
        orderByUpdateTime: true,
        productCode: this.filters.productCode,
        categoryStoreType: this.filters.categoryStoreType
      }
      this.loading = true
      this.filters.categoryStoreType === 1 && this.filters.categoryOptions && this.filters.categoryOptions.length && (para.categoryStoreId = this.filters.categoryOptions[this.filters.categoryOptions.length - 1])
      this.$postJson(this._basePath.ajaxSelfDefineCategory, para).then(res => {
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
    // 商品分类
    selectChange() {
      this.filters.categoryStoreType !== 1 &&  (this.filters.categoryOptions = null)
    },
    // 显示设置分类弹窗
    showDialog(row) {
      this.dialogVisible = true
      if (row) {
        this.sels = [row.id]
        this.checkedKeys = this.getCheckedIds(row.categoryStoreVos)
      } else {
        this.checkedKeys = []
      }
    },
    // 获取用户列表
    getCategorys() {
      this.$post(this._basePath.ajaxCategoryGetPage).then((res) => {
        if (res.success) {
          const arr = res.data
          this.categoryList = this.formatData(arr, true)
          this.cascaderList = this.formatData(arr)
        }
      })
    },
    getCheckedIds(arr) {
      if (!arr) return []
      return arr.map(item => item.id)
    },
    // 格式化商品已经选中的类别
    formatSelectData(arr) {
      if (!arr) return []
      let arrs = []
      for (let item of arr) {
        if (item.parentId !== 0) {
          let parent = arr.find(n => n.id === item.parentId)
          item.fullName = parent.name + '/' + item.name
          arrs.push(item)
        } else {
          if (arr.findIndex(n => n.parentId === item.id) === -1) {
            item.fullName = item.name
            arrs.push(item)
          }
        }
      }
      // let arrs = this._deepCopy(arr)
      // arrs.forEach(item => {
      //   if (item) {
      //     const obj = arrs.find(val => val.id === item.parentId)
      //     if (obj) {
      //       item.fullName = obj.name + '/' + item.name
      //       obj.isDelete = true
      //     } else {
      //       item.fullName = item.name
      //     }
      //   }
      // })
      // for (let i = arrs.length - 1; i >= 0; i--) {
      //   if (arrs[i] && arrs[i].isDelete) arrs.splice(i, 1)
      // }
      return arrs || []
    },
    formatData(arr, isDisable) {
      let arrs = this._deepCopy(arr)
      for (let item of arrs) {
        const childArr = arrs.filter((val) => {
          return item.id === val.parentId
        })
        for (let child of childArr) {
          if (item.children) {
            item.children.push(child)
            // isDisable && (item.disabled = true)
          } else {
            item.children = [child]
          }
          child.isDelete = true
        }
      }
      for (let i = arrs.length - 1; i >= 0; i--) {
        if (arrs[i].isDelete) arrs.splice(i, 1)
      }
      return arrs
    },
    // 设置分类
    addCategory() {
      const idList = this.$refs.tree.getCheckedKeys()
      this.$postJson(this._basePath.ajaxSetCategory, {productIdList: this.sels.toString(), idList: idList.toString()}).then(res => {
        if (res.success) {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
          this.getUsers()
        }
        this.dialogVisible = false
      })
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels.map(item => item.id)
    },
    cancelDialog() {
      this.dialogVisible = false
      this.modifyVip = null
    }
  }
}
</script>

<style lang="stylus">
  @import '~@/assets/css/index'

  #customerList
    .el-checkbox.is-disabled
      display:none
    .toolbar_process
      margin-top:20px
    .el_group
      setColumn()
      .el-radio
        margin: 5px 0
        .el-radio__label
          padl(30px)
    .order_detail
      border_()
      padding:20px
      height:200px
      overflow-y:auto
      li
        vertical(24px)
        setStart()
        span
          width:150px
          color(text_color)
          cursor()
</style>