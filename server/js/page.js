$(".list-group-item").bind("click", function () {
    $(".list-group-item").removeClass("active");
    $(this).addClass("active");
    let titleEl = document.getElementById('txtTitle');
    let title = e.target.innerText || '#';
    $(titleEl).attr('page-id', title);
    $(txtTitle).attr('placeholder', title);
});
$("a[page]").bind("click", getPage);
$("a[wss]").bind("click", function () {
    let href=$(this).attr("href");
    switch ($(this).attr("name")) {
        case "new":
            // alertify
            //     .okBtn("确定")
            //     .cancelBtn("取消")
            //     .prompt("请输入页面名称：",
            //         function (val, ev) {
            let name = dateFormat('YYYY-MM-DD HH:mm:ss');
            ev.preventDefault();
            $.get(href, {
                page:val
            }, function (data, status) {
                if (status === "success") {
                    let a = document.createElement('a');
                    a.href = "#" +name;
                    a.className = "list-group-item";
                    a.setAttribute('page', '');
                    a.style = "position: relative";
                    a.innerText = name;
                    $('#blog-group').append(a);
                    $(a).bind('click', getPage);
                }
            });
            //});
            break;
        case "delete":
            let that = this;
            $.MsgBox.Confirm('温馨提示！', '确认删除当前博客？', function() {
                $.get(href, {
                    page: $(that).attr("page-id")
                });
            });
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
    let old_name = $(titleEl).attr('page-id');
    let val = $(titleEl).val();
    if (val && old_name !== val) {
        $.ajax({
            url: '/shell?action=rename_page',
            data: {
                old_name: old_name,
                new_name: val
            },
            type: 'get',
            success : function(res) {
                $(currentEl).text(val);
                $.post(href, {
                    page: val,
                    data: $(".editormd-markdown-textarea").val()
                });
            }
        })
    } else {
        $.post(href, {
            page:  $(currentEl).text(),
            data: $(".editormd-markdown-textarea").val()
        });
    }
});


function getPage() {
    let pageId = $(this).attr("href");
    $.get('/getPage', {
        page: pageId
    }, function (data, status, xhr) {
        if (status === "success" && data.success) {
            let editor = editormd("editor", {
                width: "100%",
                height: "95%",
                markdown: data.data, // dynamic set Markdown text
                path: "/lib/" // Autoload modules mode, codemirror, marked... dependents libs path
            });
            $('a[page-id]').attr("page-id", pageId);
            let autoSaveTime = <%= autoSave %> ;
            if (autoSaveTime) {
                if (window.autoSave) clearInterval(window.autoSave);
                window.autoSave = setInterval(() => {
                    $.post($('a[name="save"]').attr("href"), {
                        page: $('a[name="save"]').attr("page-id"),
                        data: $(".editormd-markdown-textarea").val()
                    });
                }, autoSaveTime);
            }
            initPasteDragImg(editor);
        } else {
            swal("\n获取页面失败", "error");
        }
    });
    $.get('/shell?action=get_pagename',{
        page: pageId
    });
}