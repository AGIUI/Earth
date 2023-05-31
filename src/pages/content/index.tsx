import { createRoot } from "react-dom/client";
import Main from "@pages/content/Main";
import { getConfigFromUrl, getConfig } from "@components/Utils"
import styled from 'styled-components';

// user-select: none !important;
const Base: any = styled.div`
      font-family: fantasy!important;
      letter-spacing: 1px!important;
    & ._agi_ui{
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 99999998 !important;
      width: auto !important;
    }
  
  
    & .ant-card{
      background-color: white;
    }
    
    & .ant-btn{
      background-color: white;
      :hover{
        background-color: white;
        opacity: 0.8;
      }
    }
  
    & .ant-btn-primary{
      background-color:rgb(22, 119, 255) !important;
      color:white;
      :hover{
        background-color:rgb(22, 119, 255) !important;
        opacity: 0.8;
      }
    }
  
    & h1,h2{
      margin: 12px 0;
      font-weight: 800;
      color: black;
    }
    & p,li{
      margin: 6px 0;
      color: black;
    }
  
    & .chatbot-text-bubble p{
        margin: 8px 4px!important;
        line-height: 24px!important; 
    }
    //& .chatbot-suggest{
    //    background: rgb(22, 119, 255)!important;
    //    border: none!important;
    //    margin: 0px 12px 12px 0px!important;
    //    color: white!important;
    //    height: fit-content!important;
    //    :hover{
    //      background-color:rgb(22, 119, 255) !important;
    //      opacity: 0.8;
    //    }
    //}
    & .chatbot-suggest span{
        color: white!important;
    }
    & .chatbot-error{
    }
    & .chatbot-text-bubble-user{
      background: #d8e7fd!important;
    }
    & .chatbot-talks img{
        width: 200px;
        height: fit-content;
    }
    & .logo{
        width: 34px!important;
        height: fit-content!important;
    }
`



async function init() {

  let json: any = getConfig() || {};

  // from Bing,ChatGPT 初始化对话框 采用哪个引擎
  const { reader, fullscreen, userInput, from, agents } = getConfigFromUrl();

  let dom = document.body;

  // 只运行一次
  let id = json.app + "_dom";
  let h = dom.querySelector('#' + id);
  if (h && h.children.length > 0) return

  const rootContainer = document.createElement('div');
  const root = createRoot(rootContainer);
  rootContainer.id = id;
  // rootContainer.className = "_agi_ui"

  root.render(<Base>
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
      callback={(e: any) => console.log(e)}
    />
  </Base>
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
