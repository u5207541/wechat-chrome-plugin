/**
 * Created by UU on 16-1-31.
 */
$(function(){
    var serverUri = 'http://guangeryi.6655.la:8888/boyuan/putWeixinList';//推送微信文章链接
    var blockIp = 'http://guangeryi.6655.la:8888/boyuan/getBlockIp';

    var antispider = 'sogou.com/antispider'
    var indexWeiboURI = 'http://mp.weixin.qq.com/profile';
    var weiboURI = 'http://mp.weixin.qq.com/s';
    var sogouURI = 'http://weixin.sogou.com/';
    var getComments = 'http://mp.weixin.qq.com/mp/getcomment';
    var exeTime = 5000;
    var waitTaskTime = 1000*60*5; //休眠等候任务时间，只针对近日抓取服务器而言。
    var localkey = 'uu_key';
    var indexObj = {};
    var taskUri = "http://guangeryi.6655.la:8888/boyuan/getWeixinCodeList?i="

    var taskIndex = window.localStorage['uu_taskIndex']||1;

    var wechatIndexCount = window.localStorage['uu_wechatIndx']||0;

    var first = window.localStorage['uu_first'];

    var notifyConutWeekObj = {};
    var notifyData = {};

    var wechats =  [];
    try{
        wechats = JSON.parse(window.localStorage['uu_wechats'])
    }catch (e){}

    try{
        notifyData = JSON.parse(window.localStorage['notifyData'])
    }catch (e){}

    var locationUrl = window.location.href; //通过他判断是抓取还是执行




    if(locationUrl.indexOf('antispider') > -1){
        setInterval(function(){
            window.localStorage['uu_wechatIndx'] = wechatIndexCount - 1;
            //Block 当前IP
            $.getJSON(blockIp,function(result){
               window.location.href="http://weixin.sogou.com";
            })
        },2000);
    }else if(locationUrl.startsWith(sogouURI)){
        debugger;
        if(wechatIndexCount > wechats.length){
            $.getJSON(taskUri+taskIndex,function(result){
                var resultStr = JSON.stringify(result)
                window.localStorage['uu_wechats'] = resultStr;
                window.localStorage['uu_wechatIndx'] = 0;
                if(result.length < 50 && window.localStorage['uu_wechats'] == resultStr){
                    setTimeout(function(){
                        window.location.reload();
                    },waitTaskTime);
                }else{
                    window.location.reload();
                }
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
        setTimeout(function(){
           window.location.href = 'http://weixin.sogou.com/weixin?type=1&query='+wechats[wechatIndexCount-1]+'&ie=utf8&_sug_=n&_sug_type_=';
        },1000)

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
            debugger;
            //最多发送三次
            if(localFlag == 1){
                clearInterval(toFunction)
                return;
            }
            if(notifyData){
                var i = 0;
                for(var key in notifyData){
                    i++;
                }
                if(i > 0){
                    var temp = window.localStorage['notifyData'];
                    $.post(serverUri,{data:temp},function(result){
                        localFlag = 1;
                        if(temp == window.localStorage['notifyData']){
                           window.localStorage['notifyData'] = '{}';
                        }
                        window.close();
                    });
                }else{
                    window.close();
                }
            }else{
                window.close();
            }

        },5000);

    }

    function exeWeChatIndex()
    {

        $('.weui_media_box').each(function(){
            var $this =$(this);
            var time = $('.weui_media_extra_info',$(this)).text();
            var href = 'http://mp.weixin.qq.com'+$('.weui_media_title',$(this)).attr('hrefs');
            var title = $('.weui_media_title',$(this)).text().trim();
            var headImage = $('.weui_media_hd').attr('style');
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
            indexObj[wechatArtObj.time] = wechatArtObj;
            wechatArtObj.readUri = href.replace(weiboURI,getComments);
            getReadNum($this,wechatArtObj);
        })
        //每周发布次数
        var pushCount = 0;
        var notifyIndex = 0;
        // After 10 s, the article's readNum is not exist, reload page
        var countException  = 0;
        var avgReadNum = 0;
        var isPush = setInterval(function(){
            countException ++;
            for(var key in indexObj){
                if(indexObj[key]['readNum'] === undefined){
                    if(countException > 10){
                        delete indexObj[key];
                    }else{
                        return;
                    }
                }
            }


            for(var key in indexObj){
                notifyIndex++;
                avgReadNum += indexObj[key]['readNum'];
                if(moment(key).isBetween(moment().subtract(10,"day"),moment())){
                    pushCount++;
                }
            }

            indexObj.wechatCode = $('.profile_account').text().replace('微信号:','').trim();;
            indexObj.name = $('.profile_nickname').text().trim(); //名称
            indexObj.verified = $('.success').length; //是否认证
            indexObj.picture = $('.radius_avatar img').attr('src');   //头像
            indexObj.description = $('.profile_desc_value').attr('title'); //描述
            indexObj.avgReadNum = avgReadNum;
            indexObj.pushCount = pushCount;

            try{
                notifyData = JSON.parse(window.localStorage['notifyData']);
            }catch (e){}
            notifyData[indexObj.wechatCode] = indexObj;
            window.localStorage['notifyData'] = JSON.stringify(notifyData);
            postJSON(notifyData);
        },1000)
    }
})