import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { selectInput, createDebug, createTextArea } from "./Base"

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';

export type NodeData = {
  input: string;
  getNodes: any;
  debug: any;
  queryObj: any,
  type: string,
  onChange: any
};

const nodeStyle = {
  border: '1px solid transparent',
  padding: '2px 5px',
  borderRadius: '12px',
};

const createUrl = (input: string, json: any, onChange: any) => {

  const { queryObj, userInput, nodeInputId } = json;
  const { query, action } = queryObj;

  let nodeOpts: any[] = [];
  if (json.getNodes) nodeOpts = [...json.getNodes()]
  let selectNodeValue = input === "nodeInput" ? (nodeInputId || nodeOpts[0].value) : null
  // console.log(input, selectNodeValue)
  return <div onMouseOver={() => {
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
    }}>

    {
      createTextArea(i18n.t('selectQuery'), query, ".tag", "", (e: any) => {
        const data = {
          ...json,
          queryObj: {
            ...json.queryObj,
            content: '',
            query: e.data,
            action: 'input'
          }
        }
        onChange({
          key: 'data',
          data
        })
      })
    }

    <Divider dashed />
    <p>{i18n.t('queryInputText')}</p>
    {
      selectInput(i18n.t('nodeInputLabel'), i18n.t('userInputLabel'), selectNodeValue, userInput, nodeOpts, onChange)
    }

  </div>
}



function Main({ id, data, selected }: NodeProps<NodeData>) {
  i18nInit();
  const contextMenus: MenuProps['items'] = [
    {
      label: i18n.t('debug'),
      key: 'debug',
    }
  ];

  const [queryObj, setQueryObj] = React.useState(data.queryObj);

  const [input, setInput] = React.useState(data.input);

  // 更新数据
  const updateData = (e: any) => {

    if (e.key === 'data') {
      if (e.data.queryObj) setQueryObj(e.data.queryObj);
      data.onChange({ id, data: { ...data, ...e.data } })
    }


    if (e.key === "setInput") {
      setInput(e.data);
      const d: any = {
        ...data,
        input: e.data
      };
      if (e.data == 'userInput' && e.userInput) {
        d.userInput = e.userInput;
      };
      data.onChange({
        id,
        data: d
      })
    }
    if (e.key === "nodeInput") {
      data.onChange({
        id,
        data: {
          ...data,
          nodeInputId: e.data
        }
      })
    }

    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }


  const createNode = () => {

    const node = [
      createUrl(
        input,
        data,
        updateData),
      createDebug({
        header: i18n.t('debug'),
        inputText: i18n.t('inputText'),
        inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
        outputText: i18n.t('outputText'),
        outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
        debugRun: i18n.t('debugRun'),
      }, id, "", '', (event: any) => {
        if (event.key == 'input') { }
      }, () => data.debug ? data.debug(data) : '', {})
    ];

    return <Card
      key={id}
      title={i18n.t('queryInputNodeTitle')}
      bodyStyle={{ paddingTop: 0 }}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }


  return (
    <Dropdown menu={{ items: contextMenus, onClick: () => data.debug ? data.debug(data) : '' }} trigger={['contextMenu']}>
      <div style={selected ? {
        ...nodeStyle,
        backgroundColor: 'cornflowerblue'
      } : nodeStyle} key={id}>
        {createNode()}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    </Dropdown>
  );
}

export default Main;