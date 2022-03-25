/**
 * 存储utools数据方法
 */
window.putUtoolsDB = data => {
	return utools.db.put(data);
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


