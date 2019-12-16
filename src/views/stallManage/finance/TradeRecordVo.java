package com.qihuo.paycenter.api.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
* @描述:
*
* @Author:  sunking
* @Date:    2019/1/17 下午4:51
*/
@Data
public class TradeRecordVo implements Serializable {

    /** 流水号 */
    private Long id;
    /** 交易号 */
    private String bizTradeNo;
    /** 交易名称: 1.销售单（门店）2.补货单（门店）3.退货单（门店）4.订单退单 5.采购商撤销订单 6.订单驳回 7.提现 8.提现失败返还 9.客户还款 10. 手动还款 11. 零售单（门店);*/
    private String tradeName;
    
    /** 账目类型 1.order: 订单 2.withdraw: 提现 3.repayment: 客户名 4.撤销:retreat*/
    private String category;
    /** 交易金额 */
    private Double tradeAmount;
    /** 交易后账户剩余金额 */
    private Double remainingAmount;
    /** 交易时间 */
    private Date tradeTime;
    /** 业务（模块）编码 */
    private String bizCode;
    // 支付方式：0--未选择，1--现金，2--微信，3--支付宝, 4--赊账，5--余额, 6--微信+余额
    // cash(现金)、debt(赊账)、zfb（支付宝）、wx(微信)、 wx_balance(余额+微信)、balance（账户余额）
    private String accountTypeCode;
    /** 用户Id(主) */
    private Integer userId;
    /** 客户Id（从） */
    private Integer tradeUserId;
    /** 客户名字 */
    private String tradeUserName;
    //操作人（线上为店员，线下为老板）Id
    private Integer operatorId;
    //操作人（线上为店员，线下为老板）名字
    private String operatorName;
    //线上：1，线上；2，线下
    private Integer online;
    /** 附属说明，例如：针对体现数据的附属说明为：手续费1.0元 */
    private String postscript;

}
