var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require("path");

/* GET img. */
router.get('/', function (req, res, next) {
    console.log('getImgSrc')
    if (req.session.user === olConfig.user && req.session.isLogin) {
        console.log(req);
        let dirName = req.query.page;
        console.log(dirName);
        fs.readFile(path.join(hexo.source_dir, dirName),'binary', function (err, data) {
            if (err) {
                send("读取图片"+dirName+"失败", "error");
                res.json({ success: false, data: err });
                console.error(err);
                return;
            }
            res.write(file,'binary');
        });
    } else {
        res.render('login', { script: '' });
    }
});
module.exports = router;