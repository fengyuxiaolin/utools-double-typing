/**
 * 获取配置信息,如果不存在则进行初始化
 */
window.getDtConfig = () => {
	utools.db.remove("dtconfig");
	let dtconfig = utools.db.get("dtconfig");
	if (dtconfig === null) {
		// 读取配置文件
		putUtoolsDB({
			_id: "dtconfig",
			data: require('./data/config.json')
		});
		return utools.db.get("dtconfig");
	}
	return dtconfig;
}

/**
 * 存储utools数据方法
 */
window.putUtoolsDB = (data) => {
	return utools.db.put(data);
}

/**
 * 开源汉字拼音转换工具
 * https://github.com/hotoo/pinyin/tree/v2.x
 */
const pinyin = require('pinyin');

window.toPinyin = function(hanzi, option) {
	return pinyin(hanzi, option);
}

/**
 * 以无声调风格转换为拼音, 开启多音字模式
 * 
 * @param {String} hanzi
 */
window.toPinyinNormal = function(hanzi) {
	return pinyin(hanzi, {
		style: pinyin.STYLE_NORMAL,
		heteronym: true
	})
}

/**
 * 获取声母
 * 
 * @param {String} hazi
 */
window.getPinyinInitials = function(hanzi) {
	return pinyin(hanzi, {
		style: pinyin.STYLE_INITIALS,
		heteronym: true
	})
}
