<template>
  <div id="createForm">
    <div class='form_wrap'>
      <el-form class="el_form" ref="form" :model="formData" label-width="160px">
        <el-form-item label="采购成本价:">
          <el-input v-model="formData.purchasePrice" placeholder="单位: (元)"></el-input>
        </el-form-item>
        <el-form-item label="商品售价:">
          <el-input v-model="formData.sellPrice" placeholder="单位: (元)"></el-input>
        </el-form-item>
        <el-form-item label="上架时间:">
          <el-date-picker
            v-model="formData.saleTime"
            type="datetime"
            placeholder="选择上架时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="销售状态:">
          <el-select v-model="formData.saleState">
            <el-option v-for="(item, index) in saleOpts" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类:">
          <el-select v-model="formData.catelogId">
            <el-option v-for="(item, index) in typeOpts" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品来源:">
          <el-select v-model="formData.comeType">
            <el-option v-for="(item, index) in sourceOpts" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品描述:">
          <el-input type="textarea" class="el_textarea" v-model="formData.description" placeholder="200字以内"></el-input>
        </el-form-item>
        <el-form-item label="图片上传:">
          <el-upload
            class="upload-demo"
            action="http://192.168.1.41:8763/image/upload.do"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :data="typeData"
            :multiple="true"
            :drag="true"
            :show-file-list="true"
            :limit="8"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveData">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'other',
  data() {
    return {
      // fileList2: [
      //   {name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'},
      //   {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
      // ],
      typeData: {},
      formData: {
        purchasePrice: '',
        saleState: 1,
        saleTime: '2018-12-07 11: 12: 03',
        sellPrice: '',
        description: '',
        catelogId: '8a8694b760a212100160ab6fc75a1c9d',
        comeType: 0
      },
      saleOpts: [
        {
          value: 1,
          label: '销售中'
        },
        {
          value: 0,
          label: '下架'
        }
      ],
      sourceOpts: [
        {
          value: 0,
          label: '自建商品'
        },
        {
          value: 1,
          label: '淘宝天猫'
        },
        {
          value: 2,
          label: '京东'
        },
        {
          value: 3,
          label: '网商园'
        }
      ],
      typeOpts: [ 
        {
          value: '8a8694b760a212100160ab6fc75a1c9d',
          label: '夹克'
        },
        {
          value: '8a8694b760a212100160ab6fc75a1c93',
          label: '棉衣'
        },
        {
          value: '8a8694b760a212100160ab6fc75a1c95',
          label: '牛仔裤'
        }
      ]
    }
  },
  created () {
    
  },
  methods:{
    handleNodeClick(val) {
      this.$set(this.formData, 'parentId', val.id)
      console.error(val)
    },
    saveData () {
      // axios.get('http://192.168.1.41:8763/menu/getAll.do').then((res) => {
      //   console.error(res)
      // })
      axios.post('http://192.168.1.41:8763/menu/save.do', this.formData).then((res) => {
        console.error(res)
      })
    },
    beforeUpload(file) {
      console.error(file)
      // let reader = new FileReader();
      // reader.onload = function (e) {
      //     var data = e.target.result;
      //     //加载图片获取图片真实宽度和高度
      //     var image = new Image();
      //     image.onload=function(){
      //         var width = image.width;
      //         var height = image.height;
      //         debugger
      //         alert(width+'======'+height+"====="+f.size);
      //     };
      //     image.src = data;
      // };
      // reader.readAsDataURL(file)
      // console.error(file)
      // const isJPG = file.type === 'image/jpeg';
      // const isLt2M = file.size / 1024 / 1024 < 2;
      // this.typeData = {fileExtName: 'png'}
      // // if (!isJPG) {
      // //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // // }
      // if (!isLt2M) {
      //   this.$message.error('上传头像图片大小不能超过 2MB!');
      // }
      // return isJPG && isLt2M;
      // return isLt2M
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    }
  },
}
</script>
<style lang="stylus">
  @import '~@/assets/css/index.styl'
  #createForm
    margin:20px
    border: 1px solid #ddd
    border-radius: 5px
    .form_wrap
      padding: 30px
      width:50
      background: #fff
      .el_form
        width:550px
        .el_textarea
          textarea
            height:120px
      .el-form-item__label
        weight()
</style>
