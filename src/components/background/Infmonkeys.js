import { createParser } from 'eventsource-parser'
import { v4 } from 'uuid'


/**
 * TODO 改造传参方式
init(params)
const {token, baseUrl, model, team}=params
 */

const createAPIUrl = hostName => {
  // https://mixlab.infmonkeys.com/api/llm/chat
  let url = ``
  if (hostName.match('infmonkeys')) {
    url = `${hostName}/api/llm/chat`
  }
  return url
}

/**
 * 修改适配infmonkeys的输入
 *  {
        model,
        messages: [{ role: 'user', content: 'hi' }],
        temperature: 0.6,
        stream: false
      }

      to 
      
      {
    "modelId": "644242d4eafc19ddac5715ff",
    "context": [
        "接下来我说你好，你就回复“好久不见”"
    ],
    "streamMode": false,
    "useHistoryContext": false,
    "text": "你好"
}
 */
const parseBody = data => {
  const { model, messages, temperature, stream } = data
  let content = Array.from(messages, m => m.content),
    text = content.pop()
  return {
    modelId: modelName2Id(model),
    context,
    streamMode: stream,
    useHistoryContext: true,
    text
  }
}

/**
 * 
 * team 
token 

 * @returns 
 */
async function postData (url = '', team, token, data = {}, signal) {
  const response = await fetch(url, {
    method: 'POST',
    signal: signal,
    headers: {
      'Content-Type': 'application/json',
      token,
      team
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  return response
}

function fetchStream (stream, callback) {
  const reader = stream.getReader()
  let charsReceived = 0

  // read() 返回了一个 promise
  // 当数据被接收时 resolve
  reader.read().then(function processText ({ done, value }) {
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

async function parseSSEResponse (resp, onMessage) {
  const parser = createParser(event => {
    // console.log(event)
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })

  if (!resp.ok) {
    let res = await resp.json().catch(() => ({}))
    console.log('chatgpt error', res)
    if (res.object == 'error') res = { error: { message: res.message } }
    onMessage(res)
    return
  }

  if (resp.body) {
    fetchStream(resp.body, chunk => {
      const str = new TextDecoder().decode(chunk)
      parser.feed(str)
    })
  }
}

// ChatGPT 3.5（模型 id：644242d4eafc19ddac5715ff）
// ChatGPT 4（模型 id：644242d4eafc19ddac571600）
// ChatGLM（模型 id：644242d4eafc19ddac5715fd）
// LLaMA 7B（模型 id: 644242d4eafc19ddac5715fe）

const modelNames = ['ChatGPT-3.5', 'ChatGPT-4', 'ChatGLM', 'LLaMA-7B']
function modelName2Id (modelName) {
  switch (modelName) {
    case 'ChatGPT-3.5':
      return '644242d4eafc19ddac5715ff'
    case 'ChatGPT-4':
      return '644242d4eafc19ddac571600'
    case 'ChatGLM':
      return '644242d4eafc19ddac5715fd'
    case 'LLaMA-7B':
      return '644242d4eafc19ddac5715fe'
    default:
      break
  }
}

export default class Infmonkeys {
  constructor () {
    this.type = 'Infmonkeys'
    this.conversationContext = { messages: [] }
    this.contextSize = 11
    this.baseUrl = createAPIUrl('https://mixlab.infmonkeys.com')
    this.models = modelNames
    this.available = null
    this.loadFromLocal()
  }

  loadFromLocal () {
    // const myConfig = { bingStyle, chatGPTAPI, chatGPTModel, chatGPTToken,infmonkeys }
    chrome.storage.local.get('myConfig').then(data => {
      if (data.myConfig && data.myConfig.infmonkeys) {
        const { team, token, model, api } = data.myConfig.infmonkeys
        this.token = token
        this.team = team
        this.model = model
        this.baseUrl = createAPIUrl(api)
      }
    })
  }

  buildMessages () {
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

  async getAvailable () {
    let res = {
      success: false,
      info: ''
    }

    if (!this.available) res = await this.init()
    if (this.available && this.available.success == false)
      res = await this.init()
    if (this.available && this.available.success) res = this.available
    return res
  }

  async init (params={}) {
    const {token, baseUrl, model, team}=params;
    this.resetConversation()
    if ((!token || !baseUrl) && this.available) {
      return this.available
    }

    baseUrl = baseUrl ? createAPIUrl(baseUrl) : this.baseUrl
    token = token || this.token
    model = model || this.model
    team = team || this.team

    this.token = token
    this.team = team
    this.baseUrl = baseUrl
    this.model = model
    this.available = null
    // console.log(v4())

    if (!token) {
      // console.log('OpenAI API key not set')
      return {
        success: false,
        info: 'Infmonkeys API key not set'
      }
    }
    // this.conversationContext = { messages: [{ role: 'user', content:'hi' }] }

    const resp = await postData(
      baseUrl,
      team,
      token,
      parseBody({
        model,
        messages: [{ role: 'user', content: 'hi' }],
        temperature: 0.6,
        stream: false
      })
    )
    let res = await resp.json()

    console.log('init ', res, res.error && res.error.message ? false : true);

    this.available = {
      success: res.error && res.error.message ? false : true,
      info: res.error ? res.error.message : '',
      data: res,
      style: 0.6,
      temperature: 0.6
    }
    return this.available
  
  }

  stop () {
    try {
      this.controller.abort()
      console.log('chatgpt bot stop')
    } catch (error) {
      console.log('chatgpt bot stop', error)
    }
  }

  resetConversation () {
    this.conversationContext = null
  }

  async doSendMessageForBg (prompt, temperature, callback) {
    // 支持传style
    if (!temperature) temperature = 0.6
    // style = style.toLowerCase();

    let id = v4()
    try {
      this.doSendMessage({
        prompt: prompt,
        temperature,
        onEvent: async d => {
          let nd = { ...d, id, prompt }
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

  async doSendMessage (params) {
    let token = params.token || this.token,team=params.team||this.team;
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
      team,
      token,
      parseBody({
        model: params.model || this.model,
        messages: this.buildMessages(),
        temperature: params.temperature || 0.6,
        stream: true
      }),
      signal
    )

    const result = { role: 'assistant', content: '' }
    // console.log('params.stream', resp);
    await parseSSEResponse(resp, message => {
      console.log('parseSSEResponse', message)
      let isDone = false
      if (message === '[DONE]') {
        isDone = true
      }

      let data
      try {
        data = JSON.parse(message)
      } catch (err) {
        params.onEvent({ type: 'ERROR', data: `message error` })
        return
      }

      // azure done
      if (
        data &&
        data.choices &&
        data.choices.filter(c => c.finish_reason == 'stop').length > 0
      ) {
        isDone = true
      }

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
