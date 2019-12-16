<template>
  <div class="panel admin-panel">
    <div class="body-content">
      <el-upload class="upload-demo"
        ref="upload"
        :action="uploadUrl" 
        :before-upload="beforeAvatarUpload" 
        :show-file-list="false"
        :headers="headers"
        :file-list="fileList"
        :auto-upload='true'
        :on-success='handleSuccess'
        :on-error="uploadErr"
        >
        <!-- :data="form" -->
        <el-button slot="trigger" type="danger">{{btnContent}}</el-button>
        <div slot="tip" v-if="subContent" class="el-upload__tip">{{subContent}}</div>
      </el-upload>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        fileList: [],
        headers: {'x-auth-token': this.getCookie('x-auth-token'), app: 'pcStallBackend'}
      }
    },
    props: {
      uploadUrl: {
        type: String,
        default: ''
      },
      btnContent: {
        type: String,
        default: '点击上传'
      },
      subContent: {
        type: String,
        default: '只能上传xls/xlsx文件'
      },
    },
    methods: {
      submitUpload() {
        this.$refs.upload.submit();
      },
      beforeAvatarUpload(file) {
        let Xls = file.name.split('.')
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
          this.$message.error('上传文件大小不能超过 2MB!')
          return false
        }
        if (Xls[1] === 'xls' || Xls[1] === 'xlsx') {
          return file
        } else {
          this.$message.error('上传文件只能是 xls/xlsx 格式!')
          return false
        }
      },
      handleSuccess(res, file, fileList) {
        if (res.success) {
          this.$emit('uploadSuccess', res.msg)
        } else {
          this.$message.error(res.msg)
        }
      },
      uploadErr(err, file, fileList) {
        // this.loading = false
        console.log(err)
        // this.$message.warning(err.message)
      }
    }
  }
</script>
<style scope lang="stylus">
  @import '~@/assets/css/index'
  input[type="file"]
    display: none
  .el-select 
    width: 135px
</style>