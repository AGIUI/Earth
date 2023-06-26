import { workflow } from '@components/flow/Workflow'
import { getConfig, chromeStorageGet } from '@components/Utils';
import i18n from 'i18next';

const json: any = getConfig();
let discord = json.discord


// 从combo构造role选项数据
function createRoleOpts(combo: any, index: number) {
    let name = combo.tag || combo.role.name || `R${combo.id.toLocaleUpperCase()}`;
    return {
        id: combo.id,
        type: name,
        name: name,
        image: combo.role.image || chrome.runtime.getURL(`public/avatars/Designer.png`),
        text: combo.role.text,
        merged: combo.role.merged,
        checked: index == 0 || combo.interfaces && combo.interfaces.includes('role') || false,
        role: combo.role,
        owner: combo.owner,
        _type: "role"
    }
}

function getRoleOpts() {
    return new Promise((res, rej) => {
        chromeStorageGet(['user', 'offical']).then((data: any) => {
            let combo: any = [];
            if (data.user) combo = [...data.user];
            if (data.offical) combo = [...combo, ...data.offical];
            // combo=combo.filter((c:any)=>c.interfaces.includes('role'));
            combo = Array.from(combo, (c: any, index: number) => {
                if (c.role && (c.role.text || c.role.merged) && c.interfaces.includes('role')) {
                    return createRoleOpts(c, index)
                }
            }).filter(f => f)
            res(combo)
        })
    })
}


function get() {
    return [{
        id: 'ChatGPT',
        type: 'ChatGPT',
        name: 'ChatGPT',
        icon: chrome.runtime.getURL(`public/chatgpt.png`),
        style: { type: 'range', label: 'temperature', value: 0.6, values: [0, 1] },
        checked: true,
        _type: "model"
    }, {
        id: 'Bing',
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
        },
        checked: false,
        _type: "model"
    }
    ]

}



function getInput() {
    return Array.from(workflow().inputs, inp => {
        if (inp.display.includes('chatbot')) return {
            ...inp
        }
    }).filter(i => i)
}

function getOutput() {
    return Array.from(workflow().outputs, out => {
        if (out.display.includes('chatbot')) return {
            ...out
        }
    }).filter(i => i)
}

function getTranslate() {
    return Array.from(workflow().translates, translate => {
        if (translate.display.includes('chatbot')) return {
            ...translate
        }
    }).filter(i => i)
}

function getAgentOpts() {
    return Array.from(workflow().agents, (agent: any) => {
        if (!agent.disabled && agent.display.includes('chatbot')) return {
            value: agent.key,
            label: agent.label,
            checked: agent.checked
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
        case 'debug':
            data = {
                type: 'talk',
                user: false,
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
        case 'role-start':
            const hi = json.name ? `hi我是${json.name}` : `hi，让我思考下`
            data = {
                type: 'suggest',
                hi,
                user: false,
                html: json.html,
                avatarUrl: json.avatarUrl
            }
            break;
        default:
            break;
    }
    return data
}

export default {
    get, createTalkData, getOutput, getInput, getAgentOpts, getTranslate, getRoleOpts, createRoleOpts
}