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
    var exeTime = 10000;
    var refreshTime = 10000;
    var localkey = 'uu_key';
    var indexObj = {};
    var taskUri = "http://rayong.gicp.net:8888/bw/getWeixinCodeList?i="

    var taskIndex = window.localStorage['uu_taskIndex']||1;


    var wechatIndexCount = window.localStorage['uu_wechatIndx']||0;

    var first = window.localStorage['uu_first'];

    var notifyConutWeekObj = {};
    var notifyConutWeek = '';

    var wechats =  [];
    try{
        wechats = JSON.parse(window.localStorage['uu_wechats'])
    }catch (e){}

    var locationUrl = window.location.href; //通过他判断是抓取还是执行




    if(locationUrl.indexOf('antispider') > -1){
        setInterval(function(){
            window.localStorage['uu_wechatIndx'] = wechatIndexCount - 1;
            window.location.href="http://weixin.sogou.com";
        },2000);
    }else if(locationUrl.startsWith(sogouURI)){
        if(wechats.length == 0 || wechatIndexCount >= wechats.length){
            $.getJSON(taskUri+taskIndex,function(result){
                window.localStorage['uu_wechats'] =JSON.stringify(result);
                window.localStorage['uu_wechatIndx'] = 0;
                window.location.reload();
            });
        }else{
            if(wechatIndexCount == 0){
                setInterval(function(){
                    $("#upquery").val(wechats[wechatIndexCount]);
                    $.ajax({
                        type: "GET",
                        url: "http://cdn.bootcss.com/jquery/3.0.0-beta1/jquery.min.js",
                        success: function(data){
                            wechatIndexCount ++;
                            window.localStorage['uu_wechatIndx'] = wechatIndexCount;
                            window.location.href = 'http://weixin.sogou.com/weixin?type=1&query='+wechats[wechatIndexCount-1]+'&ie=utf8&_sug_=n&_sug_type_=';
                        }
                    })
                },exeTime);
                return;
            }
            if( wechatIndexCount < wechats.length){
                for (var it in $.cookie()){
                    $.removeCookie(it,{domain:'.sogou.com',path:'/'});
                    $.removeCookie(it,{domain:'weixin.sogou.com',path:'/'});
                }
                setInterval(function(){
                    $.ajax({
                        type: "GET",
                        url: "http://cdn.bootcss.com/jquery/3.0.0-beta1/jquery.min.js",
                        success: function(data){
                            exeSogou(wechats[wechatIndexCount-1]);
                        }
                    })
                },exeTime);
            }
        }
    }else if(locationUrl.startsWith(weiboURI)){
        exeWeChat();
    }else if(locationUrl.startsWith(indexWeiboURI)){
        exeWeChatIndex();
    }

    function exeSogou(weChatCode){
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
                        $('.txt-box').parent().eq(0).click();
                }
            }catch(e){}
        }
        wechatIndexCount ++;
        window.localStorage['uu_wechatIndx'] = wechatIndexCount;
        window.location.href = 'http://weixin.sogou.com/weixin?type=1&query='+wechats[wechatIndexCount-1]+'&ie=utf8&_sug_=n&_sug_type_=';
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
        console.log(content);
        var localFlag = 0;
        var toFunction = setInterval(function(){
            //最多发送三次
            if(localFlag > 3){
                clearInterval(toFunction)
                window.close();
                return;
            }
            $.post(serverUri,{data:content},function(result){

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
        //每周发布次数
        var notifyIndex = 0;
        // After 10 s, the article's readNum is not exist, reload page
        var countException  = 0;
        var avgReadNum = 0;
        var isPush = setInterval(function(){
            countException ++;
            for(var key in indexObj){
                if(!indexObj[key]['readNum']){
                    if(countException > 10){
                        delete indexObj[key];
                    }
                }
            }

            for(var key in indexObj){
                notifyIndex++;
                avgReadNum += indexObj[key]['readNum'];
            }

            //push data
            indexObj.count = notifyIndex;
            indexObj.wechatCode = wechatCode;
            indexObj.avgReadNum = avgReadNum/notifyIndex.toFixed(0);
            //window.localStorage[localkey + '_' + wechatCode] = JSON.stringify(indexObj);
            postJSON(JSON.stringify(indexObj));
            clearInterval(isPush);
        },1000)
    }
})