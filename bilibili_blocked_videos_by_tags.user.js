// ==UserScript==
// @name            Bilibili 按标签、标题、时长、UP主屏蔽视频
// @namespace       https://github.com/tjxwork
// @version         1.1.3
// @note
// @note            新版本的视频介绍，来拯救一下我可怜的播放量吧 ●︿●
// @note                   应该是目前B站最强的屏蔽视频插件？【tjxgame】
// @note                   https://www.bilibili.com/video/BV1WJ4m1u79n
// @note
// @note            v1.1.3 v1.1.3 兼容脚本处理：[bv2av](https://greasyfork.org/zh-CN/scripts/398535)(此脚本会将视频链接替换为旧的 AV 号链接)，感谢 @Henry-ZHR 的提出；
// @note                   不完善功能修复：每次触发运行时，会将屏蔽叠加背景层与父元素尺寸进行同步，解决了页面布局变化时叠加层不跟随变化，感谢 @Henry-ZHR 的建议；
// @note                   “隐藏首页等页面的非视频元素” 功能生效范围增加：隐藏 搜索页——综合 下的 直播卡片
// @note            v1.1.2 添加新功能：“按置顶评论屏蔽”；
// @note                   注意：“按置顶评论屏蔽”、“屏蔽精选评论的视频” 这两个功能都用到了获取评论的API，
// @note                   这个API对请求频率非常敏感，频繁刷新或者开启新页面会导致B站拒绝请求，正常浏览一般不会出现拒绝问题。
// @note            v1.1.1 添加新功能：“屏蔽充电专属的视频”；
// @note            v1.1.0 添加新功能：“屏蔽精选评论的视频”，骗子视频大概率会开启精选评论；
// @note                   “隐藏首页等页面的非视频元素” 功能生效范围增加：隐藏视频播放页右侧视频相关的游戏推荐；
// @note                   控制台输出日志优化：现在只有发生变化的时候才会输出；
// @note            v1.0.2 “隐藏首页等页面的非视频元素” 功能生效范围增加：隐藏视频播放页右侧最下方的“大家围观的直播”
// @note            v1.0.1 修正了B站旧版首页的顶部推荐条失效的Bug；
// @note                   如果用旧版首页只是想要更多的顶部推荐的话，建议使用 bilibili-app-recommend 来获取更多的推荐。
// @note                   现在版本B站首页的推荐卡片有广告的问题，可以通过本脚本的 “隐藏首页等页面的非视频元素” 功能来解决。
// @note            v1.0.0 菜单UI使用Vue3重构，现在不用担心缩放问题挡住UI了，界面更加现代化；
// @note                   改进了判断逻辑，现在可以使用白名单来避免误杀关注的UP了；
// @note                   新增功能：视频分区屏蔽、播放量屏蔽、点赞率屏蔽、竖屏视频屏蔽、UP主名称正则屏蔽、隐藏非视频元素、白名单避免屏蔽指定UP。
// @description     对Bilibili.com的视频卡片元素，以 标签、标题、时长、UP主名称、UP主UID 等信息来进行判断匹配，添加一个屏蔽叠加层或者隐藏视频。
// @author          tjxwork
// @license         CC-BY-NC-SA
// @icon            https://www.bilibili.com/favicon.ico
// @match           https://www.bilibili.com/*
// @match           https://www.bilibili.com/v/popular/all/*
// @match           https://www.bilibili.com/v/popular/weekly/*
// @match           https://www.bilibili.com/v/popular/history/*
// @exclude         https://www.bilibili.com/anime/*
// @exclude         https://www.bilibili.com/movie/*
// @exclude         https://www.bilibili.com/guochuang/*
// @exclude         https://www.bilibili.com/variety/*
// @exclude         https://www.bilibili.com/tv/*
// @exclude         https://www.bilibili.com/documentary*
// @exclude         https://www.bilibili.com/mooc/*
// @exclude         https://www.bilibili.com/v/virtual/*
// @exclude         https://www.bilibili.com/v/popular/music/*
// @exclude         https://www.bilibili.com/v/popular/drama/*
// @match           https://search.bilibili.com/*
// @exclude         https://search.bilibili.com/live
// @grant           GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_addStyle
// @require         https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-w/vue/3.2.31/vue.global.min.js
// @downloadURL https://update.greasyfork.org/scripts/481629/Bilibili%20%E6%8C%89%E6%A0%87%E7%AD%BE%E3%80%81%E6%A0%87%E9%A2%98%E3%80%81%E6%97%B6%E9%95%BF%E3%80%81UP%E4%B8%BB%E5%B1%8F%E8%94%BD%E8%A7%86%E9%A2%91.user.js
// @updateURL https://update.greasyfork.org/scripts/481629/Bilibili%20%E6%8C%89%E6%A0%87%E7%AD%BE%E3%80%81%E6%A0%87%E9%A2%98%E3%80%81%E6%97%B6%E9%95%BF%E3%80%81UP%E4%B8%BB%E5%B1%8F%E8%94%BD%E8%A7%86%E9%A2%91.meta.js
// ==/UserScript==

"use strict";

// --------------------参数变量初始化--------------------

// 初始化屏蔽参数变量，从 油猴扩展存储 读取到 blockedParameter
let blockedParameter = GM_getValue("GM_blockedParameter", {
    // 屏蔽标题
    blockedTitle_Switch: true,
    blockedTitle_UseRegular: true,
    blockedTitle_Array: [],

    // 屏蔽Up主和Uid
    blockedNameOrUid_Switch: true,
    blockedNameOrUid_UseRegular: false,
    blockedNameOrUid_Array: [],

    // 屏蔽视频分区
    blockedVideoPartitions_Switch: true,
    blockedVideoPartitions_UseRegular: false,
    blockedVideoPartitions_Array: [],

    // 屏蔽标签
    blockedTag_Switch: true,
    blockedTag_UseRegular: true,
    blockedTag_Array: [],

    // 屏蔽双重屏蔽标签
    doubleBlockedTag_Switch: true,
    doubleBlockedTag_UseRegular: true,
    doubleBlockedTag_Array: [],

    // 屏蔽短时长视频
    blockedShortDuration_Switch: false,
    blockedShortDuration: 0,

    // 屏蔽低播放量视频
    blockedBelowVideoViews_Switch: false,
    blockedBelowVideoViews: 0,

    // 屏蔽低于指定点赞率的视频
    blockedBelowLikesRate_Switch: false,
    blockedBelowLikesRate: 0,

    // 屏蔽竖屏视频
    blockedPortraitVideo_Switch: false,

    // 屏蔽充电专属的视频
    blockedChargingExclusive_Switch: false,

    // 屏蔽精选评论的视频
    blockedFilteredCommentsVideo_Switch: false,

    // 屏蔽置顶评论
    blockedTopComment_Switch: false,
    blockedTopComment_UseRegular: true,
    blockedTopComment_Array: [],

    // 白名单Up主和Uid
    whitelistNameOrUid_Switch: false,
    whitelistNameOrUid_Array: [],

    // 隐藏非视频元素
    hideNonVideoElements_Switch: true,

    // 隐藏视频而非叠加层模式
    hideVideoMode_Switch: false,

    // 控制台输出日志
    consoleOutputLog_Switch: false,
});

// 旧参数适配
function oldParameterAdaptation(obj) {
    //判断是否为旧参数，是的话就修改为新参数结构
    if (Object.prototype.hasOwnProperty.call(obj, "blockedTitleArray")) {
        // 屏蔽标题
        obj["blockedTitle_Switch"] = true;
        obj["blockedTitle_UseRegular"] = true;
        obj["blockedTitle_Array"] = obj["blockedTitleArray"];
        delete obj["blockedTitleArray"];

        // 屏蔽Up主和Uid
        obj["blockedNameOrUid_Switch"] = true;
        obj["blockedNameOrUid_UseRegular"] = true;
        obj["blockedNameOrUid_Array"] = obj["blockedNameOrUidArray"];
        delete obj["blockedNameOrUidArray"];

        // 屏蔽视频分区
        obj["blockedVideoPartitions_Switch"] = false;
        obj["blockedVideoPartitions_UseRegular"] = false;
        obj["blockedVideoPartitions_Array"] = [];

        // 屏蔽标签
        obj["blockedTag_Switch"] = true;
        obj["blockedTag_UseRegular"] = true;
        obj["blockedTag_Array"] = obj["blockedTagArray"];
        delete obj["blockedTagArray"];

        // 屏蔽双重屏蔽标签
        obj["doubleBlockedTag_Switch"] = true;
        obj["doubleBlockedTag_UseRegular"] = true;
        obj["doubleBlockedTag_Array"] = obj["doubleBlockedTagArray"];
        delete obj["doubleBlockedTagArray"];

        // 屏蔽短时长视频
        obj["blockedShortDuration_Switch"] = true;

        // 白名单Up主和Uid
        obj["whitelistNameOrUid_Switch"] = false;
        obj["whitelistNameOrUid_Array"] = [];

        // 隐藏视频而非叠加层模式
        obj["hideVideoMode_Switch"] = obj["hideVideoModeSwitch"];
        delete obj["hideVideoModeSwitch"];

        // 控制台输出日志
        obj["consoleOutputLog_Switch"] = obj["consoleOutputLogSwitch"];
        delete obj["consoleOutputLogSwitch"];
    }
}
oldParameterAdaptation(blockedParameter);

// --------------------菜单UI部分--------------------

// 菜单UI的CSS，使用 GM_addStyle 注入 CSS
GM_addStyle(`
:root {
    /* 主窗体背景色 */
    --uiBackgroundColor: rgb(48, 48, 48);
    /* 输入模块背景色 */
    --uiInputContainerBackgroundColor: rgb(64, 64, 64);
    /* 输入框背景色 */
    --uiInputBoxBackgroundColor: rgb(89, 89, 89);
    /* 滚动条背景色 */
    --uiScrollbarBackgroundColor: rgb(141, 141, 141);
    /* 文字颜色 */
    --uiTextColor: rgb(250, 250, 250);
    /* 按钮色 */
    --uiButtonColor: rgb(0, 174, 236);
    /* 边框色 */
    --uiBorderColor: rgba(0, 0, 0, 0);
    /* 提醒框背景色 */
    --uiPromptBoxColor: rgb(42, 44, 53);
    /* 屏蔽叠加层背景色 */
    --blockedOverlayColor: rgba(60, 60, 60, 0.85);
    /* 字体大小 */
    --fontSize: 14px;
    /* 行高 */
    --lineHeight: 24px;
    /* 圆角 */
    --borderRadius: 4px;
}

/* 菜单UI */
#blockedMenuUi {
    font-size: var(--fontSize);
    position: fixed;
    bottom: 4vh;
    right: 2vw;
    z-index: 1005;
    width: 460px;
    max-height: 90vh;
    overflow-y: auto;
    background-color: var(--uiBackgroundColor);
}

#blockedMenuUi,
#blockedMenuUi * {
    color: var(--uiTextColor);
    box-sizing: border-box;
    border-style: solid;
    border-width: 0px;
    border-color: var(--uiBorderColor);
    border-radius: var(--borderRadius);
    line-height: var(--lineHeight);
    vertical-align: middle;
    font-family: "Cascadia Mono", Monaco, Consolas, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

/* 滚动条 */
#blockedMenuUi::-webkit-scrollbar,
#blockedMenuUi ul::-webkit-scrollbar {
    width: 7px;
}

/* 滚动条 轨道*/
#blockedMenuUi::-webkit-scrollbar-track,
#blockedMenuUi ul::-webkit-scrollbar-track {
    background: var(--uiScrollbarBackgroundColor);
    border-radius: 7px;
}

/* 滚动条 滑块*/
#blockedMenuUi::-webkit-scrollbar-thumb,
#blockedMenuUi ul::-webkit-scrollbar-thumb {
    background: var(--uiInputContainerBackgroundColor);
    border-radius: 7px;
}

/* 滚动条 滑块 鼠标经过 */
#blockedMenuUi::-webkit-scrollbar-thumb:hover,
#blockedMenuUi ul::-webkit-scrollbar-thumb:hover {
    background: var(--uiInputBoxBackgroundColor);
    border-radius: 7px;
}

/* 滚动条 滑块 鼠标点击 */
#blockedMenuUi::-webkit-scrollbar-thumb:active,
#blockedMenuUi ul::-webkit-scrollbar-thumb:active {
    background: var(--uiButtonColor);
    border-radius: 7px;
}

#menuTitle {
    font-size: 18px;
    text-align: center;
    margin: 10px;
}

.menuOptions {
    background-color: var(--uiInputContainerBackgroundColor);
    padding: 10px;
    margin: 0 10px;
    margin-bottom: 10px;
}

.titleLabelLeft {
    display: inline-block;
    width: 275px;
    margin-bottom: 5px;
}

.titleLabelRight {
    display: inline-block;
    margin-bottom: 5px;
}

#blockedMenuUi label {
    font-size: 16px;
    vertical-align: middle;
}

#blockedMenuUi input {
    background-color: var(--uiInputBoxBackgroundColor);
    font-size: var(--fontSize);
    line-height: var(--lineHeight);
    border-radius: var(--borderRadius);
    padding: 0 5px;
    margin-bottom: 5px;
    width: 360px;
    vertical-align: middle;
}

#blockedMenuUi input[type="number"] {
    width: 4em;
    margin: 0 5px;
    padding: 0 5px;
    text-align: right;
    appearance: none;
}

#blockedMenuUi input[type="number"]::-webkit-inner-spin-button,
#blockedMenuUi input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

#blockedMenuUi input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin: 0;
    margin-bottom: 2.5px;
    margin-right: 5px;
    appearance: none;
    border: 1.5px solid var(--uiTextColor);
    border-radius: 8px;
}

#blockedMenuUi input[type="checkbox"]:checked {
    border: 3px solid;
    background-color: var(--uiButtonColor);
}

#blockedMenuUi button {
    line-height: var(--lineHeight);
    border-radius: var(--borderRadius);
    padding: 0;
    margin-bottom: 5px;
    margin-left: 5px;
    width: 45px;
    vertical-align: middle;
    background-color: var(--uiButtonColor);
    transition: background-color 0.1s ease;
}

#blockedMenuUi button:hover {
    background-color: rgb(17, 154, 204);
}

#blockedMenuUi button:active {
    background-color: rgb(62, 203, 255);
}

#blockedMenuUi ul {
    background-color: var(--uiInputBoxBackgroundColor);
    font-size: 14px;
    padding: 5px 5px 0px 0px;
    margin-inline: 0px;
    margin: 0;
    width: 100%;
    min-height: 34px;
    max-height: 92px;
    overflow-y: auto;
}

#blockedMenuUi li {
    line-height: var(--lineHeight);
    border-radius: var(--borderRadius);
    display: inline-block;
    padding: 0 5px;
    margin-bottom: 5px;
    margin-left: 5px;
    vertical-align: middle;
    background-color: var(--uiButtonColor);
}


#blockedMenuUi li button {
    width: 20px;
    margin: 0px;
    padding: 0 0 3px 0;
    font-size: 24px;
    line-height: 18px;
    border: 0px;
}

#blockedMenuUi li button:hover {
    background-color: var(--uiButtonColor);
    color: rgb(221, 221, 221);
}

#blockedMenuUi li button:active {
    background-color: var(--uiButtonColor);
    color: var(--uiButtonColor);
}

#blockedMenuUi textarea {
    background-color: var(--uiInputBoxBackgroundColor);
    font-size: 14px;
    padding: 0 5px;
    width: 100%;
    resize: none;
}

#menuButtonContainer {
    position: sticky;
    right: 0;
    bottom: 0;
    width: 100%;
    background-color: var(--uiBackgroundColor);
    margin-top: -10px;
}

#menuButtonContainer button {
    line-height: var(--lineHeight);
    border-radius: var(--borderRadius);
    font-size: 16px;
    border: 0;
    padding: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    height: 45px;
    width: 45px;
    vertical-align: middle;
    background-color: var(--uiButtonColor);
}

#menuButtonContainer label {
    line-height: 45px;
    border-radius: var(--borderRadius);
    display: inline-block;
    border: 0;
    padding: 0;
    margin: 10px 20px;
    height: 45px;
    width: 130px;
    vertical-align: middle;
    text-align: center;
    background-color: var(--uiInputBoxBackgroundColor);
    transition: opacity 1s;
}

@media (min-width: 1560px) and (max-width: 2059.9px) {
    .recommended-container_floor-aside .container>*:nth-of-type(n + 8) {
        margin-top: 0;
    }

    @media (min-width: 1560px) and (max-width: 2059.9px) {
        .recommended-container_floor-aside .container.is-version8>*:nth-of-type(n + 13) {
            margin-top: 0;
        }
}

`);

// 菜单UI的HTML
let menuUiHTML = `

<div id="blockedMenuUi">
<div id="menuTitle">Bilibili按标签、标题、时长、UP主屏蔽视频 v1.0</div>

<div id="menuOptionsList">
    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox" v-model="menuUiSettings.blockedTitle_Switch" />按标题屏蔽 </label>
        </div>

        <div class="titleLabelRight">
            <label><input type="checkbox" v-model="menuUiSettings.blockedTitle_UseRegular" />启用正则</label>
        </div>

        <input type="text" placeholder="多项输入请用英文逗号间隔" spellcheck="false"
            v-model="tempInputValue.blockedTitle_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'blockedTitle_Array')">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.blockedTitle_Array">
                {{value}}<button @click="delArrayButton(index, menuUiSettings.blockedTitle_Array)">×</button>
            </li>
        </ul>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox" v-model="menuUiSettings.blockedNameOrUid_Switch" />按UP名称或Uid屏蔽</label>
        </div>

        <div class="titleLabelRight">
            <label><input type="checkbox" v-model="menuUiSettings.blockedNameOrUid_UseRegular" />启用正则</label>
        </div>

        <input type="text" placeholder="多项输入请用英文逗号间隔" spellcheck="false"
            v-model="tempInputValue.blockedNameOrUid_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'blockedNameOrUid_Array')">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.blockedNameOrUid_Array">
                {{value}}<button
                    @click="delArrayButton(index, menuUiSettings.blockedNameOrUid_Array)">×</button>
            </li>
        </ul>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox"
                    v-model="menuUiSettings.blockedVideoPartitions_Switch" />按视频分区屏蔽</label>
        </div>

        <div class="titleLabelRight">
            <label><input type="checkbox"
                    v-model="menuUiSettings.blockedVideoPartitions_UseRegular" />启用正则</label>
        </div>

        <input type="text" placeholder="多项输入请用英文逗号间隔" spellcheck="false"
            v-model="tempInputValue.blockedVideoPartitions_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'blockedVideoPartitions_Array')">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.blockedVideoPartitions_Array">
                {{value}}<button
                    @click="delArrayButton(index, menuUiSettings.blockedVideoPartitions_Array)">×</button>
            </li>
        </ul>
    </div>


    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox" v-model="menuUiSettings.blockedTag_Switch" />按标签屏蔽</label>
        </div>

        <div class="titleLabelRight">
            <label><input type="checkbox" v-model="menuUiSettings.blockedTag_UseRegular" />启用正则</label>
        </div>

        <input type="text" placeholder="多项输入请用英文逗号间隔" spellcheck="false"
            v-model="tempInputValue.blockedTag_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'blockedTag_Array')">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.blockedTag_Array">
                {{value}}<button @click="delArrayButton(index, menuUiSettings.blockedTag_Array)">×</button>
            </li>
        </ul>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox" v-model="menuUiSettings.doubleBlockedTag_Switch" />按双重标签屏蔽</label>
        </div>

        <div class="titleLabelRight">
            <label><input type="checkbox" v-model="menuUiSettings.doubleBlockedTag_UseRegular" />启用正则</label>
        </div>

        <input type="text" placeholder='多项输入请用英文逗号间隔(以"A标签|B标签"格式添加)' spellcheck="false"
            v-model="tempInputValue.doubleBlockedTag_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'doubleBlockedTag_Array' )">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.doubleBlockedTag_Array">
                {{value}}<button
                    @click="delArrayButton(index, menuUiSettings.doubleBlockedTag_Array)">×</button>
            </li>
        </ul>
    </div>


    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox" v-model="menuUiSettings.blockedTopComment_Switch" />按置顶评论屏蔽 </label>
        </div>

        <div class="titleLabelRight">
            <label><input type="checkbox" v-model="menuUiSettings.blockedTopComment_UseRegular" />启用正则</label>
        </div>

        <input type="text" placeholder="多项输入请用英文逗号间隔" spellcheck="false"
            v-model="tempInputValue.blockedTopComment_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'blockedTopComment_Array')">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.blockedTopComment_Array">
                {{value}}<button @click="delArrayButton(index, menuUiSettings.blockedTopComment_Array)">×</button>
            </li>
        </ul>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox"
                    v-model="menuUiSettings.whitelistNameOrUid_Switch" />按UP名称或Uid避免屏蔽(白名单)</label>
        </div>

        <input type="text" placeholder='多项输入请用英文逗号间隔' spellcheck="false"
            v-model="tempInputValue.whitelistNameOrUid_Array" /><button
            @click="addArrayButton(tempInputValue, menuUiSettings, 'whitelistNameOrUid_Array' )">添加</button>

        <ul>
            <li v-for="(value, index) in menuUiSettings.whitelistNameOrUid_Array">
                {{value}}<button
                    @click="delArrayButton(index, menuUiSettings.whitelistNameOrUid_Array)">×</button>
            </li>
        </ul>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox"
                    v-model="menuUiSettings.blockedShortDuration_Switch" />屏蔽低于指定时长的视频</label>
        </div>
        <input type="number" spellcheck="false" v-model="menuUiSettings.blockedShortDuration" />
        <label>秒</label>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox"
                    v-model="menuUiSettings.blockedBelowVideoViews_Switch" />屏蔽低于指定播放量的视频</label>
        </div>
        <input type="number" spellcheck="false" v-model="menuUiSettings.blockedBelowVideoViews" />
        <label>次</label>
    </div>

    <div class="menuOptions">
        <div class="titleLabelLeft">
            <label><input type="checkbox"
                    v-model="menuUiSettings.blockedBelowLikesRate_Switch" />屏蔽低于指定点赞率的视频</label>
        </div>
        <input type="number" spellcheck="false" v-model="menuUiSettings.blockedBelowLikesRate" />
        <label>%</label>
    </div>


    <div class="menuOptions">
        <label><input type="checkbox" v-model="menuUiSettings.blockedPortraitVideo_Switch" />屏蔽竖屏视频</label>
    </div>

    <div class="menuOptions">
        <label><input type="checkbox" v-model="menuUiSettings.blockedChargingExclusive_Switch" />屏蔽充电专属的视频</label>
    </div>

    <div class="menuOptions">
        <label><input type="checkbox" v-model="menuUiSettings.blockedFilteredCommentsVideo_Switch" />屏蔽精选评论的视频</label>
    </div>

    <div class="menuOptions">
        <label><input type="checkbox"
                v-model="menuUiSettings.hideNonVideoElements_Switch" />隐藏首页等页面的非视频元素（直播、番剧、广告……）</label>
    </div>

    <div class="menuOptions">
        <label><input type="checkbox" v-model="menuUiSettings.hideVideoMode_Switch" />隐藏视频而不是使用叠加层覆盖</label>
    </div>

    <div class="menuOptions">
        <label><input type="checkbox" v-model="menuUiSettings.consoleOutputLog_Switch" />控制台输出日志开关</label>
    </div>
    </div>

    <div id="menuButtonContainer">
        <button @click="refreshButton()">读取</button>
        <button @click="saveButton()">保存</button>
        <button @click="closeButton()">关闭</button>
        <button @click="authorButton()">作者</button>
        <button @click="supportButton()">赞助</button>


        <label :style="{ opacity: tempInputValue.promptText_Opacity }"
            v-show="tempInputValue.promptText_Switch">{{tempInputValue.promptText}}</label>
    </div>
</div>

`;

// 菜单UI
function blockedMenuUi() {
    // 检查页面中是否已经存在这个元素
    if (!document.getElementById("blockedMenuUi")) {
        // 如果不存在，将菜单弹窗添加到页面
        // 创建Div作为菜单容器
        let menuUi = document.createElement("div");
        menuUi.innerHTML = menuUiHTML;
        document.body.appendChild(menuUi);
    } else {
        console.log("菜单 #blockedMenuUi 已存在");
        return;
    }

    // 让油猴脚本的Vue代码能网页中正常工作。
    unsafeWindow.Vue = Vue;

    const { createApp, reactive, toRaw } = Vue;

    createApp({
        setup() {
            // 设置选项数据
            const menuUiSettings = reactive({});

            // 临时存储的各数组对应的输入值
            const tempInputValue = reactive({
                blockedTitle_Array: "",
                blockedNameOrUid_Array: "",
                blockedVideoPartitions_Array: "",
                blockedTag_Array: "",
                doubleBlockedTag_Array: "",
                blockedTopComment_Array: "",
                whitelistNameOrUid_Array: "",
                // 临时提示文本
                promptText_Switch: true,
                promptText_Opacity: 0,
                promptText: "",
            });

            function showPromptText(text) {
                // tempInputValue.promptText_Switch = true; // 显示 label 元素
                tempInputValue.promptText_Opacity = 1;
                tempInputValue.promptText = text;
                // 1.5秒后隐藏 label 元素
                setTimeout(() => {
                    // tempInputValue.promptText_Switch = false;
                    tempInputValue.promptText_Opacity = 0;
                }, 1500);
            }

            // 添加数组项目
            const addArrayButton = (tempInputValue, menuUiSettings, keyName) => {
                // 确保 menuUiSettings[keyName] 是一个数组
                if (!Array.isArray(menuUiSettings[keyName])) {
                    menuUiSettings[keyName] = [];
                }
                // 双重标签的特殊处理 判断是否为空
                if (keyName == "doubleBlockedTag_Array" && tempInputValue[keyName].trim()) {
                    // 使用 split 按逗号分隔，然后映射去除每个标签的首尾空白
                    const items = tempInputValue[keyName]
                        .split(",")
                        .map((item) => item.split("|").map((str) => str.trim()))
                        .filter((subArray) => subArray.length === 2 && subArray.every((str) => str !== ""));

                    items.forEach((secondSplitItem) => {
                        // 将两个标签重新组合成一个字符串，并添加到设置数据中
                        const formattedItem = secondSplitItem.join("|");
                        menuUiSettings[keyName].push(formattedItem);
                    });

                    // 清空输入框内容
                    tempInputValue[keyName] = "";

                    return;
                }

                // 判断是否为空
                if (tempInputValue[keyName].trim()) {
                    // 用逗号分隔值并去除每项的空格后添加到数组
                    const items = tempInputValue[keyName].split(",").map((item) => item.trim());

                    menuUiSettings[keyName].push(...items);

                    // 清空输入框内容
                    tempInputValue[keyName] = "";
                }
            };

            //删除数组项目
            const delArrayButton = (index, array) => {
                //splice(要删除元素的索引位置, 要删除的元素数量)
                array.splice(index, 1);
            };

            // 读取按钮 深拷贝函数，递归处理嵌套对象，普通对象 to 普通对象/响应式对象
            function deepCopy(source, target) {
                for (let key in source) {
                    if (typeof source[key] === "object" && source[key] !== null) {
                        target[key] = Array.isArray(source[key]) ? [] : {}; // 根据类型创建空对象或数组
                        deepCopy(source[key], target[key]); // 递归拷贝子对象
                    } else {
                        target[key] = source[key]; // 复制基本类型和函数等
                    }
                }
            }

            // 读取按钮
            const refreshButton = () => {
                // 使用 deepCopy 函数进行深拷贝
                deepCopy(blockedParameter, menuUiSettings);

                showPromptText("读取数据");
            };

            // 保存按钮 深拷贝函数，递归处理响应式对象，响应式对象 to 普通对象
            function deepCopyReactiveObject(reactiveObj, targetObj) {
                for (let key in reactiveObj) {
                    const rawValue = toRaw(reactiveObj[key]); // 获取属性的原始值

                    if (typeof rawValue === "object" && rawValue !== null) {
                        targetObj[key] = Array.isArray(rawValue) ? [] : {}; // 根据类型创建空对象或数组
                        deepCopyReactiveObject(rawValue, targetObj[key]); // 递归处理嵌套的响应式子对象
                    } else {
                        targetObj[key] = rawValue; // 复制基本类型和函数等
                    }
                }
            }

            // 保存按钮
            const saveButton = () => {
                // 将响应式对象深拷贝到普通对象 blockedParameter
                deepCopyReactiveObject(menuUiSettings, blockedParameter);

                // 将全局屏蔽参数对象变量 blockedParameter 保存到油猴扩展存储中
                GM_setValue("GM_blockedParameter", blockedParameter);

                showPromptText("保存数据");

                // 触发一次主函数，以立刻生效
                FuckYouBilibiliRecommendationSystem();
            };

            // 关闭按钮
            const closeButton = () => {
                // 获取需要删除的元素
                let elementToRemove = document.getElementById("blockedMenuUi");

                // 确保元素存在再进行删除操作
                if (elementToRemove) {
                    // 先获取父元素
                    let parentElement = elementToRemove.parentNode;

                    // 在父元素删除指定的元素
                    parentElement.removeChild(elementToRemove);
                }
            };

            // 作者主页
            const authorButton = () => {
                setTimeout(() => {
                    window.open("https://space.bilibili.com/351422438", "_blank");
                }, 1000);
                showPromptText("欢迎关注！");
            };

            // 赞助作者
            const supportButton = () => {
                setTimeout(() => {
                    window.open("https://afdian.net/a/tjxgame", "_blank");
                }, 1000);
                showPromptText("感谢老板！");
            };

            // 打开菜单时，先加载一次数据
            refreshButton();

            return {
                menuUiSettings,
                tempInputValue,
                addArrayButton,
                delArrayButton,
                refreshButton,
                saveButton,
                closeButton,
                supportButton,
                authorButton,
            };
        },
    }).mount("#blockedMenuUi");
}

// 在油猴扩展中添加脚本菜单选项
GM_registerMenuCommand("屏蔽参数面板", blockedMenuUi);

// -----------------------逻辑处理部分--------------------------

// 视频的详细信息对象，以videoBv为键, 用于同窗口内的缓存查询
let videoInfoDict = {};

// 上次输出的视频详细信息对象，用于控制台判断是否输出日志
let lastConsoleVideoInfoDict = {};

// videoInfoDict 的参考内容结构
// videoInfoDict = {
//     BV12i4y1e73B: {
//         videoLink: "https://www.bilibili.com/video/BV12i4y1e73B/",
//         videoTitle: "B站按 标签 标题 时长 UP主来屏蔽视频 油猴插件【tjxgame】",
//         videoUpName: "tjxgame",
//         videoUpUid: 351422438,
//         videoPartitions: "软件应用",
//         videoTags: [
//             "科技2023年终总结",
//             "视频",
//             "教程",
//             "tjxwork",
//             "软件分享",
//             "插件",
//             "标签",
//             "屏蔽",
//             "油猴",
//             "tjxgame",
//             "2023热门年度盘点",
//         ],
//         topComment : "大更新，新视频！\nhttps://www.bilibili.com/video/BV1WJ4m1u79n/\n\nv1.0.0 菜单UI使用Vue3重构，现在不用担心缩放问题挡住UI了，界面更加现代化；\n改进了判断逻辑，现在可以使用白名单来避免误杀关注的UP了；\n新增功能：视频分区屏蔽、播放量屏蔽、点赞率屏蔽、竖屏视频屏蔽、UP主名称正则屏蔽、隐藏非视频元素、白名单避免屏蔽指定UP。"
//         whiteListTargets: true,
//         videoDuration: 259,
//         videoView: 9067,
//         videoLike: 507,
//         videoLikesRate: "5.59",
//         videoResolution: {
//             width: 3840,
//             height: 2160,
//         },
//         videoChargingExclusive : false
//         filteredComments: false,
//         blockedTarget: true,
//         triggeredBlockedRules: [
//             "屏蔽短时长视频: 259秒",
//             "屏蔽低播放量: 9067次",
//             "屏蔽低点赞率: 5.59%",
//             "屏蔽标题: tjxgame",
//             "屏蔽UP: tjxgame",
//             "屏蔽分区: 软件应用",
//             "屏蔽标签: 标签",
//             "屏蔽双重标签: 油猴,插件",
//         ],
//         lastVideoInfoApiRequestTime: "2024-06-21T09:17:10.389Z",
//         lastVideoTagApiRequestTime: "2024-06-21T09:17:10.389Z",
//         lastVideoCommentsApiRequestTime: "2024-06-21T09:17:10.389Z",
//     },
// };

// 日志输出，根据 consoleOutputLog_Switch 标志来决定是否输出日志
function consoleLogOutput(...args) {
    // 启用控制台日志输出
    if (blockedParameter.consoleOutputLog_Switch) {
        // 获取当前时间的时分秒毫秒部分
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, "0");
        let minutes = now.getMinutes().toString().padStart(2, "0");
        let seconds = now.getSeconds().toString().padStart(2, "0");
        let milliseconds = now.getMilliseconds().toString().padStart(3, "0");

        // 将时间信息添加到日志消息中
        let logTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;

        // 合并时间信息和 args 成为一个数组
        let logArray = [logTime, ...args];
        console.log(...logArray);
    }
}

// 简单对比对象是否不同
function objectDifferent(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return true;
    }
    for (const key in obj1) {
        if (obj1[key] !== obj2[key]) {
            return true;
        }
    }
    return false;
}

// 获取视频元素
function getVideoElements() {
    // // 获取所有有可能是视频元素的标签 （BewlyBewly插件的首页特殊处理）
    // let bewlyBewly = document.getElementById("bewly");
    // if (bewlyBewly) {

    //     // BewlyBewly插件使用shadowDOM，要在shadowDOM下面找元素
    //     let shadowRoot = bewlyBewly.shadowRoot;
    //     videoElements = shadowRoot.querySelectorAll("div.video-card.group");

    //     // 过滤掉没有包含a标签的元素
    //     videoElements = Array.from(videoElements).filter((element) => element.querySelector("a"));

    //     // 返回处理后的结果
    //     return videoElements;
    // }
    // BewlyBewly 更新后失效……

    // 获取所有有可能是视频元素的标签
    let videoElements = document.querySelectorAll(
        // div.bili-video-card 首页(https://www.bilibili.com/)、分区首页(https://www.bilibili.com/v/*)、搜索页面(https://search.bilibili.com/*)
        // div.video-page-card-small 播放页右侧推荐(https://www.bilibili.com/video/BV****)
        // li.bili-rank-list-video__item 分区首页-子分区右侧热门(https://www.bilibili.com/v/*)
        // div.video-card 综合热门(https://www.bilibili.com/v/popular/all) 、每周必看(https://www.bilibili.com/v/popular/weekly) 、入站必刷(https://www.bilibili.com/v/popular/history)
        // li.rank-item 排行榜(https://www.bilibili.com/v/popular/rank/all)
        // div.video-card-reco 旧版首页推送(https://www.bilibili.com/)
        // div.video-card-common 旧版首页分区(https://www.bilibili.com/)
        // div.rank-wrap 旧版首页分区右侧排行(https://www.bilibili.com/)
        "div.bili-video-card, div.video-page-card-small, li.bili-rank-list-video__item, div.video-card, li.rank-item, div.video-card-reco, div.video-card-common, div.rank-wrap"
    );

    // 过滤掉没有包含a标签的元素
    videoElements = Array.from(videoElements).filter((element) => element.querySelector("a"));

    // 判断是否存在旧版首页的顶部推荐条，为空的情况下再进行剔除广告元素，因为旧版首页的顶部推荐条，和新版的广告元素的类值一样……
    if (document.querySelector("div.recommend-container__2-line") == null) {
        // 过滤掉 CSS类刚好为 'bili-video-card is-rcmd' 的元素，因为是广告。
        videoElements = Array.from(videoElements).filter(
            (element) => element.classList.value !== "bili-video-card is-rcmd"
        );
    }

    // 返回处理后的结果
    return videoElements;
}

// 判断是否为已经屏蔽处理过的视频元素（延迟处理中）
function isAlreadyBlockedChildElement(videoElement) {
    // // 确认是否为已经修改 元素已隐藏 跳过
    // if (videoElement.style.display == "none") {
    //     // consoleLogOutput(operationInfo, "元素已隐藏 跳过剩下主函数步骤");
    //     return true;
    // }

    // 确认是否为已经修改 元素已透明 延迟处理中 跳过
    if (videoElement.style.filter == "blur(5px)") {
        // consoleLogOutput(operationInfo, "元素已透明 延迟处理中 跳过剩下主函数步骤");
        return true;
    }

    // // 获取子元素，以确认是否为已经修改
    // if (videoElement.firstElementChild.className == "blockedOverlay") {
    //     // consoleLogOutput(videoElement, "获取子元素，确认是已屏蔽处理过，跳过剩下主函数步骤");
    //     return true;
    // }
}

// 标记为屏蔽目标，并记录命中的规则
function markAsBlockedTarget(videoBv, blockedType, blockedItem) {
    // 将该 Bv号 标记为屏蔽目标
    videoInfoDict[videoBv].blockedTarget = true;

    // 确保 videoInfoDict[videoBv].triggeredBlockedRules 已定义为数组
    if (!videoInfoDict[videoBv].triggeredBlockedRules) {
        videoInfoDict[videoBv].triggeredBlockedRules = [];
    }

    let blockedRulesItem = blockedType + ": " + blockedItem;

    // 检查是否已经这条记录
    if (!videoInfoDict[videoBv].triggeredBlockedRules.includes(blockedRulesItem)) {
        // 将触发屏蔽的原因添加到 videoInfoDict[videoBv].triggeredBlockedRules
        videoInfoDict[videoBv].triggeredBlockedRules.push(blockedRulesItem);
    }
}

// 网页获取视频元素的Bv号和标题
function getBvAndTitle(videoElement) {
    // 从视频元素中获取所有a标签链接
    const videoLinkElements = videoElement.querySelectorAll("a");

    // Bv号
    let videoBv;

    // Av号转Bv号，用于兼容 bv2av (https://greasyfork.org/zh-CN/scripts/398535)，代码来源：https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/bvid_desc.html#bv-av%E7%AE%97%E6%B3%95
    function av2bv(aid) {
        const XOR_CODE = 23442827791579n;
        const MASK_CODE = 2251799813685247n;
        const MAX_AID = 1n << 51n;
        const BASE = 58n;
        const data = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";
        const bytes = ["B", "V", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
        let bvIndex = bytes.length - 1;
        let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
        while (tmp > 0) {
            bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
            tmp = tmp / BASE;
            bvIndex -= 1;
        }
        [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
        [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
        return bytes.join("");
    }

    // 循环处理所有a标签链接
    for (let videoLinkElement of videoLinkElements) {
        // 处理排行榜的多链接特殊情况，符合就跳过
        if (videoLinkElement.className == "other-link") {
            continue;
        }

        // 获取的链接，如果是Av链接的格式
        let videoAvTemp = videoLinkElement.href.match(/\/(av)(\d+)/);
        if (videoAvTemp) {
            // 从链接中获取Av号 转为 Bv号
            videoBv = av2bv(videoAvTemp[2]);
        }

        // 获取的链接，如果是Bv链接的格式
        let videoBvTemp = videoLinkElement.href.match(/\/(BV\w+)/);
        if (videoBvTemp) {
            // 从链接中获取到 视频Bv号
            videoBv = videoBvTemp[1];
        }

        if (!videoBv) {
            continue;
        }

        // 确保 videoInfoDict[videoBv] 已定义
        if (!videoInfoDict[videoBv]) {
            videoInfoDict[videoBv] = {};
        }

        // 视频链接
        videoInfoDict[videoBv].videoLink = videoLinkElement.href;
    }

    // 没有拿到Bv号，提前结束
    if (!videoBv) {
        consoleLogOutput(videoElement, "getBvAndTitle() 没有拿到Bv号 提前结束 跳过剩下主函数步骤");
        return false;
    }

    // 视频标题 , 从视频元素中获取第一个带 title 属性且不为 span 的标签
    videoInfoDict[videoBv].videoTitle = videoElement.querySelector("[title]:not(span)").title;

    return videoBv;
}

// 处理匹配的屏蔽标题
function handleBlockedTitle(videoBv) {
    // 判断是否拿到视频标题
    if (!videoInfoDict[videoBv].videoTitle) {
        return;
    }

    // 记录触发的规则内容
    // let blockedRulesItemText = "";

    // 是否启用正则
    if (blockedParameter.blockedTitle_UseRegular) {
        // 使用 屏蔽标题数组 与 视频标题 进行匹配
        const blockedTitleHitItem = blockedParameter.blockedTitle_Array.find((blockedTitleItem) => {
            // 正则化屏蔽标题
            const blockedTitleRegEx = new RegExp(blockedTitleItem);
            // 判断 正则化的屏蔽标题 是否匹配 视频标题
            if (blockedTitleRegEx.test(videoInfoDict[videoBv].videoTitle)) {
                // blockedRulesItemText = videoInfoDict[videoBv].videoTitle;
                return true;
            }
        });

        if (blockedTitleHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽标题", blockedTitleHitItem);
        }
    } else {
        // 使用 屏蔽标题数组 与 视频标题 进行匹配
        const blockedTitleHitItem = blockedParameter.blockedTitle_Array.find((blockedTitleItem) => {
            // 判断 屏蔽标题 是否匹配 视频标题
            if (blockedTitleItem === videoInfoDict[videoBv].videoTitle) {
                // blockedRulesItemText = videoInfoDict[videoBv].videoTitle;
                return true;
            }
        });

        if (blockedTitleHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽标题", blockedTitleHitItem);
        }
    }
}

// 网页获取视频UP名和UpUid (已经有API获取为什么还要网页获取？因为快……)
function getNameAndUid(videoElement, videoBv) {
    // 如果已经有 BV号 对应的 Up主名称 Up主Uid 记录，跳过
    if (videoInfoDict[videoBv].videoUpName && videoInfoDict[videoBv].videoUpUid) {
        return;
    }

    // 从视频元素中获取所有a标签链接
    const videoLinkElements = videoElement.querySelectorAll("a");

    // 循环处理所有a标签链接
    for (let videoLinkElement of videoLinkElements) {
        // 获取的链接，如果与 Uid 的链接格式匹配的话
        const uidLink = videoLinkElement.href.match(/space\.bilibili\.com\/(\d+)/);
        if (uidLink) {
            // 视频UpUid
            videoInfoDict[videoBv].videoUpUid = uidLink[1];

            // 视频Up名称
            videoInfoDict[videoBv].videoUpName = videoLinkElement.querySelector("span").innerText;
        }
    }
}

// API获取视频信息
function getVideoApiInfo(videoBv) {
    // 如果已经有BV号对应的记录，跳过
    if (videoInfoDict[videoBv].videoDuration) {
        return;
    }

    // 当 lastVideoInfoApiRequestTime 上次API获取视频信息的时间存在，并且，和当前的时间差小于3秒时，跳过
    const currentTime = new Date(); //获取当前时间
    if (
        videoInfoDict[videoBv].lastVideoInfoApiRequestTime &&
        currentTime - videoInfoDict[videoBv].lastVideoInfoApiRequestTime < 3000
    ) {
        // consoleLogOutput(videoBv, "getVideoApiInfo() 距离上次 Fetch 获取视频信息还未超过3秒钟");
        return;
    }
    videoInfoDict[videoBv].lastVideoInfoApiRequestTime = currentTime;

    // 通过API获取视频UP信息
    fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${videoBv}`)
        .then((response) => response.json())
        .then((videoApiInfoJson) => {
            // API获取的UP主名称:
            videoInfoDict[videoBv].videoUpName = videoApiInfoJson.data.owner.name;

            // API获取的UP主Uid:
            videoInfoDict[videoBv].videoUpUid = videoApiInfoJson.data.owner.mid;

            // API获取的视频AVid:
            videoInfoDict[videoBv].videoAVid = videoApiInfoJson.data.aid;

            // API获取的视频时长
            videoInfoDict[videoBv].videoDuration = videoApiInfoJson.data.duration;

            // API获取的视频分区
            videoInfoDict[videoBv].videoPartitions = videoApiInfoJson.data.tname;

            // API获取的视频播放数
            videoInfoDict[videoBv].videoView = videoApiInfoJson.data.stat.view;

            // API获取的视频点赞数
            videoInfoDict[videoBv].videoLike = videoApiInfoJson.data.stat.like;

            // 计算视频点赞率保留2位小数
            videoInfoDict[videoBv].videoLikesRate = (
                (videoInfoDict[videoBv].videoLike / videoInfoDict[videoBv].videoView) *
                100
            ).toFixed(2);

            // // API获取的视频投币数
            // videoInfoDict[videoBv].videoCoin = videoApiInfoJson.data.stat.coin;

            // // API获取的视频收藏数
            // videoInfoDict[videoBv].videoFavorite = videoApiInfoJson.data.stat.favorite;

            // // API获取的视频分享数
            // videoInfoDict[videoBv].videoShare = videoApiInfoJson.data.stat.share;

            // // API获取的视频评论数
            // videoInfoDict[videoBv].videoReply = videoApiInfoJson.data.stat.reply;

            // // API获取的视频弹幕数
            // videoInfoDict[videoBv].videoDanmaku = videoApiInfoJson.data.stat.danmaku;

            // API获取的视频是否为充电专属
            videoInfoDict[videoBv].videoChargingExclusive = videoApiInfoJson.data.is_upower_exclusive;

            // API获取的视频分辨率
            if (!videoInfoDict[videoBv].videoResolution) {
                videoInfoDict[videoBv].videoResolution = {};
            }
            videoInfoDict[videoBv].videoResolution.width = videoApiInfoJson.data.dimension.width;
            videoInfoDict[videoBv].videoResolution.height = videoApiInfoJson.data.dimension.height;

            FuckYouBilibiliRecommendationSystem();
        })
        .catch((error) => consoleLogOutput(videoBv, "getVideoApiInfo() Fetch错误:", error));
}

// 处理匹配短时长视频
function handleBlockedShortDuration(videoBv) {
    // 判断是否拿到视频时长
    if (!videoInfoDict[videoBv].videoDuration) {
        return;
    }

    // 判断设置的屏蔽短时长视频值 是否大于 视频时长
    if (blockedParameter.blockedShortDuration > videoInfoDict[videoBv].videoDuration) {
        // 标记为屏蔽目标并记录触发的规则
        markAsBlockedTarget(videoBv, "屏蔽短时长视频", videoInfoDict[videoBv].videoDuration + "秒");
    }
}

// 处理 屏蔽低播放量视频
function handleBlockedBelowVideoViews(videoBv) {
    // 判断是否拿到视频播放量
    if (!videoInfoDict[videoBv].videoView) {
        return;
    }

    // 判断设置的屏蔽视频点赞率值 是否大于 视频的点赞率
    if (blockedParameter.blockedBelowVideoViews > videoInfoDict[videoBv].videoView) {
        // 标记为屏蔽目标并记录触发的规则
        markAsBlockedTarget(videoBv, "屏蔽低播放量", videoInfoDict[videoBv].videoView + "次");
    }
}

// 处理匹配屏蔽低于指定点赞率的视频
function handleBlockedBelowLikesRate(videoBv) {
    // 判断是否拿到视频点赞数
    if (!videoInfoDict[videoBv].videoLikesRate) {
        return;
    }

    // 判断设置的屏蔽视频点赞率值 是否大于 视频的点赞率
    if (blockedParameter.blockedBelowLikesRate > videoInfoDict[videoBv].videoLikesRate) {
        // 标记为屏蔽目标并记录触发的规则
        markAsBlockedTarget(videoBv, "屏蔽低点赞率", videoInfoDict[videoBv].videoLikesRate + "%");
    }
}

// 处理匹配屏蔽竖屏视频
function handleBlockedPortraitVideo(videoBv) {
    // 判断是否拿到视频分辨率
    if (!videoInfoDict[videoBv].videoResolution.width) {
        return;
    }

    // 横向分辨率小于纵向分辨率就是竖屏
    if (videoInfoDict[videoBv].videoResolution.width < videoInfoDict[videoBv].videoResolution.height) {
        // 标记为屏蔽目标并记录触发的规则
        markAsBlockedTarget(
            videoBv,
            "屏蔽竖屏视频",
            `${videoInfoDict[videoBv].videoResolution.width} x ${videoInfoDict[videoBv].videoResolution.height}`
        );
    }
}

// 处理匹配 屏蔽充电专属视频
function handleBlockedChargingExclusive(videoBv) {
    // 判断设置的屏蔽充电专属视频是否有启用标记
    if (videoInfoDict[videoBv].videoChargingExclusive) {
        // 标记为屏蔽目标并记录触发的规则
        markAsBlockedTarget(videoBv, "屏蔽充电专属的视频", videoInfoDict[videoBv].videoUpName);
    }
}

// 处理匹配的屏蔽Up主名称或Up主Uid
function handleBlockedNameOrUid(videoBv) {
    // 判断是否拿到Up主名称或Up主Uid
    if (!videoInfoDict[videoBv].videoUpUid) {
        return;
    }

    // 记录触发的规则内容
    let blockedRulesItemText = "";

    // 是否启用正则
    if (blockedParameter.blockedNameOrUid_UseRegular) {
        // 使用 屏蔽Up名称和Uid数组 与 视频Up主Uid 和 视频Up主名称 进行匹配
        const blockedNameOrUidHitItem = blockedParameter.blockedNameOrUid_Array.find((blockedNameOrUidItem) => {
            // 正则化屏蔽Up主名称、视频Up主Uid
            const blockedNameOrUidRegEx = new RegExp(blockedNameOrUidItem);

            // 只有UP名称有正则的意义，Uid依然是直接对比
            if (blockedNameOrUidRegEx.test(videoInfoDict[videoBv].videoUpName)) {
                blockedRulesItemText = videoInfoDict[videoBv].videoUpName;
                return true;
            }

            if (blockedNameOrUidItem == videoInfoDict[videoBv].videoUpUid) {
                blockedRulesItemText = videoInfoDict[videoBv].videoUpUid;
                return true;
            }
        });

        if (blockedNameOrUidHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽UP", blockedRulesItemText);
        }
    } else {
        // 使用 屏蔽Up名称和Uid数组 与 视频Up主Uid 和 视频Up主名称 进行匹配
        const blockedNameOrUidHitItem = blockedParameter.blockedNameOrUid_Array.find((blockedNameOrUidItem) => {
            if (blockedNameOrUidItem == videoInfoDict[videoBv].videoUpName) {
                blockedRulesItemText = videoInfoDict[videoBv].videoUpName;
                return true;
            }

            if (blockedNameOrUidItem == videoInfoDict[videoBv].videoUpUid) {
                blockedRulesItemText = videoInfoDict[videoBv].videoUpUid;
                return true;
            }
        });

        if (blockedNameOrUidHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽UP", blockedRulesItemText);
        }
    }
}

// 处理匹配的屏蔽视频分区
function handleBlockedVideoPartitions(videoBv) {
    // 判断是否拿到视频分区
    if (!videoInfoDict[videoBv].videoPartitions) {
        return;
    }

    // 记录触发的规则内容
    let blockedRulesItemText = "";

    // 是否启用正则
    if (blockedParameter.blockedVideoPartitions_UseRegular) {
        // 使用 屏蔽视频分区数组 与 视频分区 进行匹配
        const blockedVideoPartitionsHitItem = blockedParameter.blockedVideoPartitions_Array.find(
            (blockedVideoPartitionsItem) => {
                // 正则化屏蔽视频标签
                const blockedVideoPartitionsRegEx = new RegExp(blockedVideoPartitionsItem);

                if (blockedVideoPartitionsRegEx.test(videoInfoDict[videoBv].videoPartitions)) {
                    blockedRulesItemText = videoInfoDict[videoBv].videoPartitions;
                    return true;
                }
            }
        );

        if (blockedVideoPartitionsHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽分区", blockedRulesItemText);
        }
    } else {
        // 使用 屏蔽视频分区数组 与 视频分区 进行匹配
        const blockedVideoPartitionsHitItem = blockedParameter.blockedVideoPartitions_Array.find(
            (blockedVideoPartitionsItem) => {
                if (blockedVideoPartitionsItem == videoInfoDict[videoBv].videoPartitions) {
                    blockedRulesItemText = videoInfoDict[videoBv].videoPartitions;
                    return true;
                }
            }
        );

        if (blockedVideoPartitionsHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽分区", blockedRulesItemText);
        }
    }
}

// API获取视频标签
function getVideoApiTags(videoBv) {
    // 如果已经有BV号对应的记录，跳过
    if (videoInfoDict[videoBv].videoTags) {
        return;
    }

    // 当 lastVideoTagApiRequestTime 上次API获取视频标签的时间存在，并且，和当前的时间差小于3秒时，跳过
    const currentTime = new Date(); //获取当前时间
    if (
        videoInfoDict[videoBv].lastVideoTagApiRequestTime &&
        currentTime - videoInfoDict[videoBv].lastVideoTagApiRequestTime < 3000
    ) {
        // consoleLogOutput(videoBv, "getVideoApiTags() 距离上次 Fetch 获取视频信息还未超过3秒钟");
        return;
    }
    videoInfoDict[videoBv].lastVideoTagApiRequestTime = currentTime;

    // 获取视频标签
    fetch(`https://api.bilibili.com/x/web-interface/view/detail/tag?bvid=${videoBv}`)
        .then((response) => response.json())
        .then((videoApiTagsJson) => {
            // API获取标签对象，提取标签名字数组
            videoInfoDict[videoBv].videoTags = videoApiTagsJson.data.map((tagsArray) => tagsArray.tag_name);

            FuckYouBilibiliRecommendationSystem();
        })
        .catch((error) => consoleLogOutput(videoBv, "getVideoApiTags() Fetch错误:", error));
}

// 处理匹配的屏蔽标签
function handleBlockedTag(videoBv) {
    // 判断是否拿到视频标签
    if (!videoInfoDict[videoBv].videoTags) {
        return;
    }

    // 记录触发的规则内容
    let blockedRulesItemText = "";

    // 是否启用正则
    if (blockedParameter.blockedTag_UseRegular) {
        // 使用 屏蔽标签数组 与 视频标题数组 进行匹配
        const blockedTagHitItem = blockedParameter.blockedTag_Array.find((blockedTagItem) => {
            // 正则化屏蔽视频标签
            const blockedTagRegEx = new RegExp(blockedTagItem);
            // 使用 屏蔽标签正则 和 视频标题数组 进行匹配
            const videoTagHitItem = videoInfoDict[videoBv].videoTags.find((videoTagItem) =>
                blockedTagRegEx.test(videoTagItem)
            );

            if (videoTagHitItem) {
                blockedRulesItemText = videoTagHitItem;
                return true;
            }
        });

        if (blockedTagHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽标签", blockedRulesItemText);
        }
    } else {
        // 使用 屏蔽标签数组 与 视频标题数组 进行匹配
        const blockedTagHitItem = blockedParameter.blockedTag_Array.find((blockedTagItem) => {
            // 使用 屏蔽标签 和 视频标题数组 进行匹配
            const videoTagHitItem = videoInfoDict[videoBv].videoTags.find(
                (videoTagItem) => blockedTagItem == videoTagItem
            );

            if (videoTagHitItem) {
                blockedRulesItemText = videoTagHitItem;
                return true;
            }
        });

        if (blockedTagHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽标签", blockedRulesItemText);
        }
    }
}

// 处理匹配屏蔽双重屏蔽标签
function handleDoubleBlockedTag(videoBv) {
    // 判断是否拿到视频标签
    if (!videoInfoDict[videoBv].videoTags) {
        return;
    }

    // 记录触发的规则内容
    let blockedRulesItemText = "";

    // 是否启用正则
    if (blockedParameter.doubleBlockedTag_UseRegular) {
        // 使用 双重屏蔽标签数组 与 视频标签 进行匹配
        const doubleBlockedTagHitItem = blockedParameter.doubleBlockedTag_Array.find((doubleBlockedTag) => {
            // 以 "|" 分割成数组，同时都能匹配上才是符合
            const doubleBlockedTagSplitArray = doubleBlockedTag.split("|");
            const doubleBlockedTagRegEx0 = new RegExp(doubleBlockedTagSplitArray[0]);
            const doubleBlockedTagRegEx1 = new RegExp(doubleBlockedTagSplitArray[1]);

            const videoTagHitItem0 = videoInfoDict[videoBv].videoTags.find((videoTagItem) =>
                doubleBlockedTagRegEx0.test(videoTagItem)
            );
            const videoTagHitItem1 = videoInfoDict[videoBv].videoTags.find((videoTagItem) =>
                doubleBlockedTagRegEx1.test(videoTagItem)
            );

            if (videoTagHitItem0 && videoTagHitItem1) {
                blockedRulesItemText = `${videoTagHitItem0},${videoTagHitItem1}`;
                return true;
            }
        });

        if (doubleBlockedTagHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽双重标签", blockedRulesItemText);
        }
    } else {
        // 使用 双重屏蔽标签数组 与 视频标签 进行匹配
        const doubleBlockedTagHitItem = blockedParameter.doubleBlockedTag_Array.find((doubleBlockedTag) => {
            // 以 "|" 分割成数组，同时都能匹配上才是符合
            const doubleBlockedTagSplitArray = doubleBlockedTag.split("|");

            const videoTagHitItem0 = videoInfoDict[videoBv].videoTags.find(
                (videoTagItem) => doubleBlockedTagSplitArray[0] == videoTagItem
            );
            const videoTagHitItem1 = videoInfoDict[videoBv].videoTags.find(
                (videoTagItem) => doubleBlockedTagSplitArray[1] == videoTagItem
            );

            if (videoTagHitItem0 && videoTagHitItem1) {
                blockedRulesItemText = `${videoTagHitItem0},${videoTagHitItem1}`;
                return true;
            }
        });

        if (doubleBlockedTagHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽双重标签", blockedRulesItemText);
        }
    }
}

// API获取视频评论区
let apiRequestDelayTime = 0;
function getVideoApiComments(videoBv) {
    // 如果已经有BV号对应的记录，跳过
    if (videoInfoDict[videoBv].filteredComments === false || videoInfoDict[videoBv].filteredComments === true) {
        return;
    }

    // 当 lastVideoCommentsApiRequestTime 上次API获取视频评论区的时间存在，并且，和当前的时间差小于3秒时，跳过
    const currentTime = new Date(); //获取当前时间
    if (
        videoInfoDict[videoBv].lastVideoCommentsApiRequestTime &&
        currentTime - videoInfoDict[videoBv].lastVideoCommentsApiRequestTime < 3000
    ) {
        // consoleLogOutput(videoBv, "getVideoApiComments() 距离上次 Fetch 获取视频信息还未超过3秒钟");
        return;
    }
    // 获取评论区的API貌似对频繁请求的容忍度很低，只能错开来请求，apiRequestDelayTime 延迟。
    // 所以设置了每次调用 getVideoApiComments() 都会增加延迟，例如：每次加 50ms 再请求下一个请求。
    // lastVideoCommentsApiRequestTime（上次API获取视频评论区的时间） 本质是为了限制每个BV号3秒只能请求一次，
    // 但是加了延迟之后，到后面 apiRequestDelayTime 延迟本身就会超过3秒了。
    // 还是会出现多次请求的问题，可能影响不大，但是还是把延迟值加进了 lastVideoCommentsApiRequestTime 里面。
    // 这也相当于把 lastVideoCommentsApiRequestTime 修正为了正确请求时间。
    let apiRequestDelayTimeData = new Date(apiRequestDelayTime);
    videoInfoDict[videoBv].lastVideoCommentsApiRequestTime = new Date(
        currentTime.getTime() + apiRequestDelayTimeData.getTime()
    );

    // apiRequestDelayTime 的最大值限制问题
    // 如果不做限制的话，这个值可能会无限增大，导致最后加载的视频元素的请求也永远等不到生效时间。
    // 以 videoInfoDict 对象的长度来做最大值限制貌似会比较合理一点。但是这个对象也可能会无限增大从而导致后面的请求等太久。
    // 如果把 videoInfoDict[videoBv].filteredComments 筛选为 null 后的统计数值x延迟时间，做为最大延迟时间比较好？
    // lastVideoCommentsApiRequestTime 也保证了每个Bv号的对应请求3秒只出现一次，这样就不用担心重复请求的问题。
    // 但是本质上这一堆处理只是为了：防止频繁请求 https://api.bilibili.com/x/v2/reply 出现拒绝，同时为了效率的问题，每个Bv号只应该请求一次。

    // 统计 videoInfoDict 中，视频Bv下面的 filteredComments 不存在的数量。
    function filteredCommentsCount() {
        let nullCount = 0;
        for (const video in videoInfoDict) {
            if (videoInfoDict[video].hasOwnProperty("filteredComments") == false) {
                nullCount++;
            }
        }
        return nullCount;
    }

    // 最大的延迟时间上限
    let apiRequestDelayTimeMax = filteredCommentsCount() * 100;
    // consoleLogOutput("最大的延迟时间上限", apiRequestDelayTimeMax);

    // 每次调用增加的延迟 > 最大的延迟时间上限后 重置为0
    if (apiRequestDelayTime > apiRequestDelayTimeMax) {
        apiRequestDelayTime = 0;
    }

    setTimeout(() => {
        // 设置请求的 URL 和参数
        const url = "https://api.bilibili.com/x/v2/reply";
        const params = {
            type: 1, // 评论区类型代码
            oid: videoBv, // 目标评论区 id
            sort: 0, // 排序方式，默认为0，0：按时间，1：按点赞数，2：按回复数
            ps: 1, // 每页项数，默认为20，定义域：1-20
            pn: 1, // 页码，默认为1
            nohot: 0, // 是否不显示热评，默认为0，1：不显示，0：显示
        };
        // 将参数转换为 URL 搜索字符串
        const searchParams = new URLSearchParams(params).toString();

        // 获取视频评论区
        fetch(`${url}?${searchParams}`)
            .then((response) => response.json())
            .then((VideoApiCommentsJson) => {
                // API获取精选评论标记
                videoInfoDict[videoBv].filteredComments = VideoApiCommentsJson.data?.control?.web_selection;

                // API获取置顶评论内容
                videoInfoDict[videoBv].topComment = VideoApiCommentsJson.data.upper.top?.content?.message;

                FuckYouBilibiliRecommendationSystem();
            })
            .catch((error) => consoleLogOutput(videoBv, "getVideoApiComments() Fetch错误:", error));
    }, apiRequestDelayTime);

    // 每次调用增加的延迟
    // consoleLogOutput("本次调用增加延迟", apiRequestDelayTime);
    apiRequestDelayTime = apiRequestDelayTime + 100;
}

// 处理匹配 屏蔽精选评论的视频
function handleBlockedFilteredCommentsVideo(videoBv) {
    // 判断设置的屏蔽精选评论的视频是否有启用标记
    if (videoInfoDict[videoBv].filteredComments) {
        // 标记为屏蔽目标并记录触发的规则
        markAsBlockedTarget(videoBv, "屏蔽精选评论的视频", videoInfoDict[videoBv].videoUpName);
    }
}

// 处理匹配 屏蔽置顶评论内容
function handleBlockedTopComment(videoBv) {
    // 判断是否拿到视频置顶评论
    if (!videoInfoDict[videoBv].topComment) {
        return;
    }

    // 记录触发的规则内容
    // let blockedRulesItemText = "";

    // 是否启用正则
    if (blockedParameter.blockedTopComment_UseRegular) {
        // 使用 屏蔽置顶评论数组 与 置顶评论 进行匹配
        const blockedTopCommentHitItem = blockedParameter.blockedTopComment_Array.find((blockedTopComment) => {
            // 正则化屏蔽置顶评论
            const blockedTitleRegEx = new RegExp(blockedTopComment);
            // 判断 正则化的屏蔽置顶评论 是否匹配 置顶评论
            if (blockedTitleRegEx.test(videoInfoDict[videoBv].topComment)) {
                return true;
            }
        });

        if (blockedTopCommentHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽置顶评论", blockedTopCommentHitItem);
        }
    } else {
        // 使用 屏蔽置顶评论数组 与 置顶评论 进行匹配
        const blockedTopCommentHitItem = blockedParameter.blockedTopComment_Array.find((blockedTopComment) => {
            // 判断 屏蔽置顶评论 是否匹配 置顶评论
            if (blockedTopComment === videoInfoDict[videoBv].topComment) {
                return true;
            }
        });

        if (blockedTopCommentHitItem) {
            // 标记为屏蔽目标并记录触发的规则
            markAsBlockedTarget(videoBv, "屏蔽置顶评论", blockedTopCommentHitItem);
        }
    }
}

// 处理匹配的白名单Up主和Uid
function handleWhitelistNameOrUid(videoBv) {
    // 判断是否拿到Up主名称或Up主Uid
    if (!videoInfoDict[videoBv].videoUpUid) {
        return;
    }

    // 使用 白名单Up主和Uid数组 与 视频Up主Uid 和 视频Up主名称 进行匹配
    const videoNameOrUid = blockedParameter.whitelistNameOrUid_Array.find((whitelistNameOrUidItem) => {
        if (whitelistNameOrUidItem == videoInfoDict[videoBv].videoUpName) {
            return true;
        }

        if (whitelistNameOrUidItem == videoInfoDict[videoBv].videoUpUid) {
            return true;
        }
    });

    if (videoNameOrUid) {
        // 标记为白名单目标
        videoInfoDict[videoBv].whiteListTargets = true;
    }
}

// 隐藏非视频元素
function hideNonVideoElements() {
    // 判断当前页面URL是否以 https://www.bilibili.com/ 开头，即首页
    if (window.location.href.startsWith("https://www.bilibili.com/")) {
        // 隐藏首页的番剧、国创、直播等左上角有标的元素，以及左上角没标的直播
        const adElements_1 = document.querySelectorAll("div.floor-single-card, div.bili-live-card");
        adElements_1.forEach(function (element) {
            element.style.display = "none";
        });
    }

    // 判断当前页面URL是否以 https://search.bilibili.com/all 开头，即搜索页——综合
    if (window.location.href.startsWith("https://search.bilibili.com/all")) {
        // 隐藏 搜索页——综合 下的 直播卡片
        const adElements_2 = document.querySelectorAll("div.bili-video-card:has(div.bili-video-card__info--living)");
        adElements_2.forEach(function (element) {
            element.parentNode.style.display = "none";
            element.style.display = "none";
        });
    }

    // 隐藏首页广告，那些没有“enable-no-interest” CSS类的视频卡片元素
    const adElements_3 = document.querySelectorAll("div.bili-video-card.is-rcmd:not(.enable-no-interest)");
    adElements_3.forEach(function (element) {
        // 检查其父元素是否是 .feed-card
        if (element.closest("div.feed-card") !== null) {
            // 如果是，选择其父元素并应用样式
            element.closest("div.feed-card").style.display = "none";
        } else {
            // 如果不是，直接在视频元素上应用样式
            element.style.display = "none";
        }
    });

    // 隐藏视频播放页右侧广告、视频相关的游戏推荐、视频相关的特殊推荐、大家围观的直播
    const adElements_4 = document.querySelectorAll(
        "div#slide_ad, a.ad-report, div.video-page-game-card-small, div.video-page-special-card-small, div.pop-live-small-mode"
    );
    adElements_4.forEach(function (element) {
        element.style.display = "none";
    });
}

// 屏蔽或者取消屏蔽
function blockedOrUnblocked(videoElement, videoBv, setTimeoutStatu = false) {
    // 是白名单目标，是屏蔽目标，没有隐藏、没有叠加层：跳过
    if (
        videoInfoDict[videoBv].whiteListTargets &&
        videoInfoDict[videoBv].blockedTarget &&
        videoElement.style.display != "none" &&
        videoElement.firstElementChild.className != "blockedOverlay"
    ) {
        return;
    }

    // 是白名单目标，是屏蔽目标, 有隐藏或有叠加层：去除隐藏或叠加层
    if (
        videoInfoDict[videoBv].whiteListTargets &&
        videoInfoDict[videoBv].blockedTarget &&
        (videoElement.style.display == "none" || videoElement.firstElementChild.className == "blockedOverlay")
    ) {
        // 去除叠加层
        removeHiddenOrOverlay(videoElement, videoBv, setTimeoutStatu);
        return;
    }

    // 不是白名单目标，是屏蔽目标, 有隐藏或有叠加层：跳过
    if (
        videoInfoDict[videoBv].whiteListTargets != true &&
        videoInfoDict[videoBv].blockedTarget &&
        (videoElement.style.display == "none" || videoElement.firstElementChild.className == "blockedOverlay")
    ) {
        return;
    }

    // 不是白名单目标，是屏蔽目标, 没有隐藏、没有叠加层：隐藏或添加叠加层
    if (
        videoInfoDict[videoBv].whiteListTargets != true &&
        videoInfoDict[videoBv].blockedTarget &&
        videoElement.style.display != "none" &&
        videoElement.firstElementChild.className != "blockedOverlay"
    ) {
        // 隐藏或添加叠加层
        addHiddenOrOverlay(videoElement, videoBv, setTimeoutStatu);
        return;
    }

    // 隐藏或添加叠加层
    function addHiddenOrOverlay(videoElement, videoBv, setTimeoutStatu) {
        // 是否为隐藏视频模式？
        if (blockedParameter.hideVideoMode_Switch == true) {
            // 隐藏视频

            // 判断当前页面URL是否以 https://search.bilibili.com/ 开头，即搜索页面，修改父元素
            if (window.location.href.startsWith("https://search.bilibili.com/")) {
                videoElement.parentNode.style.display = "none";
                // 为什么改了父元素，还要改元素本身？为了方便上面的判断。
                videoElement.style.display = "none";
            }
            // 如果是父元素是feed-card，修改父元素
            else if (videoElement.closest("div.feed-card") !== null) {
                videoElement.closest("div.feed-card").style.display = "none";
                videoElement.style.display = "none";
            } else {
                videoElement.style.display = "none";
            }
        } else {
            // 添加叠加层

            // Bug记录：
            // 位置: 视频播放页面 (即 https://www.bilibili.com/video/BVxxxxxx 页面下)
            // 行为: 添加屏蔽叠加层 这个操作 只因为 屏蔽标签 的方式来触发时 (如果还触发了 屏蔽标题 屏蔽短时长 这一类，是不会出现这个Bug的。)
            // 症状: 渲染异常，右侧视频推荐列表的封面图片不可见；评论区丢失；页面头部的搜索框丢失 (div.center-search__bar 丢失)；
            // 处理: 延迟添加 overlay 可解决，先暂时把元素变成透明/模糊的，等3秒，页面完全加载完了，再创建创建屏蔽叠加层，再把元素改回正常。
            // 猜测: 我一开始以为是使用 fetch 获取API造成的，因为只有 屏蔽标签 这个操作必须通过 fetch 获取标签信息的。
            //      但是出现 屏蔽标题 屏蔽短时长 多种触发的情况下，又不会触发这个Bug了，想不懂，我也不会调试这种加载过程。

            // 在 视频播放页面 "card-box" 创建屏蔽叠加层操作作延迟处理
            if (videoElement.firstElementChild.className == "card-box" && setTimeoutStatu == false) {
                // 元素先改模糊
                // videoElement.style.opacity = "0";
                videoElement.style.filter = "blur(5px)";
                // 延迟3秒
                setTimeout(() => {
                    // 创建屏蔽叠加层
                    blockedOrUnblocked(videoElement, videoBv, true);
                    // 元素再改回正常
                    // videoElement.style.opacity = "1";
                    videoElement.style.filter = "none";
                }, 3000);

                return;
            }

            // 获取 videoElement 的尺寸
            const elementRect = videoElement.getBoundingClientRect();

            // 叠加层参数(背景)
            let overlay = document.createElement("div");
            overlay.className = "blockedOverlay";
            overlay.style.position = "absolute";
            overlay.style.width = elementRect.width + "px"; // 使用 videoElement 的宽度
            overlay.style.height = elementRect.height + "px"; // 使用 videoElement 的高度
            overlay.style.backgroundColor = "rgba(60, 60, 60, 0.85)";
            overlay.style.display = "flex";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
            overlay.style.zIndex = "10";
            overlay.style.backdropFilter = "blur(6px)";
            overlay.style.borderRadius = "6px";

            // 叠加层文本参数(背景)
            let overlayText = document.createElement("div");
            if (videoElement.firstElementChild.className == "card-box") {
                overlayText.style.fontSize = "1.25em";
            }
            // 使用 videoInfoDict[videoBv] 里面的存储的触发规则的第1条来做为提示文字
            overlayText.innerText = videoInfoDict[videoBv].triggeredBlockedRules[0];
            overlayText.style.color = "rgb(250,250,250)";
            overlay.appendChild(overlayText);

            // 添加叠加层为最前面的子元素
            videoElement.insertAdjacentElement("afterbegin", overlay);
        }
    }

    // 去除隐藏或叠加层
    function removeHiddenOrOverlay(videoElement) {
        // 是否为隐藏视频模式？
        if (blockedParameter.hideVideoMode_Switch == true) {
            // 取消隐藏

            // 判断当前页面URL是否以 https://search.bilibili.com/ 开头，即搜索页面
            if (window.location.href.startsWith("https://search.bilibili.com/")) {
                videoElement.parentNode.style.display = "";
                videoElement.style.display = "";
            }
            // 如果是父元素是feed-card
            else if (videoElement.closest("div.feed-card") !== null) {
                videoElement.closest("div.feed-card").style.display = "";
                videoElement.style.display = "";
            } else {
                videoElement.style.display = "";
            }
        } else {
            // 删除叠加层
            if (videoElement.firstElementChild.className == "blockedOverlay") {
                videoElement.removeChild(videoElement.firstElementChild);
            }
        }
    }
}

// 同步屏蔽叠加层与父元素的尺寸
function syncBlockedOverlayAndParentNodeRect() {
    // 获取所有的屏蔽叠加层
    const blockedOverlays = document.querySelectorAll("div.blockedOverlay");

    blockedOverlays.forEach(function (element) {
        // 获取父元素的尺寸
        const parentNodeElementRect = element.parentNode.getBoundingClientRect();
        // 修改屏蔽叠加层的大小
        element.style.width = parentNodeElementRect.width + "px"; // 使用 父元素的尺寸 的宽度
        element.style.height = parentNodeElementRect.height + "px"; // 使用 父元素的尺寸 的高度
    });
}

// -----------------主流程函数----------------------

// 屏蔽Bilibili上的符合屏蔽条件的视频
function FuckYouBilibiliRecommendationSystem() {
    // 是否启用 隐藏非视频元素
    if (blockedParameter.hideNonVideoElements_Switch) {
        // 隐藏非视频元素
        hideNonVideoElements();
    }

    // 判断是否和上次的输出的字典不一样
    if (objectDifferent(lastConsoleVideoInfoDict, videoInfoDict)) {
        // 输出整个视频信息字典
        consoleLogOutput(Object.keys(videoInfoDict).length, "个视频信息: ", videoInfoDict);

        // 将本次输出的视频信息字典保存起来作参考
        lastConsoleVideoInfoDict = Object.assign({}, videoInfoDict);
    }

    // 获取所有包含B站视频相关标签的视频元素
    const videoElements = getVideoElements();

    // 遍历每个视频元素
    for (let videoElement of videoElements) {
        // 判断是否为已经屏蔽处理过的子元素
        if (isAlreadyBlockedChildElement(videoElement)) {
            // 如果是已经屏蔽处理过的子元素，跳过后续操作
            continue;
        }

        // 网页获取视频元素的Bv号和标题
        let videoBv = getBvAndTitle(videoElement);

        // 如果没有拿到Bv号，跳过后续操作
        if (!videoBv) {
            continue;
        }

        // 是否启用 屏蔽标题
        if (blockedParameter.blockedTitle_Switch && blockedParameter.blockedTitle_Array.length > 0) {
            // 判断处理匹配的屏蔽标题
            handleBlockedTitle(videoBv);
        }

        // 网页获取视频Up名和UpUid
        getNameAndUid(videoElement, videoBv);

        // 通过API获取视频信息
        getVideoApiInfo(videoBv);

        // 是否启用 屏蔽Up主名称或Up主Uid
        if (blockedParameter.blockedNameOrUid_Switch && blockedParameter.blockedNameOrUid_Array.length > 0) {
            // 判断处理匹配的屏蔽Up主名称或Up主Uid
            handleBlockedNameOrUid(videoBv);
        }

        // 是否启用 屏蔽视频分区
        if (
            blockedParameter.blockedVideoPartitions_Switch &&
            blockedParameter.blockedVideoPartitions_Array.length > 0
        ) {
            // 判断处理匹配 屏蔽视频分区
            handleBlockedVideoPartitions(videoBv);
        }

        // 是否启用 屏蔽短时长视频
        if (blockedParameter.blockedShortDuration_Switch && blockedParameter.blockedShortDuration > 0) {
            // 判断处理匹配的短时长视频
            handleBlockedShortDuration(videoBv);
        }

        // 是否启用 屏蔽低播放量视频
        if (blockedParameter.blockedBelowVideoViews_Switch && blockedParameter.blockedBelowVideoViews > 0) {
            // 判断处理匹配的低播放量视频
            handleBlockedBelowVideoViews(videoBv);
        }

        // 是否启用 屏蔽低于指定点赞率的视频
        if (blockedParameter.blockedBelowLikesRate_Switch && blockedParameter.blockedBelowLikesRate > 0) {
            // 判断处理 屏蔽低于指定点赞率的视频
            handleBlockedBelowLikesRate(videoBv);
        }

        // 是否启用 屏蔽竖屏视频
        if (blockedParameter.blockedPortraitVideo_Switch) {
            // 判断处理 屏蔽竖屏视频
            handleBlockedPortraitVideo(videoBv);
        }

        // 是否启用 屏蔽充电专属视频
        if (blockedParameter.blockedChargingExclusive_Switch) {
            // 判断处理 蔽充电专属视频
            handleBlockedChargingExclusive(videoBv);
        }

        // 通过API获取视频标签
        getVideoApiTags(videoBv);

        // 是否启用 屏蔽标签
        if (blockedParameter.blockedTag_Switch && blockedParameter.blockedTag_Array.length > 0) {
            // 判断处理 屏蔽标签
            handleBlockedTag(videoBv);
        }

        // 是否启用 屏蔽双重屏蔽标签
        if (blockedParameter.doubleBlockedTag_Switch && blockedParameter.doubleBlockedTag_Array.length > 0) {
            // 判断处理 屏蔽双重屏蔽标签
            handleDoubleBlockedTag(videoBv);
        }

        // API获取视频评论区
        getVideoApiComments(videoBv);

        // 是否启用 屏蔽精选评论的视频
        if (blockedParameter.blockedFilteredCommentsVideo_Switch) {
            // 判断处理 屏蔽精选评论的视频
            handleBlockedFilteredCommentsVideo(videoBv);
        }

        // 是否启用 屏蔽置顶评论
        if (blockedParameter.blockedTopComment_Switch && blockedParameter.blockedTopComment_Array.length > 0) {
            // 判断处理 屏蔽精选评论的视频
            handleBlockedTopComment(videoBv);
        }

        // 是否启用 白名单Up主和Uid
        if (blockedParameter.whitelistNameOrUid_Switch && blockedParameter.whitelistNameOrUid_Array.length > 0) {
            // 判断处理 白名单Up主和Uid
            handleWhitelistNameOrUid(videoBv);
        }

        // 屏蔽或者取消屏蔽
        blockedOrUnblocked(videoElement, videoBv);

        // 同步屏蔽叠加层与父元素的尺寸
        syncBlockedOverlayAndParentNodeRect();
    }
}

// 页面加载完成后运行脚本
window.addEventListener("load", FuckYouBilibiliRecommendationSystem);

// 窗口尺寸变化时运行脚本
window.addEventListener("resize", FuckYouBilibiliRecommendationSystem);

// 定义 MutationObserver 的回调函数
function mutationCallback() {
    // 在这里运行你的脚本
    FuckYouBilibiliRecommendationSystem();
}
// 创建一个 MutationObserver 实例，观察 body 元素的子节点变化
let observer = new MutationObserver(mutationCallback);
let targetNode = document.body;
// 配置观察器的选项
let config = { childList: true, subtree: true };
// 启动观察器并传入回调函数和配置选项
observer.observe(targetNode, config);
