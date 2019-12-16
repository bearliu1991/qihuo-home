<template>
  <div id="home">
    <StallIndex v-if="userType === 1"></StallIndex>
  </div>
</template>
<script>
  import StallIndex from './stallManage'
  export default {
    name: '',
    data() {
      return {
        userType: -1,
        datas: [
          {label: '商户名称', value: '胖胖家'},
          {label: '当前所在', value: '档口管家'},
          {label: '上次登录时间', value: '2019-1-1'},
          {label: '网站域名', value: 'qhgj888.com'},
          {label: '平台版本', value: 'QHGJ V1.0'},
        ]
      }
    },
    created() {
      this.userType = this.getCookie('userType') - 0
    },
    components: {StallIndex},
    methods: {
      
    }
  }
</script>
<style lang="stylus">
  @import '~@/assets/css/index'
  #home
    padding:40px
    .home_cont
      center()
      fn(30px)
      margin:50px 0
    .order_info
      h3
        fn(20px)
      ul
        setAround()
        li
          setBetween()
          .icon
            fn(30px)
          .order_route
            setColumn()
            p
              border-bottom: 1px solid #ddd
            i
              color(err_text)
    .stage_info
      li
        padding: 0 20px
        vertical(50px)
        border_()
        &:first-child
          bgColor(#999)
          color()
</style>