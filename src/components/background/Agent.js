/**
 * background
 */

import { chromeStorageSet } from '@components/Utils'

/**
 *
 * @param {*} url
 * @param {*} data={ query, text,type }
 * @param {*} combo  从面板传来的combo数据,用于继续在新的页面运行
 */
const executeScript = (url, data = {}, combo) => {
    const { query, text, type } = data;
    chromeStorageSet({ 'run-agents-result': null })

    const targetUrl = url + (url.match('/?') ? '&' : '?') + 'agents=1&reader=1';

    chrome.tabs.query({ url: targetUrl }).then(tabs => {
        // 仅保持一个代理网页
        for (const tab of tabs) {
            chrome.tabs.remove(tab.id)
        };
        setTimeout(() => {
            chrome.tabs
                .create({
                    url: targetUrl
                })
                .then(res => {
                    const agentsTabId = res.id
                        // setTimeout(() => chrome.tabs.remove(res.id), 6000)
                        // console.log(combo)

                    /** comboData 里的 query  */
                    async function getTextByQuery(query, combo) {
                        // console.log(`getTextByQuery`)
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

                    /**
                     * 
                     */
                    // 知识星球自动发内容 https://wx.zsxq.com/dweb2/index/group/481225281248
                    async function postTopicForZsxq(text, combo) {
                        const sleep = (t = 1000) => {
                            return new Promise((res, rej) => {
                                setTimeout(() => res(), t)
                            })
                        }
                        const h = document.querySelector('.post-topic-head');
                        h.click();
                        await sleep(1000)
                        const inp = document.querySelector('.ql-editor');
                        inp.innerText = text;
                        await sleep(1000)
                        const btn = document.querySelector('.submit-btn');
                        btn.click()
                        const markdown = 'done'
                        const data = {
                            markdown,
                            text,
                            combo
                        }
                        chrome.storage.local.set({ 'run-agents-result': data })
                        return data
                    }

                    let code = { target: { tabId: agentsTabId }, };
                    if (type == 'query') {
                        code = {
                            ...code,
                            function: getTextByQuery,
                            args: [query, combo]
                        }
                    } else if (type == 'send-to-zsxq') {
                        code = {
                            ...code,
                            function: postTopicForZsxq,
                            args: [text, combo]
                        }
                    }

                    if (code) setTimeout(
                        () =>
                        chrome.scripting.executeScript(code),
                        10000
                    )
                })
        }, 200);
    })


}

export default {
    executeScript
}