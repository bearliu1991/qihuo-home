package com.qihuo.paycenter.api.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * @描述: 提现
 * @Author: sunking
 * @Date: 2019/3/19 上午9:55
 */
@Data
public class WithdrawVo implements Serializable {
    /**
     * 单据号
     */
    private Long id;
    /**
     * 银行、支付宝、微信 账号
     */
    private String account;
    /**
     * 提现类型：bank, zfb, wx
     */
    private String type;
    /**
     * 金额
     */
    private BigDecimal amount;
    /**
     * 手续费
     */
    private BigDecimal serviceCharge;

    /**
     * 状态:
     *      "SUBMIT"; //申请提交
     *      "PASS"; //审核通过
     *      "RETREAT"; //驳回
     *      "SUCCESS"; //提现成功
     *      "FAIL"; //提现失败
     */
    private String status;
    /**
     * 状态对应的中文
     */
    private String statusValue;
    /**
     * 提现描述
     */
    private String desc;
    /**
     * 提现用户id
     */
    private Integer userId;
    /**
     * 申请时间
     */
    private Date createTime;
    /**
     * 修改时间
     */
    private Date modifyTime;

    // 支付密码
    private String payPwd;
}
