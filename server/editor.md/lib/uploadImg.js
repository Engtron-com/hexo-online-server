function initPasteDragImg(Editor){
    var doc = document.getElementById(Editor.id) 
    doc.addEventListener('paste', function (event) {
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
        uploadImg(file, Editor, true);
    });
    var dashboard = document.getElementById(Editor.id)
    dashboard.addEventListener("dragover", function (e) {
        e.preventDefault()
        e.stopPropagation()
    })
    dashboard.addEventListener("dragenter", function (e) {
        e.preventDefault()
        e.stopPropagation()
    })
    dashboard.addEventListener("drop", function (e) {
        e.preventDefault()
        e.stopPropagation()
     var files = this.files || e.dataTransfer.files;
        uploadImg(files[0], Editor, false);
    })
}
function uploadImg(file, Editor, isState){
    let formData = new FormData();
    formData.append('editormd-image-file', file);
    $.ajax({
        type : 'post',
        url : Editor.settings.imageUploadURL,
        data: formData,
        processData:false,
        async:false,
        cache: false,  
        contentType: false, 
        success:function(re){
            let url = re.url;
            if(/(png|jpg|jpeg|gif|bmp|ico|image)/.test(url)){
                Editor.insertValue("![图片alt]("+url+")");
            }else{
                Editor.insertValue("[下载附件]("+url+")");
            }    
        },
        error:function(e){
            console.log(e);
        }
    })
}