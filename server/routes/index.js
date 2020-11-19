var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/post?pjax=true', function (req, res, next) {
  if (req.session.user === olConfig.user && req.session.isLogin) {
    res.render('index', { wsPort: olConfig.wsPort, path: "post", ssl: olConfig.ssl });
  } else {
    res.render('login', { script: '' });
  }
});

module.exports = router;
