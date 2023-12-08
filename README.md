# Bilibili Blocked Videos By Tags

对Bilibili.com的视频卡片元素，以标签、标题、时长、UP主名称、UP主UID 来判断匹配，添加屏蔽叠加层。

‍

# 功能：

* 按视频标题内容进行屏蔽（支持正则）
* 按视频时长进行屏蔽
* 按UP主名称或UP主UID进行屏蔽
* 按标签进行屏蔽（支持正则）
* 按双重标签进行屏蔽，同时命中两个标签才生效（支持正则）

  


# 实现逻辑：

判断先后顺序：标题 > 时长 > UP主 > 标签 > 双重标签，屏蔽命中后，放弃后续的信息获取及判断。

临时缓存机制：同窗口进程下，以 BV号 为键保存相关信息。

限制API获取频率：优先使用网页元素来获取信息，每个相同的 BV号 ，在3秒内最多查询1次。

‍  

# 可能干涉的脚本兼容确认：

[bilibili-app-recommend (greasyfork.org)](https://greasyfork.org/zh-CN/scripts/443530-bilibili-app-recommend)

‍

# 相关链接：
* Greasy Fork：[Bilibili 按标签、标题、时长，UP主屏蔽视频](https://greasyfork.org/zh-CN/scripts/481629-bilibili-%E6%8C%89%E6%A0%87%E7%AD%BE-%E6%A0%87%E9%A2%98-%E6%97%B6%E9%95%BF-up%E4%B8%BB%E5%B1%8F%E8%94%BD%E8%A7%86%E9%A2%91)
* GitHub：[https://github.com/tjxwork/bilibili_blocked_videos_by_tags](https://github.com/tjxwork/bilibili_blocked_videos_by_tags)
* 视频教程：[Bilibili 按标签、标题、时长、UP主屏蔽视频 油猴插件【tjxgame】](https://www.bilibili.com/video/BV12i4y1e73B)

‍

# 效果展示：

​![pigIX5T.png](https://z1.ax1x.com/2023/12/07/pigIX5T.png)​

‍

# 赞助：
有用的话，赞助作者吃桶泡面吧

​![pigo5o6.png](https://z1.ax1x.com/2023/12/08/pigo5o6.png)
