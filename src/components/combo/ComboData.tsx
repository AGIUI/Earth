import { workflow } from '@components/Workflow'


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




const models = Array.from(workflow.models, model => {
    if (model.value === 'temperature') return {
        ...model, type: 'range'
    }
    if (model.value === 'model') return {
        ...model, type: 'select'
    }
})



const inputs = Array.from(workflow.inputs, inp => {
    return {
        ...inp, input: true, type: 'checkbox'
    }
})

/**
 * 默认 - 不传递
 */
const outputs = Array.from(workflow.outputs, out => {
    return {
        ...out, output: true, type: 'checkbox'
    }
})

const promptOptions = Array.from(workflow.agents, agent => {
    if (!agent.disabled) return {
        ...agent,
        children: [],
        inputs: inputs.filter(f => f.value),
        outputs: outputs.filter(f => f.value),
        models: models
    }
}).filter(a => a)


export {
    PROMPT_MAX_LENGTH,
    defaultCombo,
    defaultPrompt,
    comboOptions,
    promptOptions,
    inputs, outputs, models
}