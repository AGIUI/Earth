import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';

import { createDebug, createTextArea, nodeStyle, getI18n } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';


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


function Main({ id, data, selected }: any) {
  i18nInit();
  const { debugMenu, contextMenus } = getI18n();
  const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
  const [debugInput, setDebugInput] = React.useState(data.debugInput || (data.merged ? JSON.stringify(data.merged, null, 2) : " "));
  const [shouldRefresh, setShouldRefresh] = React.useState(false)


  // queryObj
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
    const node = [createUrl(i18n.t('selectQuery'), queryObj, updateData)];

    if (shouldRefresh && data.debugInput != debugInput) {
      setDebugInput(data.debugInput);
    }

    node.push(
      createDebug(debugMenu, id,
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
        (mergedStr: string) => {
          let merged;
          try {
            merged = JSON.parse(mergedStr)
          } catch (error) {

          }
          console.log('debugFun', mergedStr, merged)
          if (merged) {
            data.merged = merged;
            data.role.merged = merged.filter((f: any) => f.role == 'system');
            setShouldRefresh(false)
          } else {
            data.merged = null;
            data.role.merged = null;
            setShouldRefresh(true)
          }
          data.debug && data.debug(data)
        },
        () => data.merge && data.merge(data),
        {
          statusInput: statusInputForDebug,
          statusOutput: ""
        })
    )

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