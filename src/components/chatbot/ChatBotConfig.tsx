import { workflow } from '@components/Workflow'
import { getConfig } from '@components/Utils';

const json:any=getConfig();
let discord= json.discord 


function get() {
    return [{
        type: 'ChatGPT',
        name: 'ChatGPT',
        icon: chrome.runtime.getURL(`public/chatgpt.png`),
        style: { type: 'range', label: 'temperature', value: 0.6, values: [0, 1] },
        checked: false
    }, {
        type: 'Bing',
        name: 'New Bing',
        icon: chrome.runtime.getURL(`public/bing.svg`),
        style: {
            type: 'select', label: '风格',
            values: [
                { label: '创造力', value: 'Creative' },
                { label: '平衡', value: 'Balanced', },
                { label: '严谨', value: 'Precise', }
            ],
            value: 'Creative'
        }, checked: true
    }]

}



function getInput() {
    return Array.from(workflow.inputs, inp => {
        return {
            ...inp, checked: inp.value == 'default'
        }
    })
}

function getOutput() {
    return Array.from(workflow.outputs, out => {
        return {
            ...out, checked: out.value == 'default'
        }
    })
}



function getAgentOpts() {
    return Array.from(workflow.agents, (agent: any) => {
        if (!agent.disabled) return {
            value: agent.key,
            label: agent.label,
            checked: agent.key == 'prompt'
        }
    }).filter(a => a)
}




/**
 * 
 * @param type chatbot-is-available-false
 * @param json {hi,buttons,user,html}
 * @returns 
 */
function createTalkData(type: string, json: any) {
    let data;
    switch (type) {
        case 'chatbot-is-available-false':
            data = {
                type: 'suggest',
                hi: `hi,当前AI:${json.hi},服务异常`,
                buttons: [{
                    from: 'open-setup',
                    data: {
                        tag: '配置or切换AI',
                        prompt: '配置or切换AI',
                    }
                }],
                user: false,
                html: ''
            }
            break;
        case 'send-talk-refresh':
            data = {
                type: 'suggest',
                hi: '当前为历史对话记录',
                buttons: [{
                    from: 'send-talk-refresh',
                    data: json.data
                }],
                user: false,
                html: ''
            }
            break;
        case 'new-talk':
            data = {
                type: 'suggest',
                hi: 'hi 我可以为你梳理当前页面的知识',
                buttons: json.buttons,
                user: false,
                html: ''
            }
            break;
        case 'more-prompts':
            data = {
                type: 'suggest',
                hi: '相关推荐',
                buttons: json.buttons,
                user: false,
                html: ''
            }
            break;
        case 'urls':
            data = {
                type: 'suggest',
                hi: '其他资料',
                buttons: json.buttons,
                user: false,
                html: ''
            }
            break;
        case 'thinking':
            data = {
                type: 'thinking',
                html: '-',
                hi: json.hi || '思考中'
            }
            break;
        case 'agents':
            data = {
                type: 'thinking',
                html: '-',
                hi: '获取中'
            }
            break;
        case 'tag':
            data = {
                type: 'talk',
                user: true,
                html: json.html
            }
            break;
        case 'help':
            data = {
                type: 'suggest',
                hi: '我可以怎么帮到你？',
                buttons: [{
                    from: 'open-url',
                    data: {
                        tag: '前往社区',
                        url: discord || 'https://discord.gg/DtAYT2Pt'
                    }
                }],
                user: false,
                html: ''
            }
            break;
        default:
            break;
    }
    return data
}

export default {
    get, createTalkData, getOutput, getInput, getAgentOpts
}