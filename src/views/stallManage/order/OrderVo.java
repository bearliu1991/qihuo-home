package com.qihuo.ordercenter.api.vo;

import com.qihuo.usercenter.api.vo.ReceiverVo;
import com.qihuo.usercenter.api.vo.RemarkVo;
import com.qihuo.usercenter.api.vo.StallVo;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;

/**
 * @描述:
 *
 * @Author:  sunking
 * @Date:    2019/4/23 下午7:51
 */
@ApiModel("订单")
@Data
public class OrderVo implements java.io.Serializable {

    @ApiModelProperty(value = "id", required = false, position = 0)
    private Long id;

    @ApiModelProperty(value = "订单编号", hidden = true, position = 1)
    private String orderCode;

    @ApiModelProperty(value = "订单类型：1：销售订单，2：退货单", required = true, position = 2)
    @NotNull(message = "订单类型不能为空")
    private Integer orderType; //原订单类型：1：销售订单，2：补货单，3：退货单，4：零售单, 5:快捷退货单(vip)，6：VIP客户销售单， 7：商城单

    @ApiModelProperty(value = "订单状态：-1，订单异常; 0，未确认；1，进行中（已确认）; 2，驳回；3，待付款；4，待出货（自提单才有）；" +
            "5，待发货（物流单才有）；6，待签收（物流单才有）；7，交易完成；8，交易关闭（档口退单）; 9，交易关闭（交易超时）; 10,交易关闭（订单作废）; 11,采购取消；12，档口取消", hidden = true, position = 5)
    private Integer  status;

    // 子状态
    private Integer subStatus;

    @ApiModelProperty(value = "配送方式 0，无；1，自提；2，现取；3，物流", required = true, position = 3)
    private Integer distributionType;

    //备货状态（配送方式是自提的时候才有备货状态）： 0，无；1，未备货；2，已备货 属于待出货里面的一个小状态
    private Integer stockStatus;

    @ApiModelProperty(value = "付款时间", hidden = true, position = 6)
    private Date payTime;

    // 如果结算类型为赊账，则支付方式为赊账
    @ApiModelProperty(value = "支付方式：0--未选择，1--现金，2--微信，3--支付宝, 4--赊账，5--余额, 6--微信+余额", required = true, position = 7)
    private Integer payType;

    @ApiModelProperty(value = "结算类型：1 现结(跳过支付，settleType也是1)；2 挂账; 3 赊账；4--周结，5--月结，6--季结， 7--无", required = true, position = 8)
    private Integer settleType;

    @ApiModelProperty(value = "结算状态：0 未结算; 1 已结算", hidden = true, position = 9)
    private Integer settleStatus;

    @ApiModelProperty(value = "应结算时间", hidden = true, position = 10)
    private Date settleTime;

    @ApiModelProperty(value = "结算完成时间", hidden = true, position = 11)
    private Date settledTime;

    @ApiModelProperty(value = "档口id", hidden = true, position = 13)
    private Integer stallId;

    @ApiModelProperty(value = "档口老板id", hidden = true, position = 14)
    private Integer userId;

    @ApiModelProperty(value = "原始总金额/最大可退金额(单子的价格)，不包括折扣金额", required = true, position = 12)
    private Double originalFee;

    @ApiModelProperty(value = "商品折扣总金额", required = true, position = 13)
    private Double disCountFee;

    private Double expressFee; //运费

    @ApiModelProperty(value = "减免金额", required = true, position = 14)
    private Double reduceFee;
    @ApiModelProperty(value = "减免原因", required = true, position = 14)
    private Double reduceReason;
    @ApiModelProperty(value = "增加金额", required = true, position = 14)
    private Double addFee;
    @ApiModelProperty(value = "增加原因", required = true, position = 14)
    private Double addReason;

    @ApiModelProperty(value = "售：应收金额(扣除折扣跟减免)；退：实际可退金额(扣除欠款结余)", required = true, position = 15)
    private Double shouldFee;

    @ApiModelProperty(value = "订单成交金额", hidden = true, position = 16)
    private Double actualFee;

    private Double settleTotalFee; //结算总金额
    private Double settledFee; //已经结算金额--预收金额
    private Double unsettledFee; //未结算金额--还需支付

    @ApiModelProperty(value = "销售款数", required = true, position = 19)
    private Integer styleNum;

    @ApiModelProperty(value = "销售总数量(sku总数量)", required = true, position = 19)
    private Integer totalNum;

    @ApiModelProperty(value = "退货款数。", required = true, position = 19)
    private Integer returnStyleNum;

    @ApiModelProperty(value = "退货总数量(sku总数量)", required = true, position = 19)
    private Integer returnTotalNum;

    private Double  salesAmount; //销售金额
    private Double  returnAmount; //退货金额

    @ApiModelProperty(value = "创建方式：0，线上下单 1，快捷下单(线下下单)", hidden = true, position = 20)
    private Integer createType;
    public static final int CREATE_TYPE_ONLINE = 0;
    public static final int CREATE_TYPE_OFFLINE = 1;

    @ApiModelProperty(value = "PC:pc端；WX:线上商城；POS:线下门店", required = true, position = 21)
    private String origin;
    public static final String ORIGIN_PC = "PC";
    public static final String ORIGIN_WX = "WX";
    public static final String ORIGIN_POS = "POS";
    public static final String ORIGIN_PDA = "PDA";

    @ApiModelProperty(hidden = true, position = 22)
    private Long oldOrderId;     //原订单id，退货和补货订单需要关联之前的订单id

    @ApiModelProperty(hidden = true, position = 23)
    private String oldOrderCode;   //原订单号

    @ApiModelProperty(hidden = true, position = 24)
    private OrderVo oldOrderVo;  //原订单

    @ApiModelProperty(hidden = true, position = 25)
    private Date createTime; //创建时间

    @ApiModelProperty(hidden = true, position = 26)
    private Date finalTime; //节点处理（结束）时间

    private Date modifyTime; //结束时间

    @ApiModelProperty(hidden = true, position = 27)
    private String fetchCode; //取货码(小程序一个订单对应一个包裹一个取货码)

    @ApiModelProperty(hidden = true, position = 28)
    private Date fetchTime;

    private Integer createUserId; //店员Id

    // 开单店员的名称  (销售员名称)
    private String userName;

    @NotNull
    @ApiModelProperty(value = "1, 平台存在用户；2，手机号开单，待注册用户；3.散客; 4.VIP客户")
    private Integer customerType; //注意：如果customerType为2，一旦该单被认领，则customerType值变为1，成为平台用户
    @ApiModelProperty(value = "客户id", hidden = true, position = 12)
    private Integer customerId; //存储用户id（user中的id）
    private String customerName; //档口客户名称／VIP客户名称
    private String customerPhone; //临时开单的手机号/VIP客户手机号
    private String customerRemark; //客户备注

    private Double debt; //欠款结余
    private double reduceDebt; //欠款结余扣除金额

    private Integer returnType; //退款方式: 1 线上退款（余额退款） 2 线下退款

    private Integer mode; //1，spu开单模式；2,sku开单模式；

    private Integer receiverId; //入参：收货人id；

    private OrderDetailVo orderDetailVo;

    private ExpressDeliveryVo expressDeliveryVo;

    //入参/出参
    private List<OrderProductVo> productList;

    //出参
    private List<OrderSkuVo> skuList;

    private List<SettleRecordVo> settleRecordList;

    // 档口（自提点）信息
    private StallVo stall;

    // 收货人（出货）信息
    private ReceiverVo receiver;

    // 出参 小程序-订单列表主图列表
    private List<String> imageList;

    // 不对外暴露
    private Integer toDebt; //0，未进入欠款结余；1，已进入欠款结余
    private Integer toAccount; //0，未进入账户余额；1，已进入账户余额
    private int custDelete; //0，客户未删除；1，客户已删除

    // PDA临时订单的id
    private String temporaryOrderId;

    private String stallName; //档口名称

    private List<RemarkVo> qrcodeList;
}