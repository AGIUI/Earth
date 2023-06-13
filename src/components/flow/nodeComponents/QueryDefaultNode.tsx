import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import type { MenuProps } from 'antd';
const { Option } = Select;

import i18n from "i18next";
 
import { createDebug, createURL, createDelay } from './Base'
import { i18nInit } from '../locales/i18nConfig';


export type NodeData = {
  debugInput: any;
  debugOutput: any;

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

const contextMenus: MenuProps['items'] = [
  {
      label: i18n.t('debug'),
      key: 'debug',
  }
];
 
const createUI = (json: any, delay: number, delayFormat: string, onChange: any) => {
  const { protocol, url } = json;

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
      createURL(i18n.t('url'), i18n.t('urlPlaceholder'), protocol, url, (e: any) => {
        let d = {
          ...json,
          protocol: e.data
        }
        if (e.key == 'url') {
          d = {
            ...json,
            url: e.data,
            action: 'default'
          }
        }
        onChange({
          key: 'query',
          data: d
        })
      })
    }

    {
      createDelay(i18n.t('delay'), delayFormat, delay.toString(), [
        { value: 'ms', label: i18n.t('ms') },
        { value: 's', label: i18n.t('s') }], (e: any) => {
          if (e.key == 'delayFormat') onChange({
            key: 'delayFormat',
            data: e.data
          })

          if (e.key == 'delay') {
            let t = parseFloat(e.data);
            if (delayFormat == 's') t = 1000 * t;
            onChange({
              key: 'delay',
              data: {
                ...json,
                delay: t,
              }
            })
          }
        })
    }


  </div>
}


function Main({ id, data, selected }: NodeProps<NodeData>) {
  i18nInit()

 
  // queryObj
  // data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj)

  const [delay, setDelay] = React.useState(queryObj.delay || 1000)
  const [delayFormat, setDelayFormat] = React.useState('ms')

  const updateQueryObj = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    if (e.key === "delay") {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == "delayFormat") {
      setDelayFormat(e.data);
    }

  }


  const createNode = () => {

    const node = [createUI(queryObj, delay, delayFormat, updateQueryObj)];

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
      title={i18n.t('queryDefaultNodeTitle')}
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