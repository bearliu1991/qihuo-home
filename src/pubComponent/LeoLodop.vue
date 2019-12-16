<template>
    <div id="leo_lodop">
      <el-dialog title="打印选项" width="500px" center :visible.sync="visible" @close='close'>
        <div>
          <div class="select_type">
            <span class="label">标签尺寸(mm)：</span>
            <el-select v-model="templateId" @change="templateSelectChange" placeholder="请选择打印模板">
              <el-option
                v-for="item in printTemplates"
                :key="item.id"
                :label="item.label"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="select_type">
            <span class="label">打印设备：</span>
            <el-select v-model="deviceId" @change="deviceSelectChange" placeholder="请选择打印设备">
              <el-option
                v-for="item in deviceArr"
                :key="item.value"
                :label="item.name"
                :value="item.value">
              </el-option>
            </el-select>
            <!-- <el-button size="mini" type="primary" @click="print" title="打印">打印</el-button> -->
          </div>
          <div class="tips">
            请根据建议选择相应的纸张，以免格式混乱。
          </div>
          <div class="btns" style="text-align: center">
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary" @click="print">打印</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </template>
  <script>
    import Const from './const'
    let doT = null
    const unitNum = 10
    export default {
      name: '',
      data() {
        return {
          templateId: 1,
          lodop: window.LODOP,
          dataArray: [],
          deviceArr: [],
          deviceId: 0,
          visible: this.showLeoDialog,
          str: Const.fixedSize,
          part4: Const.part4,
          printTemplates: []
        }
      },
      model: {
        prop: "showLeoDialog",
        event: "close"
      },
      props: {
        showLeoDialog: {
          default: false,
          type: Boolean
        },
        part1: {
          default: '',
          type: String
        },
        part2: {
          default: '',
          type: String
        },
        part3: {
          default: '',
          type: String
        },
        templates: {
          default: () => [],
          type: Array
        },
        directtion: {
          default: 'horizontal',
          type: String
        },
        printData: {
          type: Array,
          default: () => []
        },
        printType: {
          type: String,
          default: 'spu'
        }
      },
      watch: {
        showLeoDialog() {
          this.showLeoDialog && (this.visible = true)
        },
        visible() {
          !this.visible && this.$emit('close')
        }
      },
      mounted() {
        !window.doT && this._loadJs(`${process.env.CHILD_ROUTE}/static/js/doT.js`, () => {doT = window.doT})
        const iPrinterCount = this.lodop.GET_PRINTER_COUNT()
        this.printTemplates = this.printType === 'spu' || this.printType === 'sku' ? Const.templates.slice() : this.templates
        this.deviceId = !localStorage.getItem('deviceId') || localStorage.getItem('deviceId') - 0 > iPrinterCount.length - 1 ? 0 : localStorage.getItem('deviceId') - 0
        this.templateId = !localStorage.getItem('templateId') || localStorage.getItem('templateId') > this.printTemplates.length - 1 ? 0 : localStorage.getItem('templateId') - 0
        for (let i = 0; i < iPrinterCount; i++) {
          this.deviceArr.push({
            name: this.lodop.GET_PRINTER_NAME(i),
            value: i
          })
        }
      },
      methods: {
        print() {
          let Templates, PART1, PART2
          if (this.printType === 'spu' || this.printType === 'sku') {
            Templates = Const.templates.slice()
          } else {
            Templates = this.templates
          }
          PART1 = Const.part1
          PART2 = Const.part2
          const PART3 = this.printType === 'spu' ? Const.part3 : this.printType === 'sku' ? Const.part33 : this.part3
          const template = Templates.find(item => item.id === this.templateId)
          this.lodop.SET_LICENSES("", "87AC4FB37A3A53E2EAEDB64543208694", "C94CEE276DB2187AE6B65D56B3FC2848", "")
          // if (this.templateId === 0) {
            // 可预览
            // this.printData.forEach(item => {
            //   let doc = doT.template(this.str)([item])
            //   this.lodop.ADD_PRINT_HTM("0", "0", "100%", "100%",doc)
            //   this.lodop.NewPage()
            // })

            // 直接打印
          //   for (let i = 0; i < this.printData.length; i = i + unitNum) {
          //     this.lodop.PRINT_INIT('')
          //     this.lodop.SET_PRINT_PAGESIZE(1, template.width * 10, template.height * 10)
          //     for (let j = 0; j < unitNum && (i + j < this.printData.length); j++) {
          //       let doc = doT.template(this.str)([this.printData[i + j]])
          //       this.lodop.ADD_PRINT_HTM("0", "0", "100%", "100%",doc)
          //       this.lodop.NewPage()
          //     }
          //     this.lodop.PREVIEW()
          //   }
          // } else if (this.templateId === 1) {
          //   let doc = doT.template(this.str)(this.printData)
          //   this.lodop.ADD_PRINT_HTM("0", "0", "100%", "100%", doc)
          // } else {
            const html = PART1 + template.height + PART2 + PART3 + this.part4
            // this.lodop.SET_PRINT_PAGESIZE(2, template.width * 10, template.height * 10, 'tag')
            // 可预览
            // this.printData.forEach(item => {
            //   let doc = doT.template(html)([item])
            //   this.lodop.ADD_PRINT_HTM("0", "0", "100%", "100%",doc)
            //   this.lodop.NewPage()
            // })
             
            // 直接打印
            for (let i = 0; i < this.printData.length; i = i + unitNum) {
              this.lodop.PRINT_INIT('')
              this.lodop.SET_PRINT_PAGESIZE(1, template.width * 10, template.height * 10, 'tag')
              for (let j = 0; j < unitNum && (i + j < this.printData.length); j++) {
                let doc = window.doT.template(html)([this.printData[i + j]])
                this.lodop.ADD_PRINT_HTM("0", "0", "100%", "100%", doc)
                this.lodop.NewPage()
              }
              if (LODOP.SET_PRINTER_INDEX(this.deviceId - 0)) {
                // LODOP.SET_PRINT_STYLEA(1,"AngleOfPageInside",-90)
                // this.lodop.PREVIEW()
                this.lodop.PRINT() 
              }
            // }
          }
          // this.lodop.PREVIEW()
          this.close()
        },
        close() {
          this.visible = false
        },
        templateSelectChange(val) {
          this.templateId = val - 0
          localStorage.setItem('templateId', val)
        },
        deviceSelectChange(val) {
          localStorage.setItem('deviceId', val)
        }
      }
    }
  </script>
  <style>
    .leo-dialog-box{
      z-index:600 !important
    }
  </style>
  <style lang="stylus">
    @import '~@/assets/css/index'
    #leo_lodop
      .label
        width:110px
      .btns
        mt(50px)
        setEnd()
      .select_type
        setStart()
        margin:10px 0
        span
          width:120px
          alignR()
        .el-select
          margin:5px 10px
          min-width:300px
          mb(10px)
      .leo-content
        padding:20px
      .leo-dialog
        border:0
        radius(0)
      .leo-header, .leo-footer
        bgColor()
      .leo-button
        bgColor(text_color)
        color()
        border-radius:4
        -webkit-appearance:none
        outline:0
        border-color:text_color
      .tips
        color(light_color)
  </style>