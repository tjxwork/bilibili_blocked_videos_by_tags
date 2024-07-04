<!--
 * @Author: tjxgame@outlook.com
 * @Date: 2024-01-30 14:57:38
 * @LastEditors: tjxgame
 * @LastEditTime: 2024-07-05 04:27:05
 * @FilePath: \001d:\Projects\GitHub\bilibili_blocked_videos_by_tags\README.md
 * @Description: 给个三连吧
 *
 * Copyright (c) 2024 by tjxwork, All Rights Reserved.
-->

# Bilibili Blocked Videos By Tags

对 Bilibili.com 的视频卡片元素，以标签、标题、UP 主、分区、时长、播放量、点赞率、竖屏、充电专属、精选评论、置顶评论来判断匹配，添加覆盖叠加层或隐藏视频。

作者的爱发电：[https://afdian.net/a/tjxgame](https://afdian.net/a/tjxgame)  
欢迎订阅支持！你的支持就是维护的动力！

# 更新：

-   v1.1.2 添加新功能：“按置顶评论屏蔽”；  
    注意：“按置顶评论屏蔽”、“屏蔽精选评论的视频” 这两个功能都用到了获取评论的 API，  
    **这个 API 对请求频率非常敏感，频繁刷新或者开启新页面会导致 B 站拒绝请求，已经尽量做了错开请求处理，正常浏览一般不会出现拒绝问题。**

-   v1.1.1 添加新功能：“屏蔽充电专属的视频”。

-   v1.1.0 添加新功能：“屏蔽精选评论的视频”，骗子视频大概率会开启精选评论。（但测试的时候发现骗子视频并不全是开的）；  
    “隐藏首页等页面的非视频元素” 功能生效范围增加：隐藏视频播放页右侧视频相关的游戏推荐；  
    控制台输出日志优化：现在只有发生变化的时候才会输出。

-   v1.0.2 “隐藏首页等页面的非视频元素” 功能生效范围增加：隐藏视频播放页右侧最下方的“大家围观的直播”。

-   v1.0.1 修正了 B 站旧版首页的顶部推荐条失效的 Bug；  
    如果用旧版首页只是想要更多的顶部推荐的话，建议使用 [bilibili-app-recommend](https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend) 脚本来获取更多的推荐。  
    如果觉得现在版本的 B 站首页的推荐卡片有广告的问题，可以通过本脚本的 “隐藏首页等页面的非视频元素” 功能来解决。

-   v1.0.0 菜单 UI 使用 Vue3 重构，现在不用担心缩放问题挡住 UI 了，界面更加现代化；改进了判断逻辑，现在可以使用白名单来避免误杀关注的 UP 了；  
    新增功能：视频分区屏蔽、播放量屏蔽、点赞率屏蔽、竖屏视频屏蔽、UP 主名称正则屏蔽、隐藏非视频元素、白名单避免屏蔽指定 UP。

-   v0.5.5 修复 视频播放页右侧推荐视频，按 UP 主名称屏蔽失效，感谢“雪炭翁” 的指出。
-   v0.5.4 修复 "综合热门、每周必看、入站必刷" 页面的标题无法正常获取的错误。
-   v0.5.3 增加屏蔽生效范围，除原有的 "首页、分区首页、播放页右侧推荐栏、搜索页" 外，  
     新增 "综合热门、每周必看、入站必刷、旧版首页(部分元素支持)"。
-   v0.5.2 修复在搜索页面下，隐藏模式没有正确隐藏视频元素，感谢 Bilibili@痕继痕迹 的指出和宣传！！！
-   v0.5.1 添加隐藏视频模式

# 功能：

-   按标题屏蔽（支持正则）
-   按 UP 名称或 Uid 屏蔽（支持正则）
-   按视频分区屏蔽（支持正则）
-   按标签屏蔽（支持正则）
-   按双重标签屏蔽，同时命中两个标签才生效（支持正则）
-   按置顶评论屏蔽（支持正则）
-   按视频时长屏蔽
-   按播放量屏蔽
-   按点赞率屏蔽
-   按竖屏视频屏蔽
-   按充电专属的视频屏蔽
-   按精选评论的视频屏蔽
-   按白名单避免屏蔽指定 UP
-   生效页面：首页、各分区首页、播放页右侧推荐栏、搜索页面、综合热门、每周必看、入站必刷、排行榜、旧版首页(部分元素支持)

‍

# 作者其他脚本：

[Video Audio Compressor](https://greasyfork.org/zh-CN/scripts/489529-video-audio-compressor) （视频音量压缩器，防止耳聋，避免响度战争，压缩视频的最大音量）

有时候刷到那些无视音量响度标准的低质视频，音量直接顶到 0dB 的那种，能压到-5dB 左右，适合习惯 B 站播放器使用 100%音量的人，对正常视频影响不大。

‍

# 实现逻辑：

判断先后顺序：标题 > UP 主 > 视频分区 > 标签 > 双重标签 > 时长 > 播放量 > 点赞率 > 竖屏 > 充电专属 > 精选评论 > 白名单。

临时缓存机制：同窗口进程下，以 BV 号 为键保存相关信息。

限制 API 获取频率：优先使用网页元素来获取信息，每个相同的 BV 号 ，在 3 秒内最多查询 1 次。

‍

# 脚本兼容测试通过：

[bilibili-app-recommend](https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend) （为 B 站首页添加像 App 一样的推荐）

‍

# 相关链接：

-   Greasy Fork：[Bilibili 按标签、标题、时长，UP 主屏蔽视频](https://greasyfork.org/zh-CN/scripts/481629-bilibili-%E6%8C%89%E6%A0%87%E7%AD%BE-%E6%A0%87%E9%A2%98-%E6%97%B6%E9%95%BF-up%E4%B8%BB%E5%B1%8F%E8%94%BD%E8%A7%86%E9%A2%91)
-   GitHub：[https://github.com/tjxwork/bilibili_blocked_videos_by_tags](https://github.com/tjxwork/bilibili_blocked_videos_by_tags)
-   视频教程：[应该是目前 B 站最强的屏蔽视频插件？【tjxgame】](https://www.bilibili.com/video/BV1WJ4m1u79n/)

# 效果展示：

[![pkDjsf0.png](https://s21.ax1x.com/2024/06/22/pkDjsf0.png)](https://imgse.com/i/pkDjsf0)
‍

# 赞助：

有用的话，赞助作者吃桶泡面吧

![](https://tc.dhmip.cn/imgs/2023/12/09/a8e5fff3320dc195.png)

作者的爱发电：[https://afdian.net/a/tjxgame](https://afdian.net/a/tjxgame)  
也可以用爱发电按月订阅支持！
