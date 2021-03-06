var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.user === olConfig.user && req.session.isLogin) {
        if (req.query.pjax) {
            res.render('post');
        } else {
            res.render('index', { wsPort: olConfig.wsPort, path: "hexo", ssl: olConfig.ssl, indexPath: olConfig.indexPath });
        }
    } else {
        res.render('login', { script: '' });
    }
});

module.exports = router;