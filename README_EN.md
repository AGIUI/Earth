<div align="center">
   <img src="public/logo.png" width=256></img>
   <p><strong>Let AI workflow change the way we work</strong></p>

[简体中文](README.md) | [English](README_EN.md)

</div>

# Earth
The mission of AGI-UI (Artificial General Intelligence user interface) organization is to improve the human-computer collaboration experience of AGI in areas such as PC, Web, Mobile, XR, and robotics, allowing more people to create their own AGI interaction interfaces.


As the first open-source project of AGIUI, <strong>Earth</strong> is a browser extension currently supported on Chrome and Edge browsers. If you are interested, you can share our project on various platforms.


Earth PC & Mac Version: https://github.com/AGIUI/Solis

[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2FAGIUI%2FEarth)](https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20project%20-%20Earth!%20https://github.com/AGIUI/Earth)
[![Weibo](https://img.shields.io/badge/Weibo-Share-red?style=social&logo=weibo)](http://service.weibo.com/share/share.php?url=https%3A%2F%2Fgithub.com%2FAGIUI%2FEarth&title=分享一下AI工作流-Earth%21)

## Features
1. Supports multiple AI models, including ChatGPT, BingChat, and local LLM (OpenAI official standard).
2. Can be used on any web page, including search engines, social media, news websites, and more.
3. Define your own workflow to free up your hands and improve work efficiency.
4. Can read and manipulate web page information.

## How to Use Earth
### 1.Download Earth
Plugin download link1: [Chrome Web Store](https://chrome.google.com/webstore/detail/earth/mcbhfeopeloibcjmdljfheanikfhmmgk?hl=zh-CN&authuser=0)
Plugin download link2: https://github.com/AGIUI/Earth/releases/


### 2.Installation of Earth
#### Chrome

1. Open the Chrome browser and enter chrome://extensions/ in the address bar. Enable the Developer mode and click on 'Load unpacked extension'.
2. Select the Earth folder and click OK. The imported extension will appear in the list of extensions, indicating a successful installation.

#### Edge

1. Open the Edge browser and enter edge://extensions/ in the address bar. Enable the Developer mode and click on 'Load unpacked extension'.
2. Select the Earth folder and click OK. The imported extension will appear in the list of extensions, indicating a successful installation.

### 3.Set up Bing Chat

Open https://www.bing.com/ in your browser, and log in to your Bing account (assuming you have obtained Bing Chat access).

### 4.Set API Key

Open the plugin, click on the settings button, enter your API Key, and click "Update Status".



## Quick Start for Developers

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

## Configuring Data

- Configure your data in config.json


## Examples of Combos

[Example 1: Comic Generation](/examples/combo/%E6%BC%AB%E7%94%BB%E7%94%9F%E6%88%90_hxTElLdYiylK18tU5cPtf.json)

[Example 2: SD Image Generation API](/examples/combo/sd%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90API_4c35df6f7513b1ed1926b9b7b1415ab3.json)

[Example 3: Extracting Email Information](/examples/combo/%E6%8F%90%E5%8F%96%E9%82%AE%E4%BB%B6%E4%BF%A1%E6%81%AF_2f77d6ca8eaec9534233812874e6f202.json)

[Example 4: Generate PPT](/examples/combo/Generate%20PPT_4c35df6f7513b1ed1926b9b7b1415ab3.json)



## Example of Combo Data
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

## Version History
#### v0.3.5
- Added i18n support for multiple languages.

- Provided several combo examples.

- Added support for creating PPT.

#### v0.3.4
- Added overall debugging function.

- Debugging window can be collapsed and displayed.

- Allowed free connection.

- Implemented nodes.

#### v0.3.3
- Removed newtab feature

- Optimized text length trimming (thanks to [@nem035/gpt-3-encoder](https://www.npmjs.com/package/@nem035/gpt-3-encoder))

- Integrated [brainwave v0.1](https://github.com/AGIUI/BrainWave)

- Improved right-click menu functionality

#### v0.3.2
- Added right-click summary and selected content interaction

- Optimized dialogue box visuals

- Fixed prompt downloading bug

- Added support for local LLM integration (currently only supports OpenAI official standard API format)

#### v0.3.1
- Adjusted combo data structure and editor, added: interfaces (home, contextMenus, showInChat), input, output

- Support for individual export of combos

- API nodes

#### v0.2.0
- Added binding to current web page, output format, combo editor import/export, and provided examples


## Future Tasks
- Implementation of AGI
  ![AGI内部](/README/AGI_EN.png)
  ![角色内部](/README/Character_EN.png)
  ![模型内部](/README/Model_EN.png)
- Further development of basic nodes
  ![基础节点](/README/basic%20node.png)
- Implementation of PDF nodes: read, create, reader

- Implementation of PPT nodes: read, create

- Highlight web page information nodes

- ...


## Community
[Discord](https://discord.gg/7YVVhEQExu)

[Issue Feedback](https://discord.gg/VtRmJCb8wh)

## Contact Us
#### Twitter
[@shadow](https://twitter.com/mixlabPro)、[@薛志荣](https://twitter.com/XueZhirong)

## Related Resources

[AGIUI Workshop](https://www.youtube.com/channel/UCmZnkBypynrFJW3L_cwxcAA)


## Licence
This code is distributed under the MIT license. See [License](https://github.com/AGIUI/Earth/blob/main/LICENSE) in this directory.
