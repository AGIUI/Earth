import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';

import i18n from "i18next";

import { createDebug, createURL, createDelay, getI18n, nodeStyle } from './Base'
import { i18nInit } from '../locales/i18nConfig';


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


function Main({ id, data, selected }: any) {
  i18nInit();
  const { debugMenu, contextMenus } = getI18n();
  const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
  const [debugInput, setDebugInput] = React.useState(data.debugInput || (data.merged ? JSON.stringify(data.merged, null, 2) : " "));
  const [shouldRefresh, setShouldRefresh] = React.useState(false)

  // queryObj
  // data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj)
  const [delayFormat, setDelayFormat] = React.useState('ms');

  const [delay, setDelay] = React.useState(queryObj.delay || 1000)


  const updateData = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }

    if (e.key == "debug") data.onChange({ id, data: e.data })
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

    if (shouldRefresh && data.debugInput != debugInput) {
      setDebugInput(data.debugInput);
    }

    // console.log(delay, delayFormat)
    const node = [createUI(queryObj, delay, delayFormat, updateData)];

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