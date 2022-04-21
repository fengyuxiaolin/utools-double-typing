<template>
  <!-- 左侧小按钮打开抽屉 -->
  <!-- 小按钮hover时提示 "全部短文" -->
  <el-tooltip class="littleButton" content="全部短文" effect="customized" placement="right">
    <el-button @click="openAllArticleBox" class="littleButton"> > </el-button>
  </el-tooltip>
  <!-- 从左至右的抽屉显示所有短文 -->
  <el-drawer v-model="allArticleBox" direction="ltr" :show-close="false">
    <!-- 自定义title -->
    <template #title>
      <div class="drawerTitle">
        <span>选择一篇短文</span>
        <el-tooltip content="添加短文">
          <el-button @click="addArticle" class="addArticleButton">
            <el-icon>
              <plus class="plusIcon" />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </template>
    <el-row>
      <el-col :span="24">
        <el-input v-model="searchArticleTitle" placeholder="搜索短文" @keyup.enter="searchArticle"></el-input>
      </el-col>
    </el-row>
    <!-- 一个简单无限滚动 -->
    <ul v-infinite-scroll="loadMoreArticle" id="allArticleList" :infinite-scroll-delay="300">
      <li v-for="article in allArticleList" :key="article" @click="openArticle(article.articleId)">
        {{ article.articleName }}
      </li>
    </ul>
  </el-drawer>
  <AddArticle :openAddArticle="openAddArticle" :configDb="configDb" :configPage="configPage" />
  <!-- 页面显示当前短文 -->
  <div id="nowArticleBox">
    <!-- 上面显示原文 -->
    <el-scrollbar id="originArticle" ref='originArticleBar'>
      <!-- 已输入的部分 -->
      <span v-for="(font, i) in nowTypingArticle" :key="i">
        <!-- 与原文进行比较 -->
        <span v-if="nowArticle.article[i] == font" class="trueFont">{{ nowArticle.article[i] }}</span>
        <!-- 与原文不同 -->
        <span v-else class="falseFont">{{ nowArticle.article[i] }}</span>
      </span>
      <span>{{ nowArticle.article.substring(nowTypingArticle.length) }}</span>
    </el-scrollbar>
    <!-- 下面显示文本域 -->
    <div id="typingArticle">
      <textarea class="textarea" type="text" v-model="nowTypingArticle" @input="textAreaInput"
        @keydown="canIChangeRow" />
      <div class="textarea">hello</div>
    </div>
    <!-- 右侧面板 -->
  </div>
</template>

<script setup>
import { ref } from "vue";
// 获取父组件传入的数据
const props = defineProps(["configDb", "configPage"]);
// 声明页面所需的变量
let configDb = props.configDb, // 数据库
  configPage = ref(props.configPage), // 页面设置
  allArticleBox = ref(false), // 所有短文抽屉开关
  openAddArticle = ref({ open: false }), // 添加短文开关
  allArticleList = ref([]), // 所有短文列表
  searchArticleTitle = ref(""), // 搜索短文标题
  nowLoad = 0, // 当前加载的短文数量
  nowArticleDb = ref({}), // 当前短文数据库
  nowArticle = ref({ article: "" }), // 当前打开的短文
  divHeight = 0, // 隐藏输入div的高度
  nowInputRow = 0, // 上一行的top值
  originArticleBar = ref(null), // 原文滚动条
  canChangeRow = false, // 是否可换行按键

  nowTypingArticle = ref(""); // 当前输入的短文的文本

//初始化页面
initPage();

// 初始化页面
function initPage () {
  // 打开抽屉, 选择一个短文
  openAllArticleBox();
  // 初始短文列表，获取20条短文
  initAllArticleList();
}

// 从页面设置中获取20条短文
function initAllArticleList () {
  let newArticleList = configPage.value.articles.slice(0, 15);
  allArticleList.value.push(...newArticleList);
  nowLoad = 15;
}

// 加载更多短文
function loadMoreArticle () {
  console.log('load: ', configPage.value.articles);
  let newArticleList = configPage.value.articles.slice(nowLoad, nowLoad + 5);
  allArticleList.value.push(...newArticleList);
  nowLoad = nowLoad + 5 > configPage.value.articles.length ? configPage.value.articles.length : 5;
}

// 搜索短文
function searchArticle (e) {
  console.log('searchArticle: ', e);
}

// 打开创建短文弹窗
function addArticle () {
  console.log('open: ', openAddArticle);
  openAddArticle.value.open = true;
}

// 打开一篇短文
function openArticle (articleId) {
  // 获取id为articleId的短文
  nowArticleDb.value = getDataById(articleId);
  nowArticle.value = nowArticleDb.value.data;
  // 关闭所有短文抽屉
  allArticleBox.value = false;
}

// 打开左侧抽屉
function openAllArticleBox () {
  allArticleBox.value = true;
}

// 文本域输入事件
function textAreaInput (e) {
  // 如果输入的最后一个内容是中文，则允许换行
  if (isChinese(e.target.value.substring(e.target.value.length - 1))) {
    canChangeRow = true;
  }
  // 将输入的内容写入#typingArticle div.textarea
  document.querySelector("#typingArticle div.textarea").innerText = e.target.value;
  // 获取当前div高度
  const newDivHeight = document.querySelector("#typingArticle div.textarea").clientHeight;
  // 如果高度发生变化，则调用setScrollTop方法滚动原文
  if (nowInputRow === 0) {
    nowInputRow++;
  }
  if (divHeight === 0) {
    divHeight = newDivHeight;
  } else if (!canChangeRow || newDivHeight === divHeight * nowInputRow) {
    return;
  } else if (nowInputRow === 1 && newDivHeight > divHeight) {
    originArticleBar.value.setScrollTop(newDivHeight - divHeight - divHeight / 2);
    nowInputRow++;
  } else {
    originArticleBar.value.setScrollTop(newDivHeight - divHeight);
    newDivHeight > divHeight * nowInputRow ? nowInputRow++ : nowInputRow--;
  }
}

// 判断是否可换行
function canIChangeRow (e) {
  if (isChineseInput(e)) {
    canChangeRow = !isInMainKey(e);
  } else {
    canChangeRow = true;
  }

}

// 正则校验中文
function isChinese (str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 判断是否输入中文
function isChineseInput (e) {
  return e.keyCode === 229
}

// 判断是否在主键区
function isInMainKey (e) {
  return e.code.toLowerCase().indexOf("key") !== -1
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

.el-drawer__header {
  margin: 0;
}
.el-drawer__header:hover {
  cursor: default;
}
ul {
  margin: 0;
  padding: 0;
}
#allArticleList li {
  cursor: pointer;
  padding: 12px;
  list-style: none;
}
#allArticleList li:hover {
  cursor: pointer;
  /* 背景色 */
  background-color: var(--resetButtonBackColor);
}

#originArticle .trueFont {
  color: var(--trueFontColor);
}
#originArticle .falseFont {
  color: var(--falseFontColor);
}

#originArticle {
  padding: 10px;
  position: absolute;
  top: 48px;
  left: 80px;
  width: 60%;
  height: 260px;
  font-size: 18px;
  color: var(--fontColor);
  background-color: var(--articleBackColor);
  box-sizing: border-box;
  font-family: monospace;
}
#typingArticle {
  padding: 10px;
  position: absolute;
  top: 308px;
  left: 80px;
  width: 60%;
  height: 180px;
  box-sizing: border-box;
  padding: 10px 0;
}
#typingArticle .textarea {
  box-sizing: border-box;
  padding: 0 10px;
  border: 1px solid var(--fontColor);
  outline: none;
  resize: none;
  font-size: 18px;
  color: var(--fontColor);
  background-color: var(--resetButtonBackColor);
  font-family: monospace;
}
#typingArticle textarea.textarea {
  width: 100%;
  height: 100%;
}
#typingArticle div.textarea {
  display: inline-block;
  visibility: hidden;
}

.addArticleButton {
  padding: 0;
  border: 0;
  height: 1em;
  margin-right: 12px;
  float: right;
}
.addArticleButton:hover {
  cursor: pointer;
  background-color: #fff0;
}
</style>