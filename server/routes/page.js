var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require("path");

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.user === olConfig.user && req.session.isLogin) {
        fs.readdir(hexo.source_dir, function (err, files) {
            let pages = [];
            if (err) {
                res.render('page', { pages, indexPath: olConfig.indexPath });
                console.error(err);
                return;
            }
            pages = getPages(files);
            if (req.query.pjax) {
                res.render('page', { pages, autoSave: olConfig.autoSave, indexPath: olConfig.indexPath });
            } else {
                res.render('index', { wsPort: olConfig.wsPort, path: "page", pages, autoSave: olConfig.autoSave, ssl: olConfig.ssl, indexPath: olConfig.indexPath });
            }
        });
    } else {
        res.render('login', { script: '' });
    }
});
function getPages(files, pages = []) {
    files.map((e, i) => {
        if (/^_/.test(e)) return e;
        let stats = fs.statSync(path.join(hexo.source_dir, e));
        if (stats.isDirectory()) {
            let files = fs.readdirSync(path.join(hexo.source_dir, e));
            if (files.includes("index.md")) {
                pages.push(e);
            }
        }
    });
    return pages;
}
module.exports = router;