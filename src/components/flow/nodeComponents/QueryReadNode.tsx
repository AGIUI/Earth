import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';

import { createDebug, createSelect, createTextArea, nodeStyle, getI18n } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';


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

  </div>
}



function QueryReadNode({ id, data, selected }: any) {
  i18nInit();
  const { debugMenu, contextMenus } = getI18n();
  const [statusInputForDebug, setStatusInputForDebug] = React.useState('');

  const [queryObj, setQueryObj] = React.useState(data.queryObj)
  const updateData = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == "debug") data.onChange({ id, data: e.data })
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }

  const createNode = () => {
    const node = [
      createUrl(i18n.t('content'), i18n.t('selectQuery'), i18n.t('queryReadPlaceholder'), queryObj, updateData)
    ];

    node.push(
      createDebug(debugMenu, id,
        data.debugInput || (data.merged ? JSON.stringify(data.merged,null,2) : ""),
        data.debugOutput,
        (event: any) => {
          if (event.key == 'input') {
            const { data } = event;
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
                merged: json?.prompt,
                debugInput: data
              }
            })
          };
          if (event.key == 'draggable') updateData(event)
        },
        () => data.debug && data.debug(data),
        () => data.merge && data.merge(data),
        {
          statusInput: statusInputForDebug,
          statusOutput: ""
        })
    )

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