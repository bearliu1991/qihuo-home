<template>
  <div id="marketing_center">
    <ul v-if="!secShow" class="marketing_ul">
      <li>
        <div class="tail_introduce">
          <h2>尾货处理</h2>
          <div class="tail_rule">{{tailRule.tailHandleRule}}</div>
        </div>
        <el-button type="primary" @click="registerFor">立即报名</el-button>
      </li>
    </ul>
    <secondary v-model="secShow">
      <TailGoods :tailRule="tailRule" @refreshRule="getRule" v-if="secShow"></TailGoods>
    </secondary>
  </div>
</template>
<script>
  import TailGoods from './tailGoods'
  export default {
    name: '',
    data() {
      return {
        secShow: false,
        tailRule: {},
      }
    },
    created() {
      this.getRule()
    },
    components: {TailGoods},
    methods: {
      registerFor() {
        this.secShow = true
      },
      getRule() {
        this.$postJson(this._basePath.ajaxStallTailRuleGet).then(res => {
          res.success && (this.tailRule = res.data)
        })
      },
    }
  }
</script>
<style lang="stylus" scoped>
  @import '~@/assets/css/index'
  #marketing_center
    .marketing_ul
      >li
        setBetween()
        padding:20px
        borb(1px solid #ddd)
        .tail_introduce
          setColumn()
          mr(100px)
          h2
            fn(20px)
            mb(20px)
          .tail_rule
            line-height:20px
</style>