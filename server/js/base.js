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