import React from 'react'

import { FlexColumn } from "@components/Style";
import MarkdownIt from 'markdown-it'

import ChatBotPanel from "@components/chatbot/ChatBotPanel"
import ChatBotConfig from "@components/chatbot/ChatBotConfig";

import ComboEditor from '@components/combo/ComboEditor';
import { parseCombo2ControlEvent } from '@components/flow/Workflow'
import i18n from 'i18next';

import {
    promptBindCurrentSite,
    promptBindUserSelection,
    promptBindTasks,
    promptBindUserClipboard,
    userSelectionInit,
    extractDomElement,
    promptParse,
    promptUseLastTalk,
    promptBindRole,
    bindUserInput,
    promptBindTranslate,
    promptBindOutput
} from '@src/components/combo/Prompt'

import { highlightText } from "@components/combo/Agent"

import Setup from "@components/Setup"


//@ts-ignore
import PDF from '@components/files/PDF'

import PPT from '@components/files/PPT'

import { consoleCheck } from '@components/Utils';

import { chromeStorageGet, chromeStorageSet, sendMessageCanRetry, checkImageUrl, md5 } from "@components/Utils"
import { message } from 'antd';

// 运行时
import { QueryDefaultRun, QueryInputRun, QueryClickRun, QueryReadRun } from "@components/runtime/webAgent"
import { ApiRun } from '@components/runtime/api'
import { LLMRun } from '@components/runtime/llm'


consoleCheck()
// checkClipboard()

declare const window: Window &
    typeof globalThis & {
        _brainwave_import: any,

    }

//['user']
const getPromptsData = async (keys = ['user']) => {
    let prompts: any[] = [];
    const res: any = await chromeStorageGet(keys);
    for (const k of keys) {
        if (res && res[k]) {
            for (const combo of res[k]) {
                prompts.push(combo);
            }
        }
    }
    return prompts;
}


const Talks = {
    filter: (talks: any) => {
        let countSuggest = talks.filter((t: any) => t.type == 'suggest').length;
        let newTalks = [];
        console.log('filter talks', talks)
        for (const t of [...talks]) {
            if (t) {
                if (t.type == "suggest") countSuggest--;
                if (t.type == 'suggest' && countSuggest == 0) {
                    newTalks.push(t);
                } else if (t.type == 'talk' ||
                    t.type == 'markdown' ||
                    t.type == 'done' ||
                    t.type == 'images' ||
                    t.type == 'audio' ||
                    t.type == 'task'
                ) {
                    newTalks.push(t);
                }
            }
        }
        console.log('filter newTalks', newTalks)
        // const nt = [...talks].filter((t: any) => t.type == 'suggest' || t.type == 'talk' || t.type == 'markdown' || t.type == 'done' || t.type == 'images');
        return newTalks
    },
    save: (value: any) => {
        console.log('Talks save', value)
        // TODO from :open-url 
        let talks = Array.from(value, (v: any, index: number) => {
            // 去除user==true的连续重复
            if (v.user && value[index - 1] && v.html == value[index - 1].html) {
                return
            }

            if (v.type != 'images' && v.type != 'audio') {
                // 去除空内容
                const d = document.createElement('div');
                d.innerHTML = v.html;
                if (d.innerText.trim() === "") return;
            }

            return v
        }).filter(m => m);
        if (talks && talks.length > 0) {
            // console.log('_currentTalks save', talks)
            chromeStorageSet({
                '_currentTalks': {
                    talks
                }
            })
        }
    },
    clear: () => {
        chromeStorageSet({ '_currentTalks': null })
    },
    clearThinking: (talks: any) => {
        return [...talks].filter((n: any) => n.type != 'thinking')
    },
    updateThinking: (text: string, talks: any) => {
        const talksNew = [...talks].filter((n: any) => n.type != 'thinking');
        talksNew.push(ChatBotConfig.createTalkData('thinking', { hi: text }))
        return talksNew
    },
    get: async () => {
        let data: any = await chromeStorageGet(['_currentTalks'])
        if (data && data['_currentTalks'] && data['_currentTalks'].talks) {
            // 只保留type==markdown talk            
            const talks = Talks.filter(data['_currentTalks'].talks)
            return talks
        };
        return []
    },
    getTalkInnerText: (data: any) => {
        // console.log('getTalkInnerText',data)
        const json = { ...data };
        const dom = document.createElement('div');
        if (json && json.html) dom.innerHTML = json.html;
        dom.innerHTML = dom.innerHTML.replaceAll('<br><br>', '\n')
        // let texts: any = Array.from(dom.children, (c: any) => c.innerText);
        // console.log('laskTalk:', dom.innerHTML, dom.innerText)
        return dom.textContent;
    },
    getTalkByPromptId: (promptId: string, talks: any) => {

        // const getTalkImages = (data: any) => {
        //     const json = { ...data };
        //     const dom = document.createElement('div');
        //     if (json && json.html) dom.innerHTML = json.html;
        //     return Array.from(dom.querySelectorAll('img'), i => i.src);
        // };

        talks = talks.filter((t: any) => t.promptId == promptId)

        // n.type == 'talk' || n.type == 'markdown' || n.type == 'done'

        const lastTalks = talks.filter((talk: any) => (
            [
                'markdown',
                'done',
                'images'
            ].includes(talk.type)) && !talk.user);
        const laskTalk = lastTalks.slice(-1)[0];

        return laskTalk

    },
    getLastTalk: (talks: any) => {
        const getTalkInnerText = (data: any) => {
            const json = { ...data };
            const dom = document.createElement('div');
            if (json && json.html) dom.innerHTML = json.html;
            dom.innerHTML = dom.innerHTML.replaceAll('<br><br>', '\n')
            // let texts: any = Array.from(dom.children, (c: any) => c.innerText);
            // console.log('laskTalk:', dom.innerHTML, dom.innerText)
            return dom.textContent;
        };
        // n.type == 'talk' || n.type == 'markdown' || n.type == 'done'
        const lastTalks = talks.filter((talk: any) => (talk.type == "markdown" || talk.type == "done") && !talk.user);
        const laskTalk = lastTalks.slice(-1)[0];

        return getTalkInnerText(laskTalk)
    },
    createTalkBubble: (text: string) => {
        const dom = document.createElement('div');
        let md = new MarkdownIt({
            breaks: true,
            langPrefix: 'chatbot-markdown-',
            linkify: true,
        });
        dom.innerHTML = md.render(text);
        // console.log('createTalkBubble:::',text)
        // const texts = Array.from(dom.innerText.split('\n'), t => t.trim()).filter(f => f);
        // dom.innerHTML = texts.join('<br><br>')
        Array.from(dom.querySelectorAll('a'), (a: any) => {
            a.innerText = a.innerText.replace(/\^/ig, '');
            a.style = `background: rgb(22, 119, 255);
            color: white;
            width: fit-content;
            height: fit-content;
            padding: 2px;
            display: inline-block;
            font-size: 12px;
            text-align: center;
            margin: 4px;
            border-radius: 8px;`
        });

        // 表格样式
        Array.from(dom.querySelectorAll('th'), (a: any) => {
            a.style = `background: #dddddd;
            padding: 4px;`
        });

        Array.from(dom.querySelectorAll('td'), (a: any) => {
            a.style = `margin: 8px 0;
            background: #eee;
            border-right: 1px dashed #bdbdbd;
            padding: 4px;`
        });

        Array.from(dom.querySelectorAll('br'), (a: any) => {
            a.style = `line-height: 20px;`
        });


        let json = { html: dom.innerHTML };
        return json
    },
    createTaskStatus: (from: string, id: string, text: string) => {
        return {
            export: false,
            from,
            id,
            markdown: '任务：' + text,
            tId: id,
            type: "task",
            user: false,
        }
    },
    createShowInChatInterfaces: async () => {
        const buttons = Array.from(
            await getPromptsData(),
            d => {
                if (d && d.interfaces) return d.interfaces.includes('showInChat') ? {
                    from: 'combo',
                    data: {
                        combo: d.combo,
                        tag: d.tag,
                        prompt: d.prompt,
                        // 强制刷新
                        newTalk: true,
                        _combo: d
                    }
                } : null
            }
        ).filter((b: any) => b);

        if (buttons && buttons.length > 0) {
            return ChatBotConfig.createTalkData('new-talk', { buttons })
        }
    }
}


const sendMessageToBackground = {
    'chat-bot-talk': (data: any) => sendMessageCanRetry('chat-bot-talk', data, console.log),
    'chat-bot-talk-new': (data: any) => sendMessageCanRetry('chat-bot-talk-new', data, console.log),
    'chat-bot-talk-stop': (data: any) => sendMessageCanRetry('chat-bot-talk-stop', data, console.log),
    'run-agents': (data: any) => sendMessageCanRetry('run-agents', data, console.log),
    'open-url': (data: any) => sendMessageCanRetry('open-url', data, console.log),
    'api-run': (data: any) => sendMessageCanRetry('api-run', data, console.log),
    'open-options-page': (data: any) => sendMessageCanRetry('open-options-page', data, console.log),
    'hi': (data: any) => sendMessageCanRetry('hi', data, console.log),

}


class Main extends React.Component<{
    className: string,
    appName: string,
    agents: any,
    readability: any,
    fullscreen: boolean,
    initIsOpen: boolean,
    userInput: any,
    initChatBotType: string,
    debug: boolean,
    debugData: any,
    callback: any
}, {
    appName: string,
    title: string,
    // 默认是否开启
    initIsOpen: boolean,
    // 总面板开关
    loading: boolean,
    // 是否全屏
    fullscreen: boolean,

    // 全局的禁止操作
    disabledAll: boolean,
    // 加载机器人，初始化
    loadingChatBot: boolean,
    chatBotType: string,
    // 聊天服务是否可用
    chatBotIsAvailable: any,
    // 聊天风格 chatgpt bing
    chatBotStyle: any,
    // 告诉chatbot当前网页的信息
    chatbotInitPrompt: string,

    // 默认的输入
    userInput: any,


    // 是否显示Edit页面
    showEdit: boolean,

    activeIndex: any,

    talks: Array<{}>,
    mixedCards: Array<{}>,

    inputCardDisplay: string,
    promptDisplay: string,
    buttonsDisplay: string,
    expirationTime: number,

    toggleSetup: boolean,
    openMyPrompts: boolean,
    myPrompts: any,

    currentCombo: any,

    //当前Prompts内有多少个prompt
    PromptIndex: number,

    chatBotConfig: any,

    role: any,

    // 等待用户输入
    waitUserInput: boolean

}> {


    constructor(props: any) {
        super(props);

        const defaultChatbots: any = ChatBotConfig.get();

        // 聊天机器人类型
        const chatBotTypes = Array.from(defaultChatbots, (d: any) => d.type)

        const defaultChatbot = {
            chatBotType: defaultChatbots[0].type,
            chatBotStyle: {
                label: defaultChatbots[0].style.label,
                value: defaultChatbots[0].style.values[0]?.value
            }
        }

        // 缓存
        const { chatBotStyle, chatBotType } = JSON.parse(localStorage.getItem('_chatBotSelect') || JSON.stringify(defaultChatbot));
        // console.log('缓存', chatBotStyle, chatBotType)

        this.state = {
            appName: this.props.appName,
            title: '',
            initIsOpen: this.props.initIsOpen,
            loading: this.props.initIsOpen ? false : true,
            fullscreen: this.props.fullscreen,
            activeIndex: undefined,

            talks: [],

            mixedCards: [],

            // 禁止点击
            disabledAll: true,

            loadingChatBot: true,
            chatBotType: chatBotTypes.includes(this.props.initChatBotType || chatBotType) ? (this.props.initChatBotType || chatBotType) : chatBotType,
            chatBotIsAvailable: undefined,
            chatBotStyle: chatBotStyle,
            chatbotInitPrompt: '',
            userInput: {
                prompt: '', tag: ''
            },


            // 界面控制
            inputCardDisplay: 'none',
            buttonsDisplay: 'none',
            promptDisplay: 'flex',
            // 缓存控制
            expirationTime: 1000 * 60,
            toggleSetup: false,
            openMyPrompts: false,
            myPrompts: [],
            showEdit: false,

            currentCombo: {},
            PromptIndex: 0,

            chatBotConfig: null,

            role: null,

            waitUserInput: false
        }


        this.init();

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            const { cmd, data, success } = request;
            if (cmd === 'chat-bot-talk-result') {
                this._updateChatBotTalksResult(data);
            } else if (cmd === "api-run-result") {
                console.log('api-run-result', data)
                // 解析数据格式
                const { responseExtract, promptId,
                    responseType, data: result } = data;
                const ttype = responseExtract.type;

                const markdown = `${i18n.t("APISucess")}:
                TYPE:${data.responseType.toLocaleUpperCase()} ${ttype.toLocaleUpperCase()}
                CONTENT:${ttype == 'text' ? data.data.slice(0, 100) : ''}...`;

                const items: any = [{
                    type: 'task',
                    markdown,
                    tId: (new Date()).getTime(),
                    export: false
                }];

                // api 返回的是图片
                if (ttype == 'images') {
                    items.push({
                        type: 'images',
                        images: result,
                        tId: (new Date()).getTime() + '2',
                        id: (new Date()).getTime() + '1',
                        promptId
                    })
                } else if (ttype == 'audio') {
                    items.push({
                        type: 'audio',
                        url: result,
                        tId: (new Date()).getTime() + '2',
                        id: (new Date()).getTime() + '1',
                        promptId
                    })
                }

                this._updateChatBotTalksResult(items);

                // 传递给父级结果
                setTimeout(() => this.props.callback({
                    cmd: 'stop-talk',
                    data: markdown || 'debug'
                }), 1200)

            } else if (cmd === 'contextMenus') {
                this._control(data);
            }
        });

        if (this.props.agents) {

            this.updateChatBotStatus(true);

            // nTalks.push(ChatBotConfig.createTalkData('agents', {}));

            this._getAgentsResult();
            chrome.storage.local.onChanged.addListener((changes) => {
                console.log(changes)
                if (changes['run-agents-result'] && changes['run-agents-result'].newValue && !changes['run-agents-result'].oldValue) {
                    this._getAgentsResult();
                }
            })
        }

    }


    componentDidMount(): void {
        console.log('#### init #### ', this.state.appName)
        if (this.props.agents) {
            message.info('自动化执行任务ing')
        }

        //  is auto open
        let isOpen = this.props.fullscreen && this.props.userInput && this.props.userInput.prompt && this.props.initChatBotType;
        // 打开任何网站都会初始化

        Talks.get().then(talks => {
            if (this.props.agents) {
                talks.push(Talks.createTaskStatus(
                    '_start',
                    (new Date()).getTime() + '02',
                    '开始'
                ))
            }

            if (talks && talks.length > 0) {
                this.setState({
                    talks
                })
            }

        });

        if (!this.state.chatBotIsAvailable) this.initChatBot(isOpen);

        if (isOpen || this.props.initIsOpen) {
            // 传参过来的页面
            this.show(false)
        }

    }

    componentDidUpdate(prevProps: any, prevState: any) {
        // 更新状态
        if (prevState.chatBotType != this.state.chatBotType) {
            this.initChatBot();
        }
        if (prevProps.debugData) {
            let isNew = false;
            for (const key in this.props.debugData) {
                if (prevProps.debugData[key] != this.props.debugData[key]) isNew = true;
            }
            if (isNew) this._runCombo(this.props.debugData)
        }
        // console.log('this.props.show', this.props.show)
        // if (this.props.show!=prevProps.show&&this.state.loading) {
        //     this.setState({ initIsOpen: true });
        //     this.show(false);
        // }

    }

    _runCombo(runComboData: any) {
        const { autoRun } = runComboData;
        if (autoRun) {
            // 新建
            this._control({ cmd: 'new-talk' });
            setTimeout(() => this._control({
                cmd: 'combo',
                data: runComboData
            }), 500);
        }
    }

    _getAgentsResult() {
        chromeStorageGet('run-agents-result').then((res: any) => {
            // console.log('_getAgentsResult', res)
            if (res && res['run-agents-result']) {

                const combo = res['run-agents-result'].combo;

                this._promptControl({
                    cmd: 'update-prompt-for-combo',
                    data: { prompt: combo, from: "fromFlow" }
                });
                setTimeout(() => {

                    this._updateChatBotTalksResult([
                        Talks.createTaskStatus('run-agents-result', (new Date()).getTime() + '', res['run-agents-result'].markdown)
                    ]);

                    chromeStorageSet({ 'run-agents-result': null })
                }, 1000)

            }
        })
    }

    init() {
        window.onfocus = (e) => {
            if (document.readyState == 'complete') {
                // console.log('激活状态！')
                this._updateCurrentTalks();
                // 保持后台连接
                sendMessageToBackground['hi']({})
            }
        }

        window.oncontextmenu = function (e) {
            sendMessageToBackground['hi']({})
        }

        // 监听当前页面的显示状态
        document.addEventListener("visibilitychange", () => {
            var visibilityState = document.visibilityState == 'hidden' ? 0 : 1
            if (visibilityState === 0) {

            } else {
                // 刷新combo编辑器的数据
                !this.state.showEdit && !this.state.loadingChatBot && this.state.openMyPrompts && this._comboEditorRefresh();
                sendMessageToBackground['hi']({});
            }
        }, false);

        chrome.runtime.onMessage.addListener(async (
            request,
            sender,
            sendResponse
        ) => {
            const {
                cmd, data, success
            } = request;
            if (cmd == 'open-readability') {
                window.location.href = window.location.origin + window.location.pathname + window.location.search + '&reader=1'
            } else if (cmd == 'open-chatbot-panel') {
                this.setState({ initIsOpen: true });
                this.show(false);
                this.props.callback({
                    cmd: 'open-chatbot-panel',
                })
                if (data.combo) {
                    console.log('data.combo', data.combo)
                    // 去重
                    let ids: any = {};
                    for (const c of [...this.state.chatBotConfig]) {
                        c.checked = false;
                        ids[c.id] = c;
                    }
                    const role = ChatBotConfig.createRoleOpts(data.combo, 0);
                    ids[role.id] = role;
                    this.setState({
                        chatBotConfig: Object.values(ids)
                    })
                    const runComboData = parseCombo2ControlEvent(data.combo)
                    this._runCombo(runComboData)
                }
            } else if (cmd == 'chat-bot-init-result') {
                this.initChatBot(false);
            }


            sendResponse('我是content，已收到消息')
            return true;
        });

        userSelectionInit();

        // 角色加载
        ChatBotConfig.getRoleOpts().then((roles: any) => {
            let models = ChatBotConfig.get()
            // console.log([...roles, ...models])
            this.setState({
                chatBotConfig: [...roles, ...models]
            })
        })

    }

    async show(loading: boolean) {
        this.setState({
            loading
        });
    }

    _updateCurrentTalks() {
        if (this.state.disabledAll) return
        Talks.get().then(async talks => {

            // 当激活窗口的时候，弹出提示
            // if (!this.props.debug) {
            //     let talk = await Talks.createShowInChatInterfaces()
            //     talks.push(talk);
            // }

            talks = Talks.filter(talks);
            if (talks.length > 0) this.setState({
                talks
            })
        });
    }

    _getChatBotFromLocal() {
        return new Promise((res: any, rej) => {
            chrome.storage.sync.get('chatBotAvailables').then((data) => {
                if (data.chatBotAvailables && data.chatBotAvailables.length > 0) {
                    // console.log('this.state.chatBotType', this.state.chatBotType)
                    let chatBotAvailables = data.chatBotAvailables.filter((n: any) => n && n.type == this.state.chatBotType && n.available);
                    let isHas = chatBotAvailables.length > 0;
                    if (!isHas) chatBotAvailables = data.chatBotAvailables.filter((c: any) => c.available)

                    console.log('##聊天服务状态', Array.from(chatBotAvailables, (a: any) => {
                        if (a && a.available) {
                            return `${a.available.success} ${a.type}`
                        }
                    }).join('\n'))

                    if (isHas) {
                        let type = chatBotAvailables[0].type,
                            available = chatBotAvailables[0].available;
                        // if (availables.length > 0) {
                        //     type = availables[0].type;
                        //     available = availables[0].available;
                        // }
                        res({
                            // 获取this.state.chatBotType
                            type,
                            available
                        });
                    }
                    ;
                }

                res()
            })
        });
    }



    // 用来判断聊天是否有效
    initChatBot(isAutoShow = true) {
        //console.log('initChatBot', isAutoShow)
        return new Promise((res: any, rej) => {
            this._getChatBotFromLocal().then((data: any) => {
                if (data) {
                    // console.log('_getChatBotFromLocal', data)
                    this.setState({
                        // 先获取第一个
                        chatBotType: data.type,
                        chatBotIsAvailable: data.available.success,
                        chatBotStyle: data.available.style,
                        chatbotInitPrompt: this.props.userInput && this.props.userInput.prompt ? this.props.userInput.prompt : '',
                        loadingChatBot: false,
                        disabledAll: this.props.agents ? true : false,
                        // initIsOpen: true
                    });
                    //console.log('chatbotInitPrompt', this.state.chatbotInitPrompt);
                    if (isAutoShow) {
                        // 自动显示，从newtab过来的
                        this.show(false)
                    }

                    res(data.available && data.available.success);
                } else if (!data) {
                    setTimeout(() => this.setState({
                        disabledAll: this.props.agents ? true : false,
                        loadingChatBot: false,
                        // initIsOpen: true
                    }), 3000)
                }

                res(data)
            });
        });

    }

    updateChatBotStatus(isLoading: boolean) {
        this.setState({
            disabledAll: isLoading
        })
    }

    _waitUserInputRun(inputText: string) {
        const PromptIndex = this.state.PromptIndex;

        const prePrompt = this.state.currentCombo[`prompt${PromptIndex - 1 > 1 ? PromptIndex - 1 : ''}`]

        const prompt = JSON.parse(JSON.stringify(this.state.currentCombo[`prompt${PromptIndex > 1 ? PromptIndex : ''}`]));
        console.log('_waitUserInputRun', prePrompt, prompt, PromptIndex, this.state.currentCombo)
        const id = md5(new Date() + inputText)

        const talk = {
            ...Talks.createTalkBubble(inputText),
            markdown: inputText,
            id,
            promptId: prePrompt.id,
            tId: id,
            type: "markdown",
            user: false
        }

        // 下一个节点
        let data: any = {
            prompt,
            index: PromptIndex,
            prePrompt,
            newTalk: true,
            from: 'combo',
            '_combo': { ...this.state.currentCombo, PromptIndex }
        }

        this.setState(
            {
                PromptIndex,
                disabledAll: true,
                waitUserInput: false,
                talks: [...this.state.talks, talk]
            }
        )

        setTimeout(() => this._control({
            cmd: 'send-talk',
            data
        }), 500)
    }

    _userInputTextRun() {

        setTimeout(() => {
            const id = md5(new Date() + '-')
            const data = Talks.createTaskStatus(
                '_userInputTextRun',
                id,
                '-'
            )
            this._updateChatBotTalksResult([data]);
        }, 1000)

    }


    _agentApiRun(prompt: any, combo: any) {

        const res = ApiRun(prompt, combo);

        sendMessageToBackground['api-run']({
            ...res
        })

        console.log("sendMessageToBackground['api-run']", res)

        // 传递给父级
        setTimeout(() => this.props.callback({
            cmd: 'send-talk',
            data: {
                url: res.url, init: res.init
            },
            type: "api"
        }), 500)

    }

    _queryClickRun(prompt: any, delay = 1000) {
        QueryClickRun(prompt, delay).then((res: any) => {
            const data = Talks.createTaskStatus(
                res.from,
                res.id,
                res.text
            )
            this._updateChatBotTalksResult([data]);
        })
    }

    _queryInputRun(prompt: any, delay = 1000) {
        QueryInputRun(prompt, delay).then((res: any) => {
            const data = Talks.createTaskStatus(
                res.from,
                res.id,
                res.text
            )
            this._updateChatBotTalksResult([data]);
            setTimeout(() => this.props.callback({
                cmd: 'stop-talk',
                data: res.text
            }), 1000)
        })
    }

    _queryDefaultRun(prompt: any, combo: any) {
        const { queryObj, context } = prompt;
        QueryDefaultRun(queryObj, context, combo).then((res: any) => {

            this.updateChatBotStatus(false);

            if (res.url) {
                // 需要把当前面板的状态停止
                this._promptControl({ cmd: 'stop-combo' });

                sendMessageToBackground['run-agents'](res.data)
            } else {
                this._updateChatBotTalksResult([
                    Talks.createTaskStatus(
                        res.from,
                        res.id,
                        res.text
                    )
                ])
                this.props.callback({
                    cmd: 'stop-talk',
                    data: '延时' + res.delay + '毫秒'
                })
            }

        })

    }

    _queryReadRun(queryObj: any) {
        QueryReadRun(queryObj).then((res: any) => {

            // 需要被下一节点使用到，需要设置成done类型
            this._updateChatBotTalksResult([{
                ...Talks.createTaskStatus(
                    res.from,
                    res.id,
                    res.markdown
                ),
                markdown: res.markdown,
                html: res.markdown,
                export: true,
                type: 'done'
            }])

            // 传递给父级
            this.props.callback({
                cmd: 'send-talk',
                data: res.data,
                type: "query"
            })

            setTimeout(() => this.props.callback({
                cmd: 'stop-talk',
                data: res.markdown || 'debug'
            }), 500)

        })


        return
    }


    _agentHighlightTextRun(text: string) {
        // let success: any = false;
        // let elements = extractDomElement();
        // console.log(text, elements)
        // success = highlightText(text, elements)
        // if (success) message.info('成功执行')
    }

    _createPPTFile(inputs: any, nTalks: any) {
        if (inputs && nTalks) {
            const items = []
            for (const nodeInputId of inputs) {
                let data = Talks.getTalkByPromptId(nodeInputId, [...nTalks]);
                if (data) {
                    items.push(data);
                }
            }
            const p = new PPT();

            p.createPPT(items).then((filename: any) => {
                const id = md5(filename + (new Date()))
                const data = Talks.createTaskStatus(
                    '_createPPTFile',
                    id,
                    i18n.t('filePPTNodeTitle')
                )
                this._updateChatBotTalksResult([data]);
            })

        }
    }

    _createInputMerge(inputs: any, nTalks: any) {
        if (inputs && nTalks) {
            let { nodes, output } = inputs;
            const items = []
            for (const nodeInputId of nodes) {
                let data = Talks.getTalkByPromptId(nodeInputId, [...nTalks]);
                if (data) {
                    items.push(Talks.getTalkInnerText(data));
                }
            }

            output = output || ''

            if (output && output.trim()) {
                for (let index = 0; index < items.length; index++) {
                    const n = items[index];
                    output = output.replaceAll('${n' + index + '}', n?.trim());
                }
            }

            const id = md5('_createInputMerge' + (new Date()) + output)
            const data = {
                markdown: output,
                id,
                export: true,
                type: "done",
            }

            setTimeout(() => this._updateChatBotTalksResult([data]), 1000)

        }
    }

    /**
     * 'prompt' ||   'tasks'  
     * newTalk 不从缓存获取
     * TODO:bug 用户输入的prompt ，
     */

    _llmRun(prompt: any, newTalk: boolean) {
        // console.log('this.state.chatBotStyle', this.state.chatBotStyle)

        const data = LLMRun(prompt, newTalk)

        sendMessageToBackground['chat-bot-talk'](data);

        // 传递给父级
        this.props.callback({
            cmd: 'send-talk',
            data: data.prompt,
            type: 'prompt'
        })

    }

    //['user']
    // async _getPromptsData(keys = ['user']) {
    //     let prompts: any[] = [];
    //     const res: any = await chromeStorageGet(keys);
    //     for (const k of keys) {
    //         if (res && res[k]) {
    //             for (const combo of res[k]) {
    //                 prompts.push(combo);
    //             }
    //         }
    //     }
    //     return prompts;
    // }

    // TODO 需要放到某个监听里，来更新对话数据
    _updateChatBotTalksResult(items: any) {
        // console.log('_updateChatBotTalksResult', items)
        // 对话数据
        const talks: any = this.state.talks;
        // 更新到这里
        let nTalks = [...talks];

        let promptFromLocal = null;

        for (const data of items) {

            // 是否清楚思考状态
            let isCanClearThinking = false;


            // 如果是本地缓存
            if (data.from == 'local' && !promptFromLocal) {
                promptFromLocal = data.prompt;

                // console.log('对话状态关闭')
                isCanClearThinking = true;
                setTimeout(() => this.updateChatBotStatus(false), 100);
            }

            if (data.type == "start") {
                // 需补充此状态
                // 对话状态开启
                console.log('对话状态开启', data)
                this.updateChatBotStatus(true);

            } else if (data.type == 'markdown' || data.type == 'done' || data.type == 'task') {
                // markdown 如果 data.from == 'local' 则isNew=true
                isCanClearThinking = !!data.markdown;

                // 检查talk的id，type，需要做对话原文的更新
                let isNew = true;
                for (let index = 0; index < talks.length; index++) {
                    let talk: any = talks[index];
                    if (talk.tId == data.tId && talk.type == 'markdown' && data.markdown) {
                        nTalks[index] = {
                            ...nTalks[index],
                            ...Talks.createTalkBubble(data.markdown)
                        }
                        isNew = false;
                    }
                }

                if ((isNew || data.from == 'local') && data.markdown) {

                    let PromptIndex = this.state.PromptIndex;
                    // 当前节点
                    let currentPrompt = this.state.currentCombo[`prompt${PromptIndex > 1 ? PromptIndex : ''}`] || {}

                    console.log('对话状态开启 promptId ', PromptIndex, this.state.currentCombo, currentPrompt.id, currentPrompt)

                    // 新对话
                    let d = {
                        ...data,
                        ...Talks.createTalkBubble(data.markdown),
                        export: data.export === undefined ? true : data.export,
                        promptId: currentPrompt.id
                    };
                    if (data.html) {
                        // 如果数据传了html
                        d.html = data.html
                    }
                    nTalks.push(d);

                    // 对话状态开启
                    // console.log('对话状态开启',data)
                    this.updateChatBotStatus(true);

                }

                if (data.type == 'done' || data.type == 'task') {

                    let PromptIndex = this.state.PromptIndex;
                    console.log('done/task', data, this.state.currentCombo, PromptIndex)

                    // 上一个节点
                    let prePrompt = this.state.currentCombo[`prompt${PromptIndex > 1 ? PromptIndex : ''}`]

                    // 无限循环功能
                    if (this.state.currentCombo.combo && this.state.currentCombo.isInfinite && this.state.currentCombo.combo > 1) {
                        if (this.state.currentCombo.combo <= PromptIndex) {
                            // 结束的时候，循环起来
                            prePrompt = this.state.currentCombo[`prompt${this.state.currentCombo.combo}`]
                            PromptIndex = 0;
                        }
                    }
                    // console.log('1无限循环功能', isNextUse, PromptIndex)

                    if (data.from == '_userInputTextRun') {

                        // console.log('_userInputTextRun', this.state.currentCombo, PromptIndex)
                        if (this.state.currentCombo.combo > PromptIndex) {
                            PromptIndex = PromptIndex + 1;

                            console.log('_userInputTextRun', {
                                PromptIndex,
                                disabledAll: false,
                                waitUserInput: true
                            })

                            this.setState(
                                {
                                    PromptIndex,
                                    disabledAll: false,
                                    waitUserInput: true
                                }
                            )
                        } else {
                            // 等待用户输入
                            setTimeout(() => this._control({ cmd: 'stop-talk' }), 500)
                        }
                        return
                    }

                    if (this.state.currentCombo.combo > PromptIndex) {

                        PromptIndex = PromptIndex + 1;
                        const prompt = JSON.parse(JSON.stringify(this.state.currentCombo[`prompt${PromptIndex > 1 ? PromptIndex : ''}`]));

                        // 下一个节点
                        let data: any = {
                            prompt,
                            index: PromptIndex,
                            prePrompt,
                            newTalk: true,
                            from: 'combo',
                            '_combo': { ...this.state.currentCombo, PromptIndex }
                        }

                        this.setState(
                            {
                                PromptIndex: PromptIndex,
                                disabledAll: true
                            }
                        )

                        // console.log('PromptIndex', PromptIndex);
                        if (this.state.disabledAll) setTimeout(() => this._control({
                            cmd: 'send-talk',
                            data
                        }), 500)

                    } else {
                        // this._promptControl({ cmd: 'stop-combo' });
                        setTimeout(() => this._control({ cmd: 'stop-talk' }), 500)

                    }

                }

            } else if (data.type == "urls") {
                // console.log(data)

                nTalks.push(ChatBotConfig.createTalkData('urls', {
                    buttons: Array.from(data.urls, (url: any) => {
                        return {
                            from: 'open-url',
                            data: {
                                ...url
                            }
                        }
                    }),
                }))

                // 推荐的链接
                // {"tId":"434d59ee-3742-4172-8d31-67e0af0ec0c9","id":"434d59ee-3742-4172-8d31-67e0af0ec0c92","morePrompts":[{"tag":"谢谢你，这很有帮助。","prompt":"谢谢你，这很有帮助。","from":"Bing"},{"tag":"新必应有什么优势？","prompt":"新必应有什么优势？","from":"Bing"},{"tag":"新必应如何保护我的隐私？","prompt":"新必应如何保护我的隐私？","from":"Bing"}],"user":false,"type":"suggest","from":"ws"}
            } else if (data.type == "suggest") {
                // 提示词
                // console.log(data)

                nTalks.push(ChatBotConfig.createTalkData('more-prompts', {
                    buttons: Array.from(data.morePrompts, (prompt: any) => {
                        return {
                            from: prompt.from,
                            data: {
                                ...prompt,
                                prompt: {
                                    type: 'prompt',
                                    text: prompt.prompt,
                                    tag: prompt.tag
                                }
                            }
                        }
                    })
                }))


            } else if (data.type === 'images') {
                // 图像
                const talk = {
                    html: Array.from(data.images, url => `<img src='${url}' />`).join(''),
                    export: true,
                    type: 'images'
                }
                delete data.images;
                let d = { ...data, ...talk };
                nTalks.push(d);

            } else if (data.type === 'audio') {
                // 音频
                const talk = {
                    html: `<audio src='${data.url}' controls />`,
                    export: false,
                    type: 'audio'
                }
                delete data.url;
                let d = { ...data, ...talk };
                nTalks.push(d);

            } else if (data.type == 'error') {
                const talk = Talks.createTalkBubble(data.markdown)
                talk.html = `<div class="chatbot-error">${talk.html}</div>`
                let d = { ...data, ...talk };
                nTalks.push(d);

                // 错误状态，把信息吐给用户
                isCanClearThinking = true;
                this.updateChatBotStatus(false);

            }


            // 清空type thinking 的状态
            if (isCanClearThinking) nTalks = Talks.clearThinking(nTalks)

        };

        if (promptFromLocal) {
            // 因为是从本地获取的数据,需要添加是否新建对话?
            console.log('promptFromLocal', promptFromLocal)
            promptFromLocal = promptFromLocal.filter((p: any) => p.role == 'user')[0]?.content
            //TODO bug需要修复
            nTalks.push(ChatBotConfig.createTalkData('send-talk-refresh', {
                data: {
                    tag: promptFromLocal.slice(0, 10) + (promptFromLocal.length > 10 ? '...' : ''),
                    prompt: {
                        text: promptFromLocal,
                        type: 'prompt',
                    },
                    // 用来强制刷新获取新的对话
                    newTalk: true
                }
            }))
        };


        nTalks = nTalks.filter(t => t)

        this.setState({
            talks: nTalks  // 保存对话内容 一句话也可以是按钮
        });

        // 把对话内容保存到本地
        Talks.save(nTalks)
    }

    _chatBotSelect(res: any) {
        if (res.type == 'ChatGPT' || res.type == 'Bing') {
            // console.log('_chatBotSelect:',res)
            const data = {
                chatBotType: res.type,
                chatBotStyle: res.style
            };
            this.setState({
                ...data
            });
            // console.log(data)
            localStorage.setItem('_chatBotSelect', JSON.stringify(data));
            // chromeStorageSet({'_chatBotSelect':JSON.stringify(data)});
        }
    }



    /*
   
    */
    async _control(event: any) {
        // 从ChatBotInput输入里返回的数据
        // cmd: new-talk、stop-talk、left-button-action、send-talk
        //    {cmd:'send-talk' ,data:{prompt,tag}}
        // console.log('_control:', event)
        if (event && event.cmd) {
            const { cmd, data } = event;
            // 对话数据
            const talks: any = this.state.talks;
            // 更新到这里
            let nTalks = [...talks].filter(t => t);

            console.log('_control::::::::::::', nTalks, cmd, data, this.state.waitUserInput, this.state.currentCombo)

            const sendTalk = async () => {

                this.updateChatBotStatus(true);

                let combo = data._combo ? data._combo.combo : -1;
                let { prompt, tag, newTalk, from, prePrompt, debugInfo } = data;
                // from : combo ,chatbot-input,comboEditor,debug

                prompt = JSON.parse(JSON.stringify(prompt))

                console.log('sendTalk::::::::::::', this.state.waitUserInput, this.state.currentCombo)

                /**
                 * ::start 对话界面的信息处理
                 */

                // role需要显示对应的avatar
                // console.log('role需要显示对应的avatar', prompt, this.state.PromptIndex)
                if (this.state.PromptIndex <= 1 && prompt.role && (prompt.role.name || prompt.role.text)) {

                    let avatarUrl = prompt.role.avatar ? chrome.runtime.getURL(`public/avatars/${prompt.role.avatar}.png`) : ''
                    const isAvatarUrl = await checkImageUrl(avatarUrl);
                    if (isAvatarUrl == false) avatarUrl = chrome.runtime.getURL('public/chatgpt-icon.png');

                    // nTalks.push(
                    //     ChatBotConfig.createTalkData('role-start',
                    //         {
                    //             name: prompt.role.name || '',
                    //             avatarUrl,
                    //             html: `<p class="chatbot-role-card">${prompt.role.text}</p>`,
                    //         }
                    //     ));
                    // console.log(nTalks)
                }

                // 标记当前执行状态，以及下一条
                const currentCombo = { ...data._combo, PromptIndex: cmd == 'combo' ? 1 : this.state.PromptIndex };


                console.log('from', from, tag)

                if (from !== 'debug' && tag) {
                    // 用户输入的信息，显示tag
                    nTalks.push(
                        ChatBotConfig.createTalkData('tag',
                            {
                                html: tag
                            }));
                } else if (from === "debug" && debugInfo) {
                    //  显示debug info
                    nTalks.push(
                        ChatBotConfig.createTalkData('debug',
                            {
                                html: debugInfo || 'debug'
                            }));
                } else if (from === 'newtab') {
                    nTalks.push(
                        ChatBotConfig.createTalkData('tag',
                            {
                                html: 'newtab'
                            }));
                }

                // 清空type thinking 的状态
                nTalks = Talks.filter(nTalks)

                // 增加思考状态
                nTalks.push(ChatBotConfig.createTalkData('thinking', {}));

                // 把对话内容保存到本地
                // Talks.save(nTalks)

                // userInput类节点
                if (['userInputText']
                    .includes(prompt.type)) {
                    // 清空type thinking 的状态
                    nTalks = Talks.filter(nTalks)
                    nTalks.push(ChatBotConfig.createTalkData('ask-user-input', {
                        html: prompt.userInput || i18n.t('inputTitle')
                    }));
                    this._userInputTextRun()
                }


                this.setState({
                    userInput: {
                        prompt: '', tag: ''
                    },
                    chatbotInitPrompt: '',
                    openMyPrompts: false,
                    talks: nTalks  // 保存对话内容 一句话也可以是按钮
                })

                /**
                 * ::end 对话界面的信息处理
                 */

                // console.log('nTalks', nTalks)
                // console.log(`prompt`, JSON.stringify(prompt, null, 2), JSON.stringify(prePrompt, null, 2), combo, prompt.input)

                // combo>0从comboor对话流里运行
                // combo==-1 用户对话框里的输入

                // userinput的初始化

                // userinput的初始化
                let promptJson: any = {
                    role: {
                        name: "", text: ""
                    },
                    userInput: "",
                    type: prompt.type,
                    model: prompt.model,
                    temperature: prompt.temperature,
                    inputs: prompt.inputs,
                    queryObj: prompt.queryObj,
                    api: prompt.api,
                    input: prompt.input,
                    nodeInputId: prompt.nodeInputId,
                    id: prompt.id,
                    merged: prompt.merged,
                    _nodeInputTalk: prompt._nodeInputTalk
                }

                if (prompt.text) promptJson = { ...promptJson, ...bindUserInput(prompt.text) };

                // role的处理
                if (prompt.role && (prompt.role.name || prompt.role.text || prompt.role.merged)) {
                    promptJson = { ...promptJson, ...promptBindRole(promptJson.userInput, prompt.role) }
                }


                /**
                 * input的处理，只有特定的type才有
                 */
                // input的处理
                if (['bindCurrentPage',
                    'bindCurrentPageHTML',
                    'bindCurrentPageURL']
                    .includes(prompt.input)) {
                    let type = 'text', query = "";
                    if (prompt.input == 'bindCurrentPage') {
                        // 绑定全文
                        type = 'text';
                    } else if (prompt.input == 'bindCurrentPageHTML') {
                        // 绑定网页
                        type = 'html';
                    } else if (prompt.input == 'bindCurrentPageURL') {
                        // 绑定url
                        type = 'url';
                    }
                    query = "";
                    promptJson = { ...promptJson, ...promptBindCurrentSite(promptJson.userInput, type, query) }
                };


                if (prompt.input == 'userSelection') {
                    // 从用户划选
                    promptJson = { ...promptJson, ...promptBindUserSelection(promptJson.userInput) }
                } else if (prompt.input == 'clipboard') {
                    // 从剪切板
                    promptJson = { ...promptJson, ...await promptBindUserClipboard(promptJson.userInput) }
                } else if (prompt.input == 'nodeInput') {
                    // 从上一节点获取文本，prompt的输入从上一个节点输入
                    console.log('从上一节点获取文本', prompt.nodeInputId, nTalks)
                    if (!prompt.nodeInputId) {
                        let lastTalk: any = Talks.getLastTalk([...nTalks]);
                        promptJson = { ...promptJson, ...promptUseLastTalk(promptJson.userInput, lastTalk) }
                    } else {
                        if (prompt._nodeInputTalk) {
                            // 调试使用
                            promptJson = { ...promptJson, ...promptUseLastTalk(promptJson.userInput, prompt._nodeInputTalk) }
                        } else {
                            let data: any = Talks.getTalkByPromptId(prompt.nodeInputId, [...nTalks]);
                            if (data) {
                                let talk: any = Talks.getTalkInnerText(data)
                                promptJson = { ...promptJson, ...promptUseLastTalk(promptJson.userInput, talk) }
                            }
                        }

                    }
                    console.log('从上一节点获取文本', prompt.nodeInputId, promptJson.context)
                } else if (prompt.input == "userInput") {
                    console.log('从用户输入获取文本', prompt, promptUseLastTalk(promptJson.userInput, prompt.userInput))
                    promptJson = { ...promptJson, ...promptUseLastTalk(promptJson.userInput, prompt.userInput) }
                }

                // translate的处理
                if (prompt.translate != "default") {
                    promptJson = { ...promptJson, ...promptBindTranslate(promptJson.userInput, prompt.translate) }
                }

                // output的处理
                promptJson = { ...promptJson, ...promptBindOutput(promptJson.userInput, prompt.output) }


                // 运行时
                console.log('prompt.type------', promptJson, from)


                //file 类
                if (promptJson.type === "file-ppt-create") {
                    // 创建ppt
                    const { file } = prompt;
                    const { inputs, type } = file || {};
                    if (inputs) {
                        // 输入的节点
                        this._createPPTFile(inputs, nTalks);
                    }
                }

                // 输入合并 inputMerge
                if (promptJson.type === "inputMerge") {
                    this._createInputMerge(promptJson.inputs, nTalks)
                }

                // 如果是用户输入的，from==chatbot-input
                if (from === "chatbot-input") {
                    promptJson.model = this.state.chatBotType;
                    promptJson.role = this.state.role;
                    if (this.state.chatBotStyle && this.state.chatBotStyle.value) promptJson.temperature = this.state.chatBotStyle.value;
                }


                if ([
                    'prompt',
                    'promptCustom'
                ].includes(promptJson.type)) {

                    if (!promptJson.model) promptJson.model = this.state.chatBotType;
                    if (!promptJson.temperature && this.state.chatBotStyle && this.state.chatBotStyle.value) promptJson.temperature = this.state.chatBotStyle.value;

                    this._llmRun(promptJson, newTalk);

                };

                // role 给调试用
                if ([
                    'role',
                ].includes(promptJson.type)) {

                    promptJson.model = this.state.chatBotType;
                    if (this.state.chatBotStyle && this.state.chatBotStyle.value) promptJson.temperature = this.state.chatBotStyle.value;

                    this._llmRun(promptJson, newTalk);

                };


                // queryInput 
                if (promptJson.type == "queryInput" && promptJson.queryObj) {
                    this._queryInputRun(promptJson);
                };

                // queryClick
                if (promptJson.type == "queryClick" && promptJson.queryObj) {
                    this._queryClickRun(prompt);
                };

                // queryDefault 跳转页面
                if (promptJson.type === 'queryDefault') this._queryDefaultRun(promptJson, currentCombo);

                // queryRead 读取
                if (promptJson.type == "queryRead") this._queryReadRun(promptJson.queryObj);

                if (promptJson.type === 'api') this._agentApiRun(promptJson, currentCombo);

                if (promptJson.type === 'highlight') {
                    // this._agentHighlightTextRun(lastTalk)
                }

            }

            switch (cmd) {
                // 打开配置
                case "open-setup":
                    this.setState({
                        toggleSetup: true
                    });
                    return;
                case "close-setup":
                    this.setState({
                        toggleSetup: false
                    });
                    return
                case "copy-action":
                    // console.log(`copy success`)
                    message.info(`copy success`)
                    return;
                // 打开官网
                case "open-url":
                    sendMessageToBackground['open-url']({ url: data.url })
                    return;
                // 打开我的prompts
                case "left-button-action":
                    getPromptsData().then((prompts: any) => {
                        this.setState({
                            openMyPrompts: true,
                            myPrompts: prompts
                        });
                    })
                    return;
                case "chatbot-select":
                    this._chatBotSelect(data)
                    return;
                case "close-chatbot-panel":
                    this.show(!this.state.loading)
                    this.props.callback({
                        cmd: 'close-insight'
                    })
                    return;
                // case "toggle-fullscreen":
                //     this.setState({
                //         fullscreen: !this.state.fullscreen
                //     });
                //     return
                case "activate-chatbot":
                    console.log('activate-chatbot')
                    return
                case "show-combo-modal":
                    // this._promptControl({ cmd, data })
                    const { from, isNew } = data;
                    // console.log(isNew,from)
                    // 修改为新的编辑器brainwave ,data.prompt - combo
                    if (isNew) {
                        chromeStorageSet({
                            '_brainwave_import': {
                                isNew
                            }
                        })
                    } else {
                        chromeStorageSet({
                            '_brainwave_import': { data: [data.prompt] }
                        })
                    }
                    sendMessageToBackground['open-options-page']({})
                    return
                case "delete-combo-confirm":
                    this._promptControl({ cmd, data })
                    return
                case "close-combo-editor":
                    this._promptControl({ cmd })
                    return
                case "Bing":
                    // urls,prompts
                    console.log('Bing:::', data)
                    if (data.url) {
                        sendMessageToBackground['open-url']({ url: data.url })
                    } else if (data.prompt) {
                        sendTalk()
                    }
                    return;
                // 用户点击建议
                case "combo":
                    console.log('combo:开始运行:', data)
                    this._promptControl({
                        cmd: 'update-prompt-for-combo',
                        data: { prompt: { ...data._combo }, from: "fromFlow" }
                    })
                    sendTalk()
                    break;
                // 用户发送对话
                case "send-talk":
                    if (this.state.waitUserInput) {
                        console.log('waitUserInput', this.state)
                        this._waitUserInputRun(data.tag);

                    } else {
                        if (data._combo) this._promptControl({
                            cmd: 'update-prompt-for-combo',
                            data: { prompt: data._combo, from: "fromFlow" }
                        })
                        sendTalk()
                    }

                    break;
                case "send-talk-refresh":
                    sendTalk()
                    break;
                // 终止对话
                case "stop-talk":
                    sendMessageToBackground['chat-bot-talk-stop']({ type: this.state.chatBotType });
                    this.updateChatBotStatus(false);
                    // 清空type thinking 的状态
                    nTalks = Talks.clearThinking(nTalks)
                    nTalks = nTalks.filter(t => t)
                    // console.log("nTalks filter", nTalks);
                    this.setState({
                        talks: nTalks,// 保存对话内容 一句话也可以是按钮
                        PromptIndex: 0
                    });

                    // 把对话内容保存到本地
                    Talks.save(nTalks)
                    // 传到父级 - 完成把对话结果
                    this.props.callback({
                        cmd: 'stop-talk',
                        data: Talks.getLastTalk(nTalks)
                    })
                    break;
                // 新建对话
                case "new-talk":
                    nTalks = []

                    // 如果是debug模式，则不显示
                    if (!this.props.debug) {
                        let talk = await Talks.createShowInChatInterfaces()
                        if (talk) nTalks.push(talk);
                    }

                    Talks.clear();
                    sendMessageToBackground['chat-bot-talk-new']({ type: this.state.chatBotType, newTalk: true });

                    nTalks = nTalks.filter(t => t)
                    console.log("nTalks filter", nTalks);
                    this.setState({
                        talks: nTalks  // 保存对话内容 一句话也可以是按钮
                    });

                    // 把对话内容保存到本地
                    // Talks.save(nTalks)

                    break;
                case "debug-combo":
                    this.props.callback({
                        cmd: 'debug-combo',
                    })
                    break;
                case "change-role":
                    this.setState({
                        role: data
                    })
                    break;
                default:
                    console.log("default");
                // // 初始化bing
            }


            // nTalks = nTalks.filter(t => t)
            // console.log("nTalks filter", nTalks);
            // this.setState({
            //     talks: nTalks  // 保存对话内容 一句话也可以是按钮
            // });

            // // 把对话内容保存到本地
            // Talks.save(nTalks)

        }


    }


    /**
     * 
     * @param type add 、 delete
     * @param data { tag,checked,bind,owner,combo,prompt,prompt2... }
     */
    _comboUpdateUserData(type = "add", data: any) {
        const { id } = data;
        chromeStorageGet(['user']).then((items: any) => {
            const oldData = items.user || [];
            const newData = oldData.filter((od: any) => od.id != id);

            if (type === 'add') newData.push(data);

            if (newData.length > 5) {
                message.info('已达到最大存储数量')
                // message.error('已达到最大存储数量');
            };

            chromeStorageSet({ 'user': newData }).then(() => this._comboEditorRefresh())

        });
    }


    _comboEditorRefresh() {
        chromeStorageGet(['user', 'official']).then((res: any) => {
            let prompts: any = [];

            if (res.user) {
                prompts = [...res.user];
            }

            if (res.official) {
                prompts = [...prompts, ...res.official];
            }
            // console.log('_comboEditorRefresh', prompts)
            this.setState({
                myPrompts: prompts,
                showEdit: false
            });

        })
    }



    /*
    bind: false,checked: true,combo:2,id:"187a3184aab",owner:"user",prompt: "1",prompt2: "2",tag:"test"
    */

    _promptControl = (event: any) => {
        const { cmd, data } = event;

        if (cmd == "update-prompt-for-combo") {
            const { prompt, from } = data;

            const d = {
                PromptIndex: prompt.PromptIndex != undefined ? prompt.PromptIndex : 1,
                currentCombo: prompt,
                disabledAll: true
            }
            console.log('update-prompt-for-combo', prompt, from, d)
            this.setState(d)

        } else if (cmd == "show-combo-modal") {
            // console.log("show-combo-modal",data)
            const { prompt, from } = data;
            if (prompt) {
                this.setState({
                    showEdit: true,
                    openMyPrompts: true,
                    currentCombo: prompt
                })
            }

        } else if (cmd == "edit-combo-finish") {
            console.log('edit-on-finish', data)
            const { prompt, from } = data;
            if (data) this._comboUpdateUserData('add', prompt);

        } else if (cmd == "edit-combo-cancel") {
            // 取消，关闭即可
            this.setState({
                showEdit: false,
                openMyPrompts: this.state.openMyPrompts
            })
        } else if (cmd == "delete-combo-confirm") {
            const { prompt, from } = data;
            console.log('_comboUpdateUserData', prompt)
            // 删除
            this._comboUpdateUserData('delete', prompt);
        } else if (cmd == "close-combo-editor") {
            this.setState({
                showEdit: false,
                openMyPrompts: false
            })
        } else if (cmd == "stop-combo") {
            this.setState(
                {
                    PromptIndex: 0,
                    currentCombo: null
                }
            )
            this.updateChatBotStatus(false)
        }
    }


    _doChatBotData() {

        let subjects = [{
            type: 'chatbot', text: '聊天', index: -1
        }];

        let activeIndex = -1;

        let talks: any = [...this.state.talks];

        // 聊天服务无效,补充提示
        console.log('_doChatBotData', this.state.chatBotIsAvailable)
        if (!this.state.chatBotIsAvailable && activeIndex == -1) {
            talks = Talks.filter(talks);

            talks.push(ChatBotConfig.createTalkData('chatbot-is-available-false', {
                hi: this.state.chatBotType
            }))

            // this._getChatBotFromLocal().then((data: any) => {
            //     // console.log('_getChatBotFromLocal', data)
            //     // console.log(chrome.storage.sync.get('chatBotAvailables'))
            // })

            // this.initChatBot(true)
        }

        let datas = [talks];
        let tabList = Array.from(subjects, subject => {
            return {
                key: subject.text,
                tab: subject.text,
                index: subject.index
            }
        });

        return {
            tabList, datas, activeIndex
        }
    }

    render() {
        const { tabList, datas, activeIndex } = this._doChatBotData();
        // console.log('this.state.loading', this.state.loading, this.state.initIsOpen)
        return (<>
            <FlexColumn
                className={this.props.className}
                translate="no"
                display={
                    this.state.initIsOpen ?
                        (this.state.loading ? 'none' : 'flex')
                        : 'none'}
                // 修复qq邮箱里不显示的问题
                style={{
                    display: this.state.initIsOpen ?
                        (this.state.loading ? 'none' : 'flex')
                        : 'none',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    zIndex: 99999998,
                    background: 'white',
                    height: '100vh'
                }}
            >
                {/* <PDF name='pdf'/> */}
                {!this.state.showEdit && !this.state.loadingChatBot && this.state.openMyPrompts ?
                    <ComboEditor
                        myPrompts={this.state.myPrompts}
                        callback={(event: any) => this._control(event)}
                    /> : ''}

                {
                    !this.state.showEdit && this.state.toggleSetup &&
                    <Setup callback={(event: any) => this._control(event)} />}

                {
                    !this.state.showEdit && !this.state.toggleSetup && !this.state.openMyPrompts && this.state.chatBotConfig ?
                        <ChatBotPanel
                            name={this.state.appName}
                            tabList={tabList}
                            activeIndex={activeIndex}
                            datas={datas}
                            fullscreen={this.state.fullscreen}
                            disabled={this.state.disabledAll}
                            callback={(e: any) => this._control(e)}
                            config={this.state.chatBotConfig}
                            debug={this.props.debug}
                        />
                        : ''
                }
            </FlexColumn>

        </>
        )
    }
}


export default Main
