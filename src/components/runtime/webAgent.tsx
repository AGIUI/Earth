import { md5 } from '@components/Utils'
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
} from '@components/combo/Prompt'
import i18n from 'i18next';



function addHighlight(dom: any) {
    if (dom) dom.style.border = "1px solid yellow"
}


function inputByQueryBase(query: string, text: string) {
    const inp: any = document.querySelector(query);
    if (inp && text) {
        inp.innerText = text;
        inp.value = text;
        inp.focus()
        inp.select()
        document.execCommand("insertText", false, text)
        addHighlight(inp)
    }

}

function clickByQueryBase(query: string) {
    const dom: any = document.querySelector(query);
    if (dom) {
        dom.click();
        addHighlight(dom)
    }
}

export function QueryDefaultRun(queryObj: any, combo: any) {
    return new Promise((res, rej) => {
        let result = {}

        if (queryObj) {
            // 如果是query，则开始调用网页代理 ,&& 避免代理页面也发起了新的agent
            let {
                url, protocol, delay
            } = queryObj;

            if (delay === 0) delay = 1;


            if (url) {
                // 对url进行处理
                if (url && !url.match('//')) url = `${protocol}${url}`;

                const data = JSON.parse(JSON.stringify({
                    type: 'queryDefault',
                    url,
                    delay: delay || 2000,
                    combo: { ...combo } //用来传递combo数据
                }));
                // console.log('_queryDefaultRun', data)

                res({
                    from: '_queryDefaultRun',
                    url,
                    data
                })
            } else {
                // url没有填写
                let id = md5("_queryDefaultRun" + (new Date()))
                setTimeout(() => {
                    res({
                        from: '_queryDefaultRun',
                        id: id + 'r',
                        text: '延时' + delay + '毫秒',
                        delay
                    })
                }, delay);
            }

        }

    })

}

export function QueryInputRun(prompt: any, delay = 1000) {
    return new Promise((res, rej) => {
        let text: any = prompt.context || '',
            query = prompt.queryObj.query;
        setTimeout(() => {
            // 当前页面
            inputByQueryBase(query, text)
            const id = md5(query + text + (new Date()))
            res({
                from: '_queryInputRun',
                id,
                text: '文本输入:' + text
            })
        }, delay)
    })
}

export function QueryClickRun(prompt: any, delay = 1000) {
    return new Promise((res, rej) => {
        let query = prompt.queryObj.query;
        // 当前页面
        setTimeout(() => {
            clickByQueryBase(query)
            const id = md5(query + (new Date()));

            res({
                from: '_queryClickRun',
                id,
                text: '模拟点击'
            })

        }, delay)
    })

}

export function QueryReadRun(queryObj: any) {
    return new Promise((res, rej) => {
        const { content, query, url, protocol } = queryObj;
        // console.log('_queryReadRun', queryObj)
        let prompt = {};
        if (content == 'bindCurrentPage') {
            // 绑定全文
            prompt = promptBindCurrentSite('', 'text', query)
        } else if (content == 'bindCurrentPageHTML') {
            // 绑定网页
            prompt = promptBindCurrentSite('', 'html', query)
        } else if (content == 'bindCurrentPageURL') {
            // 绑定url
            prompt = promptBindCurrentSite('', 'url', query)
        } else if (content == 'bindCurrentPageImages') {
            prompt = promptBindCurrentSite('', 'images', query)
        } else if (content == "bindCurrentPageTitle") {
            prompt = promptBindCurrentSite('', 'title', query)
        }

        const { id, system, user } = promptParse(prompt);

        // 折叠的样式实现 
        const markdown = `<details>
        <summary>${i18n.t("queryReadRunResult")}</summary>
        <p>${user.content}</p>
    </details>`;
        
        setTimeout(() => res({
            from: '_queryReadRun',
            id: id + 'r',
            markdown,
            data: {
                content,
                query,
                protocol,
                url
            }
        }), 500);
    })

}

// then(res => {
//     const data = Talks.createTaskStatus(
//         '_queryScrollRun',
//         id,
//         '模拟滚动'
//     )
//     this._updateChatBotTalksResult([data]);
// })

