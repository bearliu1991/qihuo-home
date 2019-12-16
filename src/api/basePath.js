const local = process.env.BASE_API + '/qhms'
const finance = process.env.BASE_API + '/pay'

export default {
  /*
  * 权限后台管理
  */
    // 权限管理相关
    ajaxDelAuth: local + '/auth/delete.do',
    ajaxAllAuth: local + '/auth/getAll.do',
    ajaxStallList: local + '/getStallList.do',
    ajaxAuthByPage: local + '/auth/getByPage.do',
    ajaxSaveAuth: local + '/auth/save.do',
    ajaxAuthAuth: local + '/auth/auth.do',
    ajaxAuthUpdate: local + '/auth/update.do',
    ajaxAuthDelArr: local + '/auth/deleteBatch.do',
    ajaxAccountIsSub: local + '/user/subAccount/isSubAccount.do',
    // 菜单管理相关
    ajaxMenuByUserId: local + '/menu/getByUserid.do',
    ajaxMenuDel: local + '/menu/delete.do',
    ajaxAllMenu: local + '/menu/getAll.do',
    ajaxAllocateRights: local + '/menu/getAllForP.do',
    ajaxGetRightsMenu: local + '/menu/getByUserid.do',
    ajaxAllMenuForTree: local + '/menu/getAllForTree.do', // 树渲染所需接口
    ajaxMenuByPage: local + '/menu/getPage.do',
    ajaxSaveMenu: local + '/menu/save.do',
    ajaxMoveMenu: local + '/menu/moveMenu.do',
    ajaxGetChoosedMenuIds: local + '/permission/getAllByUserId.do',
    // 角色管理相关
    ajaxRoleDel: local + '/role/delete.do',
    ajaxAllRole: local + '/role/getAll.do',
    ajaxRoleByPage: local + '/role/getByPage.do',
    ajaxSaveRole: local + '/role/save.do',

  /*
  * 档口管理
  */
    // 首页
    ajaxGetTotalNum: local + '/order/getStallOrderAmount.do',
    ajaxHotProduct: local + '/order/getStallHotOrderProduct.do',
    // 用户图片上传
    ajaxUpload: `${process.env.UPLOAD_URL}/image/thumb/upload.do`, // local + '/image/upload.do',
    // 物流公司
    ajaxLogisticsCom: local + '/order/getExpressCode.do',
    // 用户相关
    ajaxUserDel: local + '/user/delete.do',
    ajaxUserAll: local + '/user/getAll.do',
    ajaxUserEnable: local + '/user/subAccount/setStatus.do',
    ajaxUserImg: local + '/auth/update.do',
    // 子账号
    ajaxUserByPage: local + '/user/subAccount/getByPage.do',
    ajaxSaveUser: local + '/user/subAccount/save.do',
    ajaxSubAccountDel: local + '/user/subAccount/delete.do',
    // 登陆登出
    ajaxLogin: local + '/user/login.do',
    ajaxLogout: local + '/user/logout.do',
    ajaxLoginSendCode: local + '/user/sms/sendIdentifyCode.do',
    ajaxLoginWithCode: local + '/user/loginWithCode.do',
    // 订单相关
    ajaxOrderDel: local + '/order/delete.do',
    ajaxOrderCancel: local + '/order/invalid.do',
    ajaxOrderByPage: local + '/order/getPage.do',
    ajaxOrderSave: local + '/order/save.do',
    ajaxOrderById: local + '/order/getByOrderCode.do',
    ajaxOrderSetShlocalment: local + '/order/ready.do',
    ajaxOrderSendout: local + '/order/sendOutGoods.do',
    ajaxOrderSettle: local + '/order/settle.do',
    ajaxOrderRemindCustomer: local + '/order/sendMessage.do',
    ajaxOrderRetreatOrder: local + '/order/withdraw.do',
    ajaxOrderStock: local + '/order/stock.do',
    ajaxOrderFiltersNum: local + '/order/getTodoCount.do',
    ajaxOrderGoodOut: local + '/order/out.do',
    ajaxDownloadOrder: local + '/order/reportOrderExcel.do',
    ajaxDownloadVerify: local + '/order/queryExcelReportData.do',
    // 财务相关
    ajaxTradeRecord: finance + '/tradeRecord/getPage.do',
    ajaxGetRechargeImg: local + '/pay/recharge.do',
    ajaxBossInfo: local + '/account/findByUserId.do',
    ajaxFinanceChangePsw: local + '/account/changePwd.do',
    ajaxFinanceChangePhone: local + '/account/changePhone.do',
    ajaxGetVerifyCode: local + '/user/sms/sendIdentifyCode.do', // '/account/sendCode.do'
    ajaxCheckVerifyCode: local + '/account/checkCode.do',
    ajaxBindAcountList: local + '/paybinding/list.do',
    ajaxWithdrawChannelAvail: local + '/user/withdraw/channelStatus.do',
    ajaxWXBindCode: local + '/wx/getAuthorizeUrl.do',
    ajaxBindAccount: finance + '/paybinding/bindCard.do',
    ajaxWithdrawByPage: finance + '/stall/withdraw/getPage.do',
    ajaxStallWithdraw: finance + '/withdraw/submit.do',
    ajaxOperateChannelList: finance + '/user/withdraw/channelStatusForPC.do',
    ajaxUnbindAccount: local + '/paybinding/delete.do',
    // 商品相关
    ajaxGoodDel: local + '/stall/product/delete.do',
    ajaxGoodByPage: local + '/stall/product/getByPage.do',
    ajaxStoreGoodListByPage: local + '/stall/product/getProductStoreByPage.do',
    ajaxSavePartGood: local + '/stall/product/save.do',
    ajaxShelveGood: local + '/stall/product/shelves.do',
    ajaxUnshelveGood: local + '/stall/product/notShelves.do',
    ajaxGetDetail: local + '/stall/product/getDetail.do',
    ajaxSave: local + '/stall/product/saveDetail.do',
    ajaxUpdateSku: local + '/stall/product/updateSku.do',
    ajaxSetCategory: local + '/stall/product/setStoreCategory.do',
    ajaxMinappShelve: local + '/stall/product/mallShelves.do',
    ajaxMinappUnshelve: local + '/stall/product/notMallShelves.do',
    ajaxResTimeCount: local + '/stall/product/getToHomeRestNumber.do',
    ajaxRecomandToHome: local + '/stall/product/toHomePage.do',
    ajaxGoodFilterNum: local + '/stall/product/getCountParams.do',
    ajaxSkuDel: local + '/stall/sku/deleteSkuConfig.do',
    ajaxGoodSaleList: local + '/stall/product/getSumList.do',
    ajaxGoodSku: local + '/stall/product/getSkuList.do',
    ajaxGoodsPrintSku: local + '/stall/product/getSkusData.do',
    ajaxSingleGoodSale: local + '/stall/product/getSaleInfo.do',
    ajaxSingleGoodVipBuy: local + '/stall/product/vipSalePage.do',
    // 商品授权
    ajaxAuthrize: local + '/stall/webStore/getBindWebStoreUrl.do',
    ajaxGetShopByPage: local + '/stall/webStore/getPage.do',
    ajaxSyncGoods: local + '/stall/webStore/syncWebStoreProduct.do',
    ajaxAuthShopDel: local + '/stall/webStore/delete.do',
    // VIP客户
    ajaxStallVipGetByPage: local + '/stallVip/getPage.do',
    ajaxStallVipSave: local + '/stallVip/saveStallVip.do',
    ajaxStallVipEnable: local + '/stallVip/enableStallVip.do',
    ajaxVipHangupBill: local + '/order/vip/getPage.do',
    ajaxVipHangupDebt: local + '/order/vip/debt.do',
    ajaxVipReconciliationSummary: local + '/vipbill/sumVipTotalBill.do',
    // 对账单
    ajaxReconciliationByPage: local + '/vipbill/getPage.do',
    ajaxReconciliationSaveRemark: local + '/vipbill/saveRemarks.do',
    ajaxReconciliationDownload: local + '/vipbill/exportVipBillData.do',
    ajaxReconciliationVerify: local + '/vipbill/queryVipBillData.do',
    // 商品添改
    ajaxGoodCategory1: local + '/stall/smallCategory/getAll.do',
    ajaxGoodCategory2: local + '/stall/smallCategoryChild/getChild.do',
    ajaxGoodProperty: local + '/stall/property/getOwnerProperties.do',
    ajaxGoodColorSize: local + '/stall/sku/initSkuConfigs.do',
    ajaxSaveSku: local + '/stall/sku/saveSkuConfig.do',
    // 商品类别管理
    ajaxCategoryDel: local + '/stall/categoryStore/del.do',
    ajaxCategoryGetPage: local + '/stall/categoryStore/getList.do',
    ajaxCategorySave: local + '/stall/categoryStore/saveList.do',
    ajaxCategoryPartSave: local + '/stall/categoryStore/save.do',
    // 自定义商品分类
    ajaxSelfDefineCategory: local + '/stall/product/getCategoryStoreByPage.do',
    ajaxMoveCategory: local + '/stall/categoryStore/setOrder.do',
    // 客户管理
    ajaxCustomerDel: local + '/customer/delete.do',
    ajaxCustomerByPage: local + '/customer/getByPage.do',
    ajaxCustomerSave: local + '/customer/save.do',
    ajaxCustomerVIP: local + '/customer/setVipBatch.do',
    ajaxCustomerSearch: local + '/user/getByPhone.do',
    ajaxCustomerDetail: local + '/customer/getById.do',
    ajaxCustomerManualSettle: local + '',
    ajaxCustomerTradeList: local + '/customer/debt/getPage.do',
    ajaxCustomerTradeOrders: local + '/customer/getCustomerOrders.do',
    ajaxManualSettle: local + '/customer/debt/handRefund.do',
    ajaxCustomerPay: local + '/order/sendRepaymentMessage.do',
    ajaxStallCustomerEnable: local + '/order/vipSettleSwitch.do',
    ajaxStallCustomerBatchEnable: local + '/order/vipSettleSwitchList.do',
    ajaxVipBoughtGoods: local + '/stall/product/getStallVipSalesProductPage.do',
    // 商城Vip价格相关
    ajaxCopyCustomerPrice: local + '/productPrice/copyProductPrice.do',
    ajaxVipPriceSettledByPage: local + '/productPrice/getPage.do',
    ajaxVipPriceEdit: local + '/productPrice/saveOrUpdateProductPrice.do',
    // 一体机Vip价格相关
    ajaxStallVipPriceByPage: local + '/stallVipPrice/getPage.do',
    ajaxStallVipPriceSave: local + '/stallVipPrice/saveOrUpdateVipPrice.do',
    ajaxGetAllPriceSettledGoods: local + '/stall/product/getProductByPage.do',
    // 店铺管理
    ajaxShopDel: local + '/operation/stall/delete.do',
    ajaxShopByPage: local + '/stall/getByPage.do',
    ajaxStallDetail: local + '/getStallDetail.do',
    ajaxShopSave: local + '/operation/stall/save.do',
    // 自定义标签管理
    ajaxTipGetByPage: local + '/stall/remark/getList.do',
    ajaxTipSave: local + '/stall/remark/save.do',
    ajaxTipDel: local + '/stall/remark/delete.do',
    ajaxTipSetDefault: local + '/stall/remark/setDefault.do',
    ajaxTipSaveQrcode: local + '/stall/remark/saveQrcode.do',
    // 数据中心
    ajaxDailySellByPage: local + '/stall/stallDayStatistics/getByPage.do',
    ajaxNewGoodSaleByPage: local + '/stall/product/productSalesStatistics.do',
    ajaxVipGoodBuyRemark: local + '/stall/product/addUpdateProductPurchaseRemarks.do',
    ajaxGoodSkuSale: local + '/stall/product/getSkuSalesList.do',
    // 利润统计
    ajaxAllProfit: local + '/stall/profits/getTotalProfits.do',
    ajaxDailyProfitByPage: local + '/stall/profits/productProfits/getDayProfitsPage.do',
    ajaxGoodProfitByPage: local + '/stall/profits/productProfits/getProductProfitsPage.do',
    ajaxGoodProfitTop5: local + '/stall/profits/productProfits/getProfitsTop5.do',
    // 店员管理
    ajaxClerkDel: local + '/clerk/delete.do',
    ajaxClerkByPage: local + '/clerk/getByPage.do',
    ajaxClerkSave: local + '/clerk/save.do',
    ajaxClerkEnable: local + '/clerk/enableClerk.do',
    // 交接班管理
    ajaxShiftByPage: local + '/shiftRecord/getByPage.do',
    // 设置
    ajaxBossPswReset: local + '/user/updatePwd.do',
    ajaxStallInfoSave: local + '/stall/savePhone.do',
    // 尾货处理申请
    ajaxStallTailGoodsApply: local + '/stall/product/setTailProducts.do',
    ajaxStallTailGoodsGet: local + '/stall/product/queryTailHandleProductsByPage.do',
    ajaxStallTailRuleGet: local + '/stall/product/tailHandleRule.do',
    // 库存管理
    ajaxStallStockManage: local + '/stall/product/stockWarn.do',
    ajaxStallStockRecordByPage: local + '/stall/product/getProductStockRecordByPage.do',
    ajaxUploadGoodBarExcel: local + '/stall/excel/uploadSkuCodeExcel.do',
    ajaxDownloadGoodTemplate: local + '/stall/excel/downloadSkuTemplate.do',
    ajaxCheckDownloadGoodTemplate: local + '/stall/excel/checkDownloadSkuTemplate.do',
    ajaxGetSkuBarcodeById: local + '/stall/product/getSkusByProductId.do',
    ajaxUpdateSkuBarcodeById: local + '/stall/product/addUpdateProductBarcode.do',
    ajaxQueryExcelUploadResult: local + '/bizMsg/getUnread.do',
    ajaxQueryStockUploadResult: local + '',
    ajaxCheckDownloadStoreTemplate: local + '/stall/excel/checkExportSkuStockTemplate.do',
    ajaxDownloadStoreTemplate: local + '/stall/excel/exportSkuStockTemplate.do',
    ajaxUploadSkuStockExcel: local + '/stall/excel/uploadSkuStockExcel.do',
    // 销售日报表导出
    ajaxExportDailySellQuery: local + '/stall/product/querySkuSales.do',
    ajaxExportDailySell: local + '/stall/product/exportSkuSales.do',
    // 商品sku排序
    ajaxGoodSkuSort: local + '/stall/product/setOrderedSkuProps.do',
    // 合格证样式保存
    ajaxSkuCertificateSave: local + '/stall/product/saveCertification.do',

  /*
  * 运营后台管理
  */
    // 档口管理
    ajaxStallSave: local + '/operation/stall/save.do',
    ajaxSelectStall: local + '/user/selectStall.do',
    // 收费标准
    ajaxGetChargeStandard: finance + '/rule.do'
}
