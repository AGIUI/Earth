import React from 'react'
import { Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider, MenuProps } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

import { createDebug, nodeStyle, selectNodeInputBase, getI18n } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';


function Main({ id, data, selected }: any) {

    i18nInit();
    const { debugMenu, contextMenus } = getI18n();
    const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
    const [debugInput, setDebugInput] = React.useState(data.debugInput || (data.merged ? JSON.stringify(data.merged, null, 2) : " "));
    const [shouldRefresh, setShouldRefresh] = React.useState(false)

    const updateData = (e: any) => {
        if (e.key == "debug") data.onChange({ id, data: e.data })
        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } });
        if (e.key == 'inputs') data.onChange({
            id, data: {
                file: {
                    inputs: e.data,
                    type: 'ppt'
                }
            }
        });
        if (e.key === "nodeInput") {
            // console.log(inputs, e.index, e.data,nodeOpts.filter((n: any) => n.value == e.data));
            const inps = Array.from(inputs, (i: string, index) => {
                if (index === e.index) i = e.data;
                return i;
            });
            // console.log(JSON.stringify(inps,null,2))
            setInputs(inps)
            data.onChange({
                id,
                data: {
                    file: {
                        inputs: inps,
                        type: 'ppt'
                    }
                }
            });
        }


        if (e.key === "nodeInput-onClick") {
            // const otherNodes = data.getNodes(e.data);
            // console.log('nodeInput-onClick',otherNodes)
            // data.onChange({
            //     id: e.data,
            //     data: {
            //         hightlight: true
            //     }
            // })
        }
    }

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)];

    const file: any = data.file;
    const [inputs, setInputs] = React.useState(file?.inputs || [nodeOpts[0].value])

    // console.log(inputs)

    const createNode = (role: any) => {

        if (shouldRefresh && data.debugInput != debugInput) {
            setDebugInput(data.debugInput);
        }

        return <Card
            key={id}
            title={
                <>
                    <p style={{ marginBottom: 0 }}>{i18n.t('filePPTNodeTitle')}</p>
                    <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', padding: '0px', paddingTop: '10px', margin: 0 ,fontWeight:"normal",marginBottom:10 }}>
                        ID: {id}
                    </p>
                </>
            }
            bodyStyle={{ paddingTop: 0 }}
            style={{ width: 300 }}
        >
            <div style={{
                width: '200px',
                minHeight: '200px'
            }}
                onMouseOver={() => {
                    updateData({
                        key: 'draggable',
                        data: false
                    })
                }}
                onMouseLeave={() => {
                    updateData({
                        key: 'draggable',
                        data: true
                    })
                }}
            >
                <Button onClick={() => {
                    let inps = inputs;
                    inps.push(nodeOpts[0].value)
                    setInputs(inps);
                    updateData({
                        key: 'inputs',
                        data: inps
                    })
                }} >+</Button>

                <Button onClick={() => {
                    let inps = inputs;
                    inps.pop()
                    setInputs(inps);
                    updateData({
                        key: 'inputs',
                        data: inps
                    })
                }} >-</Button>

                {
                    inputs.length > 0 ?
                        Array.from(
                            inputs,
                            (inp: any, i) =>
                                <div key={i}>{
                                    selectNodeInputBase(inp, nodeOpts, (e: any) => updateData({ ...e, index: i }))
                                }</div>
                        ) : ''
                }
            </div>
            {
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
                            setShouldRefresh(true)
                        }
                        data.debug && data.debug(data)
                    },
                    () => data.merge && data.merge(data),
                    {
                        statusInput: statusInputForDebug,
                        statusOutput: ""
                    })
            }
        </Card>
    }

    return (
        <Dropdown menu={{
            items: contextMenus,
            onClick: () => data.debug ? data.debug(data) : ''
        }}
            trigger={['contextMenu']}
        >
            <div style={selected ? {
                ...nodeStyle,
                backgroundColor: 'cornflowerblue'
            } : nodeStyle}

            >
                {createNode("4")}

                <Handle type="target" position={Position.Left} />

            </div>
        </Dropdown>
    );
}

export default Main;