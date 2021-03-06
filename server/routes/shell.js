var express = require('express');
var router = express.Router();
var shell = require("../../lib/shell");
var dateFormat = require("../../lib/dateFormat");
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
    if (req.session.user === olConfig.user && req.session.isLogin && !req.session.isLoadingGenerate) {
        switch (req.query.action) {
            case "pull":
                gitPull();
                res.end();
                break;
            case "push":
                gitPush();
                res.end();
                break;
            case "get_postname":
                info = {
                    name: req.query.post,
                    type: 'post'
                };
                res.end();
                break
            case "get_pagename":
                info = {
                    name: req.query.page,
                    type: 'page'
                }
                res.end();
                break
            case "clean":
                hexoClean();
                res.end();
                break;
            case "generate": 
                hexoGenerate(req, res);
                break;
            case "deploy":
                hexoDeploy();
                res.end();
                break;
            case "server":
                hexoServer();
                res.end();
                break;
            case "close_server":
                closeServer();
                res.end();
                break;
            case "new_post":
                new_post(req.query.post, res);
                break;
            case "delete_post":
                delete_post(req.query.post, res);
                break;
            case "rename_post":
                rename_post(req.query.old_name, req.query.new_name, res);
                break
            case "new_page":
                new_page(req.query.page, res);
                break;
            case "delete_page":
                delete_page(req.query.page, res);
                break;
            case "rename_page":
                rename_page(req.query.old_name, req.query.new_name, res);
                break;
            default:
                send("Undefined command","error");
                res.end();
                break;
        }
    } else {
        res.render('login', { script: '' });
    }
}).post('/', upload.single('editormd-image-file'), function (req, res, next) {
    if (req.session.user === olConfig.user && req.session.isLogin && !req.session.isLoadingGenerate) {
        let data = null;
        switch (req.query.action) {
            case "save_post":
                data = save_post(req.body.post, req.body.data);
                res.json(data);
                break;
            case "save_page":
                data = save_page(req.body.page, req.body.data);
                res.json(data);
                break;
            case "upload_file":
                data = upload_file(req.file);
                res.send(data);
                break;
            default:
                send("Undefined command","error");
                res.end();
                break;
        }
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
        e: "npm run build", next: () => {
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
function hexoGenerate(req, res) {
    req.session.isLoadingGenerate = true;
    shell({
        e: "npm run build", next: () => {
            req.session.isLoadingGenerate = false;
            res.end();
            console.log('发布成功'+req.session.isLoadingGenerate )
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
function new_post(e, res) {
    shell({
        e: "hexo new " + e, next: () => {
            let checkExists = setTimeout(() => {
                if (fs.existsSync(path.join(hexo.source_dir, '_posts/', e + ".md"))) {
                    clearTimeout(checkExists);
                    res.json({ success: true, name: e, msg: "新建《" + e + "》文章成功" });
                }
            }, 100);
        }
    });
}
function delete_post(name, res) {
    let postName = name.replace("%23", "");
    fs.unlink(path.join(hexo.source_dir, '_posts/', postName + ".md"), function (err) {
        if (err) {
            send("删除文章《" + postName + "》失败", "error");
            return;
        }
        res.json({ success: true, pId: postName, msg:"删除《" + postName + "》文章成功" });
    });
}
function save_post(id, data) {
    let postName = id.replace("%23", "");
    try{
        fs.writeFileSync(path.join(hexo.source_dir, '_posts/', postName + ".md"), data)
    }
    catch (err) {
        send("保存文章《" + postName + "》失败", "error");
        return {
            error: true,
            //'msg': "保存文章《" + postName + "》失败"
        };
    }
    //send("保存《" + postName + "》文章成功","success");
    return {
        success: true,
        msg: "保存文章《" + postName + "》成功"
    };
}
function rename_post(old_name, new_name, res) {
    old_name = old_name.replace("%23", "");
    base_fs.rename(path.join(hexo.source_dir, '_posts/', old_name + ".md"), path.join(hexo.source_dir, '_posts/', new_name + ".md"),function (err) {
        if (err) {
            console.log(err)
            return
        }
        //send(new_name, "success");
        res.json({ success: true, new_name : new_name });
    })
}
function new_page(e, res) {
    shell({
        e: "hexo new page " + e, next: () => {
            let checkExists = setTimeout(() => {
                if (fs.existsSync(path.join(hexo.source_dir, e, "index.md"))) {
                    clearTimeout(checkExists);
                    res.json({ success: true, name: e, msg: "新建\"" + e + "\"页面成功" });
                    //send("", "reload");
                }
            }, 1000);
        }
    });
}
function delete_page(name, res) {
    let page = name.replace("#", "").replace("%23", "");
    let files = fs.readdirSync(path.join(hexo.source_dir, page));
    if (files.length > 1) {
        send("\"" + page + "\"文件夹内有其他文件，请手动删除", "error");
        return;
    }
    fs.unlink(path.join(hexo.source_dir, page, "index.md"), function (err) {
        if (err) {
            send("删除页面\"index.md\"文件失败", "error");
            return;
        }
        console.log('执行成功')
        fs.rmdir(path.join(hexo.source_dir, page), function (err) {
            if (err) {
                send("删除页面\"" + page + "\"失败", "error");
                return;
            }
            res.json({ success: true, pId: page, msg: "删除\"" + page + "\"页面成功" });  
        });
    });
}
function save_page(id, data) {
    let page = id.replace("%23", "");
    try {
        fs.writeFileSync(path.join(hexo.source_dir, page, "index.md"), data)
    }
    catch (err) {
        send("保存页面\"" + page + "\"失败", "error");
        return {
            error: true,
            msg: "保存页面\"" + page + "\"失败"
        };
    }
    //send("保存\"" + page + "\"页面成功","success");
    return {
        success: true,
        msg: "保存页面\"" + page + "\"成功"
    };
}
function rename_page(old_name, new_name, res) {
    old_name = old_name.replace("%23", "");
    base_fs.rename(path.join(hexo.source_dir, old_name), path.join(hexo.source_dir, new_name),function (err) {
        if (err) {
            console.log(err)
            return
        }
        res.json({ success: true, new_name: new_name });
    })
}
function upload_file(file) {
    var file_name = info.name.replace("#", "").replace("%23", "")
    var file1_path = path.join(file.destination, info.type)
    var file2_path = path.join(file1_path, file_name)
    var img_path = path.join(file2_path, file.originalname)
    var my_file = file.path;
    let fileName = file.originalname
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
            'url': hexo.public_dir + '/img/' + info.type + '/' + file_name + '/' + file.originalname,
            'success': 1,
            'massage': err
        }
    }
    if (base_fs.existsSync(img_path)) {
        try {
            fileName = new Date().getTime() +'_'+ file.originalname;
            base_fs.renameSync(img_path, file2_path+'/'+ fileName); //修改图片默认地址
        } catch (error) {
            
        }
    }
    
    return {
        'url': hexo.public_dir + '/img/' + info.type + '/' + file_name + '/' + fileName,
        'success': 1,
        'massage': '上传成功'
    }
}

module.exports = router;