---
title: 'qBittorrent 高级设置指北'
description: '得了一种不把高级设置里的选项都过一遍就浑身难受的病。'
pubDate: 2026-08-21
---

## 前言

libtorrent的许多配置项在文档中描述得很模糊，网上找到的解释也是千篇一律，于是决定自己写一篇尽可能详细的说明。

如果未特殊说明，我的qBit运行在6核8G的debian13虚拟机中docker容器内，版本为5.1.4，下载盘为ext4文件系统。

## qBit 程序部分

| 选项  | 说明  | 建议  | 来源  |
| --- | --- | --- | --- |
| 恢复数据存储类型 | *快速恢复文件*会在`/config/qBittorrent/BT_backup/`创建一个与种子hash同名的.fastresume文件；*SQLite数据库*会把这些数据存储到一个单独的数据库文件。 | 保持默认 |     |
| 物理内存（RAM）使用限制 | 如其名。 | 按需填写 |     |

## libtorrent 部分

| 选项  | 说明  | 建议  | 来源  |
| --- | --- | --- | --- |
| Bdecode 相关的限制 | 防止嵌套过深或节点过多的torrent文件耗尽内存。 | 默认  | [libtorrent 文档](https://www.libtorrent.org/reference-Bdecoding.html#bdecode%28%29) |
| 异步 I/O 线程数 | 虽然官方文档里面推荐设置为CPU线程数的四倍，用于提升哈希计算速度，但是I/O线程也影响磁盘读写，如果是HDD设置过大可能增加读写延迟。**此外，新版为哈希计算线程新增了选项**。 | SSD设置为*CPU线程数* \* 4，HDD设为低于10的值 | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 散列线程(hashing_threads) | *重新校验种子*时计算哈希使用的线程数，下载时的哈希计算仍然由上面的异步I/O线程指定。 | 设为CPU线程数 | [libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#hashing_threads) |
| 文件池大小 | Windows的一些杀毒软件会在打开文件时扫描，保持打开也许可以降低性能开销，但是Swap会不开心。Linux建议调小。 | qBit的默认值好像是5000，libtorrent的默认值是40，我调的100 | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 校验时内存使用扩增量 | 校验种子时使用的内存量，CPU吃饱的时候可以不用管。 | qBit默认32MB，libtorrent默认256MB | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 磁盘缓存 | 在 libtorrent 2.0+ 版本中，内置的磁盘缓存被`mmap`代替，没有此选项。 | 默认（-1） |     |
| 磁盘队列大小 | 写入队列数据占用的内存量，磁盘跟不上下载速度的可以适当调大。 | qBit默认1MB，libtorrent默认100MB | [libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#max_queued_disk_bytes) |
| 磁盘 IO 类型 |     | 默认  |     |
| 磁盘 IO 读取/写入模式 | 这里不要信那些说启用操作系统缓存会导致不稳定的鬼话，一般保持默认即可。页面缓存会在内存不足时立即释放，但是谁会在玩游戏时后台挂个BT呢？如果想详细了解，可以搜索[页面缓存（Page Cache）](https://en.wikipedia.org/wiki/Page_cache)。 | 默认  | [libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#disk_io_read_mode) |
| 启用相连文件块下载模式 | 关联下载相邻的4MB分块，可以提升磁盘IO吞吐量。 | 开启  | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 发送分块上传建议 | 这只在上传时有用，会发送下载建议给对方客户端，以便对方更好地下载当前在你缓存内的文件。当然，对方听不听就是另一回事了。 | 开启  | [libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#suggest_mode) |
| 发送缓冲区上限 | 上传数据缓冲区的上限，每个Peer单独计算，实际值由*当前上传速度* \* *增长系数*决定，两值取最小作为发送缓冲区。 | 普通家宽默认即可，seedbox调大 | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced)，[libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#send_buffer_watermark) |
| 发送缓冲区下限 | 和上面相似，这个是最小值。 | 同上  |     |
| 发送缓冲区增长系数 | 上面提到的增长系数。 | 同上  |     |
| 每秒传出连接数 | 每秒尝试与多少Peer建立连接，调大也许可以加快热门种子的下载速度的增长速度（？）。 | 对自己路由器自信的可以随便调，默认30 | [libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#connection_speed) |
| 套接字发送/接收缓存大小 |     | 默认  |     |
| Socket backlog 大小 | 积压的连接队列大小上限，不了解的建议保持默认。 | 默认  | [libtorrent 文档](https://www.libtorrent.org/reference-Settings.html#listen_queue_size) |
| 传出端口（下限） | 因为有一个*禁止连接特权端口Peer*的选项，所以建议设为1024。 | 1024 |     |
| 传出端口（上限） |     | 默认  |     |
| UPnP 租期 |     | 默认  |     |
| 与 peers 连接的服务类型（ToS） | IP 报头中的 ToS 字段，路由器不开启QoS的情况下没什么用，qBit中好像使用十进制表示。 | 默认  | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| μTP-TCP 混合模式策略 | TCP和μTP连接的带宽分配策略，在中国大陆UDP丢包严重，不建议使用。 | 优先使用TCP | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 支持国际化域名（IDN） | 支持使用IDN域名的Tracker，如中文域名，但是可能导致各种Unicode编码攻击。 | 关闭（默认） | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced)[](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 允许来自同一 IP 地址的多个连接 |     | 关闭（默认） | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 服务器端请求伪造（SSRF）攻击缓解 |     | 开启（默认） | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 上传窗口策略 | 上传窗口可以理解为同时向多少个Peer上传，*基于上传速率*选项开放新窗口的所需要的上传速率是指数级上涨的，建议使用*固定窗口数*更稳定地控制。 | 固定窗口数（默认） | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| 上传连接策略 | 所谓的*反吸血*是优先给刚开始和快结束的Peer上传，没什么用。 | 最快上传（默认） | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| Peer 进出阈值百分比 | 当连接的Peer达到上限的指定百分比时，启用Peer轮换机制（Peer turnover）。 | 默认  | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| Peer 进出断开间隔 | 每次Peer轮换的间隔时间。 | 默认  | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
| Peer 进出断开百分比 | 每次Peer轮换断开多少比例的低速Peer。 | 默认  | [qBittorrent 文档](https://github.com/qbittorrent/qBittorrent/wiki/Explanation-of-Options-in-qBittorrent#Advanced) |
