import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';

import type { MenuProps } from 'antd';


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
          if (e.key == 'delay') {
            onChange({
              key: 'delay',
              data: e.data
            })
          }
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
  // data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj)
  const [delayFormat, setDelayFormat] = React.useState('ms');

  const [delay, setDelay] = React.useState(queryObj.delay || 1000)


  const updateQueryObj = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    if (e.key === "delay") {
      const { delay, delayFormat } = e.data;
      let d = delay;
      if (delayFormat == 's') d = d * 1000;
      // console.log(d,delayFormat)
      setQueryObj({
        ...queryObj,
        delay: d
      });
      setDelay(delay)
      setDelayFormat(delayFormat)
      data.onChange({
        id, data: {
          queryObj: {
            ...queryObj,
            delay: d
          }
        }
      })
    }

  }


  const createNode = () => {
    // console.log(delay, delayFormat)
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