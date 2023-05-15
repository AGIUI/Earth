const PROMPT_MAX_LENGTH = 720

const defaultPrompt = {
    text: '',
    isNextUse: false,
    bindCurrentPage: false,
    queryObj: {
        query: '', url: '', isQuery: false
    },
    isApi: false,
    url: '',
    temperature: 0.6,
    model: 'ChatGPT'
}

/**
 * 
 */
const defaultCombo = {
    tag: '',
    role: '',
    combo: 1,
    checked: false,
    isInfinite: false,
    owner: 'official',
    prompt: defaultPrompt,
}

const comboOptions = [
    {
        label: '开启Prompts Combo',
        value: 'Combo',
    },
    {
        label: '作为对话流选项',
        value: 'ShowInChat',
    },
    {
        label: '无限循环',
        value: 'Infinite',
    }
];

const promptOptions = [
    {
        label: '根据选择器获取网页信息',
        value: 'isQuery',
        type: 'checkbox'
    },
    // {
    //     label:'API请求',
    //     value:'isApi'
    // },
    {
        label: '绑定当前网页',
        value: 'bindCurrentPage',
        type: 'checkbox'
    },
    {
        label: '作为上下文',
        value: 'isNextUse',
        type: 'checkbox'
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
        options:[
            { value: 'ChatGPT', label: 'ChatGPT' },
            { value: 'Bing', label: 'Bing' }
        ]
    }
];


const createPrompts = () => {

}

export {
    PROMPT_MAX_LENGTH,
    defaultCombo,
    defaultPrompt,
    promptOptions,
    comboOptions
}