import { Md5 } from 'ts-md5'


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
        chrome.storage.local.set(json).then(() => res())
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
// const { databaseId, blockId, reader, fullscreen, userInput, from } = parseUrl();
const getConfigFromUrl = () => {
    const { databaseId, blockId, reader, fullscreen, userInput, from, agents } = parseUrl();
    return { databaseId, blockId, reader, fullscreen, userInput, from, agents }
}

const getConfig = async () => {
    try {
        let json: any = await fetch(chrome.runtime.getURL('public/config.json'));
        json = await json.json();
        return json;
    } catch (error) {

    }

}

export {
    chromeStorageGet,
    chromeStorageSet,
    chromeStorageSyncGet,
    chromeStorageSyncSet,
    md5,
    parseUrl,
    getConfig,
    getConfigFromUrl
}