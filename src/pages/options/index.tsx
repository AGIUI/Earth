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
      } else {
        // 替换
        newUser = Array.from(newUser, (u: any) => {
          if (u.id == n.id) {
            u = { ...n }
          }
          return u
        })
      }
      ;
    }
    chromeStorageSet({ 'user': newUser });
    message.info('已保存');
  });
}




function options() {

  const [debugData, setDebugData] = React.useState({});
  const [flowWidth, setFlowWidth] = React.useState('calc(100% - 500px)');

  const [loadData, setLoadData] = React.useState({});
  const [isNew, setIsNew] = React.useState(true);


  chrome.storage.local.onChanged.addListener((changes) => {
    // console.log('changes')
    if (changes['_brainwave_import'] && changes['_brainwave_import'].newValue) {
      // if (window._brainwave_import) window._brainwave_import(changes['_brainwave_import'].newValue)
      const { isNew, data } = changes['_brainwave_import'].newValue;
      if (data) setLoadData(data)
      if (isNew) setIsNew(!!isNew)
      chromeStorageSet({
        '_brainwave_import': {}
      })

    }
  });

  chromeStorageGet('_brainwave_import').then((res: any) => {
    if (res['_brainwave_import']) {
      const { data, isNew } = res['_brainwave_import'];
      // console.log('chromeStorageGet',data, isNew)
      if (!isNew && data) {
        setLoadData(data);
      }
      setIsNew(!!isNew)
      chromeStorageSet({
        '_brainwave_import': {}
      })
      // console.log('_brainwave_import', data)

    }
  })

  if (typeof (window) !== 'undefined') {
    var timer = setTimeout(function () {
      window._brainwave_save_callback_init();
      window._brainwave_save_callback = () => {
        window._brainwave_get_workflow_data().then((combo: any) => {
          saveCombos([combo])
        })
      };
      window._brainwave_debug_callback = () => {

        // chrome.runtime.sendMessage({
        //   cmd: 'open-insight'
        // }, res => console.log('open-insight', res))
        setTimeout(() => {
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
        }, 500)

      }
    }, 1000);
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
    <Flow
      loadData={loadData}
      debug={{
        callback: (res:any) => {
          console.log('debug-callback-from-parent',res)
          setTimeout(() => {
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
          }, 500)
        },
        open: true
      }}
      isNew={isNew}
    />
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
      initIsOpen={true}
      // 初始引擎
      initChatBotType={
        'ChatGPT'
      }
      debug={true}
      debugData={debugData}
      callback={(e: any) => chatbotCallbacks(e)}
    />
  </div>)
}

async function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find page root element");
  const root = createRoot(rootContainer);
  const renderRoot = () => {
    const page = React.createElement(options, {});
    root.render(page);
  };
  renderRoot()
}

init();

