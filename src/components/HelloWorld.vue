<template>
	<el-space :size="30">
		<span class="dict">{{ dict }}</span>
		<el-container>
			<el-header class="pinyin">{{ nowPinyin }}</el-header>
			<el-input class="typing" v-model="typing" @input="onWordTyping" maxlength="2" autofocus="true"></el-input>
		</el-container>
	</el-space>
</template>

<script setup>
	import { ref } from 'vue'
	
	let configDb, // utools数据库中的配置信息
		settings = ref(), // 设置信息
		schemeList, // 全部方案
		nowScheme = {}, // 当前方案
		dict = ref(), // 文字
		pinyinList, // 当前文字的所有拼音
		nowPinyin = ref(), // 展示的拼音
		nowDoubleKeyList = new Set(), // 当前方案下当前文字所有拼音对应的双拼
		typing = ref(), // 输入内容
		wordProgress = 0 // 单字练习进度
		
	// 等待utools挂载~
	let waitReoad = setInterval(() => {
		try {
			configDb = getDtConfig();
			clearInterval(waitReoad);
			onReload();
		} catch(err) {console.error(err)}
	}, 10);
	
	// utools挂载后, 加载设置信息
	let onReload = () => {
		console.log(configDb);
		// 加载设置
		settings.value = configDb.data.settings;
		
		// 加载双拼方案
		getScheme();
		
		// 获取文字、拼音信息
		getWord();
	}
	
	// 加载双拼方案
	let getScheme = () => {
		schemeList = configDb.data.schemes;
		schemeList.forEach(scheme => {
			if(scheme.name === settings.value.schemeName){
				nowScheme.sheng = new Map(Object.entries(scheme.details.sheng));
				nowScheme.yun = new Map(Object.entries(scheme.details.yun));
				nowScheme.zero = new Map(Object.entries(scheme.details.zero));
			}
		})
	}
	
	// 获取文字、拼音信息
	let getWord = () => {
		// 文字
		dict.value = configDb.data.dict[wordProgress];
		if(!dict.value){
			wordProgress = 0;
			dict.value = configDb.data.dict[wordProgress];
		}
		
		// 拼音
		pinyinList = toPinyinNormal(dict.value)[0];
		nowPinyin.value = pinyinList[0];
		
		// 根据当前方案获取双拼
		getDoubleKeyList();
	}
	
	// 根据当前方案获取双拼
	let getDoubleKeyList = () => {
		
		pinyinList.forEach(pinyin => {
			let first = pinyin.slice(0, 1);
			let sheng = '',
				yun = '';
			if ("aeo".indexOf(first) != -1){
				yun = nowScheme.zero.get(pinyin);
			} else if ("scz".indexOf(first) != -1){
				let second = pinyin.slice(0, 2);
				if(second.indexOf("h") != -1){
					sheng = nowScheme.sheng.get(second);
					yun = nowScheme.yun.get(pinyin.slice(2));
				} 
			} else {
				sheng = nowScheme.sheng.get(first);
				yun = nowScheme.yun.get(pinyin.slice(1));
			}
			nowDoubleKeyList.add(sheng + yun);
			console.log(nowDoubleKeyList);
		})
		
	}
	
	// 检测单字输入
	let onWordTyping = (val) => {
		// 输入2个字母后判断
		if(val.length == 2){
			if(nowDoubleKeyList.has(val)){
				wordProgress ++;
				getWord();
			}
			// 清空输入框
			typing.value = '';
		}
	}
</script>

<style scoped>
	.dict {
		font-size: 69px;
		font-weight: 600;
	}
	.pinyin {
		padding: 0;
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
</style>
