<template>
  <div id="sale_trend">
    <div>
      <div class="block_wrap hot_product real_time">
        <div class="block_title">
          <date-pick ref="hotFilter" @dateChange="getHotProduct" size="mini" isLimit 
            :maxDays="92" defaultIndex="7" :showArr="['lastWeek','last30', 'last90']"></date-pick>
        </div>
        <div class="charts_wrap">
          <template v-if="timeArr.length">
            <i class="number">销售数量</i>
            <i class="code">时间</i>
            <div ref="canvas" id="canvas" style="height:550px"></div>
          </template>
          <img v-else="!timeArr.length" class="no_data" src="@/assets/images/no_data.png">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        echarts: {},
        timeArr: [],
        settings: {
          dataOrder: {label: '数量', order: 'desc'}
        },
        chartData: [],
        returnArr: [],
        saleArr: []
      }
    },
    props: ['curRow'],
    mounted() {
      window.echarts ? this.excuteRequest() 
        : this._loadJs(`${process.env.CHILD_ROUTE}/static/js/echarts-all.js`, () => {this.excuteRequest()})
    },
    methods: {
      excuteRequest() {
        this.getHotProduct()
      },
      init() {
        let myChart = window.echarts.init(document.getElementById('canvas'))
        
        let option = {
          tooltip: {
            trigger: 'axis'
          },
          color: ['#409eff', '#f56c6c'],
          legend: {
            data:['销售量','退货量']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLine:{
              lineStyle:{
                color:'#333',  // 坐标轴的颜色
                width:0.5
              }
            },
            // show: false,
            data: this.timeArr
          },
          yAxis: {
            type: 'value',
            splitLine: {
              show: false
            },
            axisLine:{
              lineStyle:{
                color:'#333',  // 坐标轴的颜色
                width:0.5
              }
            }
          },
          series: [
            {
              name:'销售量',
              type:'line',
              lineStyle: {
                normal: {
                  color: '#409eff',
                  width: 3
                }
              },
              data: this.saleArr
            },
            {
              name:'退货量',
              type:'line',
              lineStyle: {
                normal: {
                  color: '#f56c6c',
                  width: 3
                }
              },
              data: this.returnArr
            }
          ]
        }
        // 指定图表的配置项和数据
        // let option = {
        //     xAxis: [
        //       {
        //         type: 'value',
        //         axisLine:{
        //           lineStyle:{
        //             color:'#333',  // 坐标轴的颜色
        //             width:0.5
        //           }
        //         }
        //       }
        //     ],
        //     yAxis: [{
        //       type: 'category',
        //       data: codeArr,
        //       gridIndex: 6,
        //       axisLine:{
        //         lineStyle:{
        //           color:'#333',  // 坐标轴的颜色
        //           width:0.5
        //         }
        //       },
        //       splitLine: {
        //         show: false
        //       },
        //       axisLabel: {
        //         rotate:'-40',
        //         margin: 4
        //       }
        //     }],
        //     tooltip : {
        //       trigger: 'axis',
        //       show: true
        //     },
        //     toolbox: {
        //       show : true,
        //       // feature : {
        //       //   mark : {show: true},
        //       //   dataView : {show: true, readOnly: false},
        //       //   magicType: {show: true, type: ['line', 'bar']},
        //       //   restore : {show: true},
        //       //   saveAsImage : {show: true}
        //       // }
        //     },
        //     series: [{
        //       type: 'bar',
        //       data: valueArr,
        //       itemStyle: {
        //         normal: {
        //           label: {
        //             show: true, // 开启显示
        //             position: 'right',
        //             textStyle: { // 数值样式
        //               color: 'red',
        //               fontSize: 14,
        //               fontWeight:'bold'
        //             }
        //           },
        //           labelLine: {
        //             show: false,
        //             lineStyle: {
        //               color: 'red'
        //             }
        //           },
        //           color:'#1890FF'
        //         }
        //       }
        //     }]
        // }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option)
      },
      getTimeArr(startTime, endTime) {
        if (startTime && endTime) {
          this.timeArr = []
          let date = new Date(Date.parse(startTime.replace(/-/g,  "/"))).getTime()
          while (this._formatTime(date) !== endTime) {
            this.timeArr.push(this._formatTime(date))
            date = date + 24 * 60 * 60 * 1000
          }
          this.timeArr.push(endTime)
        }
      },
      // 获取产品销量
      getHotProduct() {
        let timeout = setTimeout(() => {
          clearTimeout(timeout)
          const val = this.$refs.hotFilter.getParams()
          if (!val) return false
          const param = {
            startTime: val[0],
            endTime: val[1],
            productId: this.curRow.productId
          }
          this.getTimeArr(val[0], val[1])
          this.$postJson(this._basePath.ajaxSingleGoodSale, param).then(res => {
            if (res.success) {
              if (res.data && res.data.length) {
                this.saleArr = []
                this.returnArr = []
                this.timeArr = []
                res.data.forEach(item => {
                  this.timeArr.push(item.createTime)
                  this.saleArr.push(item.salesNum)
                  this.returnArr.push(item.returnNum)
                })
                this.init()
              }
            }
          })
        }, 200)
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #sale_trend
    .block_wrap
      width:100%
      mt(20px)
      &.hot_product
        .charts_wrap
          relative()
          padt(50px)
          padr(30px)
          boxSizing()
          mr(30px)
          center()
          i
            absolute()
            bold()
            &.number
              top:55px
              left:20px
            &.code
              top:545px
              right:10px
</style>
