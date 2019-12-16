<template>
  <section class="app-container" id="showDetail"> 
    <div class="center_form boxshadow">
      <el-form class="" :model="editForm" label-width="100px" ref="editForm">
        <div class="form_title">档口资料</div>
        <el-form-item label='所属客户: '>
          {{bossName}}
        </el-form-item>
        <el-form-item label='档口名称: '>
          {{editForm.name}}
        </el-form-item>
        <el-form-item label="所属大楼: " prop="building">
          {{editForm.buildingName + '' + editForm.floorName}}
        </el-form-item>
        <el-form-item label="档口编号: " prop="phone">
          {{editForm.code}}
        </el-form-item>
        <el-form-item label="店铺头像: " prop="mallImage">
          <img width="100px" height="100px" :src="editForm.mallImage">
        </el-form-item>
        <div class="form_title">手机号</div>
        <el-form-item label="手机号: " prop="phone" :rules="[
          { required: true, validator: this.noEmpty, message: '手机号不能为空', trigger: 'blur' },
          {required: true, validator: mobileReg, message: '请输入正确的手机号', trigger: 'blur'}
        ]">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <!--<el-form-item label="联系地址: " prop="city">
          <el-cascader
            expand-trigger="hover"
            :options="citys"
            :props="cascaderProps"
            v-model="editForm.city">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址: " prop="betterAddress">
          <el-input style="margin-top:10px" type="textarea" placeholder="请填写详细地址" v-model="editForm.betterAddress"></el-input>
        </el-form-item>-->
        <el-form-item> 
          <el-button type="primary" @click="createData">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </section>
</template>
<script>
  // import {city} from '@/utils/city'
  export default {
    name: '',
    data() {
      return {
        editForm: {},
        stallId: '',
        // citys: city,
        cascaderProps: {value: 'name', label: 'name'},
        bossName: ''
      }
    },
    created() {
      this.stallId = this.getCookie('stallId')
      this.bossName = this.getCookie('bossName')
      this.getDetails()
      this.createData = this._debounce(this.createData)
    },
    components: {},
    methods: {
      getDetails() {
        this.$postJson(this._basePath.ajaxStallDetail,{stallId: this.stallId}).then(res => {
          if (res.success) {
            this.editForm = res.data
            this.$set(this.editForm, 'phone', this.editForm.phone || this.getCookie('phone'))
            // this.$set(this.editForm, "city", [this.editForm.provinceId, this.editForm.cityId, this.editForm.areaId])
          }
        })
      },
      setImgList(data) {
        this.$set(this.editForm, 'mallImage', data[0])
      },
      createData() {
        this.$refs.editForm.validate(valid => {
          if (valid) {
            const form = this.editForm
            const param = {
              // id: form.id,
              phone: form.phone,
              // provinceId: form.city[0],
              // cityId: form.city[1],
              // areaId: form.city[2],
              stallId: this.getCookie('stallId') - 0,
              // mallImage: form.mallImage,
              // betterAddress: form.betterAddress
            }
            this.$postJson(this._basePath.ajaxStallInfoSave, param).then(res => {
              if (res.success) {
                this.$message.success('保存成功')
              }
            })
          }
        })
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #showDetail
    margin:auto
    .form_title
      padding:10px 20px
      mb(20px)
      bgColor(rgba(232,232,232,1))
      width:100%
    .center_form
      padding:20px
      .el-form-item
        ml(100px)
        width:400px
      .el-radio
        ml(-20px)
        setStart()
        .el-radio__label
          white-space:pre-wrap
          line-height:20px
          fn(14px)
          color(light_color)
      
</style>