/**
 * background
 */

import { chromeStorageSet } from '@components/Utils'

/**
 *
 * @param {*} url
 * @param {*} query
 * @param {*} combo  从面板传来的combo数据,用于继续在新的页面运行
 */
const executeScript = (url, query, combo) => {
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

                    setTimeout(
                        () =>
                        chrome.scripting.executeScript({
                            target: { tabId: agentsTabId },
                            function: getTextByQuery,
                            args: [query, combo]
                        }),
                        10000
                    )
                })
        }, 200);
    })


}

export default {
    executeScript
}