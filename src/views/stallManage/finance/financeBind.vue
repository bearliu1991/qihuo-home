<template>
  <section class="app-container" id="financeBind">
    <div v-show="!secShow">
      <div class="top_part">
        <div class="balance">
          <ul class="balance_money">
            <li class="left_li">
              <span class="fn16">账户余额</span>
              <span class="err_color">{{accountInfo.balance}}元</span>
              <span class="text_color fn12 cursor" style="margin-left:15px" @click="withdrawDrawer">
                提现明细<i class="icon fn12">&#xe600;</i>
              </span>
            </li>
            <li>
              <span class="fn16">冻结金额</span>
              <span class="err_color">{{accountInfo.freezeMoney}}元</span>
            </li>
          </ul>
          <ul class="balance_btn">
            <!-- <li>
              <el-button type="text" class="bold" plain @click="rechargeShow = true">充值</el-button>
            </li> -->
            <li>
              <el-button type="primary" size="mini" class="bold" @click="openDialog('withdrawShow')">提现</el-button>
            </li>
          </ul>
        </div>
        <ul class="setting">
          <li>
            <p>
              <span class="icon warn_color">&#xe63a;</span><i>手机绑定</i>
            </p>
            <span>{{_formatPhone(accountInfo.safeMobile)}}</span>
            <el-button v-if="accountInfo.safeMobile && isSubAccount === 0" type="text" @click="openDialog('bindPhoneShow')"><i class="bold">更改手机号</i></el-button>
            <span v-else></span>
          </li>
          <li>
            <p>
              <span class="icon warn_color">&#xe643;</span><i>支付密码</i>
            </p>
            <span class="fn16">{{this.accountInfo.password ? '您已设置支付密码' : '尚未设置支付密码'}}</span>
            <el-button type="text" @click="openDialog('bindPswShow')"><i class="bold">{{this.accountInfo.password ? '重置' : '设置'}}密码</i></el-button>
          </li>
        </ul>
      </div>
      <ul class="bind_part">
        <li>
          <div class="bind_btn" @click="openDialog('bindCardShow')">
            <span class="icon">&#xe61c;</span>
            <i>绑定银行卡</i>
          </div>
          <BanKList :list="filterBindList('bank')" @getBindList="getBindList" type="bank"></BanKList>
        </li>
        <li>
          <div class="bind_btn" @click="showBindAccount('zfb')">
            <span class="icon">&#xe61c;</span>
            <i>绑定支付宝</i>
          </div>
          <BanKList :list="filterBindList('zfb')" @getBindList="getBindList" type="zfb"></BanKList>
        </li>
        <li>
          <div class="bind_btn" @click="showBindAccount('wx')">
            <span class="icon">&#xe61c;</span>
            <i>绑定微信</i>
          </div>
          <BanKList :list="filterBindList('wx')" @getBindList="getBindList"  type="wx"></BanKList>
        </li>
      </ul>
      <Drawer v-model="showDrawer" title="提现明细" width="800px">
        <WithdrawList></WithdrawList>
      </Drawer>
    </div>
    
    <Secondary title="提现" v-model="secShow">
      <WithdrawPage :accountInfo="accountInfo" v-if="secShow" :bindList="bindList"></WithdrawPage>
    </Secondary>

    <el-dialog
      title="充值"
      :visible.sync="rechargeShow"
      center
      width="600px">
      <div>
        <el-steps :active="rechargeActiveIdx" align-center>
          <el-step title="输入充值方信息" icon="el-icon-edit"></el-step>
          <el-step title="扫描付款" icon="el-icon-upload" ></el-step>
        </el-steps>
        <div class="recharge_bind dialog_wrap">
          <template v-if="rechargeActiveIdx === 1">
            <div class="recharge_first">
              <div class="recharge_money bindThird_form">
                <el-form :inline="true" class="bindThird_form" label-width="100px" ref="rechargeForm" :model="rechargeForm" @submit.native.prevent>
                  <el-form-item label="当前账户余额: ">
                    ￥{{accountInfo.balance}}
                  </el-form-item>
                  <el-form-item label="支付方式: ">
                    <el-radio-group v-model="rechargeType" size="mini">
                      <el-radio-button size="mini" label="zfb">支付宝</el-radio-button>
                      <el-radio-button size="mini" label="wx">微信</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item 
                    prop="inputChargeVal" 
                    label="充值金额:"
                    :rules="[
                      { required: true, message: '充值金额不能为空'},
                      { validator: validMoney, message: '充值金额为大于0的数字'}
                    ]"
                  >
                    <el-input size="medium" v-model.number="rechargeForm.inputChargeVal"></el-input> 元
                  </el-form-item>
                </el-form>
              </div>
              <div class="btns btn_wrap">
                <el-button @click="goback('recharge')">取消</el-button>
                <el-button type="primary" @click="getRechargeImg">充值</el-button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="recharge_two">
              <div class="top">
                <div class="recharge_left">
                  <div>
                    <img :src="rechargeUrl" width="100px" height="100px">
                  </div>
                  <span class="fn18">￥{{rechargeAmount}}</span>
                  <i class="fn12 light_color" style="margin-top:10px">请使用{{rechargeType === 'wx' ? '微信' : '支付宝'}}扫一扫支付</i>
                </div>
                <div class="recharge_right">
                  <div>
                    <ul>
                      <li>
                        <span>充值金额: </span>
                        <i>￥{{rechargeAmount}}</i>
                      </li>
                      <li>
                        <span>支付方式: </span>
                        <i>{{rechargeType === 'wx' ? '微信' : '支付宝'}}支付</i>
                      </li>
                    </ul>
                    <div class="tips">
                      <span>充值码失效时间还剩 <i class="err_color fn14">15:00</i></span>
                      <div>支付时，请务必检查支付金额后再进行支付。</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="center tow_btns btn_wrap">
                <el-button type="primary" @click="rechargeActiveIdx = 1">返回修改</el-button>
                <el-button type="primary" @click="goback('recharge', true)">我已支付，查看余额</el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </el-dialog>
    
    <!-- <el-dialog
      title="提现"
      :visible.sync="withdrawShow"
      center
      width="600px">
      <template v-if="!cardNum">
        您暂未绑定银行卡、支付宝或微信，不能进行提现，请绑定银行卡、支付宝或微信后再进行提现。
        <el-button type="primary" @click="goback('withdraw')">知道了，立即绑定</el-button>
      </template>
      <template v-else>
        <div class="withdraw_dialog bindThird_dialog">
          <div class="">
            <el-steps :active="withdrawActiveIdx" align-center>
              <el-step title="输入提现信息" icon="el-icon-edit"></el-step>
              <el-step title="提现" icon="el-icon-upload"></el-step>
            </el-steps>
          </div>
          <div class="withdraw_first dialog_wrap">
            <div class="withdraw_form bindThird_form" v-if="withdrawActiveIdx === 1">
              <el-form :inline="true" :model="withdrawForm" :rules="withdrawFormRules" label-width="100px" ref="withdrawForm">
                <el-form-item label="当前账户余额: ">
                  ￥{{accountInfo.balance}}
                </el-form-item>
                <el-form-item label="手机号码: ">
                  {{accountInfo.safeMobile}}
                </el-form-item>
                <el-form-item label="提现金额: " prop="amount">
                  <el-input v-model="withdrawForm.amount" placeholder="最低提现金额为50元"></el-input>
                </el-form-item>
                <el-form-item label="选择账户: " prop="account">
                  <el-select v-model="withdrawForm.account" placeholder="请选择">
                    <el-option v-for="(item, index) in bindList" :key="index" :value="item.account">
                      <i v-if="item.type === 'wx'">微信: {{item.account}}</i>
                      <i v-if="item.type === 'zfb'">支付宝: {{item.account}}</i>
                      <i v-if="item.type !== 'bank' && item.type !== 'wx'">{{item.account}}</i>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="支付密码: " prop="payPwd">
                  <el-input :type="pswType" @blur="pswType = 'password'" v-model="withdrawForm.payPwd" placeholder="请输入支付密码"></el-input>
                </el-form-item>
              </el-form>
              <div class="send_msg">*请您认真核对提现金额及提现账户，确保户名与账户一致，以免造成提现失败甚至金额损失。</div>
              <div class="btn_wrap">
                <el-button @click.native="goback('withdraw')">取消</el-button>
                <el-button type="primary" @click="withdrawMoney">确定</el-button>
              </div>
            </div>
            <div v-else>
              <p class="send_msg">我们将向你的手机号{{_formatPhone(accountInfo.safeMobile)}}发送一条短信验证码，请点击获取验证码</p>
              <el-form :inline="true" class="single_form" :model="verifyCodeForm" ref="verifyCodeForm">
                <el-form-item 
                  label="短信验证码: " prop="verifyCode"
                  :rules="[{ required: true, validator: noEmpty, message: '短信验证码不能为空', trigger: 'blur'}]"
                >
                  <el-input v-model="verifyCodeForm.verifyCode" class="verify_input" placeholder="请输入验证码"></el-input>
                  <count-down @getCode="getCode(accountInfo.safeMobile, WithdrawCode)"></count-down>
                </el-form-item>
              </el-form>
              <div class="btn_wrap">
                <el-button @click.native="goback('withdraw')">取消</el-button>
                <el-button type="primary" @click="withdrawNext">下一步</el-button>
              </div>
            </div>
            <!-- <div>当前账户余额：￥6661.00</div> -->
          <!-- </div>
        </div>
      </template>
    </el-dialog> -->

    <el-dialog
      title="绑定银行卡"
      :visible.sync="bindCardShow"
      center
      width="600px">
      <div class="bindCard_dialog">
        <div class="">
          <el-steps :active="bindCardActiveIdx" align-center>
            <el-step title="输入银行卡信息" icon="el-icon-edit"></el-step>
            <el-step title="绑定银行卡" icon="el-icon-upload"></el-step>
          </el-steps>
        </div>
        <div class="dialog_wrap">
          <div class="bindCard_form bindThird_form" v-if="bindCardActiveIdx === 1">
            <p class="send_msg">我们将向你的手机号{{_formatPhone(accountInfo.safeMobile)}}发送一条短信验证码，请点击获取验证码</p>
            <el-form :inline="true" class="single_form" :model="verifyCodeForm" ref="verifyCodeForm">
              <el-form-item 
                label="短信验证码: " prop="verifyCode"
                :rules="[{ required: true, validator: noEmpty, message: '短信验证码不能为空', trigger: 'blur'}]"
              >
                <el-input v-model="verifyCodeForm.verifyCode" class="verify_input" placeholder="请输入验证码"></el-input>
                <count-down @getCode="getCode(accountInfo.safeMobile, BindBankCode)"></count-down>
              </el-form-item>
            </el-form>
            <div class="btn_wrap">
              <el-button @click.native="goback('bindCard')">取消</el-button>
              <el-button type="primary" @click="bindCardNext">下一步</el-button>
            </div>
          </div>
          <div v-else>
            <el-form :inline="true" :model="bindCardForm" :rules="bindCardFormRules" label-width="100px" ref="bindCardForm">
              <el-form-item label="卡主姓名: " prop="name">
                <el-input style="width:250px" v-model="bindCardForm.name" placeholder="请输入卡主姓名"></el-input>
              </el-form-item>
              <el-form-item label="身份证号: " prop="idCardNo">
                <el-input style="width:250px" v-model="bindCardForm.idCardNo" placeholder="请输入有效身份证号"></el-input>
              </el-form-item>
              <el-form-item label="卡号: " prop="cardNo">
                <el-input style="width:250px" v-model.trim="bindCardForm.cardNo" @blur="getBankType(bindCardForm.cardNo)" placeholder="请输入有效卡号"></el-input>
              </el-form-item>
              <el-form-item label="银行卡类型: " v-if="bankObj">
                <span v-if="bankObj.bankName">{{bankObj.bankName}}</span><span v-else class="light_color">请输入银行卡卡号</span>
              </el-form-item>
            </el-form>
            <div class="btn_wrap">
              <el-button @click.native="goback('bindCard')">取消</el-button>
              <el-button type="primary" @click="bindCardConfirm">确定</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      :title="activePay === 'zfb' ? '绑定支付宝': '绑定微信'"
      :visible.sync="bindThirdShow"
      center
      width="600px">
      <div class="bindThird_dialog">
        <div class="">
          <el-steps :active="bindThirdActiveIdx" align-center>
            <el-step title="发送验证码" icon="el-icon-edit"></el-step>
            <el-step title="绑定账户" icon="el-icon-upload"></el-step>
          </el-steps>
        </div>
        <div class="dialog_wrap">
          <div v-if="bindThirdActiveIdx === 1">
            <p class="send_msg">我们将向你的手机号{{_formatPhone(accountInfo.safeMobile)}}发送一条短信验证码，请点击获取验证码</p>
            <el-form :inline="true" class="single_form" :model="verifyCodeForm" ref="verifyCodeForm" @submit.native.prevent>
              <el-form-item 
                label="短信验证码: " prop="verifyCode"
                :rules="[{ required: true, validator: noEmpty, message: '短信验证码不能为空', trigger: 'blur'}]"
              >
                <el-input v-model="verifyCodeForm.verifyCode" class="verify_input" placeholder="请输入验证码"></el-input>
                <count-down @getCode="getCode(accountInfo.safeMobile, activePay === 'zfb' ? BindZfbCode : BindWxCode)"></count-down>
              </el-form-item>
            </el-form>
            <div class="btn_wrap">
              <el-button @click.native="goback('bindThird')">取消</el-button>
              <el-button type="primary" @click="bindThirdNext">下一步</el-button>
            </div>
          </div>
          <div class="bindThird_first" v-else>
            <div class="bindThird_form">
              <template v-if="activePay === 'wx'">  <!--v-if="activePay === 'wx'"-->
                <qriously :value="codeUrl" :size="150" style="margin:0 auto"/>
                <div class="btn_wrap">
                  <el-button type="primary" @click="bindThirdAccount">我已绑定</el-button>
                </div>
              </template>
              <template v-else>
                <el-form :inline="true" label-width="100px" :model="bindThirdForm" ref="bindThirdForm">
                  <el-form-item
                    label="姓名: " prop="name"
                    :rules="[
                      { validator: noEmpty, message: '姓名不能为空', trigger: 'blur'}
                    ]"
                  >
                    <el-input v-model="bindThirdForm.name" placeholder="请输入真实姓名"></el-input>
                  </el-form-item>
                  <el-form-item 
                    :label="activePay === 'zfb' ? '支付宝账号': '微信账号' " prop="bindAccount"
                    :rules="[
                      { validator: noEmpty, message: '账号不能为空', trigger: 'blur'}
                    ]"
                  >
                    <el-input v-model="bindThirdForm.bindAccount" placeholder="请输入账号"></el-input>
                  </el-form-item>
                </el-form>
                <div class="btn_wrap">
                  <el-button type="primary" @click="bindThirdAccount">绑定</el-button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="更改手机号"
      :visible.sync="bindPhoneShow"
      center
      width="600px">
      <div class="bindThird_dialog">
        <div class="">
          <el-steps :active="bindPhoneActiveIdx" align-center>
            <el-step title="验证旧手机号" icon="el-icon-edit"></el-step>
            <el-step title="绑定新手机号" icon="el-icon-upload"></el-step>
          </el-steps>
        </div>
        <div class="bindThird_first dialog_wrap" ref="countDown" v-if="bindPhoneActiveIdx === 1">
          <div class="bindThird_form">
            <p class="send_msg">为保障账号安全，请使用您的旧手机号码{{_formatPhone(accountInfo.safeMobile)}}获取验证码</p>
            <el-form :inline="true" :model="bindPhoneForm" label-width="100px" ref="bindPhoneForm">
              <el-form-item
                label="短信验证码: " prop="verifyCode"
                :rules="[{ required: true, validator: noEmpty, message: '不能为空', trigger: 'blur'}]"
              >
                <el-input v-model="bindPhoneForm.verifyCode" class="verify_input" placeholder="请输入验证码"></el-input>
                <count-down @getCode="getCode(accountInfo.safeMobile, ChangePhoneCode)"></count-down>
              </el-form-item>
              <el-form-item 
                label="新手机号: " prop="phone"
                :rules="[
                  { required: true, validator: noEmpty, message: '手机号码不能为空', trigger: 'blur'},
                  { validator: mobileReg, message: '手机号码格式不正确', trigger: 'blur'}]"
              >
                <el-input v-model="bindPhoneForm.phone" placeholder="请输入新手机号"></el-input>
              </el-form-item>
            </el-form>
            <div class="btn_wrap">
              <el-button @click.native="goback('bindPhone')">取消</el-button>
              <el-button type="primary" @click="changePhoneNext(2)">下一步</el-button>
            </div>
          </div>
        </div>
        <div class="bindThird_first dialog_wrap" v-else>
          <div class="bindThird_form">
            <p class="send_msg">请使用新手机号{{bindPhoneForm.phone}}获取验证码</p>
            <el-form :inline="true" :model="newPhoneForm" ref="newPhoneForm" @submit.native.prevent>
              <el-form-item 
                label="输入验证码：" prop="verifyCode"
                :rules="[{ required: true, validator: noEmpty, message: '验证码不能为空', trigger: 'blur'}]"
              >
                <el-input v-model="newPhoneForm.verifyCode" class="verify_input" placeholder="请输入验证码"></el-input>
                <count-down v-if="bindPhoneActiveIdx === 2" @getCode="getCode(bindPhoneForm.phone, ChangePhoneCode)"></count-down>
              </el-form-item>
            </el-form>
            <div class="btn_wrap">
              <el-button type="primary" @click="modifyPhone(bindPhoneForm.phone, newPhoneForm.verify)">确定更改手机号</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="支付密码"
      :visible.sync="bindPswShow"
      width="600px"
      center>
      <div class="dialog_wrap">
        <el-form style="margin:0 auto" :inline="true" label-width="150px" :model="pswForm" ref="pswForm"
          :rules="pswFormRules" @submit.native.prevent>
          <el-form-item prop="phone" label="手机号">
            {{accountInfo.safeMobile}}
          </el-form-item>
          <el-form-item label="请输入验证码" prop="verifyCode">
            <el-input size="medium" v-model="pswForm.verifyCode" placeholder="请输入验证码" class="verify_input"></el-input>
            <count-down @getCode="getCode(accountInfo.safeMobile, PayPswCode)"></count-down>
          </el-form-item>
          <el-form-item label="请输入支付密码" prop="payPsw">
            <el-input size="medium" type="password" v-model="pswForm.payPsw" auto-complete="new-password" placeholder="请输入支付密码"></el-input>
            <span class="light_color">密码为6位数字</span>
          </el-form-item>
          <el-form-item label="请重复密码" prop="repeatPsw">
            <el-input size="medium" type="password" v-model="pswForm.repeatPsw" auto-complete="new-password" placeholder="请重复密码"></el-input>
            <span class="light_color">密码为6位数字</span>
          </el-form-item>
        </el-form>
        <div class="btn_wrap">
          <el-button @click.native="goback('bindPsw')">取消</el-button>
          <el-button type="primary" @click="modifyPsw">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </section>
</template>
<script>
  import {mapGetters} from 'vuex'
  import WithdrawList from './withdrawList'
  import WithdrawPage from './withdrawPage'
  import BanKList from './banKList'
  import {verifyCodeType} from '@/utils/const'
  
  export default {
    name: '',
    data() {
      return {
        isFalse: false,
        secShow: false,
        // 账户信息
        accountInfo: {},
        bindList: [],
        rechargeUrl: '',
        // 充值提现明细
        pageNum: 0,
        pageSize: 10,
        total: 0,
        showDrawer: false,
        // 各种绑定展示
        rechargeShow: false,
        withdrawShow: false,
        bindCardShow: false,
        bindThirdShow: false,
        bindPhoneShow: false,
        bindPswShow: false,
        // 各种验证码类型
        // 提现：SMS_161385002，设置支付密码：SMS_160861432，更改安全手机号：SMS_160856459，绑定微信：SMS_160861413，
        // 绑定支付宝：SMS_160856454，绑定银行卡：SMS_160856450，修改登录密码（PC后台）：SMS_160856442
        WithdrawCode: verifyCodeType.WithdrawCode,
        ChangePhoneCode: verifyCodeType.ChangePhoneCode,
        BindWxCode: verifyCodeType.BindWxCode,
        BindZfbCode: verifyCodeType.BindZfbCode,
        BindBankCode: verifyCodeType.BindBankCode,
        PayPswCode: verifyCodeType.PayPswCode,
        // 充值相关
        rechargeActiveIdx: 1,
        rechargeAmount: '',
        rechargeForm: {
          inputChargeVal: '',
        },
        rechargeType: 'zfb',
        // 提现相关
        withdrawActiveIdx: 1,
        cardNum: 1,
        verifyCodeForm: {
          verifyCode: ''
        },
        withdrawForm: {
          amount: '',
          account: '',
          payPwd: ''
        },
        withdrawFormRules: {
          amount: [{ required: true, validator: this.mustNumber, message: '提现金额不能为空', trigger: 'blur'}],
          account: [{ required: true, validator: this.noEmpty, message: '提现账户不能为空', trigger: 'blur'}],
          payPwd: [{ required: true, validator: this.numberPsw, message: '支付密码为6位数字', trigger: 'blur'}]
        },
        // 绑定银行卡相关
        bindCardActiveIdx: 1,
        bindCardForm: {
          name: '',
          cardNo: '',
          idCardNo: ''
        },
        bindCardFormRules: {
          name: [{ required: true, validator: this.noEmpty, message: '卡主名不能为空', trigger: 'blur'}],
          cardNo: [
            { required: true, validator: this.noEmpty, message: '银行卡号不能为空', trigger: 'blur'},
            { required: true, validator: this._isAllNumber, message: '银行卡号有误', trigger: 'blur'}
          ],
          idCardNo: [{ required: true, validator: this.isIdCard, message: '身份证号有误', trigger: 'blur'}],
          // password: [{ required: true, validator: this.numberPsw, message: '密码为6位数字', trigger: 'blur'}]
        },
        // 绑定支付宝/微信相关
        userBondInfo: {
          headimgurl: '',
          nickname: 'bear'
        },
        codeUrl: '',
        activePay: '',
        bindThirdActiveIdx: 1,
        bindThirdForm: {
          name: '',
          bindAccount: ''
        },
        // 更改手机号相关
        bindPhoneActiveIdx: 1,
        bindPhoneForm: {
          verifyCode: '',
          phone: ''
        },
        newPhoneForm: {
          phone: ''
        },
        // 设置密码相关
        pswForm: {
          phone: '',
          verifyCode: '',
          payPsw: '',
          repeatPsw: ''
        },
        pswFormRules: {
          verifyCode: [{ required: true, validator: this.noEmpty, message: '不能为空', trigger: 'blur'}],
          payPsw: [{ required: true, validator: this.numberPsw, message: '密码为6位数字', trigger: 'blur'}],
          repeatPsw: [
            { required: true, validator: this.numberPsw, message: '密码为6位数字', trigger: 'blur'},
            { validator: this.checkRepeatPsw, message: '两次密码不一致', trigger: 'blur'}
          ]
        },
        bankObj: '',
      }
    },
    computed: {
      ...mapGetters([
        'isSubAccount'
      ])
    },
    created() {
      this.init()
      this.bindCardNext = this._debounce(this.bindCardNext)
      this.bindCardConfirm = this._debounce(this.bindCardConfirm)
      this.withdrawNext = this._debounce(this.withdrawNext)
      this.withdrawMoney = this._debounce(this.withdrawMoney)
      this.modifyPsw = this._debounce(this.modifyPsw)
      this.bindThirdNext = this._debounce(this.bindThirdNext)
      this.bindThirdAccount = this._debounce(this.bindThirdAccount)
      this.checkCode = this._debounce(this.checkCode)
      this.changePhoneNext = this._debounce(this.changePhoneNext)
      this.modifyPhone = this._debounce(this.modifyPhone)
      window.bankcardCheck || this._loadJs(`${process.env.CHILD_ROUTE}/static/js/bankcardCheck.js`, () => {})
    },
    components: {WithdrawList, BanKList, WithdrawPage},
    methods: {
      async init() {
        const res = await this.getBossInfo()
        res.success && this.getBindList()
      },
      // 重复密码时验证密码
      checkRepeatPsw(rule, value, callback) {
        if (value !== this.pswForm.payPsw) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      },
      // 获取银行卡类型
      getBankType(val) {
        if (val) {
          this.bankObj = bankcardCheck(val.replace(/\s*/g, '')) || {bankName: '其它银行'}
        } else {
          this.bankObj = {}
        }
      },
      // 获取绑定列表
      getBindList() {
        this.$postJson(this._basePath.ajaxBindAcountList, {userId: this.getCookie('userId')}).then(res => {
          if (res.success) {
            this.bindList = res.data
          }
        })
      },
      filterBindList(type) {
        return this.bindList ? this.bindList.filter((item) => type === item.type) : []
      },
      // 获取账户信息
      getBossInfo() {
        return new Promise((resolve) => {
          this.$postJson(this._basePath.ajaxBossInfo, {userId: this.getCookie('userId')}).then(res => {
            if (res.success) {
              this.accountInfo = res.data || {}
            }
            resolve(res)
          })
        })
      },
      openDialog(dialogName) {
        this.verifyCodeForm = {verifyCode: ''}
        this.bankObj = {}
        if (dialogName === 'withdrawShow') {
          if (!this.bindList.length) {
            this.$alert('您暂未绑定银行卡、支付宝或微信，不能进行提现，请绑定银行卡、支付宝或微信后再进行提现', '提示', {
              confirmButtonText: '知道了',
              center:true,
              callback: action => {
                
              }
            })
          } else if (!this.accountInfo.password) {
            this.$msgbox({
              title: '提示',
              message: '您暂未设置提现密码，不能进行提现，请先设置支付密码',
              confirmButtonText: '去设置',
              center:true
            }).then(({ value }) => {
              this.bindPswShow = true
            })
          } else {
            this.secShow = true
          }
        } else {
          this[dialogName] = true
          this.bindCardActiveIdx = 1
          this.bindPhoneActiveIdx = 1
          this.rechargeActiveIdx = 1
          this.bindThirdActiveIdx = 1
          this.$nextTick(() => {
            this.$refs.pswForm && this.$refs.pswForm.resetFields()
            this.$refs.rechargeForm && this.$refs.rechargeForm.resetFields()
            this.$refs.withdrawForm && this.$refs.withdrawForm.resetFields()
            this.$refs.bindCardForm && this.$refs.bindCardForm.resetFields()
            this.$refs.verifyCodeForm && this.$refs.verifyCodeForm.resetFields()
            this.$refs.bindPhoneForm && this.$refs.bindPhoneForm.resetFields()
          })
          this.$bus.$emit('update')
        }
      },
      goback(title, isRefresh) {
        switch (title) {
          case 'recharge': 
            this.rechargeShow = false
            this.rechargeActiveIdx = 1
            isRefresh && this.getBossInfo()
            break
          case 'withdraw': 
            this.withdrawShow = false
            isRefresh && this.getBossInfo()
            break
          case 'bindCard': 
            this.bindCardShow = false
            isRefresh && this.getBossInfo()
            !isRefresh && this.$refs.bindCardForm && this.$refs.bindCardForm.resetFields()
            break
          case 'bindThird': 
            this.bindThirdShow = false
            this.activePay = ''
            isRefresh && this.getBossInfo()
            break
          case 'bindPhone': 
            this.bindPhoneShow = false
            isRefresh && this.getBossInfo()
            break
          case 'bindPsw': 
            this.bindPswShow = false
            isRefresh && this.getBossInfo()
            break
          default: 
            break
        }
      },
      // 弹出支付宝或微信绑定弹窗
      async showBindAccount(title) {
        this.verifyCodeForm = {verifyCode: ''}
        this.activePay = title
        this.bindThirdActiveIdx = 1
        this.bindThirdShow = true
      },
      // 获取充值二维码
      getRechargeImg() {
        this.$refs.rechargeForm.validate(valid => {
          if (valid) {
            this.rechargeAmount = this.rechargeForm.inputChargeVal
            this.rechargeActiveIdx = 2
            this.rechargeUrl = `${this._basePath.ajaxGetRechargeImg}?userId=0&amount=${this.rechargeAmount}&rechargeType=${this.rechargeType}`
          }
        })
      },
      // 绑定银行卡下一步
      async bindCardNext() {
        const valid = await this.validateRes('verifyCodeForm')
        if (valid) {
          const bool = await this.checkCode(this.accountInfo.safeMobile, this.verifyCodeForm.verifyCode, this.BindBankCode)
          if (bool) {
            this.bindCardActiveIdx = 2
          }
        }
      },
      // 绑定银行卡
      async bindCardConfirm() {
        const valid = await this.validateRes('bindCardForm')
        if (valid) {
          const para = {
            account: this.bindCardForm.cardNo,
            realName: this.bindCardForm.name,
            userId: this.getCookie('userId'),
            bankName: this.bankObj.bankName,
            idCardNo: this.bindCardForm.idCardNo,
            type: 'bank'
          }
          this.$post(this._basePath.ajaxBindAccount, para).then(res => {
            if (res.success) {
              this.$message.success('绑定成功')
              this.bindCardShow = false
              this.getBindList()
            }
          })
        }
      },
      // 提现下一步
      async withdrawNext() {
        const valid = await this.validateRes('verifyCodeForm')
        if (valid) {
          this.withdrawActiveIdx = 2
        }
      },
      // 提现
      async withdrawMoney() {
        const valid = await this.validateRes('withdrawForm')
        if (valid) {
          let param = Object.assign({}, this.withdrawForm)
          param.type = this.bindList.find(item => item.account === this.withdrawForm.account).type
          param.status = "SUBMIT"
          this.$post(this._basePath.ajaxStallWithdraw, param).then(res => {
            if (res.success) {
              this.$message.success('申请提交成功')
              this.withdrawShow = false
            }
          })
        }
      },
      // 修改支付密码
      async modifyPsw() {
        const valid = await this.validateRes('pswForm')
        if (valid) {
          // const bool = await this.checkCode(this.accountInfo.safeMobile, this.pswForm.verifyCode, this.PayPswCode)
          const param = {
            accountId: this.accountInfo.id,
            code: this.pswForm.verifyCode,
            password: this.pswForm.payPsw,
            userId: this.getCookie('userId'),
            phone: this.accountInfo.safeMobile
          }
          this.$postJson(this._basePath.ajaxFinanceChangePsw, param).then(res => {
            if (res.success) {
              this.$message.success('修改密码成功')
              this.goback('bindPsw', true)
            }
          })
        }
      },
      // 绑定第三方的下一步
      async bindThirdNext() {
        const valid = await this.validateRes('verifyCodeForm')
        if (valid) {
          const bool = await this.checkCode(this.accountInfo.safeMobile, this.verifyCodeForm.verifyCode, this.activePay === 'zfb' ? this.BindZfbCode : this.BindWxCode)
          if (bool) {
            const codeUrl = await this.getWXBindCode()
            this.codeUrl = codeUrl
            codeUrl && (this.bindThirdActiveIdx = 2)
          }
        }
      },
      // 绑定支付宝账户
      async bindThirdAccount() {
        if (this.activePay === 'wx') {
          this.bindThirdShow = false
          this.getBindList()
        } else {
          const valid = await this.validateRes('bindThirdForm')
          if (valid) {
            const param = {
              account: this.bindThirdForm.bindAccount,
              userId: this.getCookie('userId'),
              realName: this.bindThirdForm.name,
              type: 'zfb'
            }
            this.$post(this._basePath.ajaxBindAccount, param).then(res => {
              if (res.success) {
                this.$message.success('绑定成功')
                this.goback('bindThird')
                this.getBindList()
              }
            })
          }
        }
      },
      // 获取绑定微信的二维码
      getWXBindCode() {
        return new Promise((resolve) => {
          this.$post(this._basePath.ajaxWXBindCode).then(res => {
            if (res.success) {
              resolve(res.data)
            }
          })
        })
      },
      // 获取验证码
      getCode(phone, templateCode) {
        // 提现：SMS_161385002，设置支付密码：SMS_160861432，更改安全手机号：SMS_160856459，绑定微信：SMS_160861413，
        // 绑定支付宝：SMS_160856454，绑定银行卡：SMS_160856450，修改登录密码（PC后台）：SMS_160856442 动态密码登陆：SMS_160856438
        this.$postJson(this._basePath.ajaxGetVerifyCode, {phone: phone, templateCode: templateCode}).then(res => {
          if (res.success) {
            this.$message.success('获取验证码成功')
          }
        })
      },
      // 检查验证码
      checkCode(phone, code, templateCode) {
        return new Promise((resolve) => {
          this.$postJson(this._basePath.ajaxCheckVerifyCode, {phone: phone, code: code, templateCode: templateCode}).then(res => {
            resolve(res.success)
          })
        })
      },
      // 修改手机号下一步
      async changePhoneNext(index) {
        const valid = await this.validateRes('bindPhoneForm')
        if (valid) {
          const bool = await this.checkCode(this.accountInfo.safeMobile, this.bindPhoneForm.verifyCode, this.ChangePhoneCode)
          if (bool) {
            this.bindPhoneActiveIdx = index
            this.$bus.$emit('update')
          }
        }
      },
      // 充值提现明细
      withdrawDrawer() {
        this.showDrawer = true
      },
      // 修改财务相关手机号
      modifyPhone() {
        this.$refs.newPhoneForm.validate(valid => {
          if (valid) {
            const param = {
              accountId: this.accountInfo.id,
              code: this.newPhoneForm.verifyCode,
              phone: this.bindPhoneForm.phone,
              userId: this.getCookie('userId')
            }
            this.$postJson(this._basePath.ajaxFinanceChangePhone, param).then(res => {
              if (res.success) {
                this.goback('bindPhone', true)
              }
            })
          }
        })
      },
      validateRes(formName) {
        return new Promise((resolve) => {
          this.$refs[formName].validate(valid => {
            resolve(valid)
          })
        })
      }
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #financeBind
    .bank_card
      width:300px
      height:200px
    .user_info
      setMiddle()
      .text_info
        ml(10px)
        setColumn()
        // span
        //   mb(10px)
    .bindCard_dialog, .bindThird_dialog
      padding:0 20px
      .el-form.single_form
        center()
        .el-form-item
          setMiddle()
          padding-top:20px
    .btn_wrap
      center()
      padt(50px)
    .send_msg
      center()
      line-height: 20px
      mb(30px)
      color(#aaa)
    .top_part
      setBetween()
      >div, >ul
        border:1px solid #ededed
        height:200px
      .balance
        relative()
        width: 30%
        center()
        padt(14px)
        >div
          padding: 0 18px
          setStart()
          span
            mr(10px)
        .balance_money
          padding:15px
          setMiddle()
          bgColor(#F7F9FA)
          li
            width:70%
            setColumn()
            justify-content: flex-start
            align-items: center
            height:110px
            &:first-child
              borr()
            span
              margin: 10px 0
            .err_color
              fn(20px)
            i
              fn(12px)
        .balance_btn
          setMiddle()
          width:100%
          >li
            border-bottom:0
            vertical(40px)
            width:50%
      .setting
        width:69%
        padding:40px 90px
        li
          setBetween()
          &:first-child
            mb(50px)
          p
            setStart()
            span
              mr(20px)
              fn(30px)
            i
              fn(16px)
    .bind_part
      >li
        setAround()
        padding:10px
        center()
      .bind_btn
        vertical(180px)
        width:25%
        margin:auto
        cursor()
        border_()
        fn(16px)
        border-style:dashed
        boxShadow(0px 0px 10px 1px #eee)

    .dialog_wrap
      flex_()
      margin:auto
      padt(20px)
      width: 90%
      flex-direction:column
      .bindThird_form
        setColumn()
        .el-form
          inline()
          margin:auto
    .el-form-item
      block()
      setStart()
      .el-input
        width:180px
    .recharge_bind
      .recharge_first
        center()
        .self_amount
          display:block
        .el-input
          ml(20px)
          width:100px
      .recharge_two
        .top
          setColumn()
          .recharge_left
            setColumn()
            center()
            img
              margin:10px auto
          .recharge_right
            padding:20px
            mt(20px)
            bgColor(#eee)
            setMiddle()
            fn(12px)
            >div
              ul
                li
                  margin:8px 0
                  span
                    inline()
                    width:120px
              .tips
                mt(10px)
                div
                  mt(10px)
                  color()
                  padding:10px
                  bgColor(warn_color)
        .tow_btns
          mt(20px)
    .withdraw_dialog
      .verify_input
        width:200px
</style>