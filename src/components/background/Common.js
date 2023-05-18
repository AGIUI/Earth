/**
 * background里的监听事件的定义
 *
 * 返回 运行状态 
 * status 
 * llm-start 开始调用LLM
 * llm-end 
 * 
 * sendResponse({
                        status: 'llm-start',
                        data: {
                            ...data
                        }
                    })

 */


class Common {
    constructor(json, chatBot, Agent, Credit) {
        this.appName = json.app;

        this.init()
        this.onMessage(json, chatBot, Agent, Credit)

    }

    init() {
        chrome.runtime.getPlatformInfo().then(res => (this.platformInfo = res))

        /**快捷键
         *
         */
        chrome.commands.onCommand.addListener(async command => {
            if (command == 'toggle-insight') {
                sendMessage('toggle-insight', true, true, null)
            }
            // chrome.tabs.create({ url: "https://developer.mozilla.org" });
        })

        // chrome.commands.getAll().then(commands => {
        //     for (let command of commands) {
        //         console.log('command', command)
        //     }
        // })

        chrome.runtime.onConnectExternal.addListener(res => console.log(res))

        chrome.action.onClicked.addListener(async tab => {
            // 当点击扩展图标时，执行...
            //   chrome.action.disable(tab.id)
            // let available = await chatBot.getAvailable(chatBot.currentName)
            this.sendMessage('toggle-insight', true, true, tab.id)
                // if (!available) chatBot.init(chatBot.currentName)
                // 检查newtab有没有打开，没有的话打开
            const newTabUrl = `${chrome.runtime.getURL('')}/${chrome.runtime.getManifest().chrome_url_overrides.newtab}`
            chrome.tabs.query({}, tabs => {
                // console.log(tabs)
                if (!tabs.filter(t => t.url == newTabUrl)[0] &&
                    !tabs.filter(t => t.title == this.appName)[0]
                ) {
                    // 没打开
                    chrome.tabs.create({
                        active: false,
                        url: newTabUrl
                    })
                }
                return true
            })
        })

        chrome.contextMenus.onClicked.addListener(async(item, tab) => {
            const id = item.menuItemId
            if (!tab.url.match('http')) return
            if (id == 'toggle-insight') {
                this.sendMessage('toggle-insight', true, true, tab.id)
            }
        })
    }

    onMessage(json, chatBot, Agent, Credit) {
        // 用于监听发到bg的消息
        chrome.runtime.onMessage.addListener(
            async(request, sender, sendResponse) => {
                const { cmd, data } = request,
                tabId = sender.tab.id

                if (cmd == 'chat-bot-init') {
                    // 初始化 chatbot
                    const { type, api, model, token, team } = data || {}

                    if (api && model && token) {
                        await chatBot.init(
                            type || 'ChatGPT', {
                                token,
                                api,
                                model,
                                team
                            }
                        )
                    }

                    await chatBot.init('Bing')

                    let availables = await chatBot.getAvailables()
                    sendResponse({ cmd: 'chat-bot-init-result', data: availables })
                    this.sendMessage(
                        'chat-bot-init-result',
                        availables && availables.length > 0,
                        availables,
                        tabId
                    )
                } else if (cmd == 'chat-bot-init-by-type') {
                    let available = await chatBot.getAvailable(data.type)
                    sendResponse({ cmd: 'chat-bot-init-by-type-result', data: available })
                } else if (cmd == 'chat-bot-talk') {
                    // console.log(cmd, data)
                    // prompt, style, type, callback
                    const initTalksResult = chatBot.doSendMessage(
                        data.prompt,
                        data.style,
                        data.type,
                        data.newTalk,
                        (success, res) => {
                            // 处理数据结构
                            let dataNew = chatBot.parseData(res)
                            this.sendMessage('chat-bot-talk-result', success, dataNew, tabId)
                        }
                    );

                    sendResponse({
                        status: 'llm-start',
                        data: {
                            ...data
                        }
                    })

                } else if (cmd == 'chat-bot-talk-new') {
                    if (data.newTalk) {
                        chatBot.reset(data.type)
                    }
                } else if (cmd == 'chat-bot-talk-stop') {
                    chatBot.stop(data.type)
                } else if (cmd == 'set-badge-text') {
                    chrome.action.setBadgeText({ text: data.text })
                    chrome.action.setBadgeBackgroundColor({
                        color: data.color || [0, 0, 0, 255]
                    })
                } else if (cmd == 'close-insight') {
                    this.sendMessage(
                        'close-insight',
                        true, {
                            tabId: data.tabId
                        },
                        tabId
                    )
                } else if (cmd == 'open-bing-insight') {
                    if (data.url && data.userInput)
                        chrome.tabs.create({
                            url: `${data.url}&fullscreen=${data.fullscreen ? 1 : 0
                                }&userInput=${encodeURI(data.userInput || '')}`
                        })
                } else if (cmd == 'get-shortcuts') {
                    chrome.commands.getAll(commands => {
                        this.sendMessage(
                            'send-shortcuts-result',
                            true,
                            commands[1].shortcut,
                            tabId
                        )
                    })
                } else if (cmd == 'set-shortcuts') {
                    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
                } else if (cmd == 'open-url') {
                    chrome.tabs.create({
                        url: data.url
                    })
                } else if (cmd == 'run-agents') {
                    Agent.executeScript(data.url, data.query, data.combo)
                } else if (cmd == "get-my-points") {
                    const apiName = data.apiName,
                        token = data.token;
                    // 获取我的积分
                    Credit.getPoints(token, apiName).then(res => {
                        chrome.storage.sync.set({ myPoints: res })
                    })

                }

                sendResponse('我是后台，已收到消息：' + JSON.stringify(request))
                return true
            }
        )
    }

    sendMessage(cmd, success, data, tabId) {
        // console.log('sendMessage tabId', tabId)
        if (tabId) {
            chrome.tabs.sendMessage(
                tabId, {
                    cmd,
                    success,
                    data
                },
                function(response) {
                    // console.log(response)
                }
            )
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                let tabId = tabs[0].id
                chrome.tabs.sendMessage(
                    tabId, {
                        cmd,
                        success,
                        data
                    },
                    function(response) {
                        // console.log(response)
                    }
                )
            })
        }
    }
}

export default Common