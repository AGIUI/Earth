import { createRoot } from "react-dom/client";
import Main from "@pages/content/Main";
import { getConfigFromUrl, getConfig } from "@components/Utils"


async function init() {

  let json: any = await getConfig() || {};

  // from Bing,ChatGPT 初始化对话框 采用哪个引擎
  const {  reader, fullscreen, userInput, from, agents } = getConfigFromUrl();

  let dom = document.body;

  // 只运行一次
  let id = json.app + "_dom";
  let h = dom.querySelector('#' + id);
  if (h && h.children.length > 0) return

  const rootContainer = document.createElement('div');
  const root = createRoot(rootContainer);
  rootContainer.id = id;
  rootContainer.className="_agi_ui"

  root.render(<Main
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
  />
  );

 
  dom.appendChild(rootContainer);

}

// 如果是
function readerHack(reader: boolean) {
  if (window.location.hostname.match('producthunt.com')) return false
  return reader
}

document.addEventListener('readystatechange', (e) => {
  if (document.readyState == 'interactive') init()
});
// window.onfocus = function (e) {
//   console.log('window.onfocus')
//   if (document.readyState == 'complete') {
//     console.log('激活状态！')
//     // bing 搜索有bug，会被直接清掉
//     init()
//   }
// }
// document.addEventListener("DOMContentLoaded", init);
