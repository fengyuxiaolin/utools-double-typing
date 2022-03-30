<template>
	<el-space :size="30">
		<span class="dict">{{ dict }}</span>
		<el-container>
			<el-header class="pinyin">{{ nowPinyin }}</el-header>
			<el-input class="typing" v-model="typing" @input="onWordTyping" maxlength="2" autofocus="true" @keydown="keydown" @keyup="keyup"></el-input>
		</el-container>
	</el-space>
	<el-row v-for="(row, i) in keyboardMap" :key="i" class="key-map-row" :value="i">
		<el-col v-for="key in row" :key="key" :span="2">
			<el-button class="isNowPress isNextTrueKey" v-if="key.isNowPress">
				<p>
					<span class="keyMapKey" :value="key.key">{{ key.key }}</span>

					<span class="keyMapSheng">{{ key.sheng }}</span>
				</p>

				<p class="keyMapYunBox">
					<span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{ yun }}</span>
				</p>
			</el-button>
			<el-button class="isNextTrueKey" v-else-if="key.isNextTrueKey">
				<p>
					<span class="keyMapKey" :value="key.key">{{ key.key }}</span>
					<span class="keyMapSheng">{{ key.sheng }}</span>
				</p>
				<p class="keyMapYunBox">
					<span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{ yun }}</span>
				</p>
			</el-button>
			<el-button class="isTrueKey" v-else-if="key.isTrueKey">
				<p>
					<span class="keyMapKey" :value="key.key">{{ key.key }}</span>
					<span class="keyMapSheng">{{ key.sheng }}</span>
				</p>
				<p class="keyMapYunBox">
					<span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{ yun }}</span>
				</p>
			</el-button>
			<el-button class="bg-purple" v-else>
				<p>
					<span class="keyMapKey" :value="key.key">{{ key.key }}</span>
					<span class="keyMapSheng">{{ key.sheng }}</span>
				</p>
				<p class="keyMapYunBox">
					<span v-for="yun in key.yun" :key="yun" class="keyMapYun">{{ yun }}</span>
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
</template>

<script setup>
import { ref, watch } from 'vue';

let configDb, // utools数据库中的配置信息
	configPage, // 页面的配置信息
	schemeName, // 双拼方案
	typingModel, // 练习模式
	schemeList, // 全部方案
	nowScheme = {}, // 当前方案
	zeroKeyArr = [], // 零声母
	nowZeroScheme = ref({}), // 当前零声母方案
	keyboardMap = ref(), // 键位
	dict = ref(), // 文字
	pinyinList, // 当前文字的所有拼音
	nowPinyin = ref(), // 展示的拼音
	nowDoubleKeyList = new Set(), // 当前方案下当前文字所有拼音对应的双拼
	typing = ref(), // 输入内容
	wordProgress = 0; // 单字练习进度

const ZERO_KEY = [['a', 'ai', 'an', 'ang', 'ao'], ['e', 'ei', 'en', 'eng', 'er'], ['o', 'ou']],
	KEYBOARD_KEY_ARR = [['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'], ['Z', 'X', 'C', 'V', 'B', 'N', 'M']],
	KEYBOARD_KEY = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm'];

zeroKeyArr = ZERO_KEY.flat();

// 从父组件获取配置
const props = defineProps(['configDb', 'configPage']);
configDb = props.configDb;
configPage = props.configPage;
console.log(configPage);

// 初始化页面
initWordPage();

// 初始化页面
function initWordPage() {
	schemeName = configPage.settings.schemeName;
	typingModel = configPage.settings.typingModel;

	// 初始化键位图
	initKeyMap();

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
		(a, b) => {
			// 判断是否有变更(可能是由于使用了keep-alive, 存在多次触发watch的bug)
			let realChange = configPage.settings.schemeName != schemeName;
			realChange ||= configPage.settings.typingModel != typingModel;
			if (realChange) {
				// 移除当前零声母提示
				let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
				if (zeroKeyIndex != -1) {
					document.getElementsByClassName('zeroKeyBox')[zeroKeyIndex].classList.remove('isNextTrueKey');
				}
				console.log(configPage.settings.typingModel);
				// 重新加载页面
				initWordPage();
			}
		},
		{ deep: true }
	);
}

// 初始化键位图
function initKeyMap() {
	keyboardMap.value = [[], [], []];
	for (let i = 0; i < KEYBOARD_KEY_ARR.length; i++) {
		for (let key of KEYBOARD_KEY_ARR[i]) {
			keyboardMap.value[i].push(newKey(key));
		}
	}
}

// 按键初始化
function newKey(key) {
	return {
		key: key,
		sheng: '',
		yun: new Set(),
		isNowPress: false,
		isTrueKey: false,
		isNextTrueKey: false
	};
}

// 加载双拼方案
function getScheme() {
	schemeList = configPage.schemes;
	schemeList.forEach(scheme => {
		if (scheme.name === configPage.settings.schemeName) {
			nowScheme.sheng = new Map(Object.entries(scheme.details.sheng));
			nowScheme.yun = new Map(Object.entries(scheme.details.yun));
			nowScheme.zero = new Map(Object.entries(scheme.details.zero));
			nowZeroScheme.value = scheme.details.zero;
		}
	});
}

// 将当前方案填充键位图
function fillKeyMap() {
	for (let [sheng, keyboard] of nowScheme.sheng) {
		if (sheng != keyboard) {
			keyboardForEach(keyboard, keyMapValue => {
				keyMapValue.sheng = sheng;
			});
		}
	}
	for (let [yun, keyboard] of nowScheme.yun) {
		if (yun != keyboard) {
			keyboardForEach(keyboard, keyMapValue => {
				keyMapValue.yun.add(yun);
			});
		}
	}
}

// 获取文字、拼音信息
function getWord() {
	// 文字
	const dictLength = configPage.dict.length;
	if (configPage.settings.typingModel === 'wordRandom') {
		wordProgress = Math.round(Math.random() * dictLength);
	}
	if (dictLength <= wordProgress) {
		wordProgress = 0;
	}
	dict.value = configPage.dict[wordProgress];

	// 拼音
	pinyinList = toPinyinNormal(dict.value)[0];
	nowPinyin.value = pinyinList[0];
}

// 根据当前方案获取双拼
function getDoubleKeyList() {
	nowDoubleKeyList = new Set();
	pinyinList.forEach(pinyin => {
		let first = pinyin.slice(0, 1);
		let sheng = '',
			yun = '';
		if ('aeo'.indexOf(first) != -1) {
			yun = nowScheme.zero.get(pinyin);
		} else if ('scz'.indexOf(first) != -1) {
			let second = pinyin.slice(0, 2);
			if (second.indexOf('h') != -1) {
				sheng = nowScheme.sheng.get(second);
				yun = nowScheme.yun.get(pinyin.slice(2));
			}
		} else {
			sheng = nowScheme.sheng.get(first);
			yun = nowScheme.yun.get(pinyin.slice(1));
		}
		nowDoubleKeyList.add(sheng + yun);
	});
}

// 展示键位提示
function showKeysTip() {
	let doubleKey = '';
	try {
		nowDoubleKeyList.forEach(dk => {
			doubleKey = dk;
			throw new Error();
		});
	} catch {}
	let nextTrueKey = doubleKey[0],
		trueKey = doubleKey[1];
	// 第一个键
	keyboardForEach(nextTrueKey, keyMapValue => {
		keyMapValue.isNextTrueKey = true;
	});
	keyboardForEach(trueKey, keyMapValue => {
		keyMapValue.isTrueKey = true;
	});

	// 零声母
	let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
	if (zeroKeyIndex != -1) {
		document.getElementsByClassName('zeroKeyBox')[zeroKeyIndex].classList.add('isNextTrueKey');
	}
}

// 遍历键位图
/**
 * @param {String} keyboard
 * @param {function(keyMapValue)} callback  处理对应的键位图按键
 */
function keyboardForEach(keyboard, callback) {
	for (let i = 0; i < KEYBOARD_KEY.length; i++) {
		let index = KEYBOARD_KEY[i].indexOf(keyboard);
		if (index != -1) {
			callback(keyboardMap.value[i][index]);
		}
	}
}

// 实时检测键盘按键按下
function keydown(val) {
	keyboardForEach(val.key.toLowerCase(), keyMapValue => {
		keyMapValue.isNowPress = true;
	});
}
// 实时监测键盘按键抬起
function keyup(val) {
	keyboardForEach(val.key.toLocaleLowerCase(), keyMapValue => {
		setTimeout(() => {
			keyMapValue.isNowPress = false;
		}, 100);
	});
}

// 检测单字输入
function onWordTyping(val) {
	// 输入2个字母后判断
	if (val.length == 2) {
		if (nowDoubleKeyList.has(val)) {
			// 移除当前零声母提示
			let zeroKeyIndex = zeroKeyArr.indexOf(nowPinyin.value);
			if (zeroKeyIndex != -1) {
				document.getElementsByClassName('zeroKeyBox')[zeroKeyIndex].classList.remove('isNextTrueKey');
			}
			wordProgress++;
			getWord();
			getDoubleKeyList();
			let nextTrueKey = val[0],
				trueKey = val[1];
			keyboardForEach(nextTrueKey, keyMapValue => {
				keyMapValue.isNextTrueKey = false;
			});
			keyboardForEach(trueKey, keyMapValue => {
				keyMapValue.isTrueKey = false;
			});
			showKeysTip();
		}
		// 清空输入框
		typing.value = '';
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
.key-map-row[value='0'] {
	padding-left: 20px;
	right: 3%;
}
.key-map-row[value='1'] {
	padding-left: 43px;
}
.key-map-row[value='2'] {
	margin-bottom: 20px;
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
