<template>
  <div class="card_wrap">
    <el-button type="primary" class="icon slider_btn" @click="liMove(-1)" :disabled="activeIndex === 0">&#xe604;</el-button>
    <div class="list_wrap" :id="type">
      <ul class="bond_list card_bind" :style="ulStyle">
        <li v-for="(item, index) in handleList" :style="{width:liWidth}" :key="index">
          <div class="bank_icon" :style="{'background': !item.account ? 'transparent' : getBankProperty(item.account, 'bg')}" :class="{'noBg': !item.account}" v-if="type === 'bank'">
            <template v-if="item.account">
              <svg class="icon svg-icon" aria-hidden="true">
                <use :xlink:href="getBankProperty(item.account, 'icon')"></use>
              </svg>
              <div class="bank_detail">
                <span>{{formatAccount(item.account)}}</span>
                <i>{{getBankProperty(item.account, 'name')}}</i>
              </div>
              <img width="150px" height="100%" class="bg_image" src="../../../assets/images/bg.png"/>
              <div class="unbind_account" v-if="item.account">
                <div @click="deleteBind(item)">
                  <i class="icon">&#xe6c2;</i>
                  <span>解绑银行卡</span>
                </div>
              </div>
            </template>
          </div>
          <div class="third_detail zfb" :class="{'noBg': !item.account}" v-if="type === 'zfb'">
            <div class="accont_info">
              <span>支付宝</span>
              <i>{{item.account}}</i>
            </div>
            <span class="icon">&#xe606;</span>
            <div class="unbind_account" v-if="item.account">
              <div @click="deleteBind(item)">
                <i class="icon">&#xe6c2;</i>
                <span>解绑支付宝</span>
              </div>
            </div>
          </div>
          <div class="third_detail wx" :class="{'noBg': !item.account}" v-if="type === 'wx'">
            <div class="accont_info">
              <span>微信</span>
              <i>{{item.realName}}</i>
            </div>
            <span class="icon">&#xe64b;</span>
            <div class="unbind_account" v-if="item.account">
              <div @click="deleteBind(item)">
                <i class="icon">&#xe6c2;</i>
                <span>解绑微信</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <el-button type="primary" @click="liMove(1)" :disabled="activeIndex >= handleList.length - 2" class="icon slider_btn">&#xe648;</el-button>
  </div>
</template>
<script>
  export default {
    name: '',
    data() {
      return {
        ulStyle: {},
        activeIndex: 0,
        liWidth: 0,
        handleList: [],
        areaWidth: 0
      }
    },
    props: {
      list: {
        type: Array,
        default: () => []
      },
      type: {
        type: String,
        default: 'zfb'
      }
    },
    watch: {
      list() {
        this.handleList = this.list
        if (this.list.length === 1) {
          this.handleList.push({})
        }
        if (this.list.length === 0) {
          this.handleList = [{}, {}]
        }
      }
    },
    // created() {
    //   window.bankcardCheck || this._loadJs(`${process.env.CHILD_ROUTE}/static/js/bankcardCheck.js`, () => {})
    // },
    mounted() {
      this.calcWith()
      this.$bus.$on('resize', () => {
        this.calcWith()
        this.liMove(0)
      })
      window.onresize = () => {
        this.$bus.$emit('resize')
      }
    },
    components: {},
    methods: {
      calcWith() {
        const elem = document.getElementById(this.type)
        if (elem) {
          this.areaWidth = elem.offsetWidth
          this.liWidth = this.areaWidth * 0.5 + 'px'
        }
      },
      // 显示移动
      liMove(value) { 
        value < 0 ? this.activeIndex-- : value > 0 ? this.activeIndex++ : (this.activeIndex === 0)
        this.ulStyle = {marginLeft: -this.areaWidth / 2 * this.activeIndex + 'px', transition: 'margin-left 0.5s'}
      },
      getBankProperty(account, property) {
        const obj = bankcardCheck(account)
        if (obj) {
          if (obj.bankName) {
            const searchObj = this._bankLogoSearch(obj.bankName)
            if (property === 'bg') return searchObj.bg
            if (property === 'icon') return searchObj.icon
            if (property === 'name') return searchObj.bankName
          }
        } else {
          if (property === 'bg') return 'skyblue'
          if (property === 'icon') return '#iconreport-qt'
          if (property === 'name') return '其它银行'
        }
        return ''
      },
      formatAccount(account) {
        return account ? `************ ${account.substring(account.length - 4)}` : '**************'
      },
      deleteBind(item) {
        this.$confirm('确认解除绑定吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          this.$postJson(this._basePath.ajaxUnbindAccount, {id: item.id}).then(res => {
            if (res.success) {
              this.$message({
                message: '解除成功',
                type: 'success'
              })
              this.$emit('getBindList')
            }
          })
        })
      },
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  .card_wrap
    width:75%
    setAround()
    .slider_btn
      square(50px)
      padding:0
      color()
      fn(20px)
      radius(50%)
      &:first-child
        ml(20px)
      &:last-child
        mr(20px)
    .list_wrap
      overflow:hidden
      width:calc(100% - 150px)
      height:180px
      .bond_list
        fn(0)
        white-space:nowrap
        &.wx_bind
          li
            background: linear-gradient(to right, #7BD39F, #52B776)
        &.alipay_bind
          li
            background: linear-gradient(to right, #09A1E8, #09A1E8)
        li
          height:180px
          overflow hidden
          inline()
          relative()
          padding:0 10px
          box-sizing:border-box
          fn(14px)
          radius(3px)
          >div
            height: 100%
            border:1px dashed #ddd
            boxShadow(0px 0px 10px 1px #eee)
            &:hover
              .unbind_account
                visibility: visible
            .unbind_account
              absolute()
              visibility:hidden
              bottom:0
              left:-0.5px
              right:0
              bgColor(#ddd)
              color(text_color)
              vertical(40px)
              setMiddle()
              >div
                cursor()
                .icon
                  mr(5px)
          .bank_icon
            setStart()
            relative()
            padding:20px
            .bg_image
              absolute()
              top:0
              right:0
            .svg-icon
              bgColor()
              square(40px)
              radius(50%)
              fn(40px)
              mr(10px)
            .bank_detail
              color()
              setColumn()
              align-items:flex-start
              i
                mt(10px)
          .third_detail
            relative()
            color()
            setAround()
            &.zfb
              background: linear-gradient(360deg,#09A1E8 0%,#09A1E8 100%)
            &.wx
              background: linear-gradient(to left,#52B776 0%,#7BD39F 100%)
            &.noBg
              background:none
            .accont_info
              setColumn()
              align-items:flex-start
              i
                max-width:200px
                mt(20px)
                alignL()
            >.icon
              fn(50px)
            
</style>