<template>
  <el-space :size="30">
    <span class="dict">{{ dict }}</span>
    <el-container>
      <el-header class="pinyin">{{ nowPinyin }}</el-header>
      <el-input class="typing" v-model="typing" @input="onWordTyping" maxlength="2" autofocus="true" @keydown="keydown"
        @keyup="keyup"></el-input>
    </el-container>
  </el-space>
  <div id="keyboardMapBox" v-show="configPage.settings.keyMapSwitch">
    <el-row v-for="(row, i) in keyboardMap" :key="i" class="key-map-row" :value="i">
      <el-col v-for="key in row" :key="key" :span="2">
        <el-button class="isNowPress isNextTrueKey" @click="enterAKey(key.key)"
          v-if="configPage.settings.keyDownTipsSwitch && key.isNowPress">
          <p>
            <span class="keyMapKey" :value="key.key">{{ key.key }}</span>

            <span class="keyMapSheng">{{ key.sheng }}</span>
          </p>

          <p class="keyMapYunBox">
            <span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{
              yun
            }}</span>
          </p>
        </el-button>
        <el-button class="isNextTrueKey" @click="enterAKey(key.key)"
          v-else-if="configPage.settings.keyMapTipsSwitch && key.isNextTrueKey">
          <p>
            <span class="keyMapKey" :value="key.key">{{ key.key }}</span>
            <span class="keyMapSheng">{{ key.sheng }}</span>
          </p>
          <p class="keyMapYunBox">
            <span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{
              yun
            }}</span>
          </p>
        </el-button>
        <el-button class="isTrueKey" @click="enterAKey(key.key)"
          v-else-if="configPage.settings.keyMapTipsSwitch && key.isTrueKey">
          <p>
            <span class="keyMapKey" :value="key.key">{{ key.key }}</span>
            <span class="keyMapSheng">{{ key.sheng }}</span>
          </p>
          <p class="keyMapYunBox">
            <span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{
              yun
            }}</span>
          </p>
        </el-button>
        <el-button style="width: 0; padding: 0; border: none" v-else-if="key.key == ''"></el-button>
        <el-button class="bg-purple" @click="enterAKey(key.key)" v-else>
          <p>
            <span class="keyMapKey" :value="key.key">{{ key.key }}</span>
            <span class="keyMapSheng">{{ key.sheng }}</span>
          </p>
          <p class="keyMapYunBox">
            <span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{
              yun
            }}</span>
          </p>
        </el-button>
      </el-col>
    </el-row>
    <el-row class="zeroKeyMap" v-for="keys in ZERO_KEY" :key="keys">
      <el-col :span="7"></el-col>
      <el-col :span="2" v-for="(key, i) in keys" :key="i">
        <el-button class="zeroKeyBox">
          <span class="zeroKey" v-if="i == 0">{{ key }} &nbsp;</span>
          <span class="zeroKey" v-else>{{ key }}</span>
          <span class="zeroKeyBoard">{{ nowZeroScheme[key] }}</span>
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import html2canvas from "html2canvas";

let configDb, // utools数据库中的配置信息
  configPage, // 页面的配置信息
  schemeName, // 双拼方案
  typingModel, // 练习模式
  schemeList, // 全部方案
  nowScheme = {}, // 当前方案
  zeroKeyArr = [], // 零声母
  nowZeroScheme = ref({}), // 当前零声母方案
  keyboardMap = ref(), // 键位
  keyMapShengKey = {}, // 当前键位图提示声母
  keyMapYunKey = {}, // 键位图提示的韵母
  dict = ref(), // 文字
  pinyinList, // 当前文字的所有拼音
  nowPinyin = ref(), // 展示的拼音
  nowDoubleKeyList = new Set(), // 当前方案下当前文字所有拼音对应的双拼
  typing = ref(), // 输入内容
  wordProgress = 0, // 单字练习进度
  schemeTemp = ref(), // 临时方案
  contextList = ref([]); // 右键菜单内容

const ZERO_KEY = [
  ["a", "ai", "an", "ang", "ao"],
  ["e", "ei", "en", "eng", "er"],
  ["o", "ou"],
],
  KEYBOARD_KEY_ARR = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    ["Z", "X", "C", "V", "B", "N", "M", ""],
  ],
  KEYBOARD_KEY = ["qwertyuiop", "asdfghjkl;", "zxcvbnm"];

zeroKeyArr = ZERO_KEY.flat();

// 从父组件获取配置
const props = defineProps(["configDb", "configPage"]);
const emits = defineEmits(['addNewScheme', 'changeContextList'])
configDb = props.configDb;
configPage = props.configPage;

// 初始化页面
if (configPage.settings.schemeName) {
  initWordPage();
} else {
  initCreateSchemePage();
}

// 初始化单字练习页面
function initWordPage () {
  // 获取设置信息
  schemeName = configPage.settings.schemeName;
  typingModel = configPage.settings.typingModel;

  // 初始化键位图
  initKeyMap();

  // 初始化右键菜单
  initContextMenu();

  // 加载双拼方案
  getScheme();

  // 以当前方案填充键位图
  fillKeyMap();

  // 获取文字、拼音信息
  getWord();

  // 根据当前方案获取对应双拼
  getDoubleKeyList();

  // 键位提示
  showKeysTip();

  // 设置变更时更新页面
  watch(
    () => configPage.settings,
    (target, origin) => {
      // 判断是否有变更(存在多次触发watch的bug)
      let realChange = configPage.settings.schemeName != schemeName;
      realChange ||= configPage.settings.typingModel != typingModel;
      if (realChange) {
        // 移除当前零声母提示
        setTimeout(() => {
          let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
          if (zeroKeyIndex != -1) {
            document
              .getElementsByClassName("zeroKeyBox")
            [zeroKeyIndex]?.classList?.remove("isNextTrueKey");
          }
        }, 0);
        // 重新加载页面
        initWordPage();
      }
    },
    { deep: true }
  );
  watch(
    () => configPage.settings.keyMapTipsSwitch,
    (target, origin) => {
      if (target) {
        showZeroKeysTip();
      } else {
        hideZeroKeysTip();
      }
    },
    { deep: true }
  )
}

// 初始化右键菜单内容
function initContextMenu () {
  contextList.value = [
    {
      label: "添加新方案",
      click: () => { emits('addNewScheme') },
    },
    {
      label: "导出键位图",
      click: exportKeyMap,
    },
    {
      label: "保存页面设置",
      click: savePageSettings,
    }
  ];
  emits('changeContextList', contextList.value);
}

// 初始化创建方案页面
function initCreateSchemePage () {
  // 获取设置信息
  schemeName = configPage.settings.schemeName;
  typingModel = configPage.settings.typingModel;
  // 初始化键位图
  initKeyMap();
  if (schemeName) {
    // 加载双拼方案
    getScheme();

    // 以当前方案填充键位图
    fillKeyMap();
  }
  watch(
    () => configPage.settings.schemeName,
    () => {
      // 判断是否有变更
      let realChange = configPage.settings.schemeName != schemeName;
      if (realChange) {
        // 重新加载页面
        initCreateSchemePage();
      }
    }
  );
  watch(
    () => ({ ...configPage.schemes[configPage.schemes.length - 1] }),
    (now) => {
      let nowTemp = JSON.stringify(now);
      if (nowTemp !== schemeTemp.value) {
        schemeTemp.value = nowTemp;
        initCreateSchemePage();
      }
    },
    { deep: true }
  );
}

// 初始化键位图
function initKeyMap () {
  keyboardMap.value = [[], [], []];
  for (let i = 0; i < KEYBOARD_KEY_ARR.length; i++) {
    for (let key of KEYBOARD_KEY_ARR[i]) {
      keyboardMap.value[i].push(newKey(key));
    }
  }
}

// 按键初始化
function newKey (key) {
  return {
    key: key,
    sheng: "",
    yun: new Set(),
    isNowPress: false,
    isTrueKey: false,
    isNextTrueKey: false,
  };
}

// 加载双拼方案
function getScheme () {
  schemeList = configPage.schemes;
  schemeList.forEach((scheme) => {
    if (scheme.name === configPage.settings.schemeName) {
      nowScheme.sheng = new Map(Object.entries(scheme.details.sheng));
      nowScheme.yun = new Map(Object.entries(scheme.details.yun));
      nowScheme.zero = new Map(Object.entries(scheme.details.zero));
      nowZeroScheme.value = scheme.details.zero;
    }
  });
}

// 将当前方案填充键位图
function fillKeyMap () {
  for (let [sheng, keyboard] of nowScheme.sheng) {
    if (sheng != keyboard) {
      keyboardForEach(keyboard, (keyMapValue) => {
        keyMapValue.sheng = sheng;
      });
    }
  }
  for (let [yun, keyboard] of nowScheme.yun) {
    if (yun != keyboard) {
      keyboardForEach(keyboard, (keyMapValue) => {
        keyMapValue.yun.add(yun);
      });
    }
  }
}

// 获取文字、拼音信息
function getWord () {
  // 文字
  const dictLength = configPage.dicts.length;
  if (configPage.settings.typingModel === "wordRandom") {
    wordProgress = Math.round(Math.random() * dictLength);
  }
  if (dictLength <= wordProgress) {
    wordProgress = 0;
  }
  dict.value = configPage.dicts[wordProgress];

  // 拼音
  pinyinList = toPinyinNormal(dict.value)[0];
  nowPinyin.value = pinyinList[0];
}

// 根据当前方案获取双拼
function getDoubleKeyList () {
  nowDoubleKeyList = new Set();
  pinyinList.forEach((pinyin) => {
    let first = pinyin.slice(0, 1);
    let sheng = "",
      yun = "";
    if ("aeo".indexOf(first) != -1) {
      yun = nowScheme.zero.get(pinyin);
    } else if (
      "scz".indexOf(first) != -1 &&
      pinyin.slice(0, 2).indexOf("h") != -1
    ) {
      sheng = nowScheme.sheng.get(pinyin.slice(0, 2));
      yun = nowScheme.yun.get(pinyin.slice(2));
    } else {
      sheng = nowScheme.sheng.get(first);
      yun = nowScheme.yun.get(pinyin.slice(1));
    }
    nowDoubleKeyList.add(sheng + yun);
  });
}

// 展示键位提示
function showKeysTip (sp) {
  keyMapShengKey.isNextTrueKey = false;
  keyMapYunKey.isTrueKey = false;
  let doubleKey = sp;
  if (!doubleKey) {
    try {
      // 只需要提示第一个双拼方案
      nowDoubleKeyList.forEach((dk) => {
        doubleKey = dk;
        throw new Error();
      });
    } catch { }
  }
  let nextTrueKey = doubleKey[0],
    trueKey = doubleKey[1];
  // 第一个键
  keyboardForEach(nextTrueKey, (keyMapValue) => {
    keyMapShengKey = keyMapValue;
    keyMapValue.isNextTrueKey = true;
  });
  keyboardForEach(trueKey, (keyMapValue) => {
    keyMapYunKey = keyMapValue;
    keyMapValue.isTrueKey = true;
  });

  // 零声母
  showZeroKeysTip();
}

// 遍历键位图
/**
 * @param {String} keyboard
 * @param {function(keyMapValue)} callback  处理对应的键位图按键
 */
function keyboardForEach (keyboard, callback) {
  for (let i = 0; i < KEYBOARD_KEY.length; i++) {
    let index = KEYBOARD_KEY[i].indexOf(keyboard);
    if (index != -1) {
      callback(keyboardMap.value[i][index]);
    }
  }
}

// 实时检测键盘按键按下
function keydown (val) {
  keyboardForEach(val.key.toLowerCase(), (keyMapValue) => {
    keyMapValue.isNowPress = true;
  });
}
// 实时监测键盘按键抬起
function keyup (val) {
  keyboardForEach(val.key.toLocaleLowerCase(), (keyMapValue) => {
    setTimeout(() => {
      keyMapValue.isNowPress = false;
    }, 100);
  });
}

// 键位图的按键点击事件, 将按键的key输入到输入框
function enterAKey (keyMapValue) {
  // 如果传入的不在按键列表中，则返回
  if (!keyMapValue.toLowerCase) {
    return;
  }
  // 获取输入框
  let typingInput = document.querySelectorAll(".typing .el-input__inner")[0];
  // 将按键输入到输入框
  typingInput.value += keyMapValue.toLowerCase();
  // 触发输入框的 input 事件
  typingInput.dispatchEvent(new Event("input"));
}

// 检测单字输入
function onWordTyping (val) {
  // 输入1个字母后判断声母, 矫正键位提示

  if (val.length == 1 && val.toLowerCase != keyMapShengKey.key.toLowerCase) {
    nowDoubleKeyList.forEach((sp) => {
      if (sp[0] == val) {
        showKeysTip(sp);
      }
    });
  }
  // 输入2个字母后判断
  if (val.length == 2) {
    if (nowDoubleKeyList.has(val)) {
      // 移除当前零声母提示
      let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
      if (zeroKeyIndex != -1) {
        document
          .getElementsByClassName("zeroKeyBox")
        [zeroKeyIndex].classList.remove("isNextTrueKey");
      }
      wordProgress++;
      getWord();
      getDoubleKeyList();
      keyMapShengKey.isNextTrueKey = false;
      keyMapYunKey.isTrueKey = false;
      showKeysTip();
    }
    // 清空输入框
    typing.value = "";
  }
}

// 执行选中的右键菜单回调
function selectContext (cb) {
  cb();
}
// 导出键位图
function exportKeyMap () {
  html2canvas(document.querySelector("#keyboardMapBox")).then((canvas) => {
    // 从页面设置中获取当前方案名称
    const fileName = `${configPage.settings.schemeName}-键位图.png`;
    // 将canvas转为图片并下载
    // 打开文件保存窗口
    const filePath = showSaveDialog({
      title: "导出键位图",
      defaultPath: utools.getPath("downloads") + "/" + fileName,
      buttonLabel: "导出",
    });
    // 如果没有选择文件保存路径，则返回
    if (!filePath) return;
    // 将 canvas 转为 Buffer
    const buffer = convertCanvasToBuffer(canvas);
    // 将buffer对象写入文件
    try {
      saveFile(filePath, buffer);
      utools.showNotification("导出成功");
    } catch {
      utools.showNotification("导出失败");
    }
  });
}

// 保存页面设置
function savePageSettings () {
  configDb.data.settings = configPage.settings;
  // 保存页面设置
  updateUtoolsDB(configDb);
}

// 展示零声母提示
function showZeroKeysTip () {
  let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
  if (zeroKeyIndex != -1 && configPage.settings.keyMapTipsSwitch) {
    if (document.getElementsByClassName("zeroKeyBox").length == 0) {
      setTimeout(() => {
        document
          .getElementsByClassName("zeroKeyBox")
        [zeroKeyIndex].classList.add("isNextTrueKey");
      }, 0);
    } else {
      document
        .getElementsByClassName("zeroKeyBox")
      [zeroKeyIndex].classList.add("isNextTrueKey");
    }
  }
}

// 隐藏零声母提示
function hideZeroKeysTip () {
  let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
  if (zeroKeyIndex != -1 && !configPage.settings.keyMapTipsSwitch) {
    document
      .getElementsByClassName("zeroKeyBox")
    [zeroKeyIndex].classList.remove("isNextTrueKey");
  }
}
</script>

<style scoped>
.el-space {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}
.dict {
  font-size: 69px;
  font-weight: 600;
}
.pinyin {
  justify-content: flex-start;
  padding: 0 10px;
  line-height: 40px;
  height: 40px;
  font-size: 30px;
  font-weight: 600;
}
.typing {
  width: 80px;
  font-size: 30px;
  background-color: var(--backgroundColor);
}
.typing :deep(.el-input__inner) {
  box-shadow: var(--boxBottom);
  border-radius: 0;
}

.el-row {
  position: relative;
  max-width: 1000px;
  justify-content: center;
  margin: 0 auto;
}
.bg-purple {
  background: var(--buttonBackColor);
}
.el-button {
  color: var(--buttonFontColor);
}
.el-col :hover {
  color: var(--el-button-hover-text-color);
}
.key-map-row .el-button {
  width: 100%;
  padding: 20% 40% 60% 0;
  border-radius: 0;
  position: relative;
}
.key-map-row[value="0"] {
  padding-left: 20px;
  right: 3%;
}
.key-map-row[value="1"] {
  padding-left: 36px;
}
.key-map-row[value="2"] {
  margin-bottom: 20px;
}
.key-map-row .el-button[value=""] {
  width: 0;
}
.keyMapKey {
  font-size: 18px;
}
.keyMapSheng {
  font-size: 16px;
  font-weight: 600;
  position: absolute;
  right: 10px;
  top: 5px;
  color: var(--keyMapShengColor);
}
.keyMapYunBox {
  position: absolute;
  display: flex;
  flex-direction: column;
  right: 10px;
  bottom: -6px;
  font-size: 11px;
}
.keyMapYun {
  display: flex;
  justify-content: flex-end;
}
.el-row .el-col .isNowPress {
  background-color: var(--pressKeyBackColor);
  color: var(--el-color-success);
}
.el-col .isNextTrueKey {
  background-color: var(--trueKeyBackColor);
  color: var(--el-color-success);
}
.isTrueKey {
  background-color: var(--trueKeyBackColor);
}
.zeroKeyMap {
  justify-content: flex-start;
}
.zeroKeyBox {
  background-color: var(--buttonBackColor);
  border-radius: 0;
  justify-content: flex-end;
  position: relative;
  padding: 0;
  width: 100%;
}
.zeroKeyMap .zeroKeyBox .zeroKey {
  margin-right: 8px;
}
.zeroKeyMap .zeroKeyBox .zeroKeyBoard {
  margin-right: 8px;
  font-weight: 600;
}
</style>
