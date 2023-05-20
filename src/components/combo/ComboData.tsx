const PROMPT_MAX_LENGTH = 720

// output : default,json,markdown
//  type:prompt,tasks,query,api,highlight
const defaultPrompt = {
    text: '',
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
        ask:true,
        label: '用户划选',
        value: 'userSelection',
        type: 'checkbox'
    },
]

/**
 * 默认 - 就是 文本
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
    {
        output: true,
        label: 'JSON格式',
        value: 'json',
        type: 'checkbox'
    },
    {
        output: true,
        label: '列表',
        value: 'list',
        type: 'checkbox'
    },
    {
        output: true,
        label: 'MarkDown格式',
        value: 'markdown',
        type: 'checkbox'
    },
    {
        output: true,
        label: '中文',
        value: 'translate-zh',
        type: 'checkbox'
    },
    {
        output: true,
        label: '英文',
        value: 'translate-en',
        type: 'checkbox'
    }
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
        key: 'api',
        label: `API`,
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