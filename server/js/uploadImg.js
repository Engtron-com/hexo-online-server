function initPasteDragImg(Editor){
    var doc = document.getElementById(Editor.id);
    let firstPaste = false, firstDrop = false;
    doc.addEventListener('paste', function (event) {
        if (firstPaste) return;
        var items = (event.clipboardData || window.clipboardData).items;
        var file = null;
        if (items && items.length) {
            // 搜索剪切板items
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    file = items[i].getAsFile();
                    break;
                }
            }
        } else {
            console.log("当前浏览器不支持");
            return;
        }
        if (!file) {
            console.log("粘贴内容非图片");
            return;
        }
        uploadImg(file, Editor, (flag) => { firstPaste = flag; });
    });
   
    doc.addEventListener("dragover", function (e) {
        e.preventDefault()
        e.stopPropagation()
    })
    doc.addEventListener("dragenter", function (e) {
        e.preventDefault()
        e.stopPropagation()
    })
    doc.addEventListener("drop", function (e) {
        e.preventDefault()
        e.stopPropagation()
        if (firstDrop) return;
        var files = this.files || e.dataTransfer.files;
        uploadImg(files[0], Editor, (flag) => { firstDrop = flag; });
    })
}
function uploadImg(file, Editor, callback){
    let formData = new FormData();
    formData.append('editormd-image-file', file);
    $.ajax({
        type : 'post',
        url : Editor.settings.imageUploadURL,
        data: formData,
        processData:false,
        async: true,
        cache: false,  
        contentType: false, 
        success:function(re){
            let url = re.url;
            if(/(png|jpg|jpeg|gif|bmp|ico|image)/.test(url)){
                Editor.insertValue("![图片alt]("+url+")");
            }else{
                Editor.insertValue("[下载附件]("+url+")");
            }
            if (callback && typeof callback === 'function') callback(false);
        },
        error:function(e){
            console.log(e);
        }
    });
    if (callback && typeof callback === 'function') callback(true);
}