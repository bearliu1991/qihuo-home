package com.qihuo.ordercenter.api.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * @描述: vip客户日账单
 * @Author: sunking
 * @Date: 2019/7/23 3:01 PM
 */
@Data
public class VipDayBillVo implements Serializable {

    private Integer id;

    /**
     * 客户id
     */
    private Integer custId;

    /**
     * 档口Id
     */
    private Integer stallId;

    /**
     * 销售数量
     */
    private int salesCount;

    /**
     * 销售金额
     */
    private double salesAmount;

    /**
     * 挂账（售）金额
     */
    private double salesCreditAmount;

    /**
     * 现结（售）金额
     */
    private double salesSettledAmount;

    /**
     * 退货数量
     */
    private int returnCount;

    /**
     * 退货金额
     */
    private double returnAmount;

    /**
     * 挂账（退货）金额
     */
    private double returnCreditAmount;

    /**
     * 现结（退货）金额
     */
    private double returnSettledAmount;

    /**
     * 扣减金额
     */
    private double deductAmount;

    /**
     * 当日欠款
     */
    private double finalCreditAmount;

    /**
     * 日期(天)
     */
    private Date day;

    /**
     * 备注
     */
    private String remarks;

    private int returnCountMix; //混合单 退货数量

    private double returnAmountMix; //混合单 退货金额

}
