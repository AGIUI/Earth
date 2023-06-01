import { createParser } from 'eventsource-parser'
import { v4 } from 'uuid'
// console.log(v4())
const roles = ['system', 'assistant', 'user']

import { chromeStorageGet, chromeStorageSet } from '@src/components/Utils';


//https://mixcopilot.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15-preview
//

const createAPIUrl = (hostName) => {
    let url = `${hostName}/v1/chat/completions`
    if (hostName.match('azure')) {
        url = `${hostName}/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15-preview`
    }
    return url
}

// const controller = new AbortController();
//         const signal = controller.signal;
//         controller.abort();

async function postData(url = '', token, data = {}, signal) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST',
        signal: signal,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'api-key': token
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    return response
}

// async function* streamAsyncIterable(stream) {
//     const reader = stream.getReader()
//     try {
//         while (true) {
//             const { done, value } = await reader.read()
//             if (done) {
//                 return
//             }
//             yield value
//         }
//     } finally {
//         reader.releaseLock()
//     }
// }

function fetchStream(stream, callback) {
    const reader = stream.getReader()
    let charsReceived = 0

    // read() 返回了一个 promise
    // 当数据被接收时 resolve
    reader.read().then(function processText({ done, value }) {
        // Result 对象包含了两个属性：
        // done  - 当 stream 传完所有数据时则变成 true
        // value - 数据片段。当 done 为 true 时始终为 undefined
        if (done) {
            console.log('Stream complete', value)
                // para.textContent = value;
            return
        }
        // value for fetch streams is a Uint8Array
        charsReceived += value.length
        const chunk = value
            // let listItem = document.createElement('li');
            // listItem.textContent = 'Received ' + charsReceived + ' characters so far. Current chunk = ' + chunk;
            // list2.appendChild(listItem);

        if (callback) callback(chunk)

        // 再次调用这个函数以读取更多数据
        return reader.read().then(processText)
    })
}

async function parseSSEResponse(resp, onMessage) {
    const parser = createParser(event => {
        // console.log(event)
        if (event.type === 'event') {
            onMessage(event.data)
        }
    })

    if (!resp.ok) {
        let res = await resp.json().catch(() => ({}))
        console.log('chatgpt error', res)
        if (res.object == 'error') res = { "error": { "message": res.message } }
        onMessage(res)
        return
    }

    if (resp.body) {
        fetchStream(resp.body, chunk => {
                const str = new TextDecoder().decode(chunk)
                parser.feed(str)
            })
            // for await (const chunk of streamAsyncIterable(resp.body)) {
            //     const str = new TextDecoder().decode(chunk)
            //     parser.feed(str)
            // }
    }
}

export default class ChatGPT {
    constructor() {
        this.type = 'ChatGPT'
        this.conversationContext = { messages: [] }
        this.contextSize = 11
        this.baseUrl = createAPIUrl('https://api.openai.com')
        this.models = ['gpt-3.5-turbo']

        // { en: 'Creative', zh: '创造力',value:'Creative',label:'Creative' },
        // { en: 'Balanced', zh: '平衡' ,value:'Balanced',label:'Balanced'},
        // { en: 'Precise', zh: '严谨' ,value:'Precise',label:'Precise'}
        this.available = null
        this.loadFromLocal()
    }

    loadFromLocal() {
        chromeStorageGet('myConfig').then(data => {
            if (data.myConfig) {
                this.token = data.myConfig.token
                this.model = data.myConfig.model
                this.baseUrl = createAPIUrl(data.myConfig.api)
            }
        })
    }

    buildMessages() {
        const date = new Date().toISOString().split('T')[0]
        const systemMessage = {
            role: 'system',
            content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${date}`
        }
        return [
            systemMessage,
            ...this.conversationContext.messages.slice(-this.contextSize)
        ]
    }
    clearAvailable() {
        this.available = null;
    }
    async getAvailable() {
        let res = {
            success: false,
            info: ''
        }

        if (!this.available) res = await this.init()
        if (this.available && this.available.success == false) res = await this.init()
        if (this.available && this.available.success) res = this.available
        return res
    }

    async init(token, baseUrl, model = 'gpt-3.5-turbo') {
        this.resetConversation()
        if ((!token || !baseUrl) && this.available) {
            return this.available
        }


        baseUrl = baseUrl ? createAPIUrl(baseUrl) : this.baseUrl
        token = token || this.token
        model = model || this.model

        this.token = token
        this.baseUrl = baseUrl
        this.model = model
        this.available = null
            // console.log(v4())

        if (!this.token) {
            // console.log('OpenAI API key not set')
            return {
                success: false,
                info: 'ChatGPT API key not set'
            }
        }
        // this.conversationContext = { messages: [{ role: 'user', content:'hi' }] }

        const resp = await postData(baseUrl, token, {
            model: model,
            messages: [{ role: 'user', content: 'hi' + (new Date()).getTime() }],
            temperature: 0.6,
            stream: false
        })
        let res = await resp.json()
        console.log('init ', res, res.error && res.error.message ? false : true);

        let success = true;
        if (res.error && res.error.message) success = false;
        if (res.object == "error") success = false;
        if (res.statusCode == 401) success = false;

        let info = ''
        if (res.message) info = res.message;
        if (res.error && res.error.message) info = res.error.message;


        this.available = {
            success,
            info,
            data: res,
            style: 0.6,
            temperature: 0.6
        }

        return this.available
            // this.doSendMessageForBg('hi', (success, data) => {
            //     console.log('init - doSendMessageForBg:', success, data, this.available);
            //     if (success) {
            //         available.push(data);
            //         this.available = { prompt: 'hi', data: available };
            //         // console.log('DONE????',this.available,this.getAvailable())
            //         //    if(callback) callback(this.available);
            //     }
            // })
    }

    stop() {
        try {
            this.controller.abort()
            console.log('chatgpt bot stop')
        } catch (error) {
            console.log('chatgpt bot stop', error)
        }
    }

    resetConversation() {
        this.conversationContext = null
    }

    async doSendMessageForBg(prompt, temperature, callback) {
        // 支持传style
        if (!temperature) temperature = 0.6
            // style = style.toLowerCase();

        let id = v4()
        try {
            this.doSendMessage({
                prompt: prompt,
                temperature,
                onEvent: async d => {
                    let nd = {...d, id, prompt }
                    callback(nd.type != 'ERROR', {
                        type: 'ws',
                        data: nd
                    })
                }
            })
        } catch (error) {
            callback(false, error)
        }
    }

    async doSendMessage(params) {
        let token = params.token || this.token
        if (!token) {
            params.onEvent({ type: 'ERROR', data: 'ChatGPT API key not set' })
                // throw new Error('OpenAI API key not set')
            return
        }
        if (!this.conversationContext) {
            this.conversationContext = { messages: [] }
        }
        this.conversationContext.messages.push({
            role: 'user',
            content: params.prompt
        })

        const controller = new AbortController()
        const signal = controller.signal
            // controller.abort();
        this.controller = controller

        const resp = await postData(
            params.url || this.baseUrl,
            token, {
                model: params.model || this.model,
                messages: this.buildMessages(),
                temperature: params.temperature || 0.6,
                stream: true
            },
            signal
        )

        const result = { role: 'assistant', content: '' }
            // console.log('params.stream', resp);
        await parseSSEResponse(resp, message => {
            console.log('parseSSEResponse', message)
            let isDone = false;
            if (message === '[DONE]') {
                isDone = true;
            };

            let data
            try {
                data = JSON.parse(message)
            } catch (err) {
                let info = message ? message : `message error`;
                if (message.error && message.error.message) info = `${message.error.code} _ ${message.error.message}`;
                if (!isDone) params.onEvent({ type: 'ERROR', data: info })
                return
            }

            // azure done
            if (data && data.choices && data.choices.filter(c => c.finish_reason == 'stop').length > 0) {
                isDone = true;
            };

            if (isDone) {
                params.onEvent({ type: 'DONE' })
                return
            }


            if (data && data.choices && data.choices.length) {
                const delta = data.choices[0].delta
                    // TODO
                    // console.log('result api- ', data)
                if (delta && delta.content) {
                    result.content += delta.content
                    params.onEvent({
                        type: 'UPDATE_ANSWER',
                        data: { text: result.content }
                    })
                }
            } else {
                params.onEvent({
                    type: 'ERROR',
                    data: data.error ? data.error.message : ''
                })
                return
            }
        })
    }
}