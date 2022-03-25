import { createApp } from 'vue'
import App from './App.vue'
import pinyin from 'pinyin';
/**
 * 开源汉字拼音转换工具
 * https://github.com/hotoo/pinyin/tree/v2.x
 */
window.toPinyin = (hanzi, option) => {
	return pinyin(hanzi, option);
}

/**
 * 以无声调风格转换为拼音, 开启多音字模式
 * 
 * @param {String} hanzi
 */
window.toPinyinNormal = hanzi => {
	// throw new Error("nima")
	return pinyin(hanzi, {
		style: pinyin.STYLE_NORMAL,
		heteronym: true
	})
}
createApp(App).mount('#app')
