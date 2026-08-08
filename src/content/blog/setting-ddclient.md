---
title: '记录一次使用 ddclient 进行 DDNS 更新'
description: '简单介绍了在 debian 系统中安装 ddclient，并为托管在 Cloudflare 的域名配置 DDNS。'
pubDate: '2026-07-11'
---

## 安装

这里使用的是`debian`系统，可以直接从`apt`安装：

```bash
sudo apt install ddclient
```

如果是其他系统，可以在[项目README](https://github.com/ddclient/ddclient#installation)中查找支持状态。


## 配置

唯一的文档在这里：`ddclient -help | less`，而且**写得很烂**，所以下面踩的坑很多，也不保证最终是正确的。

安装时会有初始化配置的GUI,选择你的服务商，随便输入占位值跳过即可。我使用`Cloudflare`托管域名，接下来也会以此为例。

首先，打开`/etc/ddclient.conf`文件：

```bash
sudo vi /etc/ddclient.conf
# or easier
sudo nano /etc/ddclient.conf
```

### 基本配置项

你会看到安装时初始化的内容，下面重点讲解重要的配置项：

- `deamon`: 轮询时间，单位秒
- `protocol`: 目标服务商，可以在README或帮助查看支持列表
- `use` / `usev6`: IPv4 / IPv6 的获取方式，下面的会覆盖上面，一次只能更新一个
    - `if` / `ifv6`: 从系统网卡获取
    - `web` / `webv6`: 从网络API获取
- `zone`: 二级域名，如`example.com`
- `login`: 通常是账户，实际用途根据服务商决定
- `password`: 通常是密码，备注同上
- \(下一个`protocol`之间的空位\): 需要更新的域名，支持泛域名`*`和根域名`@`

> 理论上可以配置多个`protocol`，但是我没测试过。

> 在一个`protocol`中，同时更新IPv4和IPv6可能会出现错误，至少在`Cloudflare`的条件下会出现。

### 验证身份

Cloudflare 支持三种验证方式，具体如下：

```bash
# 截取自文档

  ## single host update using a global API key
  protocol=cloudflare,                                         \
  zone=dns.zone,                                               \
  login=my-cloudflare.com-login,                               \
  password=my-cloudflare-global-key                            \
  myhost.com

  ## single host update using an API token
  protocol=cloudflare,                                         \
  zone=dns.zone,                                               \
  login=token,                                                 \
  password=cloudflare-api-token                                \
  myhost.com

  ## multiple host update to the custom DNS service
  protocol=cloudflare,                                         \
  zone=dns.zone,                                               \
  login=my-cloudflare.com-login,                               \
  password=my-cloudflare-global-api-key                        \
  my-toplevel-domain.com,my-other-domain.com

```

我选择的是第二种，通过API令牌验证。这种方法足以覆盖所有区域（域名），且安全行更强，不推荐使用全局令牌。

可以在[管理面板](https://dash.cloudflare.com/)的`侧边栏> 管理账户（最下方）> 账户API令牌> 创建令牌`中申请账户级的令牌，或在[此处](https://dash.cloudflare.com/profile/api-tokens)申请用户级的令牌。

> 用户是账户的成员，一个账户可以包含多个用户，用户的令牌对其所在的所有账户生效。

两个令牌的申请步骤略有差别，下面分开说明。

账户令牌：点击新建后，在**权限策略**卡片的右上角，选择`Edit zone DNS`模板，可以调整以限制特定域名，完成后点击最下方的**审核令牌**。

用户令牌：点击新建后，可以直接看到模板选项，选择`编辑区域DNS`，根据自身需求调整后一路**继续**。

成功获取到令牌后，在配置文件中填入：

```bash
login=token
password=你的令牌
```

### 配置域名

`ddclient`不会帮你创建新的记录，所以使用前需要你手动去创建一个，保持和配置文件中的域名相同，写在protocol块的最后面，只能使用半角逗号`,`或空行分隔。

完整配置文件示例：

```bash
daemon=300
syslog=yes
ssl=yes

usev6=ifv6, ifv6=eth0

protocol=cloudflare
zone=example.com
login=token
password='abcdefg_hijklmn'

@.example.com
*.example.com
sub.example.com
```


## 结语

什么，还是报错？

```bash
sudo ddclient -file /path/to/config -daemon=0 --foreground -debug -verbose -noquiet
```

在白天找个时间看看吧，或者出门右转[DDNS-GO](https://github.com/jeessy2/ddns-go)，注意不要在晚上折腾。

祝好运。

