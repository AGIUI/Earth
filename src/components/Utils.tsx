import { Md5 } from 'ts-md5'
const hash = require('object-hash');
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

function chromeStorageClear(){
    return chrome.storage.local.clear()
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

function hashJson(json: any) {
    return hash(json)
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



function addCss() {
    let dom = document.body;
    // ant的bug z-index修正
    const s = document.createElement('style');
    s.innerHTML = `
    ._agi_ui{
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 2147483002 !important;
      width: auto !important;
      font-family: fantasy!important;
      letter-spacing: 1px!important;
      color: black;
    }
   .ant-card{
      background-color: white;
    }
  
   .ant-btn{
      background-color: white;
    }
  
    .ant-btn:hover{
      background-color: white;
      opacity: 0.8;
    }
  
   .ant-btn-primary{
      background-color:rgb(22, 119, 255) !important;
      color:white;
    }
  
  .ant-btn-primary:hover{
    background-color:rgb(22, 119, 255) !important;
    opacity: 0.8;
  }
  
  .ant-btn-primary span{
    color:white;
  }
  
  ._agi_ui h1,h2{
    margin: 12px 0;
    font-weight: 800;
    color: inherit;
  }
  ._agi_ui p,li{
    margin: 6px 0;
    color: inherit;
  }

   ._agi_ui dl, ol, ul{
    margin:0;
   }

  ._agi_ui .logo{
    width: 34px!important;
    height: fit-content!important;
  }
  
  .chatbot-text-bubble p{
      margin: 8px 4px!important;
      line-height: 24px!important; 
  }
   .chatbot-role-card{
      background: black;
      color: white!important;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 300;
   }
   .chatbot-suggest span{
      color: white!important;
  }
  
   .chatbot-error{
  }
   .chatbot-text-bubble-user{
    background: #d8e7fd!important;
  }
   .chatbot-talks img{
    width: 180px;
    height: fit-content;
  
    cursor: pointer;
  }
  
  .chatbot-text-bubble-images{
    display: flex;
    flex-wrap: wrap;
  }

    .ant-select-dropdown-placement-bottomLeft{
      z-index:2147483003 !important;
    }
    .ant-image-preview-mask{
        z-index: 120000000000000!important
    }
    .ant-image-preview-wrap{
        z-index: 9999999999!important
    }
    .ant-input-affix-wrapper::before {
      width: 0;
      content: "" !important;
    }
    
    .ant-card-body::-webkit-scrollbar{
        width:2px;
      }
    .ant-card-body::-webkit-scrollbar-track{
        border-radius:25px;
        -webkit-box-shadow:inset 0 0 5px rgba(255,255,255, 0.5);
        background:rgba(255,255,255, 0.5);
      }
    .ant-card-body::-webkit-scrollbar-thumb{
        border-radius:15px;
        -webkit-box-shadow:inset 0 0 5px rgba(0, 0,0, 0.2);
        background:rgba(0, 0,0, 0.2);
      }
    .chatbot-talk-card-task{
      margin: 0px!important;
    }
    .chatbot-talk-card-task .ant-card{
      margin: 0!important;
    }
    .chatbot-talk-card-task .ant-card-body{
      padding: 0 10px!important;
    }
    .chatbot-text-bubble-task{
      background: #d9d9d9!important;
      width: fit-content!important;
      padding:4px 10px!important;
    }
    .ant-dropdown{
        z-index: 2147483004;
    }
    `
    dom.appendChild(s);

}

function getNowDate() {
    let d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}


export {
    chromeStorageGet,
    chromeStorageSet,
    chromeStorageClear,
    chromeStorageSyncGet,
    chromeStorageSyncSet,
    md5, hashJson,
    parseUrl,
    getConfig,
    getConfigFromUrl,
    textSplitByLength,
    sendMessageCanRetry,
    checkImageUrl,
    addCss,
    getNowDate
}