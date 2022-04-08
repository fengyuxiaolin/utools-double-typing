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
	utools.db.remove("dtconfig");
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

// 声明常量 短文id前缀
const ARTICLE_ID_PREFIX = "article_";

/**
 * 获取所有短文
 */
window.getAllArticle = () => {
	let articles = utools.db.getAllDocs(ARTICLE_ID_PREFIX, {
		include_docs: true
	});
	return articles;
}