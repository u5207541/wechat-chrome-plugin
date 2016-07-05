/**
 * Created by UU on 16-1-31.
 */
$(function(){
    var serverUri = 'http://guangeryi.6655.la:8888/boyuan/putWeixin';//推送微信文章链接
    var antispider = 'sogou.com/antispider'
    var indexWeiboURI = 'http://mp.weixin.qq.com/profile';
    var weiboURI = 'http://mp.weixin.qq.com/s';
    var sogouURI = 'http://weixin.sogou.com/';
    var getComments = 'http://mp.weixin.qq.com/mp/getcomment';

    var noTaskRefreshTime = 10*1000;
    var taskRefreshTime = 10000;

    var localkey = 'uu_key';
    var indexObj = {};
    //var taskUri = "http://rayong.gicp.net:8888/bw/getWeixinCodeList?i="
    var taskUri2 = "http://guangeryi.6655.la:8888/boyuan/getWeixinCodeList2";
    var taskIndex = window.localStorage['uu_taskIndex']||1;

    var wechatCode = window.localStorage['wechatCode']||"";


    var locationUrl = window.location.href; //通过他判断是抓取还是执行

    if(locationUrl.indexOf('antispider') > -1){
        setInterval(function(){
            window.location.href = sogouURI;
        },2000);
    }else if(locationUrl.startsWith(sogouURI)){
        for (var it in $.cookie()){
            $.removeCookie(it,{domain:'.sogou.com',path:'/'});
            $.removeCookie(it,{domain:'weixin.sogou.com',path:'/'});
        }
        exeSogou(wechatCode);
    }else if(locationUrl.startsWith(weiboURI)){
        exeWeChat();
    }else if(locationUrl.startsWith(indexWeiboURI)){
        exeWeChatIndex();
    }

    function exeSogou(weChatCode){
        debugger;
        if(weChatCode){
            //如果不成功，微信号不存在
            var $txtbox = $('.txt-box').eq(0);
            //has DATA
            if($txtbox.length != 0){
                //weChatCode is exist
                var _weChatCode = $('.txt-box').eq(0).find('label').text();
                //不区分大小写
                try{
                    if(_weChatCode.toLowerCase() == weChatCode.toLowerCase()){
                        //点击
                        window.location.href = $('.txt-box').parent().eq(0).attr('href');
                    }
                }catch(e){}
            }
        }
        $.getJSON(taskUri2,function(result){
            if(result.status == 0){
                setTimeout(function(){
                    window.location.href = sogouURI;
                },noTaskRefreshTime);
            }else{
                window.localStorage['wechatCode'] = result.result;
                setTimeout(function(){
                    window.location.href = 'http://weixin.sogou.com/weixin?type=1&query=' + result.result + '&ie=utf8&_sug_=n&_sug_type_=';
                },10000);
            }
        })
    }

    function exeWeChat(weChatCode) {
        var title = $('#activity-name').text().trim();
        var wechatCode = $('.profile_meta_value').eq(0).text().trim();
        console.log(window.localStorage[localkey + '_' + wechatCode + '_' + title])
    }

    function getReadNum($this,wechatArtObj){
        $.getJSON(wechatArtObj.readUri,function(result){
            $this.append('<div>'+result['read_num']||0 +'</div>')
            wechatArtObj.readNum = result['read_num'];
        })
    }
    //将年月时间转换
    function translateTime(time){
        return time.replace("年","-").replace("月","-").replace("日","")
    }

    function postJSON(content){

        var localFlag = 0;
        var toFunction = setInterval(function(){
            $.post(serverUri,{data:content},function(result){
                //跳转 sogou 首页
                $.getJSON(taskUri2,function(result2){
                    if(result2.status == 0){
                        setTimeout(function(){
                            window.location.href = sogouURI;
                        },noTaskRefreshTime);
                    }else{
                        window.localStorage['wechatCode'] = result2.result;
                        setTimeout(function(){
                            window.location.href = 'http://weixin.sogou.com/weixin?type=1&query=' + result2.result + '&ie=utf8&_sug_=n&_sug_type_=';
                        },10000);
                    }
                })
            });
            localFlag ++;
        },5000);

    }

    function exeWeChatIndex(){
        var wechatCode = $('.profile_account').text().replace('微信号:','').trim();
        $('.weui_media_box').each(function(){
            var $this =$(this);
            var time = $('.weui_media_extra_info',$(this)).text();
            var href = 'http://mp.weixin.qq.com'+$('.weui_media_title',$(this)).attr('hrefs');
            var title = $('.weui_media_title',$(this)).text().trim();
            var headImage = $('.weui_media_hd').attr('style');
            var logo = $('.radius_avatar img').attr('src');
            var index = 1;
            var wechatArtObj = {};
            if(indexObj[time]!= undefined){
                return true;
            }
            wechatArtObj.time = translateTime(time);
            wechatArtObj.href = href;
            wechatArtObj.title = title;
            wechatArtObj.headImage = headImage;
            wechatArtObj.artIndex = index;
            wechatArtObj.wechatCode = wechatCode;
            wechatArtObj.logo = logo;
            indexObj[time] = wechatArtObj;
            wechatArtObj.readUri = href.replace(weiboURI,getComments);
            getReadNum($this,wechatArtObj);
        })

        // After 10 s, the article's readNum is not exist, reload page
        var countException  = 0;
        var avgReadNum = 0;
        var isPush = setInterval(function(){
            countException ++;
            for(var key in indexObj){
                if(!indexObj[key]['readNum']){
                    if(countException > 10){
                        delete indexObj[key];
                    }else{
                        return;
                    }
                }
            }
            //push data
            indexObj.wechatCode = wechatCode;
            postJSON(JSON.stringify(indexObj));
        },1000)
    }
})