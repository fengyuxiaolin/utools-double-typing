<template>
  <!-- 左侧小按钮打开抽屉 -->
  <!-- 小按钮hover时提示 "全部短文" -->
  <el-tooltip
    class="littleButton"
    content="全部短文"
    effect="customized"
    placement="right"
  >
    <el-button @click="openAllArticleBox" class="littleButton"> > </el-button>
  </el-tooltip>
  <!-- 从左至右的抽屉显示所有短文 -->
  <el-drawer v-model="allArticleBox" direction="ltr" :with-header="false">
    <!-- 一个简单无限滚动 -->
    <ul v-infinite-scroll="load">
      <li v-for="article in allArticleList" :key="article">
        <el-link :href="article.url" target="_blank">
          {{ article.title }}
        </el-link>
      </li>
    </ul>
  </el-drawer>
</template>

<script setup>
import { ref } from "vue";
// 获取父组件传入的值
const props = defineProps(["configDb", "configPage"]);
// 声明页面所需的变量
let configDb = props.configDb, // 数据库
  configPage = ref(props.configPage), // 页面设置
  allArticleBox = ref(false), // 所有短文抽屉开关
  allArticleList = ref([]); // 所有短文列表

// 打开左侧抽屉
function openAllArticleBox() {
  allArticleBox.value = true;
}
// 加载更多短文
function load() {
  // 如果没有更多短文了, 则不再加载
  if (allArticleList.value.length >= configPage.allArticleCount) {
    return;
  }
  // 加载更多短文
  const start = allArticleList.value.length;
  const end = start + 20;
  const newArticleList = configPage.allArticleList.slice(start, end);
  allArticleList.value = allArticleList.value.concat(newArticleList);
}
</script>

<style scope>
/* 垂直居中偏上, 水平最左, 小圆角, 合适的颜色 */
.littleButton {
  position: absolute;
  padding: 0;
  top: 40%;
  left: 10px;
  background-color: var(--resetButtonBackColor);
  border-radius: 2px;
  width: 25px;
  height: 40px;
}
/* hover不变色 */
.littleButton:hover {
  background-color: var(--resetButtonBackColor);
}
/* 提示框颜色 */
.el-popper.is-customized,
.el-popper.is-customized .el-popper__arrow::before {
  background-color: var(--resetButtonBackColor);
}
</style>