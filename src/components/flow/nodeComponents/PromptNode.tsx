import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, Select, Radio, Slider, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { createDebug, selectNodeInput, createText, createSelect,createOutput,createModel } from './Base';


export type NodeData = {
  debugInput: any;
  debugOutput: any;
  getNodes: any;
  nodeInputId: string;
  debug: any;
  text: string,
  api: any,
  queryObj: any,
  temperature: number,
  model: string,
  input: string,
  output: string,
  type: string,
  opts: any,
  onChange: any,
  translate: any
};



const resources = {
  zh: {
    translation: {
      title: '提示工程',
      userInput: '指令',
      input: '输入',
      output: '输出',
      translate: '翻译',
      format: '-',

      getFromBefore: "从上一节点获取文本 ${text} ",

      debug: "调试",
      debugRun: '运行',
      inputText: '输入',
      inputTextPlaceholder: '',
      outputText: '输出',
      outputTextPlaceholder: '',
    },
  },
  en: {
    translation: {
      title: 'Prompt',
      userInput: 'UserInput',
      input: 'Input',
      output: 'Output',
      translate: 'Translate',
      format: '-',

      getFromBefore: "Get text from previous node ${text}",

      debug: "Debug",
      debugRun: 'Run',
      inputText: 'Input',
      inputTextPlaceholder: '',
      outputText: 'Output',
      outputTextPlaceholder: '',
    },
  },
};

const nodeStyle = {
  border: '1px solid transparent',
  padding: '2px 5px',
  borderRadius: '12px',
};

const createTextAndInput = (
  title: string,
  text: string,
  input: string,
  nodeOpts: any,
  selectNodeValue: string,
  onChange: any) => < div
    onMouseOver={() => {
      onChange({
        key: 'draggable',
        data: false
      })
    }}
    onMouseLeave={() => {
      onChange({
        key: 'draggable',
        data: true
      })
    }}
  >

    {
      createText('text', title, '', text, '', onChange)
    }

    {selectNodeInput(i18n.t('getFromBefore'), selectNodeValue, nodeOpts, onChange)}

  </div>;




const createTranslate = (title: string, key: string, value: string, opts: any, onChange: any) => {
  return <div
    onMouseOver={() => {
      onChange({
        key: 'draggable',
        data: false
      })
    }}
    onMouseLeave={() => {
      onChange({
        key: 'draggable',
        data: true
      })
    }}
  >
    {
      createSelect(title, value, opts, (e: any) => {
        onChange({
          key: key,
          data: e.data
        })
      })
    }

  </div>
}


function Main({ id, data, selected }: NodeProps<NodeData>) {

  // console.log('RoleNode', JSON.stringify(data, null, 2))
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
      lng: navigator.language,
      debug: false,
      interpolation: {
        escapeValue: false, // 不需要对翻译文本进行转义
      },
    });

  const contextMenus: MenuProps['items'] = [
    {
      label: i18n.t('debug'),
      key: 'debug',
    }
  ];

  // 模型
  const models = data.opts.models;
  const [model, setModel] = React.useState(data.model)
  const [temperature, setTemperature] = React.useState(data.temperature)
  const updateModel = (e: any) => {
    // console.log(e)
    if (e.key === 'model') {
      setModel(e.data);
      data.onChange({ id, data: { model: e.data } })
    }
    if (e.key === 'temperature') {
      setTemperature(e.data);
      data.onChange({ id, data: { temperature: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }

  // input
  const [input, setInput] = React.useState(data.input)
  const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)
  // text
  const [text, setText] = React.useState(data.text)
  const updateTextAndInput = (e: any) => {
    // console.log(e)
    if (e.key === 'text') {
      setText(e.data);
      data.onChange({ id, data: { text: e.data } })
    }

    if (e.key === 'input') {
      setInput(e.data);
      data.onChange({
        id, data: {
          input: e.data
        }
      })
    }


    if (e.key == "nodeInput") {
      setNodeInputId(e.data);
      data.onChange({
        id,
        data: {
          nodeInputId: e.data,
          input: e.data ? 'nodeInput' : 'default'
        }
      })
    }


    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

  }


  // output
  const translates = data.opts.translates;
  const [translate, setTranslate] = React.useState(data.translate)
  const updateTranslate = (e: any) => {
    // console.log(e)
    if (e.key === 'translate') {
      setTranslate(e.data);
      data.onChange({ id, data: { translate: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }

  // output
  const outputs = data.opts.outputs;
  const [output, setOutput] = React.useState(data.output)
  const updateOutput = (e: any) => {
    // console.log(e)
    if (e.key === 'output') {
      setOutput(e.data);
      data.onChange({ id, data: { output: e.data } })
    }

  }


  const createNode = () => {
    const node = [];

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)]
    let selectNodeValue = input === "nodeInput" ? (nodeInputId || nodeOpts[0].value) : null
    // console.log('selectNodeValue',selectNodeValue,nodeInputId,nodeOpts[0],data)

    node.push(createTextAndInput(i18n.t('userInput'), text, input, nodeOpts, selectNodeValue, updateTextAndInput))
    node.push(createModel(model, temperature, models, updateModel))
    node.push(createTranslate(i18n.t('translate'), 'translate', translate, translates, updateTranslate))
    node.push(createOutput(i18n.t('output'), 'output', output, outputs, updateOutput))


    node.push(createDebug({
      header: i18n.t('debug'),
      inputText: i18n.t('inputText'),
      inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
      outputText: i18n.t('outputText'),
      outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
      debugRun: i18n.t('debugRun'),
    }, id, data.debugInput, data.debugOutput, (event: any) => {
      if (event.key == 'input') { }
    }, () => data.debug ? data.debug(data) : '', {}))

    return <Card
      key={id}
      title={i18n.t('title')}
      bodyStyle={{ paddingTop: 0 }}
      // extra={createType(type, agents, updateType)}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }





  return (
    <Dropdown menu={{ items: contextMenus, onClick: () => data.debug ? data.debug() : '' }} trigger={['contextMenu']}>
      <div style={selected ? {
        ...nodeStyle,
        backgroundColor: 'cornflowerblue'
      } : nodeStyle} 
      key={id}>
        {createNode()}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    </Dropdown>
  );
}

export default Main;