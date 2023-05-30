import React from "react";
import { createRoot } from "react-dom/client";
import { message } from 'antd';
import { getConfig, chromeStorageGet, chromeStorageSet } from "@components/Utils"
import Flow from '@components/flow/index'
import Main from "@pages/content/Main";

declare const window: Window &
  typeof globalThis & {
    _brainwave_import: any,
    _brainwave_get_current_node_for_workflow: any,
    _brainwave_get_workflow_data: any,
    _brainwave_save_callback: any,
    _brainwave_save_callback_init: any,
    _brainwave_debug_callback: any
  }

const config = getConfig();


// 保存combo
function saveCombos(combos: any = []) {
  chromeStorageGet(['user']).then((items: any) => {
    let newUser: any = []
    if (items && items.user) {
      newUser = [...items.user]
    }
    for (const n of combos) {
      let isNew = true;
      if (newUser.filter((u: any) => u.id == n.id).length > 0) isNew = false;
      if (isNew) {
        newUser.push(n);
      }
      ;
    }
    chromeStorageSet({ 'user': newUser });
    message.info('已保存');
  });
}




function newtab() {

  const [debugData, setDebugData] = React.useState({});
  const [flowWidth, setFlowWidth] = React.useState('100%');

  if (typeof (window) !== 'undefined') {
    var timer = setTimeout(function () {
      window._brainwave_save_callback_init();
      window._brainwave_save_callback = () => {
        window._brainwave_get_workflow_data().then((combo: any) => {
          saveCombos([combo])
        })
      };
      window._brainwave_debug_callback = () => {
        const combo = window._brainwave_get_current_node_for_workflow();
        const d = {
          '_combo': combo,
          from: 'brainwave',
          prompt: combo.prompt,
          tag: combo.tag,
          newTalk: true,
          autoRun: true,
          id: (new Date()).getTime()
        }
        setDebugData(d)
      }
    }, 1500);
  }

  const chatbotCallbacks = (event: any) => {
    const { cmd, data } = event;
    if (cmd == 'open-insight') {
      setFlowWidth('calc(100% - 500px)')
    } else if (cmd == "close-insight") {
      setFlowWidth('100%')
    }
  }

  return (<div style={{
    width: flowWidth, height: '100%'
  }}>
    <Flow />
    <Main
      className="_agi_ui"
      appName={config.app}
      // 代理器
      agents={false}
      // 阅读模式
      readability={false}
      // 是否全屏
      fullscreen={false}
      // 默认传参
      userInput={{
        prompt: '',
        tag: ''
      }}
      // 默认是否开启
      initIsOpen={false}
      // 初始引擎
      initChatBotType={
        'ChatGPT'
      }
      debug={debugData}
      callback={(e: any) => chatbotCallbacks(e)}
    />
  </div>)
}

async function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find page root element");
  const root = createRoot(rootContainer);
  const renderRoot = () => {
    const page = React.createElement(newtab, {});
    root.render(page);
  };
  renderRoot()
}

init();

