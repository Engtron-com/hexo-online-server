var express = require('express');
var router = express.Router();
var shell = require("../../lib/shell");
var dateFormat = require("../editor.md/lib/dateFormat");
var fs = require("fs");
var path = require("path");
var axios = require("axios");
var url = require("url");
var os = require('os');
var base_fs = require('fs')
var multer = require('multer')
var config = require('../../lib/getConfig');

var upload = multer({ dest: path.join(hexo.source_dir, '/img') })

var info = {}

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.user === olConfig.user && req.session.isLogin) {
        let data = null;
        switch (req.query.action) {
            case "pull":
                gitPull();
                break;
            case "push":
                gitPush();
                break;
            case "get_postname":
                info = {
                    name: req.query.post,
                    type: 'post'
                }
                break
            case "get_postname":
                info = {
                    name: req.query.page,
                    type: 'page'
                }
                break
            case "clean":
                hexoClean();
                break;
            case "generate": 
                hexoGenerate();
                break;
            case "deploy":
                hexoDeploy();
                break;
            case "server":
                hexoServer();
                break;
            case "close_server":
                closeServer();
                break;
            case "new_post":
                new_post(req.query.post);
                break;
            case "delete_post":
                delete_post(req.query.post);
                break;
            case "rename_post":
                data = rename_post(req.query.old_name, req.query.new_name);
                res.send(data);
                break
            case "new_page":
                new_page(req.query.page);
                break;
            case "delete_page":
                data = delete_page(req.query.page, res);
                res.send(data)
                break;
            case "rename_page":
                data = rename_page(req.query.old_name, req.query.new_name);
                res.send(data);
                break
            default:
                send("Undefined command","error");
                break;
        }
        res.status(200).end();
    } else {
        res.render('login', { script: '' });
    }
}).post('/', upload.single('editormd-image-file'), function (req, res, next) {
    if (req.session.user === olConfig.user && req.session.isLogin) {
        let data = null;
        switch (req.query.action) {
            case "save_post":
                data = save_post(req.body.post, req.body.data);
                res.send(data)
                break;
            case "save_page":
                data = save_page(req.body.page, req.body.data);
                res.send(data)
                break;
            case "upload_file":
                data = upload_file(req.file);
                res.send(data)
                break
            default:
                send("Undefined command","error");
                break;
        }
        res.status(200).end();
    } else {
        res.render('login', { script: '' });
    }
});
function gitPull() {
    let pull = olConfig.pull;
    shell({
        e: "cd " + hexo.base_dir, next: () => {
            cmds(pull);
        }
    });
}
function cmds(commands, i = 0) {
    if (i < commands.length) {
        shell({
            e: commands[i].replace("{time}", dateFormat('YYYY-MM-DD HH:mm:ss')), next: () => {
                cmds(commands, ++i);
            }
        });
    } else {
        send("-----End-----");
    }
}
function gitPush() {
    let push = olConfig.push;
    shell({
        e: "cd " + hexo.base_dir, next: () => {
            cmds(push);
        }
    });
}
function hexoClean() {
    shell({
        e: "hexo clean", next: () => {
            shell({ e: "hexo clean" });
        }
    });
}
function hexoServer() {
    shell({
        e: "hexo generate", next: () => {
            shell({ e: "hexo server" });
        }
    });
}
function closeServer() {
    let reg = new RegExp(`^.*TCP.*?:${hexo.config.server.port || 4000}.*?LISTEN.*?([\\d]+)`, 'i');
    if (/windows/gim.test(os.type())) {
        shell({
            e: `netstat -ano | findstr ${hexo.config.server.port || 4000}`, stdout: data => {
                let results = data.split("\n");
                for (let i = 0; i < results.length; i++) {
                    let res = results[i] ? results[i].match(reg) : null;
                    if (res && res[1]) {
                        shell({ e: `taskkill /f /pid ${res[1]}`, sendLog: false, next: () => { } });
                        break;
                    }
                }
            }, next: () => { }
        });
    } else if (/linux/gim.test(os.type())) {
        shell({
            e: `netstat -tunlp | grep ${hexo.config.server.port || 4000}`, stdout: data => {
                let results = data.split("\n");
                for (let i = 0; i < results.length; i++) {
                    let res = results[i] ? results[i].match(reg) : null;
                    if (res && res[1]) {
                        shell({ e: `kill ${res[1]}`, sendLog: false, next: () => { } });
                        break;
                    }
                }
            }, next: () => { }
        });
    }
}
function hexoGenerate() {
    shell({
        e: "hexo generate", next: () => {
            shell({ e: "hexo generate" });
        }
    });
}
function hexoDeploy() {
    shell({ 
        e: "hexo deploy", next: () => { 
            shell({ e: "hexo deploy" });
            send("部署完成","success") 
        } 
    });

}
function new_post(e) {
    shell({
        e: "hexo new " + e, next: () => {
            let checkExists = setTimeout(() => {
                if (fs.existsSync(path.join(hexo.source_dir, '_posts/', e + ".md"))) {
                    clearInterval(checkExists);
                    send("新建《" + e + "》文章成功","success");
                    send("", "reload");
                }
            }, 100);
        }
    });
}
function delete_post(e) {
    let postName = e.replace("#", "").replace("%23", "");
    fs.unlink(path.join(hexo.source_dir, '_posts/', postName + ".md"), function (err) {
        if (err) {
            send("删除文章《" + postName + "》失败", "error");
            return console.error(err);
        }
        send("删除《" + postName + "》文章成功","success");
        send("", "reload");
    });
}
function save_post(id, data) {
    let postName = id.replace("#", "").replace("%23", "");
    try{
        fs.writeFileSync(path.join(hexo.source_dir, '_posts/', postName + ".md"), data)
    }
    catch (err) {
        send("保存文章《" + postName + "》失败", "error");
        return {
            'code': 0,
            'msg': "保存文章《" + postName + "》失败"
        };
    }
    send("保存《" + postName + "》文章成功","success");
    return {
        'code': 0,
        'msg': "保存文章《" + postName + "》成功"
    };
}
function rename_post(old_name, new_name) {
    old_name = old_name.replace("#", "").replace("%23", "");
    base_fs.rename(path.join(hexo.source_dir, '_posts/', old_name + ".md"), path.join(hexo.source_dir, '_posts/', new_name + ".md"),function (err) {
        if (err) {
            console.log(err)
            return
        }
        send(new_name, "success");
        send("", "reload");
        return {
            'code':1,
            'new_name': new_name
        };
    })
}
function new_page(e) {
    shell({
        e: "hexo new page " + e, next: () => {
            let checkExists = setTimeout(() => {
                if (fs.existsSync(path.join(hexo.source_dir, e, "index.md"))) {
                    clearInterval(checkExists);
                    send("新建\"" + e + "\"页面成功","success");
                    send("", "reload");
                }
            }, 1000);
        }
    });
}
function delete_page(e) {
    let page = e.replace("#", "").replace("%23", "");
    let files = fs.readdirSync(path.join(hexo.source_dir, page));
    if (files.length > 1) {
        send("\"" + page + "\"文件夹内有其他文件，请手动删除", "error");
        return {
            'code': 2,
            'msg': "\"" + page + "\"文件夹内有其他文件，请手动删除"
        };
    }
    fs.unlink(path.join(hexo.source_dir, page, "index.md"), function (err) {
        if (err) {
            send("删除页面\"index.md\"文件失败", "error");
            return {
                'code': 1,
                'msg': "删除页面\"index.md\"文件失败"
            };
        }
        fs.rmdir(path.join(hexo.source_dir, page), function (err) {
            if (err) {
                send("删除页面\"" + page + "\"失败", "error");
                return {
                    'code': 1,
                    'msg': "删除页面\"" + page + "\"失败"
                };
            }
            send("删除\"" + page + "\"页面成功","success");
            send("", "reload");
            return {
                'code': 0,
                'msg': "删除\"" + page + "\"页面成功"
            };
        });
    });
}
function save_page(id, data) {
    let page = id.replace("#", "").replace("%23", "");
    try {
        fs.writeFileSync(path.join(hexo.source_dir, page, "index.md"), data)
    }
    catch (err) {
        send("保存页面\"" + page + "\"失败", "error");
        return {
            'code': 0,
            'msg': "保存页面\"" + page + "\"失败"
        };
    }
    send("保存\"" + page + "\"页面成功","success");
    return {
        'code': 1,
        'msg': "保存页面\"" + page + "\"成功"
    };
}
function rename_page(old_name, new_name) {
    old_name = old_name.replace("#", "").replace("%23", "");
    base_fs.rename(path.join(hexo.source_dir, old_name), path.join(hexo.source_dir, new_name),function (err) {
        if (err) {
            console.log(err)
            return
        }
        send(new_name, "success");
        send("", "reload");
        return {
            'code':1,
            'new_name': new_name
        };
    })
}
function upload_file(file) {
    var file_name = info.name.replace("#", "").replace("%23", "")
    var file1_path = path.join(file.destination, info.type)
    var file2_path = path.join(file1_path, file_name)
    var img_path = path.join(file2_path, file.originalname)
    var my_file = file.path
    if (!base_fs.existsSync(file1_path)) {
        try {
            base_fs.mkdirSync(file1_path)
        }
        catch (err) {

        }
    }
    if (!base_fs.existsSync(file2_path)) {
        try {
            base_fs.mkdirSync(file2_path)
        }
        catch (err) {}
    }
    try{
        base_fs.copyFileSync(my_file, img_path)
        base_fs.unlinkSync(my_file)
    }
    catch (err) {
        return {
            'url': '/img/' + info.type + '/' + file_name + '/' + file.originalname,
            'success': 1,
            'massage': err
        }
    }
    return {
        'url': '/img/' + info.type + '/' + file_name + '/' + file.originalname,
        'success': 1,
        'massage': '上传成功'
    }
}
module.exports = router;