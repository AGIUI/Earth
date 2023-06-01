import { workflow } from '@components/Workflow'
import i18n from 'i18next';

const PROMPT_MAX_LENGTH = 720

// output : default,json,markdown
//  type:prompt,tasks,query,api,highlight
const defaultPrompt = {
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
        query: '', url: '', protocol: 'https://', isQuery: false
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
        label: i18n.t('openPromptsCombo'),
        value: 'combo',
    },
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
    },
    {
        label:  i18n.t('infiniteLoopOption'),
        value: 'infinite',
    }
];




const models: any = Array.from(workflow.models, model => {
    if (model.value === 'temperature') return {
        ...model, type: 'range'
    }
    if (model.value === 'model') return {
        ...model, type: 'select'
    }
})



const inputs: any = Array.from(workflow.inputs, (inp: any) => {
    if (!inp.disabled) return {
        ...inp, input: true, type: 'checkbox'
    }
}).filter(a => a)

/**
 * 默认 - 不传递
 */
const outputs: any = Array.from(workflow.outputs, (out: any) => {
    if (!out.disabled) return {
        ...out, output: true, type: 'checkbox'
    }
}).filter(a => a)

const promptOptions: any = Array.from(workflow.agents, agent => {
    if (!agent.disabled) return {
        ...agent,
        children: [],
        inputs: inputs.filter((f: any) => f.value),
        outputs: outputs.filter((f: any) => f.value),
        models: Array.from(models, (m: any) => {
            m.value == "temperature" ? m.defaultValue = agent.temperature : '';
            return m
        })
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