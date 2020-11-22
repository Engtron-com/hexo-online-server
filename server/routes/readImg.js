var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require("path");

/* GET img. */
router.get('/', function (req, res, next) {
    let imgPath = req.query.path.substring(1, req.query.path.length);
    let dirName = imgPath.replace("%23", "");
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