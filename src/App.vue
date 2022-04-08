<template>
  <el-header
    ><component
      :is="settings"
      :configDb="configDb"
      :configPage="configPage"
      @addNewScheme="createScheme"
      @changePage="changePage"
    ></component
  ></el-header>
  <transition name="slide-fade">
    <el-main
      ><component
        :is="main"
        :configDb="configDb"
        :configPage="configPage"
      ></component
    ></el-main>
  </transition>
  <el-dialog v-model="addNewScheme" title="自定义方案" width="720px" draggable>
    <NewSchemeForm
      :configPage="newSchemeConfig"
      :configDb="configDb"
      @addNewScheme="offAddNewScheme"
    />
    <WordTyping :configPage="newSchemeConfig" />
    <span class="tips"
      >tips:&nbsp;请为每个音节设置对应按键, 不设置会自动尝试绑定对应按键,
      不建议设置过于复杂的方案</span
    >
  </el-dialog>
</template>

<script>
import WordTyping from "./components/WordTyping.vue";
import ArtiTyping from "./components/ArtiTyping.vue";
import TypingSettings from "./components/TypingSettings.vue";

export default {
  data() {
    return {
      configDb: {},
      configPage: {},
      newSchemeConfig: {},
      addNewScheme: false,
    };
  },
  methods: {
    // 切换打字页面的方法
    changePage(page) {
      this.configDb.data.settings.typingWay = page;
    },
    // 关闭新建方案的弹窗
    offAddNewScheme(val) {
      console.log(val);
      this.configPage = JSON.parse(JSON.stringify(this.configDb.data));
      let tv = this.configDb.data?.settings?.typingWay;
      this.configDb.data.settings.typingWay = "";
      setTimeout(() => {
        this.configDb.data.settings.typingWay = tv;
      }, 1);

      this.addNewScheme = false;
    },
    // 新建方案
    createScheme() {
      this.newSchemeConfig = JSON.parse(JSON.stringify(this.configDb.data));
      this.newSchemeConfig.settings.schemeName = "";
      this.addNewScheme = true;
    },
  },
  computed: {
    settings() {
      if (this.configDb.data) {
        return "TypingSettings";
      }
    },
    main() {
      return this.configDb.data?.settings?.typingWay;
    },
  },
  watch: {},
  components: {
    WordTyping,
    TypingSettings,
    ArtiTyping,
  },
  mounted() {
    // 等待utools挂载~
    let waitReoad = setInterval(() => {
      try {
        this.configDb = getDtConfig();
        clearInterval(waitReoad);
        this.configPage = JSON.parse(JSON.stringify(this.configDb.data));
        console.log("article_1: ", getDataById("article_1"));
      } catch (err) {
        console.error(err);
      }
    }, 10);
  },
};
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

:root {
  --backgroundColor: #eeeeee;
  --fontColor: #141414;

  --selectOptionBackColor: #ffffff;
  --selectAddButtonBackColor: #e6f2e6;

  --boxBottom: 0px -2px 0px #0097a7 inset;
  --buttonBackColor: #d3dce6;
  --trueKeyBackColor: #bed5be;
  --pressKeyBackColor: #b3d6e3;
  --keyMapShengColor: #12a9e0;
  --buttonFontColor: #585a5f;

  --resetButtonBackColor: #f8f8f8;
}

@media (prefers-color-scheme: dark) {
  :root {
    --backgroundColor: #333333;
    --fontColor: #adadad;

    --selectOptionBackColor: #424242;
    --selectAddButtonBackColor: #424242;

    --trueKeyBackColor: #415c41;
    --pressKeyBackColor: #54523d;
    --buttonBackColor: #333333;
    --keyMapShengColor: #ad593a;
    --buttonFontColor: #adadad;
  }
}

#app {
  background-color: var(--backgroundColor);
  height: 100%;
  color: var(--fontColor);
}

.el-input__inner {
  background-color: var(--backgroundColor);
}

.el-header {
  display: flex;
  justify-content: center;
}

.el-dialog {
  margin: 3% auto;
}
.el-dialog__header,
.el-dialog__body,
.el-dialog__headerbtn {
  background-color: var(--backgroundColor);
}
.el-dialog__header {
  margin: 0;
}
.el-dialog__title {
  color: var(--fontColor);
}
.tips {
  font-size: 12px;
  position: absolute;
  bottom: 4px;
  left: 10px;
}
</style>
