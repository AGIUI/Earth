import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';

import { createDebug, createTextArea, nodeStyle, getI18n } from './Base'

import i18n from "i18next";
// import { i18nInit } from '../i18nConfig';


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
  // i18nInit();
  const { debugMenu, contextMenus } = getI18n();
  const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
  const [debugInput, setDebugInput] = React.useState((data.merged ? JSON.stringify(data.merged, null, 2) : ""));
    const [shouldRefresh, setShouldRefresh] = React.useState(true)


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

    if (data.debugInput != debugInput && shouldRefresh) {
      setDebugInput(data.debugInput);
      setShouldRefresh(false)
    }

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
                } catch (error) {
                    setStatusInputForDebug('error')
                }
            };
            if (event.key == 'draggable') updateData(event)
        },
        () => {
            console.log('debugFun debugInput', debugInput)
            if (debugInput != "" && debugInput.replace(/\s/ig, "") != "[]" && statusInputForDebug != 'error') {
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
            } else if (debugInput == "" || debugInput.replace(/\s/ig, "") == "[]") {
                data.merged = null;
                data.debugInput = "";
                if (data.role) data.role.merged = null;
                console.log('debugFun no merged', data)
                data.debug && data.debug(data)
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
              <p style={{ marginBottom: 0 }}>{i18n.t('queryClickNodeTitle')}</p>
              <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', padding: '0px', paddingTop: '10px', margin: 0 ,fontWeight:"normal",marginBottom:10 }}>
                  ID: {id}
              </p>
          </>
      }
      bodyStyle={{ paddingTop: 0 }}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }

  return (
    <Dropdown menu={{
      items: contextMenus, onClick: (e: any) => {
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