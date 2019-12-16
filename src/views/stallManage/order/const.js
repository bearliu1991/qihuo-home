export default {
  orderStatus: [
    {label: '未出货', value: 1},
    {label: '未发货', value: 2},
    {label: '已发货', value: 3},
    {label: '已签收', value: 4}
  ],
  settleStatus: [
    {label: '已完成', value: 0},
    {label: '未结算', value: 1},
    {label: '已发货', value: 2}
  ],
  settleTypes: [
    {label: '现结', value: 0},
    {label: '周结', value: 1},
    {label: '月结', value: 2},
    {label: '季结', value: 3}
  ],
  // 配送方式
  deliveryWay: [
    {label: '自提', value: 1},
    {label: '现取', value: 2},
    {label: '物流', value: 3}
  ],
  payWays: [// 0--现金，1--微信，2--支付宝，3--赊账
    {label: '现金', value: 0},
    {label: '微信', value: 1},
    {label: '支付宝', value: 2},
    {label: '赊账', value: 3}
  ],
  orderTypes: [
    {label: '销售订单', value: 1},
    {label: '补货单', value: 2},
    {label: '退货单', value: 3},
    {label: '零售单', value: 4}
  ]
}
