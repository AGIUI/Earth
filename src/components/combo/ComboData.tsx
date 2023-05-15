const PROMPT_MAX_LENGTH=720

const defaultPrompt={
    text:'',
    isNextUse:false,
    bindCurrentPage:false,
    queryObj:{
        query:'',url:'',isQuery:false
    },
    isApi:false,
    url:'',
}

/**
 * 
 */
const defaultCombo={
    tag:'',
    role:'',
    combo:1,
    checked:false,
    isInfinite:false,
    owner: 'official',
    prompt:defaultPrompt,
    temperature:0.6,
    model:'ChatGPT'
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
        label:'根据选择器获取网页信息',
        value:'isQuery'
    },
    // {
    //     label:'API请求',
    //     value:'isApi'
    // },
    {
        label: '绑定当前网页',
        value: 'bindCurrentPage'
    },
    {
        label: '作为上下文',
        value: 'isNextUse'
    }
];

const createPrompts=()=>{

}

export {
    PROMPT_MAX_LENGTH,
    defaultCombo,
    defaultPrompt,
    promptOptions,
    comboOptions
}