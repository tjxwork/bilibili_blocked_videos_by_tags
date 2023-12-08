// ==UserScript==
// @name            Bilibili 按标签、标题、时长、UP主屏蔽视频
// @namespace       https://github.com/tjxwork
// @version         0.5
// @description     对Bilibili.com的视频卡片元素，以标签、标题、时长、UP主名称、UP主UID 来判断匹配，添加一个屏蔽叠加层。
// @author          tjxwork
// @license         CC-BY-NC-SA
// @match           https://www.bilibili.com/*
// @match           https://search.bilibili.com/*
// @exclude         https://www.bilibili.com/anime/*
// @exclude         https://www.bilibili.com/movie/*
// @exclude         https://www.bilibili.com/guochuang/*
// @exclude         https://www.bilibili.com/variety/*
// @exclude         https://www.bilibili.com/tv/*
// @exclude         https://www.bilibili.com/documentary*
// @exclude         https://www.bilibili.com/mooc/*
// @exclude         https://www.bilibili.com/v/popular/*
// @exclude         https://www.bilibili.com/v/virtual/*
// @grant           GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_getValue
// ==/UserScript==

"use strict";

// 初始化屏蔽参数变量
let blockedParameter = GM_getValue("GM_blockedParameter", {
    // 屏蔽标题数组
    blockedTitleArray: [],
    // 屏蔽UP主或者Uid数组
    blockedNameOrUidArray: [],
    // 屏蔽标签数组
    blockedTagArray: [],
    // 双重屏蔽标签数组
    doubleBlockedTagArray: [],
    // 屏蔽短时长视频(0为不生效)
    blockedShortDuration: 0,
    // 启用日志输出
    consoleOutputLogSwitch: false,
});

// 配色

// 主窗体背景色
const uiBackgroundColor = "#303030";

// 输入模块背景色
const uiInputContainerBackgroundColor = "#404040";

// 输入框背景色
const uiInputBoxBackgroundColor = "#595959";

// 文字颜色
const uiTextColor = "rgb(250,250,250)";

// 按钮色
const uiButtonColor = "rgb(0, 174, 236)";

// 边框色
const uiBorderColor = "rgba(0, 0, 0, 0)";

// 提醒框背景色
const uiPromptBoxColor = "rgb(42,44,53)";

// 屏蔽叠加层背景色
const blockedOverlayColor = "rgba(60, 60, 60, 0.85)";

// --------------------菜单UI部分--------------------

// 通用的基础样式
const basicsStyles = {
    boxSizing: "border-box",
    padding: "0 0.5em",
    marginBottom: "0.5em",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: uiBorderColor,
    borderRadius: "0.3em",
    lineHeight: "1.5em",
    fontSize: "1em",
    verticalAlign: "middle",
    color: uiTextColor,
    fontFamily: '"Cascadia Mono", Monaco, Consolas, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif',
};

// 添加基础样式辅助函数
function addStyles(element, styles) {
    for (const style in styles) {
        element.style[style] = styles[style];
    }
}

// 屏蔽菜单UI
function blockedMenuUi() {
    // 创建菜单Ui的Div
    const menuContent = document.createElement("div");
    menuContent.id = "blockedMenuUi";
    addStyles(menuContent, basicsStyles);
    menuContent.style.position = "fixed";
    menuContent.style.bottom = "5vh";
    menuContent.style.right = "1vh";
    menuContent.style.zIndex = "1000";
    menuContent.style.width = "32em";
    menuContent.style.height = "58.5em";
    menuContent.style.backgroundColor = uiBackgroundColor;
    menuContent.style.fontSize = "14px";
    menuContent.style.padding = "0.85em";

    // 创建标题
    const title = document.createElement("div");
    title.textContent = "Bilibili按标签/标题/时长/UP主屏蔽视频";
    addStyles(title, basicsStyles);
    title.style.textAlign = "center";
    title.style.fontSize = "1.5em";
    title.style.padding = "0";

    // 创建输入模块的辅助函数 (标签文本，保存参数的对象变量，保存参数的对象变量里面的Key名，输入模块的类型)ffff
    function createInputModule(label, blockedParameterObject, blockedParameterObjectKey, type) {
        // 数组类的输入
        if (type == "Array") {
            // 创建父级容器
            const container = document.createElement("div");
            addStyles(container, basicsStyles);
            container.style.backgroundColor = uiInputContainerBackgroundColor;

            // 创建提示标签
            const inputLabel = document.createElement("label");
            inputLabel.textContent = label;
            addStyles(inputLabel, basicsStyles);
            inputLabel.style.display = "block";
            inputLabel.style.marginTop = "0.5em";

            // 创建输入框
            const inputBox = document.createElement("input");
            inputBox.type = "text";
            inputBox.placeholder = "多项输入请用英文逗号间隔";
            inputBox.spellcheck = false;
            addStyles(inputBox, basicsStyles);
            inputBox.style.backgroundColor = uiInputBoxBackgroundColor;
            inputBox.style.width = "25em";

            // 创建添加按钮
            const addButton = document.createElement("button");
            addButton.textContent = "添加";
            addButton.addEventListener("click", addButtonClickFunction);
            addStyles(addButton, basicsStyles);
            addButton.style.backgroundColor = uiButtonColor;
            addButton.style.marginLeft = "0.5em";

            // 创建已有数据的多行展示框
            const inputMultiLineDisplayBox = document.createElement("textarea");
            inputMultiLineDisplayBox.id = blockedParameterObjectKey;
            inputMultiLineDisplayBox.value = blockedParameterObject[blockedParameterObjectKey];
            inputMultiLineDisplayBox.rows = "3"; // 设置多行展示框的行数
            inputMultiLineDisplayBox.placeholder = "也可以直接编辑该输入框内容，“保存”后生效";
            inputMultiLineDisplayBox.spellcheck = false;
            addStyles(inputMultiLineDisplayBox, basicsStyles);
            inputMultiLineDisplayBox.style.backgroundColor = uiInputBoxBackgroundColor;
            inputMultiLineDisplayBox.style.width = "100%";
            inputMultiLineDisplayBox.style.resize = "none"; // 禁止拖动
            inputMultiLineDisplayBox.style.padding = "0.5em";

            // 组合元素
            container.appendChild(inputLabel);
            container.appendChild(inputBox);
            container.appendChild(addButton);
            container.appendChild(inputMultiLineDisplayBox);

            return container;
        }
        // 数值类的输入
        if (type == "Number") {
            // 创建父级容器
            const container = document.createElement("div");
            addStyles(container, basicsStyles);
            container.style.backgroundColor = uiInputContainerBackgroundColor;
            container.style.lineHeight = "2em";

            // 创建提示标签
            const inputLabel = document.createElement("label");
            addStyles(inputLabel, basicsStyles);
            inputLabel.textContent = label;
            inputLabel.style.marginTop = "0.5em";

            // 创建输入框
            const inputBox = document.createElement("input");
            inputBox.type = "number";
            inputBox.id = blockedParameterObjectKey;
            inputBox.value = blockedParameterObject[blockedParameterObjectKey];
            inputBox.spellcheck = false;
            addStyles(inputBox, basicsStyles);
            inputBox.style.backgroundColor = uiInputBoxBackgroundColor;
            inputBox.style.width = "6em";
            inputBox.style.margin = "0";
            inputBox.style.verticalAlign = "baseline";

            // 组合元素
            container.appendChild(inputLabel);
            container.appendChild(inputBox);

            return container;
        }
        // 布尔类的输入
        if (type == "Bool") {
            // 创建父级容器
            const container = document.createElement("div");
            addStyles(container, basicsStyles);
            container.style.backgroundColor = uiInputContainerBackgroundColor;
            container.style.lineHeight = "2em";

            // 创建提示标签
            const inputLabel = document.createElement("label");
            inputLabel.textContent = label;
            addStyles(inputLabel, basicsStyles);
            inputLabel.style.marginTop = "0.5em";

            // 创建输入框
            const inputBox = document.createElement("input");
            inputBox.type = "checkbox";
            inputBox.id = blockedParameterObjectKey;
            inputBox.checked = blockedParameterObject[blockedParameterObjectKey];
            inputBox.spellcheck = false;
            addStyles(inputBox, basicsStyles);
            inputBox.style.backgroundColor = uiInputBoxBackgroundColor;
            inputBox.style.margin = "0";

            // 组合元素
            container.appendChild(inputLabel);
            container.appendChild(inputBox);

            return container;
        }
    }

    // 创建各个变量参数输入框和按钮
    const blockedTitleInput = createInputModule(
        "按标题屏蔽 (支持正则)",
        blockedParameter,
        "blockedTitleArray",
        "Array"
    );
    const blockedNamesInput = createInputModule(
        "按UP名称或UID屏蔽",
        blockedParameter,
        "blockedNameOrUidArray",
        "Array"
    );
    const blockedTagsInput = createInputModule("按标签屏蔽 (支持正则)", blockedParameter, "blockedTagArray", "Array");
    const doubleBlockedTagsInput = createInputModule(
        '按双重标签屏蔽 (以"A标签|B标签"的格式来添加，支持正则)',
        blockedParameter,
        "doubleBlockedTagArray",
        "Array"
    );
    const blockedShortDurationInput = createInputModule(
        "按时间短于指定秒数视频屏蔽 (0为不生效)",
        blockedParameter,
        "blockedShortDuration",
        "Number"
    );
    const consoleOutputLogSwitchInput = createInputModule(
        "控制台输出日志开关",
        blockedParameter,
        "consoleOutputLogSwitch",
        "Bool"
    );

    // 创建菜单按钮的辅助函数
    function createMenuButton(label, clickFunction) {
        // 创建添加按钮
        const menuButton = document.createElement("button");
        menuButton.textContent = label;
        menuButton.addEventListener("click", clickFunction);
        addStyles(menuButton, basicsStyles);
        menuButton.style.backgroundColor = uiButtonColor;
        menuButton.style.padding = "0.5em";
        menuButton.style.marginBottom = "0";
        menuButton.style.marginRight = "0.5em";

        return menuButton;
    }

    // 创建菜单按钮
    const closeButton = createMenuButton("关闭", closeButtonClickFunction);
    // 使用 () => 闭包来在 createMenuButton 函数内部传递带参数的 saveButtonClickFunction。
    const saveButton = createMenuButton("保存", () => saveButtonClickFunction(blockedParameter));
    const refreshButton = createMenuButton("读取", () => refreshButtonClickFunction(blockedParameter));
    const saveAndCloseButton = createMenuButton("保存并关闭", () => saveAndCloseButtonClickFunction(blockedParameter));

    // 创建菜单按钮父级容器
    const menuButtonContainer = document.createElement("div");
    menuButtonContainer.id = "menuButtonContainer";
    addStyles(menuButtonContainer, basicsStyles);
    menuButtonContainer.style.padding = "0";
    menuButtonContainer.style.margin = "0";

    // 把菜单按钮 添加到 菜单按钮父级容器里
    menuButtonContainer.appendChild(closeButton);
    menuButtonContainer.appendChild(saveButton);
    menuButtonContainer.appendChild(refreshButton);
    menuButtonContainer.appendChild(saveAndCloseButton);

    // 将所有元素添加到弹窗中
    menuContent.appendChild(title);
    menuContent.appendChild(blockedTitleInput);
    menuContent.appendChild(blockedNamesInput);
    menuContent.appendChild(blockedTagsInput);
    menuContent.appendChild(doubleBlockedTagsInput);
    menuContent.appendChild(blockedShortDurationInput);
    menuContent.appendChild(consoleOutputLogSwitchInput);
    menuContent.appendChild(menuButtonContainer);

    // 将弹窗添加到页面
    document.body.appendChild(menuContent);
}

// 添加按钮对应的点击函数
function addButtonClickFunction() {
    // 使用 event.target 获取触发事件的按钮
    const clickedButton = event.target;

    // 将获取上一兄弟元素的值，既为 inputBox 输入框 的值
    const inputBox = clickedButton.previousElementSibling.value;

    // 将获取下一兄弟元素，既为 inputMultiLineDisplayBox 已有数据的多行展示框 的值
    const inputMultiLineDisplayBox = clickedButton.nextElementSibling.value;

    if (inputMultiLineDisplayBox === "") {
        // 如果多行展示框为空
        clickedButton.nextElementSibling.value = inputBox;
    } else {
        // 如果多行展示框不为空，则在前面添加逗号并返回拼接后的字符串
        clickedButton.nextElementSibling.value = inputMultiLineDisplayBox.concat(",", inputBox);
    }

    // 清空输入框
    clickedButton.previousElementSibling.value = "";
}

// 关闭按钮对应的点击函数
function closeButtonClickFunction() {
    // 获取需要删除的元素
    let elementToRemove = document.getElementById("blockedMenuUi");

    // 确保元素存在再进行删除操作
    if (elementToRemove) {
        // 先获取父元素
        var parentElement = elementToRemove.parentNode;

        // 在父元素删除指定的元素
        parentElement.removeChild(elementToRemove);
    }
}

// 保存按钮对应的点击函数 （把 多行展示框 里面的东西 写进 blockedParameter）
function saveButtonClickFunction(blockedParameterObject) {
    // 获取在 blockedMenuUi 菜单UI下，所有带有ID的元素
    let inputIdItem = document.querySelectorAll("#blockedMenuUi > div >[id]");

    // 遍历处理ID元素
    for (const item of inputIdItem) {
        // 双重屏蔽标签 的 多行展示框 内容要特殊处理
        if (item.id == "doubleBlockedTagArray") {
            // 处理特殊的双重屏蔽字符串
            function processDoubleBlockedTagString(inputString) {
                // 使用逗号分割字符串
                const items = inputString.split(",");

                // 过滤并处理每个项
                const processedArray = items
                    .map((item) => {
                        // 去除项两端的空格
                        const trimmedItem = item.trim();

                        // 判断项中是否包含 "|"，且 "|" 的数量为1 (分割后有两份),且不为空值
                        const secondSplitItem = trimmedItem.split("|").filter((value) => value !== "");
                        if (secondSplitItem.length === 2) {
                            // 去除空格，并拼接成最终的项
                            const formattedItem = secondSplitItem.map((str) => str.trim()).join("|");
                            return formattedItem;
                        } else {
                            // 如果不包含 "|" 或者 "|" 数量不为1，返回 null（后续过滤）
                            return null;
                        }
                    })
                    .filter((item) => item !== null); // 过滤掉为 null 的项

                return processedArray;
            }

            blockedParameterObject[item.id] = processDoubleBlockedTagString(item.value);

            continue;
        }

        // 多行展示框 数据
        if (item.type == "textarea") {
            // 多行展示框 的数据存入 blockedParameter
            blockedParameterObject[item.id] = item.value
                .split(",")
                .filter((value) => value !== "")
                .map((str) => str.trim());
        }

        // 数值类输入框
        if (item.type == "number") {
            function convertToNumber(str) {
                const parsedNumber = parseInt(str, 10); // 第二个参数表示使用十进制转换
                return isNaN(parsedNumber) ? 0 : parsedNumber;
            }

            // 多行展示框 的数据存入 blockedParameter
            blockedParameterObject[item.id] = convertToNumber(item.value);
        }

        // 布尔类的输入框
        if (item.type == "checkbox") {
            blockedParameterObject[item.id] = item.checked;
        }
    }

    // 将全局屏蔽参数对象变量 blockedParameter 保存到油猴扩展存储中
    GM_setValue("GM_blockedParameter", blockedParameterObject);

    // 触发刷新(读取)函数，通知为 false
    refreshButtonClickFunction(blockedParameterObject, false);

    showFloatingReminder("内容已保存");
}

// 读取按钮对应的点击函数（把 油猴扩展存储 读取到 blockedParameter 读取到 多行展示框）
function refreshButtonClickFunction(blockedParameterObject, enableMessage = true) {
    // 油猴扩展存储 读取到 blockedParameter
    blockedParameterObject = GM_getValue("GM_blockedParameter", {
        // 屏蔽标题数组
        blockedTitleArray: [],
        // 屏蔽UP主或者Uid数组
        blockedNameOrUidArray: [],
        // 屏蔽标签数组
        blockedTagArray: [],
        // 双重屏蔽标签数组
        doubleBlockedTagArray: [],
        // 屏蔽短时长视频(0为不生效)
        blockedShortDuration: 0,
        // 启用日志输出
        consoleOutputLogSwitch: false,
    });

    // 获取在 blockedMenuUi 菜单UI下，所有带有ID的元素
    let inputIdItem = document.querySelectorAll("#blockedMenuUi > div >[id]");

    // 把 blockedParameter 的数据 写到对应的 多行展示框
    for (let item of inputIdItem) {
        if (item.type == "textarea") {
            item.value = blockedParameterObject[item.id].join(",");
        }

        if (item.type == "number") {
            item.value = blockedParameterObject[item.id];
        }

        if (item.type == "checkbox") {
            item.checked = blockedParameterObject[item.id];
        }
    }

    // 保存按钮 saveButtonClickFunction 保存后，会触发一次 refreshButtonClickFunction，不需要两个都弹出提示框
    if (enableMessage) {
        showFloatingReminder("内容已刷新");
    }
}

// 保存并关闭按钮对应的点击函数，分别触发保存和关闭按钮
function saveAndCloseButtonClickFunction(blockedParameterObject) {
    saveButtonClickFunction(blockedParameterObject);

    closeButtonClickFunction();
}

// 菜单按钮按下的提醒消息
function showFloatingReminder(message) {
    const element = document.querySelector("#menuButtonContainer");

    // 创建提醒元素
    const reminderElement = document.createElement("div");
    reminderElement.textContent = message;
    addStyles(reminderElement, basicsStyles);
    reminderElement.style.backgroundColor = uiPromptBoxColor;
    reminderElement.style.padding = "0.5em";
    reminderElement.style.marginBottom = "0";
    reminderElement.style.float = "right";
    reminderElement.style.bottom = "1em";
    reminderElement.style.right = "1em";

    // 将提醒元素添加到指定的元素内
    element.appendChild(reminderElement);

    // 3秒后移除提醒元素
    setTimeout(() => {
        element.removeChild(reminderElement);
    }, 3000);
}

// 在油猴扩展中添加脚本菜单选项
GM_registerMenuCommand("屏蔽参数面板", blockedMenuUi);

// -----------------------逻辑处理部分--------------------------

// 视频的临时详细信息对象，以videoBv为键, 用于同窗口内的缓存查询
let videoInfoDict = {};

// 日志输出, 创建一个包装函数，根据 consoleOutputLogSwitch 标志来决定是否输出日志
function consoleLogOutput(...args) {
    if (blockedParameter.consoleOutputLogSwitch) {
        // 获取当前时间的时分秒毫秒部分
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, "0");
        var minutes = now.getMinutes().toString().padStart(2, "0");
        var seconds = now.getSeconds().toString().padStart(2, "0");
        var milliseconds = now.getMilliseconds().toString().padStart(3, "0");

        // 将时间信息添加到日志消息中
        var logTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;

        // 合并时间信息和 args 成为一个数组
        var logArray = [logTime, ...args];
        console.log(...logArray);
    }
}

// 获取视频元素
function getVideoElements() {
    // 获取所有有可能是视频元素的标签
    var videoElements = document.querySelectorAll(
        "div.bili-video-card, div.video-page-card-small, li.bili-rank-list-video__item"
    );

    // 过滤掉没有包含a标签的元素
    videoElements = Array.from(videoElements).filter((element) => element.querySelector("a"));

    // 返回处理后的结果
    return videoElements;
}

// 判断是否为已经屏蔽处理过的子元素
function isAlreadyBlockedChildElement(videoElement) {
    // 确认是否为已经修改 元素已透明 延迟处理中 跳过
    if (videoElement.style.filter == "blur(5px)") {
        // consoleLogOutput(operationInfo, "元素已透明 延迟处理中 跳过剩下主函数步骤");
        return true;
    }

    // 获取子元素，以确认是否为已经修改
    if (videoElement.firstElementChild.className == "blockedOverlay") {
        // consoleLogOutput(videoElement, "获取子元素，确认是已屏蔽处理过，跳过剩下主函数步骤");
        return true;
    }
}

// 获取视频元素的Bv号和标题
function getBvAndTitle(videoElement) {
    // 从视频元素中获取所有a标签链接
    const videoLinkElements = videoElement.querySelectorAll("a");

    // Bv号
    let videoBv;

    // 循环处理所有a标签链接
    for (let videoLinkElement of videoLinkElements) {
        // 如果a标签中没有字符，跳过剩余语句，开始下一次循环
        if (!videoLinkElement.textContent) {
            continue;
        }

        // 如果a标签中的字符有"稍后再看"，跳过剩余语句，开始下一次循环
        if (/稍后再看/.test(videoLinkElement.textContent)) {
            continue;
        }

        // 获取的链接，如果与Bv链接的格式匹配的话
        let bvTemp = videoLinkElement.href.match(/\/(BV\w+)/);
        if (bvTemp) {
            // 视频Bv号
            videoBv = bvTemp[1];
            consoleLogOutput(videoBv, "此BV号来源于", videoElement);

            // 确保 videoInfoDict[videoBv] 已定义
            if (!videoInfoDict[videoBv]) {
                videoInfoDict[videoBv] = {};
            }

            // 视频链接
            videoInfoDict[videoBv].videoLink = videoLinkElement.href;
            consoleLogOutput(videoBv, "网页上获取的链接: ", videoInfoDict[videoBv].videoLink);

            // 视频标题
            videoInfoDict[videoBv].videoTitle = videoLinkElement.textContent;
            consoleLogOutput(videoBv, "网页上获取的标题: ", videoInfoDict[videoBv].videoTitle);
        }
    }

    // 没有拿到Bv号，提前结束
    if (!videoBv) {
        consoleLogOutput(videoElement, "getBvAndTitle() 没有拿到Bv号 提前结束 跳过剩下主函数步骤");
        return false;
    }

    return videoBv;
}

// 判断处理匹配的屏蔽标题
function handleBlockedTitle(videoElement, videoBv) {
    // 使用 屏蔽标题数组 与 视频标题 进行匹配
    const blockedTitleFind = blockedParameter.blockedTitleArray.find((blockedTitle) => {
        const blockedTitleRegEx = new RegExp(blockedTitle);
        if (blockedTitleRegEx.test(videoInfoDict[videoBv].videoTitle)) {
            return blockedTitle;
        }
    });
    if (blockedTitleFind) {
        createOverlay(`屏蔽标题: ${blockedTitleFind}`, videoElement, `${videoBv} handleBlockedTitle()`);
        consoleLogOutput(videoBv, "handleBlockedTitle() 已屏蔽视频元素 跳过剩下主函数步骤");
        return true;
    }
}

// 时分秒 转 秒 辅助函数
function timeToSeconds(timeString) {
    // 将时间字符串按冒号分割
    const timeArray = timeString.split(":");

    // 从数组的末尾开始计算秒数
    let seconds = 0;
    let multiplier = 1;

    for (let i = timeArray.length - 1; i >= 0; i--) {
        seconds += parseInt(timeArray[i]) * multiplier;
        multiplier *= 60; // 每遍历一个单位，乘以60，转为秒
    }

    return seconds;
}

// 获取视频元素的时长
function getDuration(videoElement, videoBv) {
    // 如果已经有 BV号 对应的 记录，跳过
    if (videoInfoDict[videoBv].videoDuration) {
        consoleLogOutput(videoBv, "getDuration() 在 videoInfoDict 中，找到对应的 视频时长 记录");
        return;
    }

    // 从视频元素中获取视频元素
    const timeStringElement = videoElement.querySelector("span.bili-video-card__stats__duration, span.duration");

    if (timeStringElement) {
        const timeStringTemp = timeStringElement.textContent;
        videoInfoDict[videoBv].videoDuration = timeToSeconds(timeStringTemp);

        consoleLogOutput(
            videoBv,
            "getDuration() 已成功在网页上获取 视频时长",
            videoInfoDict[videoBv].videoDuration,
            "秒"
        );
    } else {
        consoleLogOutput(videoBv, "getDuration() 在没有在网页中找到 视频时长 元素");
    }

    //获取当前时间
    const currentTime = new Date();

    // 当 lastTimeApiVideoInfo 上次API获取视频标签的时间存在，并且，和当前的时间差小于3秒时，跳过
    if (
        videoInfoDict[videoBv].lastTimeApiVideoInfo &&
        currentTime - videoInfoDict[videoBv].lastTimeApiVideoInfo < 3000
    ) {
        consoleLogOutput(videoBv, "getDuration() 距离上次 Fetch 获取视频信息还未超过3秒钟");
        return;
    }

    videoInfoDict[videoBv].lastTimeApiVideoInfo = currentTime;

    // 通过API获取视频UP信息
    fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${videoBv}`)
        .then((response) => response.json())
        .then((videoApiInfoJson) => {
            let returnMessage = videoApiInfoJson.message;
            consoleLogOutput(videoBv, "getDuration() Fetch:返回的消息: ", returnMessage);

            videoInfoDict[videoBv].videoUpUid = videoApiInfoJson.data.owner.mid;
            consoleLogOutput(videoBv, "getDuration() API获取的UP主Uid: ", videoInfoDict[videoBv].videoUpUid);

            videoInfoDict[videoBv].videoUpName = videoApiInfoJson.data.owner.name;
            consoleLogOutput(videoBv, "getDuration() API获取的UP主名称: ", videoInfoDict[videoBv].videoUpName);

            videoInfoDict[videoBv].videoDuration = videoApiInfoJson.data.duration;
            consoleLogOutput(videoBv, "getDuration() API获取的视频时长: ", videoInfoDict[videoBv].videoDuration, "秒");

            // 尝试在fetch异步结束后直接屏蔽处理 匹配的短时长视频
            handleBlockedShortDuration(videoElement, videoBv, true);

            // 为了减少 API 调用，限制了短时间不能重复调用API，getDuration() 和 getUpNameAndUpUid() 实际是使用的同一个API
            // 在同时需求API 查询 视频时长 和 视频UP主名称 时，getDuration() 没来得及返回信息到videoInfoDict的情况下，
            // getUpNameAndUpUid() 没有从videoInfoDict里拿到信息，会重新发起 API ，但是这没有必要，getDuration() 的信息是一样的。
            // getDuration() 和 getUpNameAndUpUid() 会共用同一个时间标记 lastTimeApiVideoInfo 来限制同Bv号的查询频率，
            // 并将 handleBlockedUpNameOrUpUid() 操作复制到一份到 getDuration() 下，等待 fetch 结束后运行。

            // 尝试在fetch异步结束后直接屏蔽处理 匹配的屏蔽Up主名称或Up主Uid
            handleBlockedUpNameOrUpUid(videoElement, videoBv, true);
        })
        .catch((error) => console.error(videoBv, "getDuration() Fetch错误:", error));

    // 判断是否成功拿到 BV号 对应的 Up主名称 Up主Uid 记录
    if (videoInfoDict[videoBv].videoUpUid && videoInfoDict[videoBv].videoUpName) {
        consoleLogOutput(videoBv, "getDuration() 已成功在API上获取 UP主名称 UP主UID 视频时长");
        return;
    } else {
        consoleLogOutput(videoBv, "getDuration() 暂时未获取 UP主名称 UP主UID 视频时长");
        return;
    }
}

// 判断处理匹配的短时长视频
function handleBlockedShortDuration(videoElement, videoBv, withinFetch = false) {
    if (!videoInfoDict[videoBv].videoDuration) {
        consoleLogOutput(videoBv, "handleBlockedShortDuration() 未获取到 视频时长，放弃执行");
        return;
    }
    // 匹配短时长视频
    if (videoInfoDict[videoBv].videoDuration < blockedParameter.blockedShortDuration) {
        createOverlay(
            `屏蔽短于${blockedParameter.blockedShortDuration}秒时长视频`,
            videoElement,
            `${videoBv} handleBlockedShortDuration()`
        );

        if (withinFetch) {
            consoleLogOutput(
                videoBv,
                "在 getDuration() 的 Fetch 内执行 handleBlockedShortDuration() 已屏蔽 短时长视频"
            );
        } else {
            consoleLogOutput(videoBv, "handleBlockedShortDuration() 已屏蔽 短时长视频，跳过剩下主函数步骤");
        }

        return true;
    }
}

// 获取视频元素的Up主名称 Up主Uid
function getUpNameAndUpUid(videoElement, videoBv) {
    // 如果已经有 BV号 对应的 Up主名称 Up主Uid 记录，跳过
    if (videoInfoDict[videoBv].videoUpUid && videoInfoDict[videoBv].videoUpName) {
        consoleLogOutput(videoBv, "getUpNameAndUpUid() 在 videoInfoDict 中，已找到对应的 UP主名称 UP主UID 记录");
        return;
    }

    // 从视频元素中获取所有a标签链接
    const videoLinkElements = videoElement.querySelectorAll("a");

    // 循环处理所有a标签链接
    for (let videoLinkElement of videoLinkElements) {
        // 获取的链接，如果与 Uid 的链接格式匹配的话
        const uidTemp = videoLinkElement.href.match(/space\.bilibili\.com\/(\d+)/);

        if (uidTemp) {
            // 视频UpUid
            videoInfoDict[videoBv].videoUpUid = uidTemp[1];
            consoleLogOutput(videoBv, "网页上获取的UP主UID: ", videoInfoDict[videoBv].videoUpUid);

            // 视频Up名称
            videoInfoDict[videoBv].videoUpName = videoLinkElement.textContent;
            videoInfoDict[videoBv].videoUpName = videoInfoDict[videoBv].videoUpName.replace(/\s?·\s\S*$/, "");
            consoleLogOutput(videoBv, "网页上获取的UP主名称: ", videoInfoDict[videoBv].videoUpName);
        }
    }

    // 判断是否成功拿到 BV号 对应的 Up主名称 Up主Uid 记录，成功就提前退出
    if (videoInfoDict[videoBv].videoUpUid && videoInfoDict[videoBv].videoUpName) {
        consoleLogOutput(videoBv, "getUpNameAndUpUid() 已成功在网页上获取 UP主名称 UP主UID");
        return;
    }

    //获取当前时间
    const currentTime = new Date();

    // 当 lastTimeApiVideoInfo 上次API获取视频标签的时间存在，并且，和当前的时间差小于3秒时，跳过
    if (
        videoInfoDict[videoBv].lastTimeApiVideoInfo &&
        currentTime - videoInfoDict[videoBv].lastTimeApiVideoInfo < 3000
    ) {
        consoleLogOutput(videoBv, "getUpNameAndUpUid() 距离上次 Fetch 获取视频信息还未超过5秒钟");
        return;
    }

    videoInfoDict[videoBv].lastTimeApiVideoInfo = currentTime;

    // 如果前面的通过网页提取视频UP信息失败，则通过API获取视频UP信息
    fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${videoBv}`)
        .then((response) => response.json())
        .then((videoApiInfoJson) => {
            let returnMessage = videoApiInfoJson.message;
            consoleLogOutput(videoBv, "getUpNameAndUpUid() Fetch:返回的消息: ", returnMessage);

            videoInfoDict[videoBv].videoUpUid = videoApiInfoJson.data.owner.mid;
            consoleLogOutput(videoBv, "getUpNameAndUpUid() API获取的UP主UID: ", videoInfoDict[videoBv].videoUpUid);

            videoInfoDict[videoBv].videoUpName = videoApiInfoJson.data.owner.name;
            consoleLogOutput(videoBv, "getUpNameAndUpUid() API获取的UP主名称: ", videoInfoDict[videoBv].videoUpName);

            videoInfoDict[videoBv].videoDuration = videoApiInfoJson.data.duration;
            consoleLogOutput(
                videoBv,
                "getUpNameAndUpUid() API获取的视频时长: ",
                videoInfoDict[videoBv].videoDuration,
                "秒"
            );

            // 尝试在fetch异步结束后直接屏蔽处理 匹配的屏蔽Up主名称或Up主Uid
            handleBlockedUpNameOrUpUid(videoElement, videoBv, true);
        })
        .catch((error) => console.error(videoBv, "getUpNameAndUpUid() Fetch错误:", error));

    // 判断是否成功拿到 BV号 对应的 Up主名称 Up主Uid 记录
    if (videoInfoDict[videoBv].videoUpUid && videoInfoDict[videoBv].videoUpName) {
        consoleLogOutput(videoBv, "getUpNameAndUpUid() 已成功在API上获取 Up主名称 Up主Uid 视频时长");
        return;
    } else {
        consoleLogOutput(videoBv, "getUpNameAndUpUid() 暂时未获取 Up主Uid Up主名称 视频时长");
        return;
    }
}

// 判断处理匹配的屏蔽Up主名称或Up主Uid
function handleBlockedUpNameOrUpUid(videoElement, videoBv, withinFetch = false) {
    if (!videoInfoDict[videoBv].videoUpUid) {
        consoleLogOutput(videoBv, "handleBlockedUpNameOrUpUid() 未获取到 UP主名称 UP主UID 信息，放弃执行");
        return;
    }

    // 使用 屏蔽Up名称和Uid数组 与 视频UpUid 和 视频Up名称 进行匹配
    const blockedNameOrUidFind = blockedParameter.blockedNameOrUidArray.find((blockedNameOrUid) => {
        if (blockedNameOrUid == videoInfoDict[videoBv].videoUpUid) {
            return videoInfoDict[videoBv].videoUpUid;
        }
        if (blockedNameOrUid == videoInfoDict[videoBv].videoUpName) {
            return videoInfoDict[videoBv].videoUpName;
        }
    });
    if (blockedNameOrUidFind) {
        createOverlay(`屏蔽UP: ${blockedNameOrUidFind}`, videoElement, `${videoBv} handleBlockedUpNameOrUpUid()`);

        if (withinFetch) {
            consoleLogOutput(
                videoBv,
                "在 getUpNameAndUpUid() 的 Fetch 内执行 handleBlockedUpNameOrUpUid() 已屏蔽对应的 UP主名称 UP主UID"
            );
        } else {
            consoleLogOutput(
                videoBv,
                "handleBlockedUpNameOrUpUid() 已屏蔽对应的 UP主名称 UP主UID ，跳过剩下主函数步骤"
            );
        }
        return true;
    }
}

// 获取视频元素的视频标签
function getVideoTags(videoElement, videoBv) {
    // 如果已经有 BV号 对应的 Up主名称 Up主Uid 视频时长 记录，跳过
    if (videoInfoDict[videoBv].videoTags) {
        consoleLogOutput(videoBv, "getVideoTags() 在 videoInfoDict 中，已找到对应的 视频标签 记录");
        return;
    }

    //获取当前时间
    const currentTime = new Date();

    // 当 lastTimeApiVideoTag 上次API获取视频信息的时间存在，并且，和当前的时间差小于3秒时，跳过
    if (videoInfoDict[videoBv].lastTimeApiVideoTag && currentTime - videoInfoDict[videoBv].lastTimeApiVideoTag < 3000) {
        consoleLogOutput(videoBv, "getVideoTags 距离上次 Fetch 获取视频信息还未超过3秒钟");
        return;
    }

    videoInfoDict[videoBv].lastTimeApiVideoTag = currentTime;

    // 获取视频标签
    fetch(`https://api.bilibili.com/x/web-interface/view/detail/tag?bvid=${videoBv}`)
        .then((response) => response.json())
        .then((videoApiInfoJson) => {
            let returnMessage = videoApiInfoJson.message;
            consoleLogOutput(videoBv, "getVideoTags() Fetch:返回的消息: ", returnMessage);

            // 提取标签名字数组
            videoInfoDict[videoBv].videoTags = videoApiInfoJson.data.map((tagInfoItem) => tagInfoItem.tag_name);
            consoleLogOutput(videoBv, "getVideoTags() API获取的视频标签: ", videoInfoDict[videoBv].videoTags);

            // 尝试在fetch异步结束后直接屏蔽处理 匹配的屏蔽视频标签
            handleBlockedVideoTag(videoElement, videoBv, true);
        })
        .catch((error) => console.error(videoBv, "getVideoTags() Fetch错误:", error));

    // 如果已经有 BV号 对应的 Up主名称 Up主Uid 视频时长 记录，跳过
    if (!videoInfoDict[videoBv].videoTags) {
        consoleLogOutput(videoBv, "getVideoTags() 暂时未获取 视频标签 ，跳过剩下主函数步骤");
        return true;
    }
}

// 判断处理匹配的屏蔽视频标签
function handleBlockedVideoTag(videoElement, videoBv, withinFetch = false) {
    if (!videoInfoDict[videoBv].videoTags) {
        consoleLogOutput(videoBv, "handleBlockedVideoTag() 未获取到 视频标签 信息，放弃执行");
        return;
    }

    // 使用 屏蔽标签数组 与 视频标签 进行匹配
    const blockedTagFind = blockedParameter.blockedTagArray.find((blockedTag) => {
        const blockedTagRegEx = new RegExp(blockedTag);
        return videoInfoDict[videoBv].videoTags.find((videoTag) => blockedTagRegEx.test(videoTag));
    });

    if (blockedTagFind) {
        createOverlay(`屏蔽标签: ${blockedTagFind}`, videoElement, `${videoBv} handleBlockedVideoTag()`);
        if (withinFetch) {
            consoleLogOutput(videoBv, "在 getUpNameAndUpUid() 的 Fetch 内执行 handleBlockedVideoTag() 已屏蔽 屏蔽标签");
        } else {
            consoleLogOutput(videoBv, "handleBlockedVideoTag() 已屏蔽 屏蔽标签，跳过剩下主函数步骤");
        }
        return;
    }

    // 使用 双重屏蔽标签数组 与 视频标签 进行匹配
    const doubleBlockedTagFind = blockedParameter.doubleBlockedTagArray.find((doubleBlockedTag) => {
        // 以 "|" 分割成数组，同时都能匹配上才是符合
        const doubleBlockedTagSplitArray = doubleBlockedTag.split("|");

        const doubleBlockedTagRegEx0 = new RegExp(doubleBlockedTagSplitArray[0]);
        const doubleBlockedTagRegEx1 = new RegExp(doubleBlockedTagSplitArray[1]);

        if (
            videoInfoDict[videoBv].videoTags.find((videoTag) => doubleBlockedTagRegEx0.test(videoTag)) &&
            videoInfoDict[videoBv].videoTags.find((videoTag) => doubleBlockedTagRegEx1.test(videoTag))
        ) {
            return doubleBlockedTag;
        }
    });
    if (doubleBlockedTagFind) {
        createOverlay(`双重屏蔽标签: ${doubleBlockedTagFind}`, videoElement, `${videoBv} doubleBlockedTagFind()`);

        if (withinFetch) {
            consoleLogOutput(
                videoBv,
                "在 getUpNameAndUpUid() 的 Fetch 内执行 handleBlockedVideoTag() 已屏蔽 双重屏蔽标签"
            );
        } else {
            consoleLogOutput(videoBv, "handleBlockedVideoTag() 已屏蔽 双重屏蔽标签，跳过剩下主函数步骤");
        }
        return;
    }
}

// 创建屏蔽叠加层
function createOverlay(text, videoElement, operationInfo, setTimeoutStatu = false) {
    // 获取子元素，确认是否为已经修改
    if (videoElement.firstElementChild.className == "blockedOverlay") {
        consoleLogOutput(operationInfo, "创建屏蔽叠加层 出现重复处理 跳过");
        return;
    }

    // Bug记录：
    // 位置: 视频播放页面 (即 https://www.bilibili.com/video/BVxxxxxx 页面下)
    // 行为: 添加屏蔽叠加层 这个操作 只因为 屏蔽标签 的方式来触发时 (如果还触发了 屏蔽标题 屏蔽短时长 这一类，是不会出现这个Bug的。)
    // 症状: 渲染异常，右侧视频推荐列表的封面图片不可见；评论区丢失；页面头部的搜索框丢失 (div.center-search__bar 丢失)；
    // 处理: 延迟添加 overlay 可解决，先暂时把元素变成透明/模糊的，等3秒，页面完全加载完了，再创建创建屏蔽叠加层，再把元素改回正常。
    // 猜测: 我一开始以为是使用 fetch 获取API造成的，因为只有 屏蔽标签 这个操作必须通过 fetch 获取标签信息的。
    //      但是出现 屏蔽标题 屏蔽短时长 多种触发的情况下，又不会触发这个Bug了，想不懂，我也不会调试这种加载过程。

    // // 在 导航中的分类页面 创建屏蔽叠加层操作 延迟处理
    // if (videoElement.firstElementChild.className == "bili-video-card__skeleton hide" && setTimeoutStatu == false) {
    //     // 元素先改透明
    //     // videoElement.style.opacity = "0";
    //     videoElement.style.filter = "blur(10px)"
    //     // 延迟3秒
    //     setTimeout(() => {
    //         // 创建屏蔽叠加层
    //         createOverlay(text, videoElement, `${operationInfo} 延迟处理`, true);
    //         //元素再改回不透明
    //         // videoElement.style.opacity = "1";
    //         videoElement.style.filter = "none"
    //     }, 3000);

    //     return;
    // }

    // 在 视频播放页面 创建屏蔽叠加层操作作延迟处理
    if (videoElement.firstElementChild.className == "card-box" && setTimeoutStatu == false) {
        // 元素先改模糊
        // videoElement.style.opacity = "0";
        videoElement.style.filter = "blur(5px)";
        // 延迟3秒
        setTimeout(() => {
            // 创建屏蔽叠加层
            createOverlay(text, videoElement, `${operationInfo} 延迟处理`, true);
            //元素再改回正常
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
    overlay.style.backgroundColor = blockedOverlayColor;
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "10";
    overlay.style.backdropFilter = "blur(6px)";
    overlay.style.borderRadius = "6px";

    let overlayText = document.createElement("div");
    if (videoElement.firstElementChild.className == "card-box") {
        overlayText.style.fontSize = "1.25em";
    }
    overlayText.innerText = text;
    overlayText.style.color = uiTextColor;
    overlay.appendChild(overlayText);

    // 添加叠加层为最前面的子元素
    videoElement.insertAdjacentElement("afterbegin", overlay);
}

// -----------------主函数----------------------

// 屏蔽Bilibili上的符合屏蔽条件的视频
function FuckYouBilibiliRecommendationSystem() {
    // 获取所有包含B站视频相关标签的视频元素
    const videoElementArray = getVideoElements();

    // 输出整个视频信息字典
    consoleLogOutput(Object.keys(videoInfoDict).length, "个视频信息: ", videoInfoDict);

    // 遍历每个视频元素
    for (let videoElement of videoElementArray) {
        // 是否为已经屏蔽处理过的子元素
        if (isAlreadyBlockedChildElement(videoElement)) {
            // 如果是已经屏蔽处理过的子元素，跳过后续操作
            continue;
        }

        // 获取视频元素的Bv号和标题
        let videoBv = getBvAndTitle(videoElement);
        if (!videoBv) {
            // 如果没有拿到Bv号，跳过后续操作
            continue;
        }

        // 判断处理匹配的屏蔽标题
        if (handleBlockedTitle(videoElement, videoBv)) {
            // 如果匹配成功并屏蔽，跳过后续操作
            continue;
        }

        // 是否处理短时长视频
        if (blockedParameter.blockedShortDuration > 0) {
            // 获取视频元素的视频时长
            getDuration(videoElement, videoBv);

            // 判断处理匹配的短时长视频
            if (handleBlockedShortDuration(videoElement, videoBv)) {
                // 如果匹配成功并屏蔽，跳过后续操作
                continue;
            }
        }

        // 是否处理屏蔽Up主名称或Up主Uid
        if (blockedParameter.blockedNameOrUidArray.length > 0) {
            // 获取视频元素的Up主名称和Up主Uid
            getUpNameAndUpUid(videoElement, videoBv);

            // 判断处理匹配的屏蔽Up主名称或Up主Uid
            if (handleBlockedUpNameOrUpUid(videoElement, videoBv)) {
                // 如果匹配成功并屏蔽，跳过后续操作
                continue;
            }
        }

        // 是否处理屏蔽视频标签
        if (blockedParameter.blockedTagArray.length > 0 || blockedParameter.doubleBlockedTagArray.length > 0) {
            // 获取视频元素的视频标签
            if (getVideoTags(videoElement, videoBv)) {
                // 如果没有拿到视频元素的视频标签，跳过后续操作
                continue;
            }

            // 判断处理匹配的屏蔽视频标签
            if (handleBlockedVideoTag(videoElement, videoBv)) {
                // 如果匹配成功并屏蔽，跳过后续操作
                continue;
            }
        }
    }

    // 输出整个视频信息字典
    consoleLogOutput(Object.keys(videoInfoDict).length, "个视频信息: ", videoInfoDict);
}

// 页面加载完成后运行脚本
window.addEventListener("load", FuckYouBilibiliRecommendationSystem);

// 定义 MutationObserver 的回调函数
function mutationCallback(mutationsList, observer) {
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
