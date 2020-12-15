function nextTick(callback) {
    return new Promise((res, rej) => {
        res();
    }).then( (r) => {
        if(isFunction(callback)) {
            callback(r);
        }
    }).catch( e => { throw e });
}

function isFunction(fun) {
    return Object.prototype.toString.call(fun) === '[object Function]';
}

window.onresize = function() {
    let clientWidth = getClientWidth();
    if (clientWidth > 1400) {
        $('.el-button-primary').show();
    } else {
        $('.el-button-primary').hide();
    }
}

function getClientWidth() {
    if(window.innerHeight !== undefined){
        return window.innerWidth;
    }else if(document.compatMode === "CSS1Compat"){
        return  document.documentElement.clientWidth;
    }else{
        return document.body.clientWidth;
    }
}