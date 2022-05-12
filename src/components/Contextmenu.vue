<template>
  <div id="contextmenu" v-show="visible" class="menu">
    <div v-for="context in contextmenu.contextList" :key="context" class="contextmenu_item"
      @click="selectItem(context.click)">
      {{ context.label }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// 从父组件获取数据
let props = defineProps(["contextmenu"]);
// 声明页面所需数据
let visible = ref(false), // 是否显示菜单
  menuStamp = 0; // 
// 实现一个右键菜单
function openContextmenu (key) {
  document.querySelectorAll('.el-dialog__body, .el-drawer__body, .el-drawer__header')?.forEach(item => {
    item.removeEventListener('click', foo);
    item.addEventListener('click', foo);
  });
  visible.value = false; // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
  visible.value = true; // 打开模态框
  var menu = document.querySelector(".menu");
  styleMenu(key, menu);
  // 打开后, 保存时间戳, 用于判断是否需要关闭菜单
  menuStamp = Date.now();
}
function foo (e) {
  // 如果打开时间不到 100ms，则大概率是通过点击menuButton触发的，而不是右键菜单
  if (Date.now() - menuStamp > 100) {
    visible.value = false;
  }
}
function styleMenu (key, menu) {
  menu.style.left = key.clientX + "px";
  menu.style.top = key.clientY + "px";
  // 如果点击位置在页面的右边，则菜单栏的位置往左移动
  let menuWidth = 100;
  if (key.clientX + menuWidth + 20 > document.body.clientWidth) {
    menu.style.left = key.clientX - menuWidth + "px";
  }
  // 如果点击位置在页面的下方，则菜单栏的位置往上移动
  let menuHeight = props.contextmenu.contextList.length === 1 ? 34 : props.contextmenu.contextList.length * 35 + 1;
  if (key.clientY + menuHeight + 20 > document.body.clientHeight) {
    menu.style.top = key.clientY - menuHeight + "px";
  }
}

// 给整个document新增监听鼠标事件，点击任何位置执行foo方法
if (!window.hasContextmenuListener) {
  // 绑定右键菜单栏事件
  document.addEventListener('contextmenu', openContextmenu);
  document.addEventListener("click", foo);
  window.hasContextmenuListener = true;
}

// 右键菜单栏选择项
function selectItem (cb) {
  cb();
  // 关闭菜单栏
  visible.value = false;
}

// 暴露打开菜单方法供按钮调用
defineExpose({ openContextmenu });
</script>

<style scope>
.menu {
  position: absolute;
  background-color: #fff;
  width: 100px;
  /*height: 106px;*/
  font-size: 12px;
  color: #444040;
  border-radius: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  white-space: nowrap;
  z-index: 9999;
}
.contextmenu_item {
  display: block;
  line-height: 34px;
  text-align: center;
}
.contextmenu_item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.contextmenu_item:hover {
  cursor: pointer;
  background: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}
</style>