const PROMPT_MAX_LENGTH = 720

// output : default,json,markdown
//  type:prompt,tasks,query,api,highlight
const defaultPrompt = {
    text: '',
    url: '',
    api: {
        url: '',
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
        query: '', url: '', isQuery: false
    },
    temperature: 0.6,
    model: 'ChatGPT',
    input: 'default',
    output: 'default',
    type: 'prompt'
}

/**
 * interfaces -- home、contextMenus、showInChat
 * app 应用名
 * version版本号
 * app、version 在combo导出的时候会动态写
 *
 */
const defaultCombo = {
    tag: '',
    role: '',
    combo: 1,
    interfaces: [],
    isInfinite: false,
    owner: 'official',
    prompt: defaultPrompt,
    version: '0.3.0',
    app: 'earth',
    id: ''
}

const comboOptions = [
    {
        label: '开启Prompts Combo',
        value: 'combo',
    },
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
    },
    {
        label: '无限循环',
        value: 'infinite',
    }
];

const models = [
    {
        label: '温度',
        value: 'temperature',
        type: 'range'
    },
    {
        label: '模型',
        value: 'model',
        type: 'select',
        options: [
            { value: 'ChatGPT', label: 'ChatGPT' },
            { value: 'Bing', label: 'Bing' }
        ]
    }
]


/**
 * ask 等待用户输入，TODO待处理
 */
const inputs = [
    {
        input: true,
        label: '默认',
        value: 'default',
        type: 'checkbox'
    }, {
        input: true,
        label: '绑定网页正文',
        value: 'bindCurrentPage',
        type: 'checkbox'
    },
    {
        input: true,
        label: '绑定网页HTML',
        value: 'bindCurrentPageHTML',
        type: 'checkbox'
    },
    {
        input: true,
        label: '绑定网页URL',
        value: 'bindCurrentPageURL',
        type: 'checkbox'
    },
    {
        input: true,
        ask: true,
        label: '用户划选',
        value: 'userSelection',
        type: 'checkbox'
    },
    {
        input: true,
        label: '剪切板',
        value: 'clipboard',
        type: 'checkbox'
    },
]

/**
 * 默认 - 不传递
 */
const outputs = [
    {
        output: true,
        label: '默认',
        value: 'default',
        type: 'checkbox'
    }, {
        output: true,
        label: '作为上下文',
        value: 'isNextUse',
        type: 'checkbox'
    },

]

const promptOptions = [
    {
        key: 'prompt',
        label: `Prompt`,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    }, {
        key: 'tasks',
        label: `目标拆解`,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    }, {
        key: 'highlight',
        label: `高亮网页内容`,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    }, {
        key: 'query',
        label: `根据选择器获取网页信息`,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    }, {
        key: 'send-to-zsxq',
        label: `发布内容至知识星球`,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: []
    }, {
        key: 'api',
        label: `API`,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
    {
        label: 'JSON格式',
        key: 'json',
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
    {
        label: '列表',
        key: 'list',
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
    {
        label: 'MarkDown格式',
        key: 'markdown',
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
    {
        label: '中文',
        key: 'translate-zh',
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
    {
        label: '英文',
        key: 'translate-en',
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
    {
        label: '提取结构化数据',
        key: 'extract',
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    },
]


export {
    PROMPT_MAX_LENGTH,
    defaultCombo,
    defaultPrompt,
    comboOptions,
    promptOptions,
    inputs, outputs, models
}