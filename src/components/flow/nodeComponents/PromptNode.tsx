import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';

import i18n from "i18next";

import { createDebug, selectNodeInput, createText, createSelect, createOutput, createModel, nodeStyle, getI18n } from './Base';
// import { i18nInit } from '../i18nConfig';



function Main({ id, data, selected }: any) {
  // i18nInit();
  const { debugMenu, contextMenus } = getI18n();
  const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
  const [debugInput, setDebugInput] = React.useState((data.merged ? JSON.stringify(data.merged, null, 2) : ""));
  const [shouldRefresh, setShouldRefresh] = React.useState(true)

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
      data.onChange({ id, data: { text: e.data, debugInput: "" } });
      setShouldRefresh(true);
      // console.log('updateData:',e,shouldRefresh)
    }

    if (e.key === 'input') {
      setInput(e.data);
      data.onChange({
        id, data: {
          debugInput: e.data
        }
      })
    }

    if (e.key === 'output') {
      setOutput(e.data);
      data.onChange({ id, data: { debugOutput: e.data } })
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

  if (data.debugInput != debugInput && shouldRefresh) {
    setDebugInput(data.debugInput);
    setShouldRefresh(false)
  }


  const createNode = () => {
    const node = [];

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)]
    let selectNodeValue = input === "nodeInput" ? (nodeInputId) : null
    // console.log('selectNodeValue',selectNodeValue,nodeInputId,nodeOpts[0],data)
    // setNodeInputId(selectNodeValue)

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

    node.push(
      createDebug(debugMenu, id,
        debugInput,
        data.debugOutput,
        (event: any) => {
          if (event.key == 'input') {
            const { data } = event;
            setDebugInput(data)
            let json: any;
            try {
              json = JSON.parse(data);
              setStatusInputForDebug('')
              updateData(event)
            } catch (error) {
              setStatusInputForDebug('error')
            }
          };
          if (event.key == 'draggable') updateData(event)
        },
        () => {
          console.log('debugFun debugInput', debugInput)
          if (debugInput != "" && debugInput && debugInput.replace(/\s/ig, "") != "[]" && statusInputForDebug != 'error') {
            let merged;
            try {
              merged = JSON.parse(debugInput)
            } catch (error) {

            }
            console.log('debugFun merged', merged)
            data.merged = merged;
            data.debugInput = JSON.stringify(merged, null, 2);
            if (data.role) data.role.merged = merged.filter((f: any) => f.role == 'system');
            data.debug && data.debug(data);
          } else if (debugInput == "" || debugInput && debugInput.replace(/\s/ig, "") == "[]") {
            data.merged = null;
            data.debugInput = "";
            if (data.role) data.role.merged = null;
            console.log('debugFun no merged', data)
            data.debug && data.debug(data)
            setShouldRefresh(true);
          } else if (debugInput === undefined) {
            data.debug && data.debug(data);
            setShouldRefresh(true);
          }
        },
        () => data.merge && data.merge(data),
        {
          statusInput: statusInputForDebug,
          statusOutput: ""
        })
    )


    return <Card
      key={id}
      title={
        <>
          <p style={{ marginBottom: 0 }}>{i18n.t('promptNodeTitle')}</p>
          <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', padding: '0px', paddingTop: '10px', margin: 0, fontWeight: "normal", marginBottom: 10 }}>
            ID: {id}
          </p>
        </>
      }
      bodyStyle={{ paddingTop: 0 }}
      // extra={createType(type, agents, updateType)}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }

  return (
    <Dropdown menu={{
      items: contextMenus,
      onClick: (e: any) => {
        if (e.key == 'debug' && data.debug) {
          data.debug(data)
        };
        if (e.key == 'delete') {
          data.delete(id)
        }
      }
    }} trigger={['contextMenu']}>
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