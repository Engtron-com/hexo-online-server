var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require("path");

/* GET img. */
router.get('/', function (req, res, next) {
    console.log('--------------------------');
    console.log(req.url);
    console.log(req.query);
    let dirName = req.url.replace("#", "").replace("%23", "");
    console.log(dirName);
    console.log(path.join(hexo.source_dir, dirName));
    fs.readFile(path.join(hexo.source_dir, dirName),'binary', function (err, data) {
        if (err) {
            send("读取图片"+dirName+"失败", "error");
            res.json({ success: false, data: err });
            console.error(err);
            return;
        }
        res.write(data, 'binary');
        res.end();
    });
});
module.exports = router;