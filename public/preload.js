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
 * 读取初始化数据
 */
window.readInitConfig = () => {
    return require('./data/config.json');
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
 * @typedef {Object} saveDialogOptions
 * @property {string} title 标题
 * @property {string} defaultPath 文件保存路径
 * @property {String} buttonLabel 按钮文字
 */
/**
 * 弹出保存框
 * @param {saveDialogOptions} options 保存框配置
 * @returns 
 */
window.showSaveDialog = options => {
    return utools.showSaveDialog(options);
}

/**
 * 将canvas转换为Buffer
 * @param {*} canvas 
 * @returns 
 */
window.convertCanvasToBuffer = (canvas) => {
    // 将 canvas 转为 base64, 去掉前缀
    const base = canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
    // 将 base64 转为 buffer对象
    return Buffer.from(base, 'base64');
}

// 导入fs模块
const fs = require('fs');

/**
 * 保存文件
 * @param {string} filePath 文件路径
 * @param {Object} data 数据
 */
window.saveFile = (filePath, data) => {
    fs.writeFile(filePath, data, (err) => {
        if (err) throw err;
    });
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
            window.putUtoolsDB({
                _id: id,
                data: data
            });
            data = utools.db.get(id);
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
    let date = new Date()
    let timestamp = date.getTime()
    return ARTICLE_ID_PREFIX + timestamp
}

/**
 * @typedef {object} article 文章数据
 * @property {string} title 文章标题
 * @property {string} author 文章作者
 * @property {string} content 文章内容
 */
/**
 * 创建短文
 * @param {article} 文章数据
 * @returns 
 */
window.createArticle = ({ articleTitle, articleAuthor, articleContent }) => {
    let article = {
        _id: generateArticleId(),
        data: {
            title: articleTitle.trim(),
            author: articleAuthor.trim(),
            article: articleContent
        }
    }
    window.updateUtoolsDB(article);
    return article;
}