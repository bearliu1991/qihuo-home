<template>
  <div>
    <el-menu class="navbar" mode="horizontal">
      <span
        class="icon hamburger-container"
        @click="toggleSideBar"
        :class="[sidebar.opened && 'inactive']"
      >&#xe610;</span>
      <!-- &#xe667; -->
      <nx-breadcrumb class="breadcrumb-container"></nx-breadcrumb>
      <div class="right-menu">
        <el-dropdown class="avatar-container right-menu-item" trigger="click">
          <div class="avatar-wrapper set_middle">
            <!-- <img class="user-avatar" src="/static/img/home.png"> -->
            <svg class="icon svg-icon" aria-hidden="true">
              <use xlink:href="#iconyonghu" />
            </svg>
            <span class="phone">{{getCookie('phone')}}</span>
            <i class="el-icon-caret-bottom"></i>
          </div>
          <!-- <div class="set_start">
            
          </div>-->
          <el-dropdown-menu slot="dropdown">
            <!-- <router-link  v-if="userType - 0 === 1" to="/setting">
              <el-dropdown-item>
                设置密码
              </el-dropdown-item>
            </router-link>-->
            <el-dropdown-item v-if="userType === 1" style="padding: 0 0">
              <div
                @click="pswDialog = true"
                style="text-align:center; width:100%;padding:0 20px; line-height:36px"
              >设置密码</div>
            </el-dropdown-item>
            <!-- <a target='_blank' href="https://github.com/mgbq/nxAdmin-template/">
              <el-dropdown-item>
                github地址
              </el-dropdown-item>
            </a>-->
            <el-dropdown-item style="padding: 0 0">
              <span @click="logout" style="text-align:center; display:block; padding:0 20px">退出</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="fr stall_aplly">
        <el-select v-model="stallId" @change="selectChange" size="mini" v-if="userType === 1">
          <el-option
            v-for="(item, index) in stallList"
            :key="index"
            :value="item.id"
            :label="item.name"
          ></el-option>
        </el-select>
        <!-- <el-button type="primary" size="mini" v-if="userType - 0 === 1" @click="dialogShow = true">申请档口</el-button> -->
      </div>
    </el-menu>
    <el-dialog title="重置密码" :visible.sync="pswDialog" center width="600px">
      <PswSet v-if="pswDialog" @close="pswDialog = false"></PswSet>
    </el-dialog>
    <el-dialog title="申请档口" :visible.sync="dialogShow" center width="600px">
      <el-form
        :model="editForm"
        label-width="100px"
        style="width: 80%;margin:auto"
        :rules="editFormRules"
        ref="editForm"
      >
        <el-form-item label="申请人姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="如: 刘XXX"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="联系地址" prop="city">
          <el-cascader
            expand-trigger="hover"
            :options="citys"
            :props="cascaderProps"
            v-model="editForm.city"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="betterAddress">
          <el-input style="margin-top:10px" type="textarea" v-model="editForm.betterAddress"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogShow=false">取消</el-button>
        <el-button type="primary" @click="applyStall">添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import nxBreadcrumb from "@/components/nx-breadcrumb";
import PswSet from "@/views/stallManage/setting/pswSet";
export default {
  name: "navBar",
  data() {
    return {
      stallId: 0,
      userType: -1,
      pswDialog: false,
      dialogShow: false,
      stallList: [],
      cascaderProps: { value: "name", label: "name" },
      citys: [],
      editFormRules: {
        name: [
          {
            required: true,
            validator: this.noEmpty,
            message: "请输入档口名",
            trigger: "blur"
          }
        ],
        phone: [
          {
            required: true,
            validator: this.noEmpty,
            message: "手机号不能为空",
            trigger: "blur"
          },
          {
            required: true,
            validator: this.mobileReg,
            message: "请输入正确的手机号",
            trigger: "blur"
          }
        ],
        city: [
          {
            required: true,
            validator: this.noEmptyArr,
            message: "请选择省市区",
            trigger: "blur"
          }
        ],
        betterAddress: [
          {
            required: true,
            validator: this.noEmpty,
            message: "请输入详细地址",
            trigger: "blur"
          }
        ]
      },
      editForm: {
        areaId: "",
        betterAddress: "",
        buildingId: 0,
        businessHours: "",
        businessLicense: "",
        businessScopeCode: "",
        cityId: "",
        code: "",
        floorNum: 0,
        id: 0,
        location: "",
        machineCode: "",
        marketId: 0,
        name: "",
        phone: "",
        provinceId: "",
        shopPicPath: "",
        status: 0,
        userId: 0
      }
    };
  },
  components: {
    nxBreadcrumb,
    PswSet
  },
  computed: {
    ...mapGetters(["sidebar", "name", "avatar", "userInfo"])
  },
  created() {
    this.getStalls()
  },
  // mounted() {
  //   if (window.citys) {
  //     this.citys = window.citys
  //     this.getStalls()
  //   } else {
  //     this._loadJs(`${process.env.CHILD_ROUTE}/static/js/city.js`, () => {
  //       this.citys = window.citys
  //       this.getStalls()
  //     })
  //   }
  // },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("ToggleSideBar");
    },
    logout() {
      this.$store.dispatch("LogOut").then(res => {
        // if (res.code === "-3") {
        //   this.$alert(res.msg, {
        //     callback: action => {
        //       this.logoutClearCookie()
        //       this.$router.replace("/login");
        //     }
        //   });
        //   return;
        // }
        if (res.success) {
          this.logoutClearCookie()
          this.$bus.$emit('logout')
          this.$router.replace("/login");
        }
        // location.reload()
      });
    },
    getStalls() {
      this.stallId = this.getCookie("stallId") - 0;
      const userId = this.getCookie("userId");
      this.userType = this.getCookie("userType") - 0;

      if (this.userType === 1) {
        this.$postJson(this._basePath.ajaxStallList, { userId: userId }).then(
          res => {
            if (res.success) {
              this.stallList = res.data ? res.data : [];
              // 保存档口名称
              if (this.stallList && this.stallList instanceof Array) {
                this.stallList.filter(el => {
                  if (
                    el &&
                    el.id &&
                    this.getCookie("stallId") &&
                    el.id === +this.getCookie("stallId")
                  ) {
                    if (el.name) this.setCookie("stallName", el.name);
                  }
                });
              }
            }
          }
        );
      }
    },
    // 申请档口
    applyStall() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          const param = {
            userId: this.getCookie("userId"),
            name: this.editForm.name,
            phone: this.editForm.phone,
            provinceId: this.editForm.city[0],
            cityId: this.editForm.city[1],
            areaId: this.editForm.city[2],
            betterAddress: this.editForm.betterAddress
          };
          this.$post(this._basePath.ajaxStallSave, param).then(res => {
            if (res.success) {
              this.dialogShow = false;
            }
          });
        }
      });
    },
    // 切换档口
    selectChange(val) {
      this.$postJson(this._basePath.ajaxSelectStall, { stallId: val }).then(
        res => {
          if (res.success) {
            this.$message.success("切换成功")
            this.setCookie("stallId", val)
            this.setCookie("GQSJ", res.data.currentStallExpire)
            location.reload()
          } else {
            this.stallId = this.getCookie("stallId") - 0
          }
        }
      );
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 50px;
    height: 50px;
    font-size: 24px;
    float: left;
    padding: 0 10px;
    cursor: pointer;
  }
  .hamburger-container.inactive {
    transform: rotate(180deg);
  }
  .hamburger-container {
    transition: 0.38s;
    transform: rotate(0deg);
  }
  .breadcrumb-container {
    float: left;
  }
  .nx-help {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international {
      vertical-align: top;
    }
    .theme-switch {
      vertical-align: 15px;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        cursor: pointer;
        // margin-top: 5px;
        align-items: center;
        position: relative;
        .svg-icon {
          width: 30px;
          height: 30px;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .phone {
          margin-left: 5px;
          margin-right: 10px;
        }
        .el-icon-caret-bottom {
          // position: absolute;
          // right: -20px;
          // top: 10px;
          font-size: 12px;
        }
      }
    }
  }
  .stall_aplly {
    width: 200px;
    display: flex;
    align-items: center;
    margin-right: 20px;
    button {
      margin-left: 10px;
    }
  }
}
</style>
