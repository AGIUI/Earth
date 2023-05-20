const PROMPT_MAX_LENGTH = 720

// output : default,json,markdown
const defaultPrompt = {
    text: '',
    api: {
        url: '', isApi: false
    },
    queryObj: {
        query: '', url: '', isQuery: false
    },
    temperature: 0.6,
    model: 'ChatGPT',
    input:'default',
    output: 'default',
    agent:'default'
}

/**
 * interfaces -- home、contextMenus、showInChat
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

const promptOptions = [
    {
        input: true,
        label: '默认',
        value: 'defalut',
        type: 'checkbox'
    },
    {
        output: true,
        label: '默认',
        value: 'defalut',
        type: 'checkbox'
    },{
        agent: true,
        label: '默认',
        value: 'defalut',
        type: 'checkbox'
    },
    {
        input: true,
        label: '根据选择器获取网页信息',
        value: 'isQuery',
        type: 'checkbox'
    },
    // {
    //     label:'API请求',
    //     value:'isApi'
    // },
    {
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
        label: 'MarkDown格式',
        value: 'markdown',
        type: 'checkbox'
    },
    {
        output: true, label: '中文', value: 'translate-zh',
        type: 'checkbox'
    },
    {
        output: true, label: '英文', value: 'translate-en',
        type: 'checkbox'
    },
    {
        agent:true,
        label:'高亮网页内容',
        value:'parseJSONAndHighlightText',type: 'checkbox'
    },
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
];


export {
    PROMPT_MAX_LENGTH,
    defaultCombo,
    defaultPrompt,
    promptOptions,
    comboOptions
}