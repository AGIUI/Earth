import { workflow } from '@components/Workflow'
import { getConfig } from '@components/Utils';
import i18n from 'i18next';


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
            type: 'select',
            label: i18n.t('styleLabel'),
            values: [
                { label: i18n.t('creativeStyleLabel'), value: 'Creative' },
                { label: i18n.t('balancedStyleLabel'), value: 'Balanced' },
                { label: i18n.t('preciseStyleLabel'), value: 'Precise' }
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
                hi: i18n.t('hiCurrentAI', { hi: json.hi }),
                buttons: [{
                    from: 'open-setup',
                    data: {
                        tag: i18n.t('configOrSwitchAI'),
                        prompt: i18n.t('configOrSwitchAI'),
                    }
                }],
                user: false,
                html: ''
            }
            break;
        case 'send-talk-refresh':
            data = {
                type: 'suggest',
                hi: i18n.t('historyConversation'),
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
                hi: i18n.t('hiWelcome'),
                buttons: json.buttons,
                user: false,
                html: ''
            }
            break;
        case 'more-prompts':
            data = {
                type: 'suggest',
                hi: i18n.t('relatedRecommendations'),
                buttons: json.buttons,
                user: false,
                html: ''
            }
            break;
        case 'urls':
            data = {
                type: 'suggest',
                hi: i18n.t('otherMaterials'),
                buttons: json.buttons,
                user: false,
                html: ''
            }
            break;
        case 'thinking':
            data = {
                type: 'thinking',
                html: '-',
                hi: json.hi || i18n.t('thinking')
            }
            break;
        case 'agents':
            data = {
                type: 'thinking',
                html: '-',
                hi: i18n.t('fetching')
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
                hi: i18n.t('howCanIHelp'),
                buttons: [{
                    from: 'open-url',
                    data: {
                        tag: i18n.t('goToCommunity'),
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
    return data;
}

export default {
    get, createTalkData, getOutput, getInput, getAgentOpts
}