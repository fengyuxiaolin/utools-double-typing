/**
 * 存储utools数据方法
 */
window.putUtoolsDB = data => {
	return utools.db.put({
		_id: data._id,
		data: JSON.parse(JSON.stringify(data.data)),
		_rev: data._rev
	});
}

/**
 * 更新数据
 */
window.updateUtoolsDB = data => {
	const res = putUtoolsDB(data);
	if (res.ok) {
		data._rev = res.rev;
	}
}

/**
 * 获取配置信息,如果不存在则进行初始化
 */
window.getDtConfig = () => {
	let dtconfig = utools.db.get("dtconfig");
	if (dtconfig === null) {
		// 读取配置文件
		window.putUtoolsDB({
			_id: "dtconfig",
			data: require('./data/config.json')
		});
		return utools.db.get("dtconfig");
	}
	return dtconfig;
}

/**
 * 根据id获取数据
 */
window.getDataById = (id) => {
	let data = utools.db.get(id);
	if (data === null) {
		// 尝试初始化数据
		try {
			data = require(`./data/${id}.json`);
			let i = window.putUtoolsDB({
				_id: id,
				data: data
			});
			console.log('i: ', i);
			data = utools.db.get(id);
			console.log('data: ', data);
			return data;
		} catch (error) {
			return null;
		}
	}
	return data;
}

// 声明常量 短文id前缀
const ARTICLE_ID_PREFIX = "article_";

/** 
 * 利用时间戳生成文章id
 */
let generateArticleId = () => {
	let date = new Date();
	let timestamp = date.getTime();
	return ARTICLE_ID_PREFIX + timestamp;
}


