import { v4 } from 'uuid'
import WebSocketAsPromised from 'websocket-as-promised'
import { ofetch, FetchError } from 'ofetch'

const websocketUtils = {
    packMessage(data) {
        const RecordSeparator = String.fromCharCode(30)
        return `${JSON.stringify(data)}${RecordSeparator}`
    },
    unpackMessage(data) {
        const RecordSeparator = String.fromCharCode(30)
        return data
            .toString()
            .split(RecordSeparator)
            .filter(Boolean)
            .map(s => JSON.parse(s))
    }
}

// new bing TODO 错误要立马传给前端 采用chrome stor
async function createConversation() {
    const headers = {
        'x-forwarded-for': '1.1.1.1',
        'x-ms-client-request-id': v4(),
        'x-ms-useragent': 'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32'
    }

    let resp, info;

    try {

        resp = await ofetch('https://www.bing.com/turing/conversation/create', {
            headers
        })

        if (!resp.result) {
            console.log('bing/conversation/create', resp)
            resp = await ofetch(
                'https://edgeservices.bing.com/edgesvc/turing/conversation/create', { headers }
            )
        }
    } catch (err) {
        if (err instanceof FetchError && err.status === 404) {
            try {
                resp = await ofetch(
                    'https://edgeservices.bing.com/edgesvc/turing/conversation/create', { headers }
                )
            } catch (error) {
                console.log(error)
                return { resp: null, info: 'Forbidden' }
            }
        } else {
            console.log(err)
            return { resp: null, info: 'Forbidden' }
        }
    }

    if (resp && resp.result && resp.result.value && resp.result.value !== 'Success') {
        const message = `${resp.result.value}: ${resp.result.message}`
        if (resp.result.value === 'UnauthorizedRequest') {
            // console.error('UnauthorizedRequest')
            info = 'UnauthorizedRequest'
        } else if (resp.result.value === 'Forbidden') {
            // console.error('Forbidden')
            info = 'Forbidden'
        } else {
            info = message
        }
        // console.error(message)
        resp = null
    }
    return { resp, info }
}



class NewBing {
    constructor(bingConversationStyle = 'Balanced') {

        this.type = 'Bing'

        this.conversationContext = undefined

        this.bingConversationStyles = {
            Creative: 'creative',
            Balanced: 'balanced',
            Precise: 'precise'
        }
        this.conversationStyle = this.bingConversationStyles[bingConversationStyle]
        this.updateStyleOption(this.conversationStyle);
        this.init();
    }

    // loadFromLocal() {
    //     // const myConfig = { bingStyle, chatGPTAPI, chatGPTModel, chatGPTToken }
    //     chrome.storage.local.get('myConfig').then(data => {
    //         if (data.myConfig) {
    //             this.token = data.myConfig.bingStyle
    //         }
    //     })
    // }

    async init() {
        if (!this.conversationContext) {
            const { resp: conversation, info } = await createConversation()
            if (conversation == null) {
                this.available = {
                    success: false,
                    info: info
                };
                return this.available
            }
            this.conversationContext = {
                conversationId: conversation.conversationId,
                conversationSignature: conversation.conversationSignature,
                clientId: conversation.clientId,
                invocationId: 0,
                conversationStyle: this.conversationStyle
            }
        }

        this.available = {
            success: true,
            style: { label: 'Creative', value: 'Creative' },
            styles: [
                { en: 'Creative', zh: '创造力', value: 'Creative', label: 'Creative' },
                { en: 'Balanced', zh: '平衡', value: 'Balanced', label: 'Balanced' },
                { en: 'Precise', zh: '严谨', value: 'Precise', label: 'Precise' }
            ],
            conversationContext: this.conversationContext
        };
        // console.log(this.available)
        return this.available
    }
    clearAvailable() {
        this.available = null;
    }
    getAvailable() {

        // let res = {
        //     success: false,
        //     info: ''
        // }

        // if (!this.available) res = await this.init()
        // if (this.available && this.available.success == false) res = await this.init()
        // if (this.available && this.available.success) res = this.available
        return this.available;
    }


    updateStyleOption(type = 'creative') {
        const json = {
            balanced: 'harmonyv3',
            creative: 'h3imaginative',
            precise: 'h3precise'
        }

        this.styleOption = json[type]
    }



    async saveChatBotByPrompt(prompt, result) {
        let key = `p_${prompt}`
        let data = await chrome.storage.local.get(key)
        if (!data[key]) data[key] = []
        data[key].push(result)
        await chrome.storage.local.set(data)
    }

    convertMessageToMarkdown(message) {
        if (message) {
            if (message.messageType === 'InternalSearchQuery') {
                return message.text
            }
            for (const card of message.adaptiveCards || []) {
                for (const block of card.body) {
                    if (block.type === 'TextBlock') {
                        return block.text
                    }
                }
            }
        }

        return ''
    }

    buildChatRequest(conversation, message) {
        const styleOption = this.styleOption
            // console.log(styleOption)
        return {
            arguments: [{
                source: 'cib',
                optionsSets: [
                    'deepleo',
                    'nlu_direct_response_filter',
                    'disable_emoji_spoken_text',
                    'responsible_ai_policy_235',
                    'enablemm',
                    'dtappid',
                    'rai253',
                    'dv3sugg',
                    styleOption
                ],
                allowedMessageTypes: ['Chat', 'InternalSearchQuery'],
                isStartOfSession: conversation.invocationId === 0,
                message: {
                    author: 'user',
                    inputMethod: 'Keyboard',
                    text: message,
                    messageType: 'Chat'
                },
                conversationId: conversation.conversationId,
                conversationSignature: conversation.conversationSignature,
                participant: { id: conversation.clientId }
            }],
            invocationId: conversation.invocationId.toString(),
            target: 'chat',
            type: 4
        }
    }

    async doSendMessage(params) {
        if (!this.conversationContext) {
            const { success, info } = await this.init();
            if (success == false) {
                params.onEvent({ type: 'ERROR', data: info })
            }
        }

        // style 传参进来
        if (params.style) {
            //creative balanced precise
            this.updateStyleOption(params.style)
        }

        const conversation = this.conversationContext

        const wsp = new WebSocketAsPromised(
            'wss://sydney.bing.com/sydney/ChatHub', {
                packMessage: websocketUtils.packMessage,
                unpackMessage: websocketUtils.unpackMessage
            }
        )

        wsp.onUnpackedMessage.addListener(events => {
            for (const event of events) {
                if (JSON.stringify(event) === '{}') {
                    try {
                        wsp.sendPacked({ type: 6 })
                        wsp.sendPacked(this.buildChatRequest(conversation, params.prompt))
                        conversation.invocationId += 1
                        params.onEvent({ type: 'BUILD_CHAT_REQUEST', data: { event } })
                    } catch (error) {
                        params.onEvent({ type: 'ERROR', data: 'BUILD_CHAT_REQUEST fail' })
                    }

                } else if (event.type === 6) {
                    wsp.sendPacked({ type: 6 })
                } else if (event.type === 3) {
                    params.onEvent({ type: 'DONE', data: { event } })
                    wsp.removeAllListeners()
                    wsp.close()
                } else if (event.type === 1) {

                    const text = this.convertMessageToMarkdown(
                        event.arguments && event.arguments[0] && event.arguments[0].messages ? event.arguments[0].messages[0] : '')
                    params.onEvent({ type: 'UPDATE_ANSWER', data: { text, event } })
                } else if (event.type === 2) {
                    const messages = event.item.messages;
                    if (messages) {
                        const limited = messages.some(
                            message => message.contentOrigin === 'TurnLimiter'
                        )
                        if (limited) {
                            params.onEvent({
                                type: 'ERROR',
                                data: 'Sorry, you have reached chat turns limit in this conversation.'
                            })
                        }
                    } else if (event.item.result && event.item.result.error == "UnauthorizedRequest") {
                        params.onEvent({
                            type: 'ERROR',
                            data: 'UnauthorizedRequest'
                        })
                    }

                    console.log(' messages.some', event)

                }
            }
        })

        wsp.onClose.addListener(() => {
            params.onEvent({ type: 'DONE' })
        })

        params.signal.addEventListener('abort', () => {
            wsp.removeAllListeners()
            wsp.close()
        })

        await wsp.open()
        wsp.sendPacked({ protocol: 'json', version: 1 })
    }

    stop() {
        try {
            this.controller.abort();
            // console.log('bing bot stop')
        } catch (error) {
            console.log('bing bot stop', error)
        }
    }

    resetConversation() {
        this.conversationContext = undefined
        this.available = null;
    }

    // 确保输入prompt是string
    async doSendMessageForBg(prompt, style, callback) {
        if (typeof(prompt) == 'object') prompt = JSON.stringify(prompt);
        // 支持传style
        if (!style) style = this.conversationStyle;
        style = style.toLowerCase();

        let id = v4();

        const controller = new AbortController();
        const signal = controller.signal;
        // controller.abort();
        this.controller = controller;

        try {
            this.doSendMessage({
                prompt: prompt,
                style,
                signal,
                onEvent: async d => {
                    let nd = {...d, id, prompt };

                    callback(d.type != 'ERROR', {
                        type: 'ws',
                        data: nd
                    })
                }
            })
        } catch (error) {
            callback(false, error)
        }
    }

}

export default NewBing