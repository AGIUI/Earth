import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import type { MenuProps } from 'antd';

const { TextArea } = Input;

import { createDebug, createTextArea } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';


export type NodeData = {
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


const createUrl = (title: string, json: any, onChange: any) => {
  const { protocol, url, init, query } = json;
  const key = 'query';
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
      createTextArea(title, query, ".tag", "", (e: any) => {
        const data = {
          ...json,
          query: e.data,
          action: 'click'
        }

        onChange({
          key,
          data
        })
      })
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
  // queryObj
  const [queryObj, setQueryObj] = React.useState(data.queryObj)
  const updateQueryObj = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }

  const createNode = () => {
    const node = [createUrl(i18n.t('selectQuery'), queryObj, updateQueryObj)];

    node.push(createDebug({
      header: i18n.t('debug'),
      inputText: i18n.t('inputText'),
      inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
      outputText: i18n.t('outputText'),
      outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
      debugRun: i18n.t('debugRun'),
    }, id, "", '', (event: any) => {
      if (event.key == 'input') { }
    }, () => data.debug ? data.debug(data) : '', {}))

    return <Card
      key={id}
      title={i18n.t("queryClickNodeTitle")}
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