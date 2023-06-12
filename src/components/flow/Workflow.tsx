/** ! 与earth的同名文件一致
 * 
 * ask 等待用户输入，TODO待处理
 */


import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            "divergenceDegree": "Divergence Degree",
            "model": "Model",
            "default": "Default",
            "bindWebContent": "Bind Web Content",
            "bindWebHTML": "Bind Web HTML",
            "bindWebURL": "Bind Web URL",
            "userSelection": "User Selection",
            "clipboard": "Clipboard",
            "asContext": "As Context",
            "conditional": "Conditional",
            "prompt": "Prompt",
            "taskDecomposition": "Task Decomposition",
            "getWebInfoBySelector": "Get Web Info by Selector",
            "publishToZhiShiXingQiu": "Publish to Zhi Shi Xing Qiu",
            "highlightWebContent": "Highlight Web Content",
            "autoClick": "Click",
            "jsonFormat": "JSON Format",
            "list": "List",
            "table": "Table",
            "markdownFormat": "Markdown Format",
            "chinese": "Chinese",
            "english": "English",
            "extractStructuredData": "Extract Structured Data",
            "text": "Text",
            "ifelse": "If else",
            "for": "For",

        },
    },
    zh: {
        translation: {
            "divergenceDegree": "发散程度",
            "model": "模型",
            "default": "默认",
            "bindWebContent": "绑定网页正文",
            "bindWebHTML": "绑定网页HTML",
            "bindWebURL": "绑定网页URL",
            "userSelection": "用户划选",
            "clipboard": "剪切板",
            "asContext": "作为上下文",
            "conditional": "条件判断",
            "prompt": "Prompt",
            "taskDecomposition": "目标拆解",
            "getWebInfoBySelector": "根据选择器获取网页信息",
            "publishToZhiShiXingQiu": "发布内容至知识星球",
            "highlightWebContent": "高亮网页内容",
            "autoClick": "模拟点击",
            "jsonFormat": "JSON格式",
            "list": "列表",
            "table": "表格",
            "markdownFormat": "MarkDown格式",
            "chinese": "中文",
            "english": "英文",
            "extractStructuredData": "提取结构化数据",
            "text": "纯文本",
            "ifelse": "条件判断",
            "for": "循环",
        },
    },
};

try {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
            lng: typeof (navigator) && navigator.language,
            debug: false,
            interpolation: {
                escapeValue: false, // 不需要对翻译文本进行转义
            },
        });
} catch (error) {

}



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
        }
    ]

}

const comboOptions = [
    {
        label: i18n.t('showInChatOption'),
        value: 'showInChat',
    },
    {
        label: i18n.t('contextMenusOption'),
        value: 'contextMenus',
    },
    {
        label: i18n.t('homeOption'),
        value: 'home',
        disabled: true
    },
    {
        label: i18n.t('infiniteLoopOption'),
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
            cache: 'default'
        },
        responseType: 'text',
        extract: {
            "key": "images",
            "type": "images"
        },//responseExtract
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
        info = `${prompt.role.name ? `<p>${prompt.role.name}</p><br>` : ''}<p>${prompt.role.text}</p>`
    } else {
        // prompt
        info = `<p>${JSON.stringify({
            id: prompt.id,
            type: prompt.type
        }, null, 2)}</p>`;
    }
    return info
}

//   把一条prompt包装成_control可以执行的数据格式
const parsePrompt2ControlEvent = (id: string, prompt: any) => {
    const d = debugInfo(prompt);
    const controlEvent = {
        from: 'debug',
        prompt,
        // 调试状态的显示
        tag: d,
        debugInfo: d,
        newTalk: true,
        autoRun: true,
        id: id,
        createTime: (new Date()).getTime()
    }
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
        from: 'combo',
        prompt: prompt,
        // 调试状态的显示
        tag: d,
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