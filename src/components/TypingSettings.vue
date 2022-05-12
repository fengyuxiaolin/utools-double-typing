<template>
  <el-row :gutter="2">
    <el-col :span="4">
      <el-select placeholder="双拼方案" :teleported="false" popper-class="schemeSelect"
        v-model="configPage.settings.schemeName">
        <el-button @click="addNewScheme">添加新方案</el-button>
        <el-divider border-style="dashed" />
        <el-option-group v-for="schemeGroup in schemeGroups" :key="schemeGroup" :label="schemeGroup.groupName">
          <el-option v-for="scheme in schemeGroup.schemeList" :key="scheme" :label="scheme" :value="scheme" />
        </el-option-group>
      </el-select>
    </el-col>
    <el-col :span="4">
      <el-select placeholder="练习模式" :teleported="false" popper-class="schemeSelect"
        v-model="configPage.settings.typingModel" @change="typingWayChange">
        <el-option-group label="单字练习">
          <el-option label="顺序练习" value="wordOrder" />
          <el-option label="随机练习" value="wordRandom" />
        </el-option-group>
        <el-option-group label="短文练习">
          <el-option label="中文输入" value="chineseTyping" />
          <el-option label="双拼输入" value="doubleTyping" disabled />
        </el-option-group>
      </el-select>
    </el-col>
    <el-col v-if="configPage.settings.typingWay.toLowerCase() == 'wordtyping'" :span="4">
      <el-switch active-text="键位图" v-model="configPage.settings.keyMapSwitch" />
    </el-col>
    <el-col v-if="configPage.settings.typingWay.toLowerCase() == 'wordtyping'" :span="4">
      <el-switch active-text="键位提示" v-model="configPage.settings.keyMapTipsSwitch" />
    </el-col>
    <el-col v-if="configPage.settings.typingWay.toLowerCase() == 'wordtyping'" :span="4">
      <el-switch active-text="实时按键" v-model="configPage.settings.keyDownTipsSwitch" />
    </el-col>
  </el-row>
  <el-button class="menuButton" @click="toOpenContextmenu">
    <el-icon :size="18">
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ba633cb8="">
        <path fill="currentColor"
          d="M160 448a32 32 0 0 1-32-32V160.064a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V416a32 32 0 0 1-32 32H160zm448 0a32 32 0 0 1-32-32V160.064a32 32 0 0 1 32-32h255.936a32 32 0 0 1 32 32V416a32 32 0 0 1-32 32H608zM160 896a32 32 0 0 1-32-32V608a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32H160zm448 0a32 32 0 0 1-32-32V608a32 32 0 0 1 32-32h255.936a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32H608z">
        </path>
      </svg>
    </el-icon>
  </el-button>
</template>

<script setup>
// 获取父组件传入的值
const props = defineProps(["configDb", "configPage"]);
const emit = defineEmits(["addNewScheme", "changePage", "clickContextButton"]);

const configPage = props.configPage, // 设置
  configDb = props.configDb, // 数据库
  schemeGroups = configPage.schemeGroups; // 方案分组信息

if (configPage.settings.keyMapSwitch === undefined) {
  configDb.data.settings.keyMapSwitch = true;
  configDb.data.settings.keyMapTipsSwitch = true;
  configDb.data.settings.keyDownTipsSwitch = true;
  updateUtoolsDB(configDb);
  configPage.settings.keyMapSwitch = true;
  configPage.settings.keyMapTipsSwitch = true;
  configPage.settings.keyDownTipsSwitch = true;
}
function addNewScheme () {
  emit("addNewScheme");
}
// 练习模式改变时, 如果是短文练习, 则切打字页面为短文练习, 如果是单字练习, 则切打字页面为单字练习
function typingWayChange () {
  if (
    configPage.settings.typingModel === "wordOrder" ||
    configPage.settings.typingModel === "wordRandom"
  ) {
    emit("changePage", "WordTyping");
  } else if (
    configPage.settings.typingModel === "doubleTyping" ||
    configPage.settings.typingModel === "chineseTyping"
  ) {
    emit("changePage", "ArtiTyping");
  }
}

// 打开上下文菜单
function toOpenContextmenu (e) {
  emit('clickContextButton', e);
}
</script>

<style scoped="scoped">
.el-row {
  width: 100%;
}
.el-select {
  width: 100px;
}
:deep(.schemeSelect) {
  background-color: var(--selectOptionBackColor);
}
.el-select:deep(.el-input__inner) {
  color: var(--fontColor);
  text-align: right;
  box-shadow: none;
}
.el-scrollbar .el-button {
  padding: 0 20%;
  margin-top: -4px;
  background-color: var(--selectOptionBackColor);
  border: none;
  color: #00b6c9;
}
.el-select-dropdown__item {
  color: var(--fontColor);
}
.el-select-dropdown__item.selected {
  color: var(--el-color-success);
}
.el-scrollbar .el-button:hover {
  color: #0097a7;
  background-color: var(--selectAddButtonBackColor);
}
.el-select-dropdown__item.selected {
  background-color: #0000;
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
  background-color: #aaaa;
}
.el-select-dropdown__item.is-disabled.hover,
.el-select-dropdown__item.is-disabled:hover {
  background-color: #0000;
}
.el-divider--horizontal {
  margin: 0;
}
</style>
