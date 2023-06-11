/**
 * background
 */

import { chromeStorageSet } from '@components/Utils'

async function base(combo) {
    const markdown = '打开网页'
    const data = {
        markdown,
        combo
    }
    chrome.storage.local.set({ 'run-agents-result': data })
    return data
}

// getTextByQuery
async function getTextByQuery(query, combo) {
    const doms = document.querySelectorAll(query)
    if (doms && doms.length == 0) {
        setTimeout(() => getTextByQuery(query, combo), 5000)
        return
    }

    const markdown = Array.from(doms, t => t.innerText).join('\n')
    const data = {
        markdown,
        query,
        combo
    }
    chrome.storage.local.set({ 'run-agents-result': data })
    return data
}


// 知识星球自动发内容 https://wx.zsxq.com/dweb2/index/group/481225281248
async function postTopicForZsxq(text, combo) {
    const sleep = (t = 1000) => {
        return new Promise((res, rej) => {
            setTimeout(() => res(), t)
        })
    }
    let success = true;
    try {
        const h = document.querySelector('.post-topic-head');
        h.click();
        await sleep(1000)
        const inp = document.querySelector('.ql-editor');
        inp.innerText = text;
        await sleep(1000)
        const btn = document.querySelector('.submit-btn');
        btn.click()
    } catch (error) {
        success = false;
    }

    const data = {
        markdown: success ? '[知识星球发内容] 任务完成' : '任务失败，请重试',
        text,
        combo
    }
    chrome.storage.local.set({ 'run-agents-result': data })
    return data
}


function run(tabId, data, combo) {
    let { query, text, type, delay } = data;
    delay = delay || 10000
    let code = { target: { tabId }, };

    if (type == 'queryDefault') {
        code = {
            ...code,
            function: base,
            args: [combo]
        }
    };

    if (type == 'send-to-zsxq') {
        code = {
            ...code,
            function: postTopicForZsxq,
            args: [text, combo]
        }
    }

    if (code) setTimeout(
        () =>
        chrome.scripting.executeScript(code),
        delay
    )
}


/**
 *
 * @param {*} url
 * @param {*} data={ query, text,type }
 * @param {*} combo  从面板传来的combo数据,用于继续在新的页面运行
 */
const executeScript = (url, data = {}, combo) => {
    if (!url) return
    chromeStorageSet({ 'run-agents-result': null })

    url = url + (url.includes('?') ? '&ref=mix' : (url.endsWith('/') ? '?ref=mix' : '/?ref=mix'))
    url = url + (url.includes('?') ? '&' : '/?') + 'agents=1&reader=1';

    chrome.tabs.query({ url, active: true }).then(tabs => {
        // 仅保持一个代理网页
        for (const tab of tabs) {
            chrome.tabs.remove(tab.id)
        };
        setTimeout(() => {
            chrome.tabs
                .create({ url })
                .then(tab => {
                    run(tab.id, data, combo)
                })
        }, 200);
    })
}

export default {
    executeScript
}