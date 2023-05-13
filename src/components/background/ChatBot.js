// 通用的chatbot入口
// TODO ： 逐步支持 bing、gpt4、chatgpt等；
// 提供了初始化、结果回调、缓存机制
import * as _ from 'lodash'

import { md5 } from "@components/Utils"

import {
    chromeStorageGet,
    chromeStorageSet,
} from "@components/Utils"


class ChatBotBackground {
    constructor(opts) {
        this.items = opts.items
            /*available 用来存储初始化是否成功的信息,和styles信息
            {type,available,doSendMessage,init}
            */

        // 可被调用的机器人清单
        this.updateCurrent()

        this.keyPrefix = `mixprompt_`

        this.currentType = ''
        this.talksRecord = []
    }

    getList() {
        return { list: this.list, currentType: this.currentType }
    }

    //   增加机器人
    add(item) {
        this.items.push(item)
        this.updateCurrent()
            // this.init(this.currentType)
    }

    updateCurrent() {
        this.list = Array.from(this.items, item => item.type)
        this.currentType = this.list[0]
        return this.currentType
    }

    devInit() {
        this.available = {
            styles: [
                { en: 'Creative', zh: '创造力', value: 'Creative', label: 'Creative' },
                { en: 'Balanced', zh: '平衡', value: 'Balanced', label: 'Balanced' },
                { en: 'Precise', zh: '严谨', value: 'Precise', label: 'Precise' }
            ]
        }
        return this.available
    }

    // 初始化
    async init(type, params) {
        const { token, api, model, team } = params;
        // if (this.dev) return this.devInit()
        if (this.items) {
            let item = this.items.filter(item => item.type == type)[0]
            return await item.init(token, api, model)
        }
        return
    }

    async getAvailables() {
        let res = []
        for (const n of this.getList()['list']) {
            let a = await this.getAvailable(n)
                // console.log('getAvailables', a)
            res.push(a)
        }
        res = res.filter(r => r && r.type)

        chrome.storage.sync.set({
                chatBotAvailables: res
            })
            // console.log('getAvailables', res)
        return res
    }

    createKeyIdForInit(type, params = {}) {
        let id = md5(`chatBotAvailable_${type}`)
        return id
    }

    saveInit(type, available) {
        let chatBotAvailable = { type, available, time: new Date().getTime() }
        if (available) {
            let json = {}
            let id = this.createKeyIdForInit(type, available || {})
            json[id] = chatBotAvailable
            chrome.storage.sync.set(json)
                // _.throttle(() => chrome.storage.sync.set(json), 3000)
            return chatBotAvailable
        }
        return chatBotAvailable
    }

    getInit(type) {
        return new Promise((res, rej) => {
            let id = this.createKeyIdForInit(type, {})
            chrome.storage.sync.get(id).then(data => {
                let chatBotAvailable = data[id]
                    //60*60s 24h缓存
                    // console.log(chatBotAvailable,
                    //     chatBotAvailable.available,
                    //     (new Date()).getTime() - chatBotAvailable.time,
                    //     60 * 1000)

                if (
                    chatBotAvailable &&
                    chatBotAvailable.available && chatBotAvailable.available.success &&
                    new Date().getTime() - chatBotAvailable.time < 24 * 60 * 60 * 1000
                ) {
                    res(chatBotAvailable)
                }
                res()
            })
        })
    }

    //   是否可用
    async getAvailable(type) {
        this.currentType = type

        let chatBotAvailable = await this.getInit(type)

        if (chatBotAvailable) {
            return chatBotAvailable
        }

        const available = await (async() => {
            // if (this.dev) return this.devInit();
            if (this.items) {
                // console.log(this.items, type)
                let item = this.items.filter(item => item.type == type)[0]
                return await item.getAvailable()
            }
        })()

        // console.log('getAvailable',type,this.items,available)
        if (available) {
            return this.saveInit(type, available)
        }
        return {
            type,
            available
        }
    }

    // 开始对话，start记录
    createNewTalks(type) {
        this.talksRecord = []
        this.currentType = type
    }

    getCurrentTalks() {
        return JSON.parse(JSON.stringify({
            talks: this.talksRecord,
            type: this.currentType
        }))
    }

    // 添加对话记录
    addTalks(item) {
        this.talksRecord.push(item)
        return this.talksRecord
    }

    // style ：bing的，chatgpt的
    // 开始对话，需要给一个start的记录
    // this.talksRecord=[];
    async doSendMessage(prompt, style, type, newTalk = false, callback) {
        let item = this.items.filter(item => item.type == type)[0]

        // 从缓存中读取
        if (!newTalk) {
            // TODO styles
            let res = await this.getChatBotByPrompt(prompt, style, type)
            if (res) {
                res.result._items = res._items
                callback(true, {
                    type: 'local',
                    data: res.result,
                    _data: res
                })
                return
            }
        }

        this.createNewTalks(type)
        item.doSendMessageForBg(prompt, style, async(...args) => {
            // callback(true, {
            //     type: 'ws',
            //     data: res
            //   })
            console.log('doSendMessageForBg', args)
            if (args[1].type == 'ws') {
                // 缓存下来
                let data = args[1].data
                    // 添加时间戳
                const createTime = new Date().getTime()
                data = {...data, createTime }

                // 成功
                if (args[0]) {
                    // 如果是 UPDATE_ANSWER
                    if (data.type == 'UPDATE_ANSWER' && this.talksRecord.length == 0) {
                        data.type = 'START'
                    }
                    // 如果是 DONE,&& args[1].data.data里没数据

                    // bing data.data.text == undefined ,chatgpt data.data
                    // console.log(data.type, data.data, this.talksRecord[this.talksRecord.length - 1])
                    if (data.type == 'DONE' && (!data.data || !(data.data && data.data.text))) {
                        data.data = this.talksRecord[this.talksRecord.length - 1];
                        // console.log(data.type, data.data)
                    }

                    // bing
                    if (data.data && data.data.event) {
                        // bing
                        const bingMore = this.parseDataForBing(data.data.event);
                        // console.log('bingMore', bingMore, data.data)
                        if (bingMore) {
                            data.data = {
                                text: data.data.text,
                                moreLinks: bingMore.moreLinks,
                                morePrompts: bingMore.morePrompts
                            }
                        }
                    }


                    // 先临时存储
                    this.addTalks(data.data)

                    if (data.type == 'DONE') {
                        // 只保存done的数据
                        await this.saveChatBotByPrompt(prompt, style, type, data)
                    }
                }


                // 更新，继续传递
                args[1].data = data

                // 也记录下
                args[1]._data = {
                    prompt,
                    style,
                    type,
                    data
                }
            }
            callback(...args)
        })
        return this.getCurrentTalks()
    }

    // 重设上下文
    reset(type) {
            let item = this.items.filter(item => item.type == type)[0]
            if (item) item.resetConversation()
        }
        // 停止
    stop(type) {
        let item = this.items.filter(item => item.type == type)[0]
        if (item) item.stop()
    }

    createKeyId(prompt, style, type) {
            return 'prompt_' + md5(`${this.keyPrefix}_${type}_${prompt}_${style}`)
        }
        // 获取本地保存的prompt结果
        // type 聊天机器人名称
        // style 聊天机器人:chatgpt 、bing

    async getChatBotByPrompt(prompt, style, type) {
            let key = this.createKeyId(prompt, style, type)
            let data = await chromeStorageGet(key)

            if (data && data[key]) {
                let items = []
                for (const id in data[key]) {
                    items.push(data[key][id])
                }
                items.sort((a, b) => b.createTime - a.createTime)

                items[0]._items = items

                // 返回最近的
                return items[0]
            }
            return
        }
        // 只有DONE才保留数据,保存prompt及结果到本地
    async saveChatBotByPrompt(prompt, style, type, result) {
        const id = result.id
        let key = this.createKeyId(prompt, style, type)
        let data = await chromeStorageGet(key)

        if (!data[key]) data[key] = {}
            // 储存
        data[key][id] = {
            id,
            prompt,
            style,
            type,
            result,
            createTime: result.createTime
        }

        console.log('saveChatBotByPrompt', data, result)
        try {
            await chromeStorageSet(data)
        } catch (error) {
            //TODO 提示： 存储容量超上限了
            console.log(error)
        }
    }

    parseDataForBing(event) {
        //把bing的相关推荐提取出来
        let sourceAttributions, suggestedResponses
        try {
            if (event && event.arguments && event.arguments[0]) {
                sourceAttributions = event.arguments[0].messages[0].sourceAttributions
                suggestedResponses = event.arguments[0].messages[0].suggestedResponses
            }
        } catch (error) {
            console.log(error)
        }

        /**
         * {text,url} {prompt,tag,from}
         */
        let moreLinks, morePrompts
        if (sourceAttributions && suggestedResponses) {
            // morelinks
            moreLinks = Array.from(sourceAttributions, s => {
                    return {
                        tag: s.providerDisplayName,
                        url: s.seeMoreUrl,
                        from: 'Bing'
                    }
                })
                // 更多提示词
            morePrompts = Array.from(suggestedResponses, s =>
                s.messageType == 'Suggestion' ? {
                    tag: s.text,
                    prompt: s.text,
                    from: 'Bing'
                } :
                null
            ).filter(f => f)
        }
        if (moreLinks && morePrompts) {
            return {
                moreLinks,
                morePrompts
            }
        }
    }

    // 转化数据结构
    parseData(data) {
        console.log('parseData', data)
            // 对话数据
            /**
             *    tId,
                  id: tId + 0,
                  markdown: result,
                  user:false,
                  type: suggest 、markdown、urls 、 error、done ,+ start
                  from:local、ws
             */
        let talks = [],
            morePrompts, moreLinks;

        if (data.data && data.data.type == 'DONE' && data.data.data && data.data.data.moreLinks) moreLinks = data.data.data.moreLinks;
        if (data.data && data.data.type == 'DONE' && data.data.data && data.data.data.morePrompts) morePrompts = data.data.data.morePrompts;
        console.log('morePrompts, moreLinks', morePrompts, moreLinks)

        if (data.type == 'local') {
            // console.log('本地获取到了缓存,需要添加新建对话的建议', data)

            let answer = data.data

            // 过滤掉无用的urls
            let urls = moreLinks ? moreLinks : [];

            let tId = answer.id
            talks.push({
                tId,
                id: tId + 0,
                markdown: answer.data.text,
                user: false,
                type: 'markdown',
                from: 'local',
                prompt: answer.prompt
            })

            if (urls && urls.length > 0)
                talks.push({
                    tId,
                    id: tId + 1,
                    urls,
                    user: false,
                    type: 'urls',
                    from: 'local'
                })

            if (morePrompts && morePrompts.length > 0) {
                talks.push({
                    tId,
                    id: tId + 2,
                    morePrompts,
                    user: false,
                    type: 'suggest',
                    from: 'local'
                })
            }
        } else if (data.type == 'ws') {
            data = data.data

            // 一次次展示
            let tId = data.id

            let urls = moreLinks ? moreLinks : [];

            if (data.type == 'START') {
                talks.push({
                    tId,
                    id: tId,
                    markdown: data.data ? data.data.text : '',
                    user: false,
                    type: 'start',
                    from: 'ws'
                })
            } else if (data.type == 'UPDATE_ANSWER') {
                talks.push({
                        tId,
                        id: tId,
                        markdown: data.data ? data.data.text : '',
                        user: false,
                        type: 'markdown',
                        from: 'ws'
                    })
                    // console.log(talks)
            } else if (data.type == 'DONE') {
                talks.push({
                    tId,
                    id: tId,
                    markdown: data.data ? data.data.text : '',
                    user: false,
                    type: 'done',
                    from: 'ws'
                })
            } else if (data.type == 'ERROR') {
                talks.push({
                    tId,
                    markdown: data.data,
                    user: false,
                    type: 'error',
                    from: 'ws'
                })
            };



            if (urls && urls.length > 0)
                talks.push({
                    tId,
                    id: tId + 1,
                    urls,
                    user: false,
                    type: 'urls',
                    from: 'ws'
                })

            if (morePrompts && morePrompts.length > 0) {
                talks.push({
                    tId,
                    id: tId + 2,
                    morePrompts,
                    user: false,
                    type: 'suggest',
                    from: 'ws'
                })
            }
        }
        // console.log(JSON.stringify(talks))
        return talks
    }
}

export default ChatBotBackground