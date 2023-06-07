/** ! 与earth的同名文件一致
 * 
 * ask 等待用户输入，TODO待处理
 */


/**
 * workflow的开关
 * chatbot - 在对话框
 * editor - 编辑器
 * debug - 调试框
 * */
const display = [
    "chatbot", "editor", "debug"
]


/**
 * 角色库
 */

const roleAvatars = [
    {
        label: '工程师',
        key: 'Engineer'
    },
    {
        label: '设计师',
        key: 'Designer'
    }, {
        label: '财务官',
        key: 'Financial-Officer'
    }, {
        label: '执行官',
        key: 'Executive-Officer'
    }
]



const workflow = {
    "models": [
        {
            "label": "发散程度",
            "value": "temperature",
            "defaultValue": 0.7,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": "模型",
            "value": "model",
            "options": [
                { "value": "ChatGPT", "label": "ChatGPT" },
                { "value": "Bing", "label": "Bing" }
            ],
            "display": ["chatbot", "editor", "debug"]
        }
    ],
    "inputs": [{
        "label": "默认",
        "value": "default",
        "checked": true,
        "display": ["chatbot", "editor", "debug"]
    }, {
        "label": "绑定网页正文",
        "value": "bindCurrentPage",
        "display": ["chatbot", "editor"]
    },
    {
        "label": "绑定网页HTML",
        "value": "bindCurrentPageHTML",
        "display": ["chatbot", "editor"]

    },
    {
        "label": "绑定网页URL",
        "value": "bindCurrentPageURL",
        "display": ["chatbot", "editor"]

    },
    {
        "ask": true,
        "label": "用户划选",
        "value": "userSelection",
        "display": ["chatbot", "editor"]
    },
    {
        "label": "剪切板",
        "value": "clipboard",
        "display": ["chatbot", "editor"]
    }
    ],
    "translates": [
        {
            "label": "中文",
            "value": "translate-zh",
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": "英文",
            "value": "translate-en",
            "display": ["chatbot", "editor", "debug"]
        },
    ],
    "outputs": [{
        "label": "默认",
        "value": "default",
        "checked": true,
        "display": ["chatbot", "editor", "debug"]
    },
    {
        "label": "JSON格式",
        "value": "json",
        "display": ["chatbot", "editor", "debug"]
    },
    {
        "label": "MarkDown格式",
        "value": "markdown",
        "display": ["chatbot", "editor", "debug"]
    },
    {
        "label": "列表",
        "value": "list",
        "disabled": true,
        "display": ["chatbot", "editor", "debug"]
    },
    ],
    "agents": [
        {
            "key": "prompt",
            "label": "Prompt",
            "checked": true,
            "parent": "prompt",
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "key": "tasks",
            "label": "目标拆解",
            "parent": "prompt",
            "disabled": true,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "key": "query",
            "label": "根据选择器获取网页信息",
            "parent": "query",
            "display": ["editor"]
        },
        {
            "key": "query-click",
            "label": "模拟点击",
            "disabled": true,
            "parent": "query",
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "key": "send-to-zsxq",
            "label": "发布内容至知识星球",
            "parent": "query",
            "display": ["editor"]
        },
        {
            "key": "highlight",
            "label": "高亮网页内容",
            "disabled": true,
            "parent": "query",
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "key": "api",
            "label": "API",
            "parent": "api",
            "display": ["editor"]
        },
        {
            "label": "条件判断",
            "key": "if-else",
            "parent": "logic",
            "disabled": true,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": "循环",
            "key": "for-of",
            "parent": "logic",
            "disabled": true,
            "display": ["chatbot", "editor", "debug"]
        }
    ]

}

const comboOptions = [
    {
        label: '作为对话流选项',
        value: 'showInChat',
    },
    {
        label: '作为右键菜单选项',
        value: 'contextMenus',
    },
    {
        label: '首页',
        value: 'home',
        disabled: true
    },
    {
        label: '无限循环',
        value: 'infinite',
        disabled: true
    }
];

const defaultNode = {
    text: '',
    url: '',
    api: {
        url: '',
        protocol: 'https://',
        init: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: "{}",
            mode: 'cors',
            cache: 'default',
            responseType: 'text'
        },
        isApi: false
    },
    queryObj: {
        query: '',
        url: '',
        protocol: 'https://',
        content: 'bindCurrentPage',//给read使用
        action: 'default', // 网页跳转 default、模拟点击click 、输入input、读取read
        isQuery: false
    },
    temperature: 0.6,
    model: 'ChatGPT',
    input: 'nodeInput',// nodeInput、userInput
    userInput: '',
    translate: 'default',
    output: 'default',
    type: 'prompt',//运行时使用
    // 以下是选项
    opts: {
        ...workflow
    },

}

const _DEFAULTCOMBO = {
    tag: 'default',
    role: {
        name: '',
        text: ''
    },
    combo: 1,
    interfaces: [],
    isInfinite: false,
    owner: 'user',
    prompt: {},
    version: '0.3.3',
    app: 'earth',
    id: 'default',
    createDate: (new Date()).getTime()
}

const debugInfo = (prompt: any) => {
    console.log('debugInfo', prompt)
    let info = '';
    if (prompt.type == 'role') {
        info = `<p>${prompt.role.name}</p><br><p>${prompt.role.text}</p>`
    } else {
        info = `<p>${JSON.stringify({
            text: prompt.text,
            input: prompt.input,
            output: prompt.output,
            type: prompt.type,
            model: prompt.model,
            temperature: prompt.temperature
        }, null, 2)}</p>`;
    }
    return info
}

//   把一条prompt包装成_control可以执行的数据格式
const parsePrompt2ControlEvent = (prompt: any) => {
    const controlEvent = {
        from: 'debug',
        prompt,
        // 调试状态的显示
        tag: debugInfo(prompt),
        debugInfo: debugInfo(prompt),
        newTalk: true,
        autoRun: true,
        id: (new Date()).getTime()
    }
    return controlEvent
}

//   把多条prompt包装成_control可以执行的数据格式
const parseCombo2ControlEvent = (combo: any) => {

    const { prompt } = combo;
    const controlEvent = {
        '_combo': {
            ..._DEFAULTCOMBO,
            ...combo,
            createDate: (new Date()).getTime()
        },
        from: 'combo',
        prompt: prompt,
        // 调试状态的显示
        tag: debugInfo(prompt),
        debugInfo: debugInfo(prompt),
        newTalk: true,
        autoRun: true,
        id: (new Date()).getTime()
    }
    return controlEvent
}

export {
    roleAvatars,
    workflow,
    defaultNode,
    comboOptions,
    _DEFAULTCOMBO,
    parsePrompt2ControlEvent,
    parseCombo2ControlEvent
}