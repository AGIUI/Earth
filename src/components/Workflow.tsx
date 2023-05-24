/**
 * ask 等待用户输入，TODO待处理
 */


const workflow = {
    "models": [
        {
            "label": "发散程度",
            "value": "temperature",
            "defaultValue":0.6
        },
        {
            "label": "模型",
            "value": "model",
            "options": [
                { "value": "ChatGPT", "label": "ChatGPT" },
                { "value": "Bing", "label": "Bing" }
            ]
        }
    ],
    "inputs": [{
        "label": "默认",
        "value": "default"
    }, {
        "label": "绑定网页正文",
        "value": "bindCurrentPage"

    },
    {
        "label": "绑定网页HTML",
        "value": "bindCurrentPageHTML"

    },
    {
        "label": "绑定网页URL",
        "value": "bindCurrentPageURL"

    },
    {
        "ask": true,
        "label": "用户划选",
        "value": "userSelection"
    },
    {
        "label": "剪切板",
        "value": "clipboard"
    }
    ],
    "outputs": [{
        "label": "默认",
        "value": "default"

    }, {
        "label": "作为上下文",
        "value": "isNextUse"

    },{
        "label":"条件判断",
        "value":"isMatch"
    }],
    "agents": [{
        "key": "prompt",
        "label": "Prompt"
    },
    {
        "key": "tasks",
        "label": "目标拆解"
    },
    {
        "key": "query",
        "label": "根据选择器获取网页信息"
    },
    {
        "key": "send-to-zsxq",
        "label": "发布内容至知识星球"
    },
    {
        "key": "highlight",
        "label": "高亮网页内容",
        "disabled":true
    },
    {
        "key": "api",
        "label": "API"
    },
    {
        "label": "JSON格式",
        "key": "json"
    },
    {
        "label": "列表",
        "key": "list"
    },
    {
        "label": "MarkDown格式",
        "key": "markdown"
    },
    {
        "label": "中文",
        "key": "translate-zh"
    },
    {
        "label": "英文",
        "key": "translate-en"
    },
    {
        "label": "提取结构化数据",
        "key": "extract",
        "temperature":0
    }
    ]
}


export {
    workflow
}