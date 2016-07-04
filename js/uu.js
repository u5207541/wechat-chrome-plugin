/**
 * Created by UU on 16-1-31.
 */
//注解 测试提交
$(function(){
    var temp = "";
    var $button = $('<a href="javascript:void(0);" onclick="">复制(chrome)</a>');
    $(".ndownlist :checkbox").each(function(){
        var $this = $(this);
        if($this.val() == 'on'){
            return;
        }
        temp += $this.val() +"\n";
    })

    function copyTextToClipboard(text) {
        var copyFrom = document.createElement("textarea");
        copyFrom.textContent = text;
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        body.removeChild(copyFrom);
    }

   if(temp){
       $('.ckbox p').html($button);
       $button.click(function(event){
           copyTextToClipboard(temp);
           alert('复制成功');
       })
   }

    chrome.extension.sendRequest({greeting: "all"}, function(response) {

    });
})