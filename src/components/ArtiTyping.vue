<template>
  <!-- 左侧小按钮打开抽屉 -->
  <!-- 小按钮hover时提示 "全部短文" -->
  <el-tooltip class="littleButton" content="全部短文" effect="customized" placement="right">
    <el-button @click="openAllArticleBox" class="littleButton"> > </el-button>
  </el-tooltip>
  <!-- 从左至右的抽屉显示所有短文 -->
  <el-drawer v-model="allArticleBox" direction="ltr" :show-close="false" @closed="closeAllArticleBox">
    <!-- 自定义title -->
    <template #title>
      <div class="drawerTitle">
        <span>选择一篇短文</span>
        <el-tooltip content="添加短文">
          <el-button @click="addArticle" class="addArticleButton">
            <el-icon>
              <plus />
            </el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </template>
    <el-row>
      <el-col :span="24">
        <el-input v-model="searchArticleTitle" placeholder="搜索短文" @input="searchLikeArticle"
          @keyup.enter="searchArticle" autofocus ref="searchInputRef"></el-input>
      </el-col>
    </el-row>
    <!-- 一个简单无限滚动 -->
    <ul v-infinite-scroll="loadMoreArticle" id="allArticleList" :infinite-scroll-delay="300">
      <li v-for="article in allArticleList" :key="article" @click="openArticle(article.articleId)"
        @contextmenu="liRightClick(article)">
        {{ article.articleName }}
      </li>
    </ul>
  </el-drawer>

  <AddArticle :openAddArticle="openAddArticle" :configDb="configDb" :configPage="configPage" :initArticle='initArticle'
    @changeContextMenu='changeContextMenu' @initContextMenu='initContextMenu' />
  <UpdateArticle ref="updateArticleComp" :configPage='configPage' @changeContextMenu='changeContextMenu'
    @updateDialogClosed='updateDialogClosed' />
  <el-dialog v-model="delConfirm" title="确认删除" width="30%" draggable @closed="closeDel">
    <span v-if="checkedArticleName">确认要删除短文《{{checkedArticleName}}》吗?</span>
    <span v-else>未选择任何短文</span>
    <template #footer>
      <span class="dialog-footer" v-if="checkedArticleName">
        <el-button @click="delConfirm = false">取消</el-button>
        <el-button type="primary" @click="delAndClose">删除</el-button>
      </span>
      <span class="dialog-footer" v-else>
        <el-button @click="delConfirm = false">取消</el-button>
      </span>
    </template>
  </el-dialog>

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
      <textarea class="textarea" type="text" v-model="nowTypingArticle" @input="textAreaInput" @keydown="canIChangeRow"
        @keydown.tab="tabDown" @keydown.backspace="backspaceDown" ref="textAreaRef" />
      <div class="textarea"></div>
    </div>
    <!-- 右侧面板, 记录数据 -->
    <el-card class="rightPanel" shadow="always">
      <ArticleRightPanel :rightPanel='rightPanel' :nowArticle='nowArticle' :nowTypingArticle='nowTypingArticle' />
    </el-card>
    <!-- 完成练习 -->
    <el-dialog title="完成练习" v-model="rightPanel.typingEnd" width="30%" draggable>
      <p style="margin: -25px 10px 25px;">本文已完成</p>
      <span class="dialog-footer" style="float: right; position: relative; bottom: 10px">
        <el-button type="info" @click="rightPanel.typingEnd = false">ok</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
// 获取父组件传入的数据
const props = defineProps(["configDb", "configPage"]);
const emits = defineEmits(['addNewScheme', 'changeContextList']);
// 声明页面所需的变量
let configDb = props.configDb, // 数据库
  configPage = ref(props.configPage), // 页面设置
  allArticleBox = ref(false), // 所有短文抽屉开关
  openAddArticle = ref({ open: false }), // 添加短文开关
  allArticleList = ref([]), // 所有短文列表
  searchArticleTitle = ref(""), // 搜索短文标题
  nowLoad = 0, // 当前加载的短文数量
  nowArticleDb = ref({ id: '', data: '', _rev: '' }), // 当前短文数据库
  nowArticle = ref({ article: "", title: "", author: "" }), // 当前打开的短文
  nowArticleId = ref(""), // 当前打开的短文id
  rowHeight = 0, // 隐藏输入div的高度
  nowInputRow = 0, // 上一行的top值
  originArticleBar = ref(), // 原文滚动条
  canChangeRow = false, // 是否可换行按键
  rightPanel = ref({
    formData: {
      title: '',
      author: '',
      speed: "0字/分",
      correct: '100%',
      timer: '00:00:00',
      schedule: '0%',
      backSeveral: 0,
      errSeveral: 0
    },
    typingStart: false,
    typingInterval: null,
    typingEnd: false
  }), // 右侧面板
  contextList = ref([
    {
      label: '新建短文',
      click: () => {
        openAddArticle.value.open = true;
      }
    },
    {
      label: '修改短文',
      click: () => {
        updateArticle(nowArticleId.value);
      }
    },
    {
      label: '删除短文',
      click: () => {
        delArticle(nowArticleId.value);
      }
    },
    {
      label: '保存配置',
      click: saveConfig
    }
  ]),
  atcContextList = ref([
    {
      label: '新建短文',
      click: () => {
        openAddArticle.value.open = true;
      }
    },
    {
      label: '修改短文',
      click: updateArticle
    },
    {
      label: '删除短文',
      click: delArticle
    }
  ]),
  initContextList = atcContextList.value,
  checkedArticleId = '', // 当前右键点击的li的id
  checkedArticleName = ref(''), // 当前右键点击的li的标题
  initArticle = { init: initAllArticleList }, // 添加后初始化短文
  nowTypingArticle = ref(""),
  updateArticleComp = ref(),
  delConfirm = ref(false), // 当前输入的短文的文本
  textAreaRef = ref(), // 文本域的ref
  searchInputRef = ref(); // 搜索输入框的ref
let nowHei = ref(0)
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
  allArticleList.value = [];
  let newArticleList = configPage.value.articles.slice(0, 20);
  allArticleList.value.push(...newArticleList);
  nowLoad = 20;
}

// 加载更多短文
function loadMoreArticle () {
  let newArticleList = configPage.value.articles.slice(nowLoad, nowLoad + 5);
  allArticleList.value.push(...newArticleList);
  nowLoad = nowLoad + 5 > configPage.value.articles.length ? configPage.value.articles.length : nowLoad + 5;
}

// 模糊搜索
function searchLikeArticle (keyword) {
  // 如果清空了搜索关键词，则重新初始化短文列表
  if (!keyword) {
    initAllArticleList();
    return;
  }
  keyword = keyword.toLowerCase();
  allArticleList.value = [];
  // 先精确搜索, 并比对拼音首字母
  foreachSearchArticle(keyword, true);
  // 外层遍历关键词
  for (let key of keyword) {
    // 内层遍历所有短文搜索
    foreachSearchArticle(key, false);
  }
}

// 搜索短文
function searchArticle (e) {
  const keyword = e.target.value;
  // 如果清空了搜索关键词，则重新初始化短文列表
  if (!keyword) {
    initAllArticleList();
    return;
  }
  keyword = keyword.toLowerCase();
  allArticleList.value = [];
  // 遍历搜索
  foreachSearchArticle(keyword, true);
}

// 遍历搜索短文方法
function foreachSearchArticle (keyword, comparePy) {
  for (let article of configPage.value.articles) {
    if (allArticleList.value.indexOf(article) == -1) {
      if (article.articleName.indexOf(keyword) != -1) {
        allArticleList.value.push(article);
      } else if (comparePy) {
        // 获取标题拼音首字母(二维数组), 转为字符串无分隔符
        let py = toPinyinFirst(article.articleName).join('');
        console.log('py: ', py);
        if (py.indexOf(keyword) != -1) {
          allArticleList.value.push(article);
        }
      }
    }
  }
}

// 打开创建短文弹窗
function addArticle () {
  openAddArticle.value.open = true;
}


// 打开一篇短文
function openArticle (articleId) {
  // 清空当前输入
  nowTypingArticle.value = "";
  // 获取id为articleId的短文
  nowArticleDb.value = getDataById(articleId);
  nowArticle.value = nowArticleDb.value.data;

  // 关闭所有短文抽屉
  allArticleBox.value = false;
  initContextList = contextList.value;
  initContextMenu();

  // 记录当前打开的短文id
  nowArticleId.value = articleId;

  // 设置右侧面板信息
  const rightPanelData = rightPanel.value.formData;
  rightPanelData.title = nowArticle.value.title;
  rightPanelData.author = nowArticle.value.author;
  rightPanelData.speed = '0字/分';
  rightPanelData.correct = '100%'
  rightPanelData.timer = '00:00:00';
  rightPanelData.schedule = '0%';
  rightPanelData.backSeveral = 0;
  rightPanelData.errSeveral = 0;

  // 清空计时器
  if (rightPanel.value.typingInterval) {
    clearInterval(rightPanel.value.typingInterval);
  }
  rightPanel.value.typingInterval = undefined;
}

// 打开左侧抽屉
function openAllArticleBox () {
  initContextList = atcContextList.value;
  initContextMenu();
  searchInputRef.focus ? searchInputRef.focus() : searchInputRef.value?.focus();
  allArticleBox.value = true;
}

// 关闭左侧抽屉
function closeAllArticleBox () {
  initContextList = contextList.value;
  initContextMenu();
  allArticleBox.value = true;
  // 聚焦文本域
  if (nowArticle.value.article) {
    textAreaRef.focus ? textAreaRef.focus() : textAreaRef.value.focus();
  }
}

// 文本域输入事件
function textAreaInput (e) {
  rightPanel.value.typingStart = true;
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
  if (rowHeight === 0) {
    rowHeight = newDivHeight;
  } else if (!canChangeRow || newDivHeight === rowHeight * nowInputRow) {
    return;
  } else {
    originArticleBar?.setScrollTop(newDivHeight - rowHeight * 2);
    newDivHeight > rowHeight * nowInputRow ? nowInputRow++ : nowInputRow--;
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
  return /(?:[\u3400-\u4DB5\u4E00-\u9FEF\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])/.test(str);
}

// 判断是否输入中文
function isChineseInput (e) {
  return e.keyCode === 229
}

// 判断是否在主键区
function isInMainKey (e) {
  return e.code.toLowerCase().indexOf("key") !== -1
}

// tab键按下事件
function tabDown (e) {
  // 移除原生tab键事件
  e.preventDefault();
  // 获取当前输入光标
  const cursor = e.target.selectionStart;
  // 如果光标下一位是标点， 则将光标向下移动一位
  if (isPunctuation(e.target.value.substring(cursor, cursor + 1))) {
    e.target.selectionStart = cursor + 1;
  }
}

// backspace键按下事件
function backspaceDown (e) {
  // textArea
  const textArea = e.target;
  // 阻止原生backspace键事件（搞不了还是用原生吧）
  //   e.preventDefault();
  // 获取当前光标选中区域
  const start = textArea.selectionStart;
  const end = textArea.selectionEnd;
  // 原文本
  //   const text = textArea.value;
  // 如果光标选中区域不是空，则删除选中区域, 如果光标选中区域是空，则删除光标前一位
  //   let newText = '';
  //   if (start !== end) {
  //     newText = text.substring(0, start) + text.substring(end);
  //   } else {
  //     newText = text.substring(0, start - 1) + text.substring(start);
  //   }
  // 重新赋值
  //   textArea.value = newText;
  // 重新设置光标
  //   let newStart = end - start == 1 ? start : start - 1
  //   textArea.selectionStart = newStart;
  //   textArea.selectionEnd = newStart;

  // 设置右侧面板信息
  let backSize = end == start ? 1 : end - start;
  rightPanel.value.formData.backSeveral += backSize;
}

// 标点符号判断
function isPunctuation (str) {
  return /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]/.test(str);
}

// 保存设置
function saveConfig () {
  configDb.data.settings = configPage.value.settings;
  // 保存页面设置
  updateUtoolsDB(configDb);
}

// 初始化右键菜单
function initContextMenu () {
  changeContextMenu(initContextList)
}

// 切换右键菜单
function changeContextMenu (list) {
  emits('changeContextList', list)
}
function randomArrNoRepeat (min, max, length) {
  let arr = [];
  for (let i = 0; i < length; i++) {
    let num = Math.round(Math.random() * (max - min + 1) + min);
    if (arr.indexOf(num) === -1) {
      arr.push(num);
    } else {
      i--;
    }
  }
  return arr;
}

// 短文列表右击事件
function liRightClick (article) {
  checkedArticleId = article.articleId;
  checkedArticleName.value = article.articleName;
}

// 修改短文
function updateArticle (article_id) {
  if (article_id) {
    checkedArticleId = article_id;
  }
  updateArticleComp.value ? updateArticleComp.value.openDialog() : updateArticleComp.openDialog();
  updateArticleComp.value ? updateArticleComp.value.initFormData(checkedArticleId) : updateArticleComp.initFormData(checkedArticleId);
}

// 关闭短文修改窗口事件
function updateDialogClosed () {
  checkedArticleId = '';
  checkedArticleName.value = '';
  initContextMenu();
  // 如果左侧抽屉是关闭的，则刷新所选短文
  if (!allArticleBox.value && nowArticleId.value) {
    openArticle(nowArticleId.value);
  }
}

// 开始删除短文流程
function delArticle (article_id) {
  if (article_id) {
    checkedArticleId = article_id;
    checkedArticleName.value = nowArticle.value.title;
  }
  delConfirm.value = true;
}

// 关闭删除短文时移除当前选择信息
function closeDel () {
  checkedArticleId = '';
  checkedArticleName.value = '';
}

// 确认删除短文
function delAndClose () {
  // 删除短文列表中短文
  configDb.data.articles.splice(configDb.data.articles.findIndex(item => item.articleId === checkedArticleId), 1);
  configPage.value.articles.splice(configPage.value.articles.findIndex(item => item.articleId === checkedArticleId), 1);
  // 如果已查出, 则删除查出的短文, 并将查询下标减一
  const listIndex = allArticleList.value.findIndex(item => item.articleId === checkedArticleId);
  if (listIndex !== -1) {
    allArticleList.value.splice(listIndex, 1);
    nowLoad--;
  }
  // 如果是当前打开的短文，则清除当前打开的短文
  if (checkedArticleId === nowArticleId.value) {
    nowArticleId.value = '';
    nowArticle.value = { article: "", title: "", author: "" };
    // 右侧面板
    const rightPanelData = rightPanel.value.formData;
    rightPanelData.title = nowArticle.value.title;
    rightPanelData.author = nowArticle.value.author;
    rightPanelData.speed = '0字/分';
    rightPanelData.correct = '100%'
    rightPanelData.timer = '00:00:00';
    rightPanelData.schedule = '0%';
    rightPanelData.backSeveral = 0;
    rightPanelData.errSeveral = 0;
  }

  // 更新数据库
  window.updateUtoolsDB(configDb);

  // 删除短文
  window.removeDbById(checkedArticleId);

  // 关闭确认框
  delConfirm.value = false;
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
  left: 56px;
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
  left: 56px;
  width: 60%;
  height: 180px;
  box-sizing: border-box;
  padding: 10px 0;
  overflow: hidden;
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

/* 右侧面板 */
.rightPanel {
  position: absolute;
  top: 48px;
  right: 56px;
  width: 180px;
  height: 296px;
  background-color: var(--rightPanelBackColor);
}

#nowArticleBox span {
  white-space: pre-wrap;
}
</style>