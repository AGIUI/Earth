<div align="center">
   <img src="public/logo.png" width=256></img>
   <p><strong>让AI工作流改变我们的工作方式</strong></p>

[简体中文](README.md) | [English](README_EN.md)

</div>

# Earth
AGI-UI（Artificial General Intelligence user interface，通用人工智能用户界面）组织的使命是改善AGI在PC、Web、Mobile、XR、机器人等领域的人机协作体验，让更多人可以实现自己的AGI交互界面。

作为AGIUI的首个开源项目，<strong>Earth</strong>是一款浏览器插件，暂时支持Chrome和Edge浏览器。如果你感兴趣可以分享我们的项目到各个平台。

Earth PC&Mac版本：https://github.com/AGIUI/Solis

[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2FAGIUI%2FEarth)](https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20project%20-%20Earth!%20https://github.com/AGIUI/Earth)
[![Weibo](https://img.shields.io/badge/Weibo-Share-red?style=social&logo=weibo)](http://service.weibo.com/share/share.php?url=https%3A%2F%2Fgithub.com%2FAGIUI%2FEarth&title=分享一下AI工作流-Earth%21)

## 主要特色
1. 支持多种AI模型，包括ChatGPT、BingChat和本地LLM（OpenAI官方标准）。
2. 可以在任何网页上使用，包括搜索引擎、社交媒体、新闻网站等。
3. 定义自己的工作流，解放双手，提高工作效率。
4. 可以读取和操控网页信息

## 如何使用Earth
### 1.下载Earth
插件下载地址1：[chrome Web Store](https://chrome.google.com/webstore/detail/earth/mcbhfeopeloibcjmdljfheanikfhmmgk?hl=zh-CN&authuser=0)

插件下载地址2：https://github.com/AGIUI/Earth/releases/


### 2.Earth安装方法
#### Chrome

1. 打开Chrome浏览器，地址栏输入 chrome://extensions/, 勾择开发者模式，点击'加载已解压的扩展程序'
2. 选择Earth文件夹，点击确定。扩展程序列表出现你导入的扩展程序即为成功。

#### Edge

1. 打开Edge浏览器，地址栏输入 edge://extensions/, 勾择开发者模式，点击'加载已解压的扩展程序'
2. 选择Earth文件夹，点击确定。扩展程序列表出现你导入的扩展程序即为成功。

### 3.设置Bing Chat

在浏览器打开[https://www.bing.com/](https://www.bing.com/) ，登录Bing账号（前提是已获得Bing Chat使用权限）

### 4.设置API Key和前缀

打开插件，点击设置按钮，输入你的API Key和API前缀，点击“更新状态”。



## 开发者快速上手

```sh
# Install packages
npm install

# Live Dev for multiple browsers
npm run start [browser]
# npm run start chrome firefox safari

# Build for multiple browsers
npm run build [browser]
# npm run build chrome firefox safari
```

## 配置数据

- config.json 里配置你的数据


## Combo的一些示例
[示例1：漫画生成](/examples/combo/%E6%BC%AB%E7%94%BB%E7%94%9F%E6%88%90_hxTElLdYiylK18tU5cPtf.json)

[示例2：sd图像生成API](/examples/combo/sd%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90API_4c35df6f7513b1ed1926b9b7b1415ab3.json)

[示例3：提取邮件信息](/examples/combo/%E6%8F%90%E5%8F%96%E9%82%AE%E4%BB%B6%E4%BF%A1%E6%81%AF_2f77d6ca8eaec9534233812874e6f202.json)

[示例4：知识星球助手](/examples/combo/%E7%9F%A5%E8%AF%86%E6%98%9F%E7%90%83%E5%8A%A9%E6%89%8B_mFnsueSPO86CkHudr6sD2.json)


## combo的数据示例
```
[
    {
        "tag": "提取邮件信息",
        "role": {
            "text": "麦肯锡咨询专家，掌握了非常多的方法，擅长分析整理信息。"
        },
        "combo": 3,
        "interfaces": [
            "showInChat",
            "contextMenus",
            "home"
        ],
        "isInfinite": false,
        "owner": "user",
        "prompt": {
            "id": "prompt22f77d6ca8eaec9534233812874e6f202",
            "nextId": "prompt32f77d6ca8eaec9534233812874e6f202",
            "nodeInputId": "",
            "role": {
                "text": "麦肯锡咨询专家，掌握了非常多的方法，擅长分析整理信息。"
            },
            "text": "",
            "url": "",
            "queryObj": {
                "action": "default",
                "content": "bindCurrentPage",
            },
            "temperature": 0.6,
            "model": "ChatGPT",
            "input": "nodeInput",
            "translate": "default",
            "output": "default",
            "type": "queryRead"
        },
        "version": "0.1.0",
        "app": "brainwave",
        "id": "2f77d6ca8eaec9534233812874e6f202",
        "createDate": 1686640915993,
        "prompt2": {
            "id": "prompt32f77d6ca8eaec9534233812874e6f202",
            "nextId": "prompt42f77d6ca8eaec9534233812874e6f202",
            "nodeInputId": "prompt22f77d6ca8eaec9534233812874e6f202",
            "role": {
                "text": "麦肯锡咨询专家，掌握了非常多的方法，擅长分析整理信息。"
            },
            "text": "用中文回答，提取摘要，时间、地点、人物、事件、链接等信息。",
            "temperature": 0.3,
            "model": "ChatGPT",
            "input": "nodeInput",
            "userInput": "",
            "translate": "translate-zh",
            "output": "markdown",
            "type": "prompt"
        },
        "prompt3": {
            "id": "prompt42f77d6ca8eaec9534233812874e6f202",
            "nextId": "",
            "nodeInputId": "prompt32f77d6ca8eaec9534233812874e6f202",
            "role": {
                "text": "麦肯锡咨询专家，掌握了非常多的方法，擅长分析整理信息。"
            },
            "text": "提取AI相关的信息，给这些信息评分，满分是5分，并写一句推荐文案推荐给我这个内容。输出格式：\n分数、AI信息、推荐文案",
            "temperature": 0.24,
            "model": "ChatGPT",
            "input": "nodeInput",
            "translate": "translate-zh",
            "output": "default",
            "type": "prompt"
        }
    }
]
```

## 版本记录

#### v0.3.6
- 角色节点的升级，对话界面可以切换角色

- 提示工程支持嵌入变量的方式


#### v0.3.5
- 多国语言支持 i18n

- 提供若干combo示例

- 支持创建PPT


#### v0.3.4
- 增加整体调试功能

- 调试窗口可以被收起和显示
    
- 允许自由连线

- 节点实现


#### v0.3.3
- 去除newtab

- 裁剪文本长度的优化（感谢[@nem035/gpt-3-encoder](https://www.npmjs.com/package/@nem035/gpt-3-encoder)）

- 集成 [brainwave v0.1](https://github.com/AGIUI/BrainWave)

- 右键菜单功能的完善

#### v0.3.2
- 增加右键总结、选中内容交互

- 优化对话框视觉

- 解决prompt下载的bug

- 已支持本地LLM的接入(暂时只支持OpenAI官方标准接口形式)

#### v0.3.1
- combo数据结构调整及编辑器，新增：interfaces（home、contextMenus、showInChat）、input、output

- combo支持单个导出

- API节点

#### v0.2.0
- 新增绑定当前网页、输出格式，combo编辑器导入导出，提供示例


## 未来要做的事情
- AGI实现
![AGI内部](/README/AGI.png)
![角色内部](/README/Character.png)
![模型内部](/README/Model.png)
- 完善基础节点
![基础节点](/README/basic%20node.png)
- 实现PDF节点:读取、创建、阅读器

- 实现PPT节点:读取、创建

- 高亮网页信息节点
- ......


## 社区
[Discord](https://discord.gg/7YVVhEQExu)

[问题反馈](https://discord.gg/VtRmJCb8wh)

## 联系我们
#### Twitter
[@shadow](https://twitter.com/mixlabPro)、[@薛志荣](https://twitter.com/XueZhirong)

#### 微信
![微信](/README/wechat.png)

## 相关资料

[AGIUI 研讨会](https://m.bilibili.com/video/BV1a24y1P7Qg)

[视频demo](https://space.bilibili.com/540054369)

[如何构建属于自己的知识引擎？](https://mp.weixin.qq.com/s/W6wjg8873gNci2vcZhamGg)

[人工智能写作指南v1.0](https://mp.weixin.qq.com/s/sisxObPri8ElG2krgE7w_A)

[趋势：自主思考，通用人工智能的雏形#生成式智能体](https://mp.weixin.qq.com/s/uMvX_SgWyRpekWIfPpwYCQ)

[Next Thing：角色+模型+流程+接口调用](https://mp.weixin.qq.com/s/RGcGGsjOF3li_56Cy4myIQ)

[推荐系统的可解释性到底需不需要？可解释性的UI应该是什么样的？](https://mp.weixin.qq.com/s/HEGrrTkIyY_4EaBpFYJJ7Q)

[mix-copilot](http://www.mix-copilot.com)

## Licence
此代码在 MIT 许可证下分发。 请参阅此目录中的[许可证](https://github.com/AGIUI/Earth/blob/main/LICENSE)。
