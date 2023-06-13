import { createRoot } from "react-dom/client";
import Main from "@src/components/ChatbotMain";
import { getConfigFromUrl, getConfig, addCss } from "@components/Utils"

// import i18n from 'i18next';
import '@src/locales/i18nConfig'


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
