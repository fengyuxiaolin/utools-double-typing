
/**
 * 开源汉字拼音转换工具
 * https://github.com/hotoo/pinyin.git
 */
const pinyin = require('pinyin');

window.toPinyin = function(hanzi, option){
	const piny = pinyin(hanzi, option);
	return piny;
}