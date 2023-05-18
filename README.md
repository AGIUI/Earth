# Earth

Artificial General Intelligence user interface
普惠AGI交互界面，让更多人可以实现自己的AGI交互界面。

AGI-UI的使命是改善AGI在PC、Web、Mobile、XR、机器人等领域的人机协作体验。

> 作为AGIUI的首个开源项目，Earth是一个浏览器插件，支持常见的浏览器：Chrome, Firefox, Safari, Edge, Brave等。

## 如何使用？

安装步骤，先打开网址下载 https://github.com/AGIUI/Earth/releases/tag/v0.1.1

Chrome：

1.打开Chrome浏览器，地址栏输入 chrome://extensions/, 勾择开发者模式，点击'加载已解压的扩展程序'

2.选择文件夹，点击确定。扩展程序列表出现你导入的扩展程序即为成功。

Edge：

1.打开Edge浏览器，地址栏输入 edge://extensions/, 勾择开发者模式，点击'加载已解压的扩展程序'

2.选择文件夹，点击确定。扩展程序列表出现你导入的扩展程序即为成功。


## Commands

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

## 从notion里读取你的数据

- config.json 里配置你的notion数据源


## Combo的一些示例

[示例1：获取微博信息-创作科幻故事.json](/examples/example01.json)

[示例2：获取微博最新消息，写一个访谈提纲](/examples/example02.json)

[示例3：chirper上的shadowai行为解读](/examples/example03.json)


## combo的数据示例
```
[{
    "checked": true,
    "combo": 3,
    "id": "1881e7d386e",
    "isInfinite": false,
    "owner": "user",
    "prompt": {
        "bindCurrentPage": false,
        "isApi": false,
        "isNextUse": true,
        "queryObj": {
            "isQuery": false,
            "query": "",
            "url": ""
        },
        "text": "给我一个科幻故事，和植物、机器人、爱情有关",
        "url": ""
    },
    "prompt2": {
        "bindCurrentPage": false,
        "isApi": false,
        "isNextUse": false,
        "text": "总结下"
    },
    "prompt3": {
        "text": "嗯"
    },
    "role": "",
    "tag": "科幻故事"
}]
```

## 版本记录

v0.2.0 

新增绑定当前网页、输出格式，combo编辑器导入导出，提供示例



## 相关资料：

[视频demo](https://space.bilibili.com/540054369)

[如何构建属于自己的知识引擎？](https://mp.weixin.qq.com/s/W6wjg8873gNci2vcZhamGg)

[人工智能写作指南v1.0](https://mp.weixin.qq.com/s/sisxObPri8ElG2krgE7w_A)

[趋势：自主思考，通用人工智能的雏形#生成式智能体](https://mp.weixin.qq.com/s/uMvX_SgWyRpekWIfPpwYCQ)

[Next Thing：角色+模型+流程+接口调用](https://mp.weixin.qq.com/s/RGcGGsjOF3li_56Cy4myIQ)

[推荐系统的可解释性到底需不需要？可解释性的UI应该是什么样的？](https://mp.weixin.qq.com/s/HEGrrTkIyY_4EaBpFYJJ7Q)

[mix-copilot](http://www.mix-copilot.com)
