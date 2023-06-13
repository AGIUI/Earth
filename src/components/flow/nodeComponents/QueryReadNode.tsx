import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;

import { createDebug, createSelect, createTextArea } from './Base'

import i18n from "i18next";
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

const createUrl = (title1: string, title2: string, placeholder2: string, json: any, onChange: any) => {
  const { query, content } = json;
  const key = 'query'
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
      createSelect(title1, content || "bindCurrentPage", [
        { value: 'bindCurrentPageHTML', label: i18n.t('bindWebHTML') },
        { value: 'bindCurrentPage', label: i18n.t('bindWebContent') },
        { value: 'bindCurrentPageURL', label: i18n.t('bindWebURL') },
        { value: 'bindCurrentPageTitle', label: i18n.t('bindWebTitle') },
        { value: 'bindCurrentPageImages', label: i18n.t('bindWebImages') },
      ], (e: any) => {
        // console.log(e)
        const data = {
          ...json,
          content: e.data,
          action: 'read'
        }

        onChange({
          key,
          data
        })
      })
    }

    {
      createTextArea(title2, query, ".tag", "", (e: any) => {
        const data = {
          ...json,
          query: e.data,
          action: 'read'
        }

        onChange({
          key,
          data
        })
      })
    }


  </div>
}



function QueryReadNode({ id, data, selected }: NodeProps<NodeData>) {
  i18nInit();

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
    const node = [
      createUrl(i18n.t('content'), i18n.t('selectQuery'), i18n.t('queryReadPlaceholder'), queryObj, updateQueryObj)
    ];

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
      title={i18n.t('queryReadNodeTitle')}
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

export default QueryReadNode;