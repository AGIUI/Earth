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
    const { reader, fullscreen, userInput, from, agents } = parseUrl();
    return { reader, fullscreen, userInput, from, agents }
}

const getConfig = async () => {
    try {
        let json: any = await fetch(chrome.runtime.getURL('public/config.json'));
        json = await json.json();
        return json;
    } catch (error) {

    }

}


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
    textSplitByLength
}