import { Md5 } from 'ts-md5'
import app from '@src/config/app.json'

function chromeStorageGet(k: any) {
    return new Promise((res, rej) => {
        k = k || undefined
        chrome.storage.local.get(k, r => {
            res(r)
        })
    })
}

function chromeStorageSet(json: any) {
    return new Promise<void>((res, rej) => {
        chrome.storage.local.set(json).then(
            () => {
                chrome.runtime.sendMessage({
                    cmd: 'update-chromeStorage-data',
                })
                res();
            }
        )
    });
}


function chromeStorageSyncGet(k: any) {
    return new Promise((res, rej) => {
        k = k || undefined
        chrome.storage.sync.get(k, r => {
            res(r)
        })
    })
}

function chromeStorageSyncSet(json: any) {
    return new Promise<void>((res, rej) => {
        chrome.storage.sync.set(json).then(() => res())
    });
}

const sendMessageCanRetry = (cmd: any, data: any, erroCallback: any) => {
    let start = false, count = 0;
    const r = () => {
        chrome.runtime.sendMessage({
            cmd,
            data
        }, res => {
            console.log('status', res.status)
            start = true;
        })

        setTimeout(() => {
            const tryInfo = '出错了，重试ing'
            const info = "出错了，请重试"
            if (start === false) {
                console.log(tryInfo)
                if (erroCallback) erroCallback({
                    data,
                    info: tryInfo,
                    cmd
                })
                count++;
                if (count > 10) {
                    // message.info('出错了，请重试')
                    console.log(info)
                    if (erroCallback) erroCallback({
                        data,
                        info,
                        cmd
                    })
                } else {
                    //TODO 把上一条的对话输入，传过来
                    r();
                }
            }
        }, 2100)
    }
    r();
}

function checkImageUrl(url: string) {
    return new Promise((res, rej) => {
        const im = new Image()
        im.src = url
        im.onerror = () => res(false);
        im.onload = () => res(true);
    })
}

function md5(text: string) {
    return Md5.hashStr(text)
}


const parseUrl = () => {
    let paramsString = window.location.href.split('?')[1];
    let searchParams = new URLSearchParams(paramsString);
    let res: any = {};
    for (let p of searchParams) {
        res[p[0]] = p[1]
    }
    return res
}


// from Bing,ChatGPT 初始化对话框 采用哪个引擎
// const {  reader, fullscreen, userInput, from } = parseUrl();
const getConfigFromUrl = () => {
    const { reader, fullscreen, userInput, from, agents, databaseId, blockId } = parseUrl();
    return { reader, fullscreen, userInput, from, agents, databaseId, blockId }
}

const getConfig = () => app


const textSplitByLength = (text: string, length: number) => {
    var tt = /\n/;
    var arr = [];
    var tmpstr = "";
    var ass = text.split('');
    if (text.length >= length) {
        for (var i = 0; i < ass.length; i++) {
            var curr = ass[i];
            if (curr != "") {
                tmpstr += curr;
                if (tt.test(curr)) {
                    arr.push(tmpstr);
                    tmpstr = "";
                }
                if (tmpstr.length >= length) {
                    arr.push(tmpstr);
                    tmpstr = "";
                } else if (i == ass.length - 1) {
                    arr.push(tmpstr);
                    tmpstr = "";
                }
            }
        }
    } else {
        for (var i = 0; i < ass.length; i++) {
            var curr = ass[i];
            if (curr != "") {
                tmpstr += curr;
                if (tt.test(curr)) {
                    arr.push(tmpstr);
                    tmpstr = "";
                }
                if (tmpstr.length >= length) {
                    arr.push(tmpstr);
                    tmpstr = "";
                } else if (i == ass.length - 1) {
                    arr.push(tmpstr);
                    tmpstr = "";
                }
            }
        }
    }
    return arr;
}

export {
    chromeStorageGet,
    chromeStorageSet,
    chromeStorageSyncGet,
    chromeStorageSyncSet,
    md5,
    parseUrl,
    getConfig,
    getConfigFromUrl,
    textSplitByLength,
    sendMessageCanRetry,
    checkImageUrl
}