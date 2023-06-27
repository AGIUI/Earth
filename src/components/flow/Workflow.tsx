/** ! 与earth的同名文件一致
 * 
 * ask 等待用户输入，TODO待处理
 */


import i18n from "i18next";

/**
 * workflow的开关
 * chatbot - 在对话框
 * editor - 编辑器
 * debug - 调试框
 * */
const display = [
    "chatbot", "editor", "debug"
]


const systemKeys: any = () => {
    return {
        role: i18n.t('role'),
        task: i18n.t('task'),
        output: i18n.t('output')
    }
}

const assistantKeys: any = () => { }

const userKeys: any = () => {
    return {
        title: i18n.t('title'),//网页标题
        url: i18n.t('url'),//网页url
        text: i18n.t('text'),//网页正文
        html: i18n.t('html'),//网页html
        images: i18n.t('images'),//网页图片
        context: i18n.t('context'),//上一个节点信息
        userInput: i18n.t('userInput'),//用户指令
        translate: i18n.t('translate'),//翻译
    }
}



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



const workflow = () => ({
    "models": [
        {
            "label": i18n.t("divergenceDegree"),
            "value": "temperature",
            "defaultValue": 0.7,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": i18n.t("model"),
            "value": "model",
            "options": [
                { "value": "ChatGPT", "label": "ChatGPT" },
                { "value": "Bing", "label": "Bing" }
            ],
            "display": ["chatbot", "editor", "debug"]
        }
    ],
    "inputs": [{
        "label": i18n.t("default"),
        "value": "default",
        "checked": true,
        "display": ["chatbot", "editor", "debug"]
    }, {
        "label": i18n.t("bindWebContent"),
        "value": "bindCurrentPage",
        "display": ["chatbot", "editor"]
    },
    {
        "label": i18n.t("bindWebHTML"),
        "value": "bindCurrentPageHTML",
        "display": ["chatbot", "editor"]

    },
    {
        "label": i18n.t("bindWebURL"),
        "value": "bindCurrentPageURL",
        "display": ["chatbot", "editor"]

    },
    {
        "ask": true,
        "label": i18n.t("lastTalk"),
        "value": "nodeInput",
        "display": ["chatbot", "editor"]
    },
    {
        "ask": true,
        "label": i18n.t("userSelection"),
        "value": "userSelection",
        "display": ["chatbot", "editor"]
    },
    {
        "label": i18n.t("clipboard"),
        "value": "clipboard",
        "display": ["chatbot", "editor"]
    }
    ],
    "translates": [
        {
            "label": i18n.t("chinese"),
            "value": "translate-zh",
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": i18n.t("english"),
            "value": "translate-en",
            "display": ["chatbot", "editor", "debug"]
        },
    ],
    "outputs": [{
        "label": i18n.t('text'),
        "value": "default",
        "checked": true,
        "display": ["chatbot", "editor", "debug"]
    },
    {
        "label": i18n.t("jsonFormat"),
        "value": "json",
        "display": ["chatbot", "editor", "debug"]
    },
    {
        "label": i18n.t("markdownFormat"),
        "value": "markdown",
        "display": ["chatbot", "editor", "debug"]
    }, {
        "label": i18n.t("table"),
        "value": "table",
        "disabled": false,
        "display": ["chatbot", "editor", "debug"]
    },
    {
        "label": i18n.t("list"),
        "value": "list",
        "disabled": false,
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
            "label": i18n.t("taskDecomposition"),
            "parent": "prompt",
            "disabled": true,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "key": "query",
            "label": i18n.t("getWebInfoBySelector"),
            "parent": "query",
            "display": ["editor"]
        },
        {
            "key": "query-click",
            "label": i18n.t("autoClick"),
            "disabled": true,
            "parent": "query",
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "key": "highlight",
            "label": i18n.t("highlightWebContent"),
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
            "label": i18n.t('ifelse'),
            "key": "if-else",
            "parent": "logic",
            "disabled": true,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": i18n.t('for'),
            "key": "for-of",
            "parent": "logic",
            "disabled": true,
            "display": ["chatbot", "editor", "debug"]
        },
        {
            "label": i18n.t('ppt'),
            "key": "file-ppt",
            "parent": "file",
            "disabled": false,
            "display": ["editor", "debug"]
        }
    ]
})

const comboOptions = () => {
    // console.log(i18n,1,i18n.t('showInChatOption'))
    return [
        {
            label: i18n.t('showInChatOption'),
            value: 'showInChat',
        },
        {
            label: i18n.t('contextMenusOption'),
            value: 'contextMenus',
            children:
                // contexts 上下文
                Array.from([
                    "all", "page", "selection",
                    "editable", "pdf", "link",
                    "image", "video", "audio",
                    "frame", "launcher", "browser_action",
                    "page_action", "action"
                ], m => {
                    return {
                        label: m,
                        value: m,
                        checked: m === 'page'
                    }
                })
        },
        {
            label: i18n.t('roleOption'),
            value: 'role',
            disabled: false
        },
        {
            label: i18n.t('homeOption'),
            value: 'home',
            disabled: false
        },
        {
            label: i18n.t('infiniteLoopOption'),
            value: 'infinite',
            disabled: true
        }
    ]
};

const defaultNode = () => ({
    id: "",
    nextId: "",
    nodeInputId: "",
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
            responseType: 'json',
            extract: {
                "key": "images",
                "type": "images"
            },
        },
        responseType: 'json',
        extract: {
            "key": "images",
            "type": "images"
        },//responseExtract

    },
    queryObj: {
        query: '',
        url: '',
        protocol: 'https://',
        content: 'bindCurrentPage',//给read使用
        action: 'default', // 网页跳转 default、模拟点击click 、输入input、读取read
        delay: 1000
    },
    file: {
        inputs: [],
        type: 'ppt'
    },
    inputs: {
        nodes: [],//输入的节点
        output: ''//输出的格式 ${n0} ${n1}
    },
    temperature: 0.6,
    model: 'ChatGPT',
    input: 'nodeInput',// nodeInput、userInput
    userInput: '',
    translate: 'default',
    output: 'default',
    type: 'prompt',//运行时使用
    merged: [],//处理好的prompt {role,content}
    // 以下是选项
    opts: {
        ...workflow()
    },

})

const _DEFAULTCOMBO = (app: string, version: string) => ({
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
    version: version || '0.3.5',
    app: app || 'earth',
    id: 'default',
    createDate: (new Date()).getTime()
})

const debugInfo = (prompt: any) => {
    console.log('debugInfo', prompt)
    let info = '', merged;
    if (prompt.type == 'role') {
        info = `${prompt.role.name ? `<p>${prompt.role.name}</p><br>` : ''}<p>${prompt.role.text}</p>`;
        merged = prompt.role.merged;
    } else {
        // prompt
        info = `<p>${JSON.stringify({
            id: prompt.id,
            type: prompt.type
        }, null, 2)}</p>`;
        merged = prompt.merged;
    };
    if (merged && merged.length > 0) {
        info += `<p>使用Merged数据</p>`
    };
    info = info.trim();
    if (info == "" || info == "<p></p>") {
        info = i18n.t("debug") + ":''"
    }
    console.log('debugInfo', info)
    return info
}

//   把一条prompt包装成_control可以执行的数据格式
const parsePrompt2ControlEvent = (id: string, prompt: any) => {

    try {
        if (!prompt.merged && prompt.debugInput) {
            let merged: any = JSON.parse(prompt.debugInput);
            prompt = {
                ...prompt,
                merged
            }
        }
    } catch (error) {

    }

    if (prompt.type == 'role' && prompt.role) {
        prompt.role.merged = prompt.merged;
    }

    const d = debugInfo(prompt);

    const controlEvent = {
        from: 'debug',
        prompt,
        // 调试状态的显示
        tag: d,
        debugInfo: d,
        newTalk: true,
        autoRun: true,
        id,
        createTime: (new Date()).getTime()
    }

    console.log('controlEvent', controlEvent)

    return controlEvent
}

//   把多条prompt包装成_control可以执行的数据格式
const parseCombo2ControlEvent = (combo: any) => {

    const { prompt } = combo;
    const d = debugInfo(prompt);
    const controlEvent = {
        '_combo': {
            ..._DEFAULTCOMBO,
            ...combo,
            createDate: (new Date()).getTime()
        },
        from: combo.from || 'combo',
        prompt: prompt,
        // 调试状态的显示
        tag: combo.tag || d,
        debugInfo: d,
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