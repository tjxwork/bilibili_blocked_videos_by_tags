<!--
 * @Author: tjxgame@outlook.com
 * @Date: 2024-01-30 14:57:38
 * @LastEditors: tjxgame
 * @LastEditTime: 2024-03-28 12:41:45
 * @FilePath: \Chapter05d:\Projects\GitHub\bilibili_blocked_videos_by_tags\README.md
 * @Description: 给个三连吧
 * 
 * Copyright (c) 2024 by tjxwork, All Rights Reserved. 
-->
# Bilibili Blocked Videos By Tags

对Bilibili.com的视频卡片元素，以标签、标题、时长、UP主名称、UP主UID 来判断匹配，添加屏蔽叠加层或隐藏视频。


# 更新：

* v0.5.4 修复 "综合热门、每周必看、入站必刷" 页面的标题无法正常获取的错误。
* v0.5.3 增加屏蔽生效范围，除原有的 "首页、分区首页、播放页右侧推荐栏、搜索页" 外，  
    新增 "综合热门、每周必看、入站必刷、旧版首页(部分元素支持)"。
* v0.5.2 修复在搜索页面下，隐藏模式没有正确隐藏视频元素，感谢 Bilibili@痕继痕迹 的指出和宣传！！！
* v0.5.1 添加隐藏视频模式


# 功能：

* 按视频标题内容进行屏蔽（支持正则）
* 按视频时长进行屏蔽
* 按UP主名称或UP主UID进行屏蔽
* 按标签进行屏蔽（支持正则）
* 按双重标签进行屏蔽，同时命中两个标签才生效（支持正则）
* 生效页面：首页、各分区首页、播放页右侧推荐栏、搜索页面、综合热门、每周必看、入站必刷、旧版首页(部分元素支持)

‍ 

# 作者其他脚本：

[Video Audio Compressor](https://greasyfork.org/zh-CN/scripts/489529-video-audio-compressor) （视频音量压缩器，防止耳聋，避免响度战争，压缩视频的最大音量）

有时候刷到那些无视音量响度标准的低质视频，音量直接顶到0dB的那种，能压到-5dB左右，适合习惯B站播放器使用100%音量的人，对正常视频影响不大。

‍ 

# 实现逻辑：

判断先后顺序：标题 > 时长 > UP主 > 标签 > 双重标签，屏蔽命中后，放弃后续的信息获取及判断。

临时缓存机制：同窗口进程下，以 BV号 为键保存相关信息。

限制API获取频率：优先使用网页元素来获取信息，每个相同的 BV号 ，在3秒内最多查询1次。

‍ 

# 脚本兼容测试通过：

[bilibili-app-recommend](https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend) （为 B 站首页添加像 App 一样的推荐）


‍ 


# 相关链接：
* Greasy Fork：[Bilibili 按标签、标题、时长，UP主屏蔽视频](https://greasyfork.org/zh-CN/scripts/481629-bilibili-%E6%8C%89%E6%A0%87%E7%AD%BE-%E6%A0%87%E9%A2%98-%E6%97%B6%E9%95%BF-up%E4%B8%BB%E5%B1%8F%E8%94%BD%E8%A7%86%E9%A2%91)
* GitHub：[https://github.com/tjxwork/bilibili_blocked_videos_by_tags](https://github.com/tjxwork/bilibili_blocked_videos_by_tags)
* 视频教程：[Bilibili 按标签、标题、时长、UP主屏蔽视频 油猴插件【tjxgame】](https://www.bilibili.com/video/BV12i4y1e73B)

‍

# 效果展示：

[![pigIX5T.png](https://z1.ax1x.com/2023/12/07/pigIX5T.png)](https://imgse.com/i/pigIX5T)
‍

# 赞助：

有用的话，赞助作者吃桶泡面吧

![](https://tc.dhmip.cn/imgs/2023/12/09/a8e5fff3320dc195.png)