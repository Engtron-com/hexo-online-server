$(".list-group-item").bind("click", function (e) {
    $(".list-group-item").removeClass("active");
    $(this).addClass("active");
    let titleEl = document.getElementById('txtTitle');
    let title = e.target.innerText || '#';
    $(titleEl).attr('post-id', title);
    $(txtTitle).attr('placeholder', title);
});
$(".list-group-item")[0] &&  $(".list-group-item")[0].click();
$("a[post]").bind("click", getPost);

$("a[post]")[0] && $("a[post]")[0].click();
$("a[wss]").bind("click", function (e) {
    let href=$(this).attr("href");
    switch ($(this).attr("name")) {
        case "new":
            // var val = prompt("请输入文章标题：")
            // var c = function (val, ev) {
                ev.preventDefault();
                let name = dateFormat('YYYY-MM-DD HH:mm:ss');
                //if (val) {
                    $.get(href, {
                        post: name
                    }, function (data, status) {
                        if (status === "success") {
                            let a = document.createElement('a');
                            a.href =  "#" +name;
                            a.className = "list-group-item";
                            a.setAttribute('post', '');
                            a.style = "position: relative";
                            a.innerText = name;
                           $('#blog-group').append(a);
                           $(a).bind('click', getPost);
                        }
                    });
            //     }
            // };
            // c(val, e)
            break;
        case "delete":
            let that = this;
            $.MsgBox.Confirm('温馨提示！', '确认删除当前文章？', function() {
                $.get(href, {
                    post: $(that).attr("post-id")
                });
            })
            break;
        default:
            swal("未知操作", "error");
            break;
    }
    return false;
});
$(".btn-save").click(function () {
    let currentEl = $(".list-group-item.active");
    let titleEl = $('#txtTitle');
    let old_name = $(titleEl).attr('post-id');
    let val = $(titleEl).val();
    if (val && old_name !== val) {
        $.ajax({
            url: '/shell?action=rename_post',
            data: {
                old_name: old_name,
                new_name: val
            },
            type: 'get',
            success : function(res) {
                $(currentEl).text(val);
                $.ajax({
                    url: '/shell?action=save_post',
                    data: {
                        post: val,
                        data: $(".editormd-markdown-textarea").val()
                    },
                    type: 'post',
                    dataType: 'json',
                    success: function (res) {
                        swal("保存成功", "success");
                    }
                })
            }
        })
    } else {
        $.ajax({
            url: '/shell?action=save_post',
            data: {
                post: $(currentEl).text(),
                data: $(".editormd-markdown-textarea").val()
            },
            type: 'post',
            dataType: 'json',
            success: function (res) {
                swal("保存成功", "success");
            }
        })
    }
});
$(".btn-publish").click(function () {
    $.get("/shell?action=clean", function (data, status, xhr) {
        if (status === "success") {  
            $.get("/shell?action=generate");
        }
    })
});

$("#search").bind('input', throttle(function(e) {
    let val = $(this).val();
    let aList = document.querySelectorAll('.list-group-item');
    if (!val) {
        aList.forEach( aEl => {
            aEl.style.display = 'block';
        })
    } else {
        aList.forEach( aEl => {
            let text = aEl.innerText;
            if (!text || !text.indexOf(val) === -1) {
                aEl.style.display = 'none';
            }
        })
    }
}, 1500));

function getPost() {
    let postId = $(this).attr("href");
    $.get('/getPost', {
        post: postId
    }, function (data, status, xhr) {
        if (status === "success" && data.success) {
            let editor = editormd("editor", {
                width: "100%",
                height: "95%",
                markdown: data.data, // dynamic set Markdown text
                path: "/lib/" // Autoload modules mode, codemirror, marked... dependents libs path
            });
            $('a[post-id]').attr("post-id", postId);
            let autoSaveTime = <%= autoSave %> ;
            if (autoSaveTime) {
                if (window.autoSave) clearInterval(window.autoSave);
                window.autoSave = setInterval(() => {
                    $.post($('a[name="save"]').attr("href"), {
                        post: $('a[name="save"]').attr("post-id"),
                        data: $(".editormd-markdown-textarea").val()
                    });
                }, autoSaveTime);
            }
            initPasteDragImg(editor);
        } else {
            swal("\n获取文章失败", "error");
        }
    });
    $.get('/shell?action=get_postname',{
        post: postId
    });
}

function throttle(fun, delay) {
    let time = null;
    return function() {
        if (time) {
           return;
        }
        time = setTimeout(()=> {
            fun.call(null, ...arguments);
            time = null;
        }, delay)
    }
}