<template>
  <div id="stall_home">
    <div class="block_wrap real_time top_part">
      <div class="block_title">
        <h3>店铺经营情况</h3>
        <date-pick ref="statisticalFilter" @dateChange="getNum" isLimit :maxDays="366" size="mini" defaultIndex="1" :showArr="['today', 'lastWeek', 'last30']"></date-pick>
      </div>
      <div class="num_part">
        <div class="num_wrap">
          <!-- <span class="big_head lighter">销售金额</span>
          <h4>￥{{resObj.salesTotalFee}}</h4> -->
          <ul class="block_cont lighter">
            <li>
              <span>
                <span>销售金额(元)</span>
              </span>
              <i>{{resObj.salesTotalFee || 0}}</i>
            </li>
            <li>
              <span>销售单数</span>
              <i>{{(resObj.sellOrderTotalNum) || 0}}</i>
            </li>
            <li>
              <span>商品销售数量</span>
              <i>{{(resObj.salesProductTotalNum) || 0}}</i>
            </li>
          </ul>
        </div>
        <div class="num_wrap">
          <ul class="block_cont lighter">
            <li>
                <span>
                  <span>退货金额(元)</span>
                </span>
                <i>{{resObj.returnTotalFee || 0}}</i>
              </li>
            <li>
              <span>
                <span>退货单数</span>
              </span>
              <i>{{resObj.returnOrderTotalNum || 0}}</i>
            </li>
            <li>
              <span>商品退货数量</span>
              <i>{{(resObj.returnProductTotalNum) || 0}}</i>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="set_between">
      <div class="block_wrap hot_product real_time">
        <div class="block_title">
          <h3>前10热销商品</h3>
          <date-pick ref="hotFilter" @dateChange="getHotProduct" isLimit :maxDays="366" size="mini" defaultIndex="7" :showArr="['today', 'lastWeek', 'last30']"></date-pick>
        </div>
        <div class="charts_wrap">
          <template v-if="chartData.length">
            <i class="number">商品货号</i>
            <i class="code">数量</i>
            <div ref="canvas" id="canvas" style="height:370px;width:105%"></div>
          </template>
          <img v-else="!chartData.length" class="no_data" src="../../assets/images/no_data.png">
        </div>
      </div>
      <!-- <div class="block_wrap raw_order">
        <div class="block_title">
          <h3>未操作订单</h3>
        </div>
        <ul class="block_cont short_cont unprocess_order">
          <li>
            <svg class="icon svg-icon" aria-hidden="true">
              <use xlink:href="#iconweibiaoti--x"></use>
            </svg>
            <el-badge :value="num1" class="item">
              <router-link to="/order/sales">
                <el-button type="primary" size="medium" plain>销售订单</el-button>
              </router-link>
            </el-badge>
          </li>
          <li>
            <svg class="icon svg-icon" aria-hidden="true">
              <use xlink:href="#iconfenzux2"></use>
            </svg>
            <el-badge :value="num2" class="item">
              <router-link to="/order/replenish">
                <el-button type="primary" size="medium" plain>补货订单</el-button>
              </router-link>
            </el-badge>
          </li>
          <li>
            <svg class="icon svg-icon" aria-hidden="true">
              <use xlink:href="#iconfenzux1"></use>
            </svg>
            <el-badge class="item" :value="num3">
              <router-link to="/order/vipOrder">
                <el-button type="primary" size="medium" plain>VIP订单</el-button>
              </router-link>
            </el-badge>
          </li>
        </ul>
      </div> -->
    </div>
    <div class="block_wrap real_time top_part">
      <div class="block_title">
        <h3>商品利润分析</h3>
        <date-pick ref="profitRef" @dateChange="getProfit" isLimit :maxDays="366" size="mini" defaultIndex="30" :showArr="['today', 'lastWeek', 'last30']"></date-pick>
      </div>
      <div class="num_part third_part">
        <div class="profit_wrap">
          <div class="sec_title">
            <p>总计利润<span>（只统计已设置成本的商品）</span></p>
            <router-link to="/sellData/dailyProfit">查看更多详情</router-link>
          </div>
          <ul class="block_cont lighter">
            <li>
              <span>已设置成本款号（款）</span>
              <i>{{allProfitObj.productNum || 0}}</i>
            </li>
            <li>
              <span>收入合计（元）</span>
              <i>{{allProfitObj.salesTotalFee || 0}}</i>
            </li>
            <li>
              <span>成本合计（元）</span>
              <i>{{allProfitObj.costTotalFee || 0}}</i>
            </li>
            <li>
              <span>利润合计（元）</span>
              <i>{{allProfitObj.profitsTotalFee || 0}}</i>
            </li>
          </ul>
        </div>
        <div class="profit_rank">
          <div class="sec_title">
            <p>单款利润排行<span>（只统计已设置成本的商品）</span></p>
            <router-link to="/sellData/profitRank">查看更多详情</router-link>
          </div>
          <ul class="rank_list">
            <li>
              <span>货号</span>
              <i>利润（元）</i>
            </li>
            <li v-for="(item,index) in profitRankArr" :key="index">
              <div class="left_circle">
                <span class="circle">{{index + 1}}</span>
                <span>{{item.productCode}}</span>
              </div>
              <i>{{item.profitsTotalFee}}</i>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  // import echarts from 'echarts/lib/echarts'
  // import 'echarts/lib/chart/bar'
  // import 'echarts/lib/component/toolbox'
  // import 'echarts/lib/component/toolbox'
  // import echarts from '@/assets/js/echarts-all.js'
  export default {
    name: '',
    data() {
      return {
        filterNum: '',
        num1: 0,
        num2: 0,
        num3: 0,
        resObj: {},
        echarts: {},
        extend: {
          'xAxis.0.axisLabel.fontSize': 16,
          'yAxis.0.axisLabel.fontSize': 14,
        },
        settings: {
          dataOrder: {label: '数量', order: 'desc'}
        },
        chartData: [],
        allProfitObj: {},
        profitRankArr: []
      }
    },
    mounted() {
      window.echarts ? this.excuteRequest() 
        : this._loadJs(`${process.env.CHILD_ROUTE}/static/js/echarts-all.js`, () => {this.excuteRequest()})
    },
    methods: {
      excuteRequest() {
        // this.getFiltersNum(1)
        this.getNum()
        this.getHotProduct()
        this.getAllProfit()
        this.getProfitTop5()
      },
      getProfit() {
        this.getAllProfit()
        this.getProfitTop5()
      },
      getAllProfit() {
        let arr = this.$refs.profitRef.getParams()
        this.$postJson(this._basePath.ajaxAllProfit, {startTime: arr[0], endTime: arr[1]}).then(res => {
          if (res.success) {
            this.allProfitObj = res.data
          }
        })
      },
      getProfitTop5() {
        let arr = this.$refs.profitRef.getParams()
        this.$postJson(this._basePath.ajaxGoodProfitTop5, {startTime: arr[0], endTime: arr[1]}).then(res => {
          if (res.success) {
            this.profitRankArr = res.data
          }
        })
      },
      init(codeArr,valueArr) {
        let myChart = window.echarts.init(document.getElementById('canvas'))
        // 指定图表的配置项和数据
        let option = {
            xAxis: [
              {
                type: 'value',
                axisLine:{
                  lineStyle:{
                    color:'#333',  // 坐标轴的颜色
                    width:0.5
                  }
                }
              }
            ],
            yAxis: [{
              type: 'category',
              data: codeArr,
              gridIndex: 6,
              axisLine:{
                lineStyle:{
                  color:'#333',  // 坐标轴的颜色
                  width:0.5
                }
              },
              splitLine: {
                show: false
              },
              axisLabel: {
                rotate:'-40',
                margin: 4
              }
            }],
            tooltip : {
              trigger: 'axis',
              show: true
            },
            toolbox: {
              show : true,
              // feature : {
              //   mark : {show: true},
              //   dataView : {show: true, readOnly: false},
              //   magicType: {show: true, type: ['line', 'bar']},
              //   restore : {show: true},
              //   saveAsImage : {show: true}
              // }
            },
            series: [{
              type: 'bar',
              data: valueArr,
              itemStyle: {
                normal: {
                  label: {
                    show: true, // 开启显示
                    position: 'right',
                    textStyle: { // 数值样式
                      color: 'red',
                      fontSize: 14,
                      fontWeight:'bold'
                    }
                  },
                  labelLine: {
                    show: false,
                    lineStyle: {
                      color: 'red'
                    }
                  },
                  color:'#1890FF'
                }
              }
            }]
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option)
      },
      // 获取热销产品
      getHotProduct() {
        const val = this.$refs.hotFilter.getParams()
        if (!val) return false
        const param = {
          startTime: val[0],
          endTime: val[1]
        }
        this.$postJson(this._basePath.ajaxHotProduct, param).then(res => {
          if (res.success) {
            let arr = res.data && res.data.length ? res.data : []
            arr = arr.filter(item => item.totalNum > 0)
            arr.length > 10 && (arr.length = 10)
            this.chartData = arr
            arr.sort((a, b) => a.totalNum - b.totalNum)
            let codeArr = arr.map(item => item.productCode)
            let valueArr = arr.map(item => item.totalNum)
            this.chartData && this.$nextTick(() => {
              try {
                this.init(codeArr, valueArr)
              } catch (err) {
                console.log(err)
              }
            })

            // let arr = res.data && res.data.length ? res.data.map(item => {return {'商品': item.productCode, '数量': item.totalNum}}) : []
            // arr = arr.filter(item => item['数量'] > 0)
            // arr.sort((a, b) => a['数量'] - b['数量'])
            // arr.length > 10 && (arr.length = 10)
            // this.$set(this.chartData, 'rows', arr)
          }
        })
      },
      // 获取各筛选条件
      // getFiltersNum(orderType) {
      //   this.$postJson(this._basePath.ajaxOrderFiltersNum, {orderType: orderType}).then((res) => {
      //     if (res.success) {
      //       orderType === 1 && (this.num1 = this.calculate(res.data))
      //       orderType === 2 && (this.num2 = this.calculate(res.data))
      //       orderType === 5 && (this.num3 = this.calculate(res.data))
      //     }
      //   })
      // },
      // 获取各项统计数据
      getNum() {
        const val = this.$refs.statisticalFilter.getParams()
        if (!val) return false
        const param = {
          startTime: val[0],
          endTime: val[1]
        }
        this.$postJson(this._basePath.ajaxGetTotalNum, param).then(res => {
          if (res.success) {
            this.resObj = res.data
          }
        })
      },
      calculate(obj) {
        if (!obj) return false
        let count = 0
        let keys = ['unConfirmStatusCount', 'unDistributeCount', 'unPayCount', 'unOutCount', 'unSignCount']
        for (let key of keys) {
          (obj[key] && !Number.isNaN(Number(obj[key]))) && (count = count + Number(obj[key]))
        }
        return count
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #stall_home
    padb(100px)
    .short_cont
      padding:30px
      height:450px
    .long_cont
      height:400px
    .block_wrap
      border_()
      mt(20px)
      .block_title
        setBetween()
        padding:15px 20px
        borb(1px solid #ddd)
        h3
          min-width:115px
          fn(18px)
      .num_part
        padding:60px 30px
        setBetween()
        &.third_part
          align-items: flex-start
        .num_wrap
          width:50%
          boxSizing()
          borr()
          setColumn()
          align-items:center
          &:last-child
            border-right: 0
          .big_head
            fn(20px)
          h4
            fn(26px)
            mt(25px)
            mb(42px)
          .lighter
            bold()
            li
              margin:0 15px
            i
              mt(20px)
              fn(28px)
      .profit_wrap, .profit_rank
        width:60%
        setColumn()
        min-height:100px
        .sec_title
          setBetween()
          mb(20px)
          p
            span
              fn(12px)
          a
            color(text_color)
      .profit_wrap
        padr(20px)
        .sec_title
          mb(40px)
        .block_cont
          li
            span
              fn(14px !important)
      .profit_rank
        width: 40%
        padl(20px)
        border-left:1px solid #ddd
        .rank_list
          li
            setBetween()
            margin:10px 0
            &:first-child
              fn(16px)
              bold()
              mt(0)
            .left_circle
              .circle
                inline()
                bgColor(text_color)
                color()
                square(18px)
                radius(50%)
      &.real_time
        width:73%
        .block_cont
          setAround()
          li
            setColumn()
            align-items:center
            margin:0 10px
            .svg-icon
              inline()
              square(80px)
            >span
              mb(10px)
              fn(16px)
              letter-spacing:1px
            i
              fn(20px)
              bold()
              mb(10px)
      &.top_part
        width:100%
      &.hot_product
        width: 100%
        .charts_wrap
          relative()
          padding:10px
          padt(50px)
          padr(30px)
          boxSizing()
          mr(30px)
          center()
          i
            absolute()
            bold()
            &.number
              top:35px
              left:10px
            &.code
              top:360px
              right:-10px
      &.raw_order
        width:25%
        .block_cont
          setColumn()
          justify-content space-around
          li
            setMiddle()
            .svg-icon
              square(60px)
              mr(20px)
            >span
              square(40px)
              radius(50%)
              bgColor(green)
              color()
</style>
