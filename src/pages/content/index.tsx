import { createRoot } from "react-dom/client";
import Main from "@src/components/ChatbotMain";
import { getConfigFromUrl, getConfig } from "@components/Utils"

let json: any = getConfig() || {};
let id = json.app + "_dom";
const rootContainer = document.createElement('div');
rootContainer.id = id;

const chatbotCallbacks = (event: any) => {
  const { cmd, data } = event;
  // console.log(event)
  if (cmd == 'open-chatbot-panel') {
    init()
  } else if (cmd == "close-insight") {

  }
}

async function init() {
  // from Bing,ChatGPT 初始化对话框 采用哪个引擎
  const { reader, fullscreen, userInput, from, agents } = getConfigFromUrl();

  let dom = document.body;

  // 只运行一次
  let h = dom.querySelector('#' + id);
  if (h && h.children.length > 0) return

  const root = createRoot(rootContainer);
  root.render(
    <Main
      className="_agi_ui"
      appName={json.app}
      // 代理器
      agents={agents === "1"}

      // 阅读模式
      readability={readerHack(!!reader)}
      // 是否全屏
      fullscreen={fullscreen === "1"}
      // 默认传参
      userInput={{
        prompt: decodeURI(userInput || ''),
        tag: decodeURI(userInput || '')
      }}
      // 默认是否开启
      initIsOpen={!!(reader || userInput)}
      // 初始引擎
      initChatBotType={
        from
      }

      debug={false}
      debugData={{}}
      callback={(e: any) => chatbotCallbacks(e)}
    />
  );

  dom.appendChild(rootContainer);
  addCss();

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
    z-index: 99999997 !important;
    width: auto !important;
    font-family: fantasy!important;
    letter-spacing: 1px!important;
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

._agi_ui h1,h2{
  margin: 12px 0;
  font-weight: 800;
  color: black;
}
._agi_ui p,li{
  margin: 6px 0;
  color: black;
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
    width: 200px;
    height: fit-content;
}
._agi_ui .logo{
    width: 34px!important;
    height: fit-content!important;
}
  .ant-select-dropdown-placement-bottomLeft{
    z-index: 99999999 !important;
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
  `
  dom.appendChild(s);

}

// 如果是
function readerHack(reader: boolean) {
  if (window.location.hostname.match('producthunt.com')) return false
  return reader
}

// document.addEventListener('readystatechange', (e) => {
//   if (document.readyState == 'interactive') {
//     console.log(document.readyState)
//     init()
//   }
// });
window.onfocus = function (e) {
  console.log('window.onfocus')
  if (document.readyState == 'complete') {
    console.log('激活状态！')
    // bing 搜索有bug，会被直接清掉
    init()
  }
}

// 部分网站body下面的元素是动态植入的，需要在dom加载完后再注入，不然会被清除掉
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded")
  init()
});
