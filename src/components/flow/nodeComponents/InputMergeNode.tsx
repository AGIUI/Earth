import React from 'react'
import { Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

import { Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider, MenuProps } from 'antd';
 
import {createCardTitle, createText, nodeStyle, selectNodeInputBase, getI18n } from './Base'

import i18n from "i18next";
 

function Main({ id, data, selected }: any) {

    // i18nInit();
    const { debugMenu, contextMenus } = getI18n();


    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)];

    const [inputs, setInputs] = React.useState(data.inputs?.nodes || [])
    const [output, setOutput] = React.useState(data.inputs?.output || '')

    const updateData = (e: any) => {
        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } });
        if (e.key == 'inputs') data.onChange({
            id, data: {
                inputs: {
                    ...data.inputs,
                    nodes: e.data,
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
                    inputs: {
                        ...data.inputs,
                        nodes: inps
                    }
                }
            });
        }

        if (e.key == 'output') {
            setOutput(e.data)
            data.onChange({
                id, data: {
                    inputs: {
                        ...data.inputs,
                        output: e.data,
                    }
                }
            });
        }

    }



    // console.log(inputs)

    const createNode = (role: any) => {
        return <Card
            key={id}
            title={createCardTitle(i18n.t('inputMergeNodeTitle'),id, data) }
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
                    nodeOpts[0] && inps.push(nodeOpts[0].value)
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


                {createText('output', i18n.t('mergeReg'), '', output, '', updateData)}
                <p style={{marginTop:5,color:"red",fontSize:12}}>{i18n.t('inputMergePlaceholderTips')}</p>

            </div>



        </Card>
    }

    return (
        <Dropdown menu={contextMenus(id, data)}
            trigger={['contextMenu']}
        >
            <div style={selected ? {
                ...nodeStyle,
                backgroundColor: 'cornflowerblue'
            } : nodeStyle}

            >
                {createNode("4")}

                <Handle type="target" position={Position.Left} />
                <Handle type="source" position={Position.Right} />

            </div>
        </Dropdown>
    );
}

export default Main;