import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';

import i18n from "i18next";

import { createDebug, selectNodeInput, createText, createSelect, createOutput, createModel, nodeStyle, getI18n } from './Base';
import { i18nInit } from '../locales/i18nConfig';



function Main({ id, data, selected }: any) {
  i18nInit();
  const { debugMenu, contextMenus } = getI18n();
  const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
  const [debugInput, setDebugInput] = React.useState(data.debugInput || (data.merged ? JSON.stringify(data.merged, null, 2) : " "));
  const [shouldRefresh, setShouldRefresh] = React.useState(false)

  // 模型
  const models = data.opts.models;
  const [model, setModel] = React.useState(data.model)
  const [temperature, setTemperature] = React.useState(data.temperature);

  // input
  const [input, setInput] = React.useState(data.input)
  const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)
  // text
  const [text, setText] = React.useState(data.text)

  // output
  const translates = data.opts.translates;
  const [translate, setTranslate] = React.useState(data.translate)

  // output
  const outputs = data.opts.outputs;

  const [output, setOutput] = React.useState(data.output)

  const updateData = (e: any) => {
    // console.log(e)
    if (e.key === 'model') {
      setModel(e.data);
      data.onChange({ id, data: { model: e.data } })
    }
    if (e.key === 'temperature') {
      setTemperature(e.data);
      data.onChange({ id, data: { temperature: e.data } })
    }

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

    if (e.key === 'output') {
      setOutput(e.data);
      data.onChange({ id, data: { output: e.data } })
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

    // console.log(e)
    if (e.key === i18n.t('translate')) {
      setTranslate(e.data);
      data.onChange({ id, data: { translate: e.data } })
    }


    if (e.key == "debug") data.onChange({ id, data: e.data })
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }


  const createNode = () => {
    const node = [];

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)]
    let selectNodeValue = input === "nodeInput" ? (nodeInputId) : null
    // console.log('selectNodeValue',selectNodeValue,nodeInputId,nodeOpts[0],data)
    // setNodeInputId(selectNodeValue)

    if (shouldRefresh&&data.debugInput!=debugInput) {
      setDebugInput(data.debugInput);
  }


    node.push(
      createText('text', i18n.t('userInput'), '', text, '', updateData)
    )
    node.push(
      selectNodeInput(i18n.t('getFromBefore'), selectNodeValue, nodeOpts, updateData)
    )

    node.push(createModel(model, temperature, models, updateData))

    node.push(
      createSelect(i18n.t('translate'), translate, translates, updateData)
    )

    node.push(createOutput(i18n.t('outputText'), 'output', output, outputs, updateData))

    node.push(createDebug(debugMenu, id,
      debugInput,
      data.debugOutput,
      (event: any) => {
          if (event.key == 'input') {
              setShouldRefresh(false)
              const { data } = event;
              setDebugInput(data)
              let json: any;
              try {
                  json = JSON.parse(data);
                  setStatusInputForDebug('')
              } catch (error) {
                  setStatusInputForDebug('error')
              }
              updateData({
                  key: 'debug',
                  data: {
                      debugInput: data
                  }
              })
          };
          if (event.key == 'draggable') updateData(event)
      },
      () => {
          data.debug && data.debug(data)
          setShouldRefresh(true)
      },
      () => data.merge && data.merge(data),
      {
          statusInput: statusInputForDebug,
          statusOutput: ""
      }))

    return <Card
      key={id}
      title={i18n.t('promptNodeTitle')}
      bodyStyle={{ paddingTop: 0 }}
      // extra={createType(type, agents, updateType)}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }

  return (
    <Dropdown menu={{ items: contextMenus, onClick: () => data.debug ? data.debug(data) : '' }} trigger={['contextMenu']}>
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