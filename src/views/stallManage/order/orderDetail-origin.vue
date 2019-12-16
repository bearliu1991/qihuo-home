<template>
  <div id="order_detail">
    <div class="big_title">
      <div>{{formatOrderType(details)}}【{{formatFinishType(details)}}】</div>
      <span>{{_formatTime(details.createTime, true)}}</span>
    </div>
    <el-row class="pad10">
      <el-col :span="6" v-if="_isHave(details.orderType, [1, 2, 3])">
        <span>客户名: </span>{{details.customerName}}
      </el-col>
      <el-col :span="10" :offset="4" v-if="_isHave(details.orderType, [1, 2])">
        <span>订单编号: </span>{{details.id}}
      </el-col>
      <el-col :span="10" :offset="4" v-if="details.orderType === 3">
        <span>退货单编号: </span>{{details.id}}
      </el-col>
      <el-col :span="6" v-if="_isHave(details.orderType, [1, 2])">
        <span>出货状态: </span>{{formatOrderStatus(details)}}
      </el-col>
      <el-col :span="10" :offset="details.orderType !== 3 ? 4 : 0" v-if="_isHave(details.orderType, [1, 2, 3])">
        <span>手机号: </span>{{details.customerPhone}}
      </el-col>
      <el-col :span="10" v-if="_isHave(details.orderType, [2, 3])">
        <span>原销售单号: </span>{{details.oldOrderId}}
      </el-col>
      <el-col :span="10" v-if="details.orderType === 4">
        <span>零售单号: </span>{{details.id}}
      </el-col>
    </el-row>
    <p class="order_detail_title" v-if="_isHave(details.orderType, [1, 2])">发/出货信息</p>
    <el-row class="pad10"  v-if="_isHave(details.orderType, [1, 2])">
      <el-col :span="4">
        <span>配送方式: </span>{{formatDelivery(details)}}
      </el-col>
      <el-col :span="10" class="text20" v-if="details.status !== 0">
        <span>收货地址: </span>{{details.orderDetailVo && details.orderDetailVo.distributionAddress}}
      </el-col>
      <el-col :span="10" class="text20" v-if="details.status === 0">
        <span>自提点: </span>{{details.orderDetailVo && details.orderDetailVo.distributionAddress}}
      </el-col>
      <el-col :span="4" class="text20" v-if="_isHave(details.distributionStatus, [1, 2])">
        <span>备货状态: </span>{{formatStockStatus(details.stockStatus)}}
      </el-col>
      <el-col :span="6" class="text20" v-if="details.status === 1 && details.stockStatus === 1">
        <span>提货时间: </span>{{_formatTime(fetchTime, true)}}
      </el-col>
    </el-row>
    <p class="order_detail_title">商品信息</p>
    <el-table class="pad10 outside_table" :data="goodsData">
      <!-- <el-table-column prop="name" label="" class="first_column" style="border-right: 1px solid #999"></el-table-column> -->
        <el-table-column prop="title" label="商品标题">
          <template slot-scope="scope">
            <span>{{scope.row.title}}</span>
            <div v-if="details.orderType === 2" class="icon text_color">&#xe60c;</div>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="货号"></el-table-column>
        <el-table-column prop="unitPrice" label="原价"></el-table-column>
        <el-table-column prop="realUnitPrice" label="单价"></el-table-column>
        <el-table-column prop="orderNum" label="总数量"></el-table-column>
        <el-table-column prop="totalFee" label="总价"></el-table-column>
        <el-table-column prop="sizeColor" label="商品详情" min-width="400px">
          <template slot-scope="scope">
            <el-table :data="transformData(scope.row)" border class="inner_table">
              <el-table-column label="" prop="color"></el-table-column>
              <el-table-column v-for="(item, index) in sizeSet" :label="item" :key="index" :prop="item"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
    </el-table>
    <ul class="order_total" v-if="_isHave(details.orderType, [1, 2])">
      <li>
        <span>商品数量 : </span><i>{{details.totalNum}}</i>
      </li>
      <li>
        <span>金额合计 : </span><i>￥{{details.originalFee}}</i>
      </li>
      <li class="err_color">
        <span>折扣 : </span><i>-￥{{details.disCountFee}}</i>
      </li>
      <li class="err_color">
        <span>减免 : </span><i>-￥{{details.reduceFee}}</i>
      </li>
      <li>
        <span>应收金额 : </span><i>￥{{details.shouldFee}}</i>
      </li>
    </ul>
    <ul class="order_total" v-if="details.orderType === 3">
      <li>
        <span>退货数量 : </span><i>￥{{details.totalNum}}</i>
      </li>
      <li>
        <span>退货总价 : </span><i>￥{{details.actualFee}}</i>
      </li>
      <li>
        <span>退货时间 : </span><i>￥{{_formatTime(details.createTime, 'YYYY-MM-DD HH:mm')}}</i>
      </li>
    </ul>
    <template v-if="_isHave(details.orderType, [1, 2])">
      <p class="order_detail_title">结算记录</p>
      <el-table class="pad10" :data="details.settleRecordList" >
        <el-table-column prop="" label="结算"></el-table-column>
        <el-table-column prop="money" label="金额"></el-table-column>
        <el-table-column prop="" label="时间" :formatter="formatCreateTime"></el-table-column>
        <el-table-column prop="" label="欠收金额"></el-table-column>
      </el-table>
    </template>
    <p class="order_detail_title" v-if="_isHave(details.orderType, [1, 2, 4])">结算详情</p>
    <el-row class="pad10" v-if="_isHave(details.orderType, [1, 2])">
      <el-col :span="6">
        <span>结算状态: </span>{{formatSettleStatus(details.settleStatus)}}
      </el-col>
      <el-col :span="10" :offset="4">
        <span>结算类型: </span>{{formatSettleType(details.settleType, details.settleStatus)}}
      </el-col>
      <el-col :span="6">
        <span>支付方式: </span>{{formatSettleWay(details.payType)}}
      </el-col>
      <el-col :span="10" :offset="4">
        <span>结清时间: </span>{{formatSettledTime(details.settleTime, details.settleStatus)}}
      </el-col>
    </el-row>
    <ul v-if="details.orderType === 4" class="retail_ul pad10">
      <li>
        <span>线下支付方式: </span><i>{{formatPayWay(details.payWayName)}}</i>
      </li>
      <li>
        <span>金额: </span><i>{{details.actualFee}}</i>
      </li>
      <li>
        <span>交易时间: </span><i>{{_formatTime(details.settleTime, )}}</i>
      </li>
    </ul>
    <template v-if="_isHave(details.orderType, [1, 2])">
      <p class="order_detail_title">备注信息</p>
      <div class="pad10 text20">{{details.orderDetailVo && details.orderDetailVo.memo}}</div>
    </template>
    <template v-if="_isHave(details.orderType, [1, 2])">
      <p class="order_detail_title" >取货码</p>
      <el-col :span="6" class="pad10">
        <span>取货码:  &nbsp;</span>{{details.fetchCode}}
      </el-col>
      <el-col :span="10" :offset="4">
        <div class="code_img">
          <span>二维码: &nbsp;</span>
          <img width="200px" height="200px" :src="details.orderDetailVo && details.orderDetailVo.qrCodeUrl"/>
        </div>
      </el-col>
    </template>
  </div>
</template>
<script>
  export default {
    name: 'order_detail',
    data() {
      return {
        goodsData: []
      }
    },
    props: {
      details: {
        type: Object,
        default: () => {}
      }
    },
    created() {
      this.goodsData = this.details.productList
      this.$bus.$emit('calcScrollHeight')
    },
    components: {},
    methods: {
      init() {
        // this.detials.orderType
      },
      formatFinishType() {
        const status = this.details.status
        // 订单状态：0，未完成， 1，已完成， 2，交易关闭
        return status === 0 ? '未完成' : status === 1 ? '已完成' : '交易关闭'
      },
      formatStockStatus(val, isClass) {
        // 0--无 1--未备货，2 已备货
        if (isClass && (val === 0)) return 'text_color cursor'
        return val === 0 ? '无' : val === 1 ? '未备货' : '已备货'
      },
      transformData(arrObj) {
        if (arrObj) {
          this.sizeSet = arrObj.sizeSet.map(item => item.sizeName)
          const list = arrObj.colorSkuVoList
          let arr = list.map(item => {
            let obj = this._deepCopy(item)
            obj.arr = this.sortByArr(obj.skuVoList, this.sizeSet, 'size', {orderNum: ''})
            obj.arr.forEach(i => {
              obj[i.size] = i.orderNum
            })
            return obj
          })
          return arr
        }
      },
      formatOrderType(val) {
        // 订单类型 1，销售订单；2，补货单；3，退货单 4 零售单
        return val.orderType === 1 ? '销售订单' : val.orderType === 2 ? '补货单' :  val.orderType === 3 ? '退货单' : '零售单'
      },
      formatDelivery(val) {
        // 配送方式 1，自提；2，现取；3，物流
        return val.distributionType === 1 ? '自提' : val.distributionType === 2 ? '现取' : '物流'
      },
      formatOrderStatus(val) {
        // 1 未出货， 2 未发货、3 已发货（扫码录入快递单号之后）、4 已签收（采购商／档口手动确认）（物流）
        return val.status === 1 ? '未出货' : val.status === 2 ? '未发货' : val.status === 3 ? "已发货" : '已签收'
      },
      formatPayWay(val) {
        // 支付方式：0--未选择，1--现金，2--微信，3--支付宝，4--赊账
        return val === 0 ? '未选择' : val === 1 ? '现金' : val === 2 ? '微信' : val === 3 ? '支付宝' : '赊账'
      },
      // 转换时间
      formatCreateTime(val) {
        return this.$dateFns.format(val.updateTime, 'YYYY-MM-DD')
      },
      // 转换结算时间
      formatSettledTime(val, status) {
        if (status === 0) return '——'
        return this.$dateFns.format(val, 'YYYY-MM-DD')
      },
      // 转换结算状态
      formatSettleStatus(val) {
        // 0未结清; 1 已结清
        return val === 0 ? '未结清' : val === 1 ? '已结清' : '——'
      },
      // 转换结算类型
      formatSettleType(val) {
        const status = val.settleType
        // 1 现结；2 跳过; 3 赊账；4--周结，5--月结，6--季结
        return status === 1 ? '现结' : status === 2 ? '跳过' : status === 3 ? '赊账' : status === 4 ? '周结' : status === 5 ? '月结' : status === 6 ? '季结' : '——'
      },
      // 转换支付方式
      formatSettleWay(val) {
        // 支付方式：0--未选择，1--现金，2--微信，3--支付宝，4--赊账
        return val === 0 ? '未选择' : val === 1 ? '现金' : val === 2 ? '微信' : val === 3 ? '支付宝' : val === 4 ? '赊账' : '——'
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #order_detail
    .big_title
      bgColor(#999)
      padding:20px
      vertical(60px)
      color()
      setBetween()
    .order_total
      li
        setEnd()
        height:30px
        span
          width:100px
          alignR()
        i
          ml(10px)
          width:160px
    .inner_table
      background-color:transparent
    .el-col
      padding: 5px 0
    p.order_detail_title
      vertical(40px)
      bgColor(#E4E7ED)
      padl(10px)
    .pad10
      padding: 10px
    .text20
      line-height:20px
    .code_img
      setStart()
      align-items: flex-start
    .retail_ul
      li
        line-height:20px
</style>