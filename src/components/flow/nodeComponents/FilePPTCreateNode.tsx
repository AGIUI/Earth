import React from 'react'
import { Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider, MenuProps } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

import { createDebug, createText, selectNodeInputBase } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';

export type NodeData = {
    file: any;
    inputs: any;
    getNodes: any;
    debugInput: any;
    debugOutput: any;
    role: any;
    debug: any;
    text: string,
    api: any,
    queryObj: any,
    temperature: number,
    model: string,
    input: string,
    output: string,
    type: string,
    opts: any,
    onChange: any
};

const nodeStyle = {
    border: '1px solid transparent',
    padding: '2px 5px',
    borderRadius: '12px',
};


function Main({ id, data, selected }: NodeProps<NodeData>) {

    i18nInit();
    const contextMenus: MenuProps['items'] = [
        {
            label: i18n.t('debug'),
            key: 'debug',
        }
    ];

    const onChange = (e: any) => {
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
                id, data: {
                    file: {
                        inputs: inps,
                        type: 'ppt'
                    }
                }
            });
        }
    }

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)];

    const file: any = data.file;
    const [inputs, setInputs] = React.useState(file?.inputs || [nodeOpts[0].value])

    // console.log(inputs)

    const createNode = (role: any) => {
        return <Card
            key={id}
            title={i18n.t('filePPTNodeTitle')}
            bodyStyle={{ paddingTop: 0 }}
            style={{ width: 300 }}
        >
            <div style={{
                width: '200px',
                minHeight: '200px'
            }}
                onMouseOver={() => {
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
                }}
            >
                <Button onClick={() => {
                    let inps = inputs;
                    inps.push(nodeOpts[0].value)
                    setInputs(inps);
                    onChange({
                        key: 'inputs',
                        data: inps
                    })
                }} >+</Button>

                <Button onClick={() => {
                    let inps = inputs;
                    inps.pop()
                    setInputs(inps);
                    onChange({
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
                                    selectNodeInputBase(inp, nodeOpts, (e: any) => onChange({ ...e, index: i }))
                                }</div>
                        ) : ''
                }
            </div>
            {
                createDebug({
                    header: i18n.t('debug'),
                    inputText: i18n.t('inputText'),
                    inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
                    outputText: i18n.t('outputText'),
                    outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
                    debugRun: i18n.t('debugRun'),
                }, id, data.debugInput, data.debugOutput, (event: any) => {

                    if (event.key == 'input') { }
                }, () => data.debug ? data.debug(data) : '', {})
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