# Earth

Artificial General Intelligence user interface
普惠AGI交互界面，让更多人可以实现自己的AGI交互界面。

AGI-UI的使命是改善AGI在PC、Web、Mobile、XR、机器人等领域的人机协作体验。

> 作为AGIUI的首个开源项目，Earth是一个浏览器插件，支持常见的浏览器：Chrome, Firefox, Safari, Edge, Brave等。


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

- 根据选择器获取网页信息 示例


获取微博话题下面的文本内容
```
{
    "url":"https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D%23AGIUI",
    "query":".weibo-main .weibo-text"
}
```

获取微博推荐的内容
```
{   "url":"https://m.weibo.cn/?ref=mix",
    "query":".weibo-text"
}
```

chirper上的shadowai行为解读
```
{
    "url":"https://chirper.ai/shadowai/?ref=mix",
    "query":".MuiCardContent-root"
}
```


## 相关资料：

[如何构建属于自己的知识引擎？](https://mp.weixin.qq.com/s/W6wjg8873gNci2vcZhamGg)

[人工智能写作指南v1.0](https://mp.weixin.qq.com/s/sisxObPri8ElG2krgE7w_A)

[趋势：自主思考，通用人工智能的雏形#生成式智能体](https://mp.weixin.qq.com/s/uMvX_SgWyRpekWIfPpwYCQ)

[Next Thing：角色+模型+流程+接口调用](https://mp.weixin.qq.com/s/RGcGGsjOF3li_56Cy4myIQ)

[推荐系统的可解释性到底需不需要？可解释性的UI应该是什么样的？](https://mp.weixin.qq.com/s/HEGrrTkIyY_4EaBpFYJJ7Q)

[mix-copilot](http://www.mix-copilot.com)