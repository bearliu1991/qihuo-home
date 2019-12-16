<template>
	<section class="app-container">
    <div>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-select v-model="filters.statusType" size="medium" placeholder="请选择同步状态">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="(item, index) in statusTypes" :key="index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <nx-upload-excel></nx-upload-excel>
            <!-- <el-button type="primary" v-on:click="inportData">导入数据包</el-button> -->
          </el-form-item>
        </el-form>
        <div class="process_btns">
          <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
          <el-button type="danger" @click="setSyncGoods" :disabled="this.sels.length===0">同步商品</el-button>
        </div>
      </el-col>

      <!--列表-->
      <div class="table_records"><span class="icon">&#xe645;</span> 共<i> {{total}} </i>条记录</div>
      <el-table :data="users" highlight-current-row @selection-change="selsChange" style="width: 100%;">
        <el-table-column type="selection" width="35px">
        </el-table-column>
        <el-table-column prop="userName" label="商品名称">
        </el-table-column>
        <el-table-column prop="phone" label="货号">
        </el-table-column>
        <el-table-column prop="createTime" label="库存">
        </el-table-column>
        <el-table-column prop="updateTime" label="类目" :formatter="formatCreateTime">
        </el-table-column>
        <el-table-column prop="status" label="状态" :formatter="formatStatus">
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="batchRemove(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--工具条-->
      <div class="page_toolbar">
        <el-pagination layout="prev, pager, next, jumper" prev-text="上一页" next-text="下一页" background 
          @current-change="handleCurrentChange" :page-size="pageSize" :total="total">
        </el-pagination>
      </div>
    </div>
	</section>
</template>

<script>
import NxUploadExcel from '@/components/nx-upload-excel'

export default {
  data() {
    return {
      filters: {
        statusType: '',
      },
      statusTypes: [
        {label: '已同步', value: 1},
        {label: '等待同步', value: 2},
        {label: '同步失败', value: 3}
      ],
      users: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      sels: [], // 列表选中列
      ids: [],
    }
  },
  components: {NxUploadExcel},
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getUsers()
    },
    formatCreateTime(row) {
      return this._formatTime(row.createTime)
    },
    formatStatus: function(row) {
      return 0
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
      this.$postJson(this._basePath.ajaxUserByPage, {...para, ...b}).then(res => {
        if (res.success) {
          this.total = res.data.count
          this.users = res.data.datas
        }
      })
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels
    },
    // 同步商品
    setSyncGoods() {
      const ids = this.sels.map(item => item.id).toString()
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { idList: ids }
          this.$postJson(this._basePath.ajaxUserDel, para).then(res => {
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
    },
    // 删除
    batchRemove(index, row) {
      let ids
      if (row) {
        ids = [row.id].toString()
      } else {
        ids = this.sels.map(item => item.id).toString()
      }
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { idList: ids }
          this.$postJson(this._basePath.ajaxUserDel, para).then(res => {
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
    },
    inportData() {

    }
  }
}
</script>

<style scoped>
  .toolbar_process {
    margin-top:20px
  }
</style>