import { workflow, defaultNode, comboOptions } from '@components/flow/Workflow'


const PROMPT_MAX_LENGTH = 720

// output : default,json,markdown
//  type:prompt,tasks,query,api,highlight
const defaultPrompt = {
    ...defaultNode
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

// const comboOptions = [
//     {
//         label: '开启Prompts Combo',
//         value: 'combo',
//     },
//     {
//         label: '作为对话流选项',
//         value: 'showInChat',
//     },
//     {
//         label: '作为右键菜单选项',
//         value: 'contextMenus',
//     },
//     {
//         label: '首页',
//         value: 'home',
//     },
//     {
//         label: '无限循环',
//         value: 'infinite',
//     }
// ];




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

const promptOptions: any = Array.from(workflow.agents, (agent: any) => {
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