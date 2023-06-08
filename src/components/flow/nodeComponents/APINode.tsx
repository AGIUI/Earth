import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Collapse, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
const { Panel } = Collapse;
import { DownOutlined, CaretRightOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

import { createDebug, selectNodeInput } from './Base';

const menuNames = {
    title: 'API调用',
    url: 'URL',
    method: '方法',
    parama: '参数(字符串)',
    getFromBefore: "从上一节点获取文本 ${text} ",
    responseType: '返回的数据类型',
    output: '输出',
    outputKeyword: "输出字段",
    more: "调试",
    debugRun: '运行',
    debugParama: '请求参数'
}


export type NodeData = {
    nodeInputId: string;
    getNodes: any;
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


const createUI = (
    id: string,
    data: any,
    json: any,
    init: string,
    input: string,
    selectNodeValue: string,
    nodeOpts: any,
    onChange: any, statusInput: string) => {

    const { protocol, url, responseType } = json;
    const key = 'api';

    const extract = {
        ...(json.init.extract || {
            key: '', type: ''
        })
    }

    return <div
        style={{ cursor: 'default' }}
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
        <p>{menuNames.url}</p>
        <Input addonBefore={
            <Select defaultValue={protocol} onChange={(e: string) => {
                onChange({
                    key,
                    data: {
                        ...json, protocol: e
                    }
                })

            }}>
                <Option value="http://">http://</Option>
                <Option value="https://">https://</Option>
            </Select>
        }
            placeholder={`请填写url`}
            defaultValue={url}
            onChange={(e: any) => {
                // console.log('input url',e)
                onChange({
                    key,
                    data: {
                        ...json,
                        url: e.target.value
                    }
                })
            }}
        />
        <p>{menuNames.method}</p>
        <Select
            defaultValue={"post"}
            style={{ width: 120 }}
            onChange={(e) => {
                console.log(e)
                const data = {
                    ...json,
                    init: {
                        ...json.init,
                        method: e,
                    }
                }
                onChange({
                    key,
                    data
                })

            }}
            options={[
                { value: 'POST', label: 'POST' },
                { value: 'GET', label: 'GET' }
            ]}
        />

        <p>{menuNames.parama}</p>
        <TextArea
            value={JSON.stringify(json.init.body, null, 2)}
            rows={4}
            placeholder={JSON.stringify(json.init.body, null, 2)}
            autoSize
            onChange={(e) => {
                const data = {
                    ...json,
                    init: {
                        ...json.init,
                        body: JSON.parse(e.target.value)
                    }
                }
                onChange({
                    key,
                    data
                })
            }}
        />
        {
            selectNodeInput(selectNodeValue, nodeOpts, onChange)
        }
        {/* <Checkbox
            style={{ marginTop: '12px' }}
            defaultChecked={input == "nodeInput"}
            // checked={input == "nodeInput"}
            onChange={(e) => {
                // console.log(e)
                onChange({
                    key: 'input',
                    data: e.target.checked ? 'nodeInput' : 'default'
                })
            }}>{menuNames.getFromBefore}</Checkbox>
        {
            input === "nodeInput" ? <Select
                value={selectNodeValue}
                style={{ width: '100%', marginTop: '8px', marginBottom: '12px' }}
                onChange={(e) => {
                    onChange({
                        key: 'nodeInput',
                        data: e
                    })
                }}
                options={nodeOpts}
            /> : ''
        } */}

        <p>{menuNames.responseType}</p>
        <Select
            defaultValue={responseType}
            style={{ width: 120, marginBottom: '12px' }}
            onChange={(e) => {
                // console.log(e)
                const data = {
                    ...json,
                    init: {
                        ...json.init,
                        responseType: e
                    },
                    responseType: e
                };
                onChange({
                    key,
                    data
                })

            }}
            options={[
                { value: 'text', label: '字符串' },
                { value: 'json', label: 'JSON' }
            ]}
        />

        <p>{menuNames.output}</p>
        <Select
            value={extract.type}
            style={{ width: 120 }}
            onChange={(e) => {
                const extract = {
                    ...(json.init.extract || {
                        key: '', type: ''
                    }),
                    type: e
                }
                const data = {
                    ...json,
                    init: {
                        ...json.init,
                        extract
                    }
                };
                onChange({
                    key,
                    data
                })

            }}
            options={[
                { value: 'text', label: '文本' },
                { value: 'images', label: '多张图片' },
                { value: 'json', label: 'JSON', disabled: true },
                { value: 'audio', label: '音频', disabled: true }
            ]}
        />
        <p>{menuNames.outputKeyword}</p>
        <TextArea
            // style={{marginTop:'8px'}}
            value={extract.key}
            rows={4}
            placeholder={extract.key}
            autoSize
            onChange={(e) => {

                const extract = {
                    ...(json.init.extract || {
                        key: '', type: ''
                    }),
                    key: e.target.value
                }
                const data = {
                    ...json,
                    init: {
                        ...json.init,
                        extract
                    }
                };
                onChange({
                    key,
                    data
                })
            }}
        />

        {
            createDebug(id, init, json.debugOutput, (event: any) => {
                if (event.key == 'input') {
                    try {
                        onChange({
                            key,
                            data: {
                                ...data.api,
                                init: JSON.parse(event.data)
                            }
                        })
                    } catch (error) {
                        onChange({
                            key: 'error-input',
                            data: event.data
                        })
                    }
                }
            }, () => data.debug ? data.debug(data) : '', {
                statusInput: statusInput,
                statusOutput: ''
            })
        }


    </div>

}


function Main({ id, data, selected }: NodeProps<NodeData>) {

    // 类型
    const [type, setType] = React.useState(data.type)

    // api
    data.api.isApi = type === "api";
    const [api, setApi] = React.useState(data.api)

    const [init, setInit] = React.useState(JSON.stringify(api.init, null, 2))

    const updateApi = (e: any) => {
        if (e.key === 'api') {
            data.onChange({ id, data: { api: e.data } })
            setApi(e.data);
            setInit(JSON.stringify(e.data.init, null, 2))
            setStatusInput('success');
        }

        if (e.key === 'error-input') {
            setStatusInput('error');
            setInit(e.data)
        }

        // if (e.key === 'input') {
        //     setInput(e.data);
        //     data.onChange({
        //         id,
        //         data: {
        //             input: e.data
        //         }
        //     })
        // }

        if (e.key == "nodeInput") {
            setNodeInputId(e.data);
            data.onChange({
                id,
                data: {
                    nodeInputId: e.data,
                    input: e.data ? 'nodeInput' : 'default'
                }
            })
        }

        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })


    }

    const [input, setInput] = React.useState(data.input)
    const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)

    const [statusInput, setStatusInput] = React.useState('')

    const createNode = () => {

        let nodeOpts: any[] = [];
        if (data.getNodes) nodeOpts = [...data.getNodes(id)]
        let selectNodeValue = nodeInputId || nodeOpts[0].value
        // console.log(nodeOpts)
        return <Card
            key={id}
            title={menuNames.title}
            bodyStyle={{ paddingTop: 0 }}
            style={{ width: 300 }}>
            {createUI(
                id,
                data,
                api,
                init,
                input,
                selectNodeValue,
                nodeOpts,
                updateApi,
                statusInput
            )}
        </Card>
    }

    const nodeStyle = selected ? {
        border: '1px solid transparent',
        padding: '2px 5px',
        borderRadius: '12px',
        backgroundColor: 'cornflowerblue'
    } : {
        border: '1px solid transparent',
        padding: '2px 5px'
    };


    const items: MenuProps['items'] = [
        {
            label: '调试',
            key: 'debug',

        }
    ];


    return (
        <Dropdown menu={{ items, onClick: () => data.debug ? data.debug() : '' }} trigger={['contextMenu']}>

            <div style={nodeStyle} key={id}>

                {createNode()}
                <Handle type="target" position={Position.Left} />
                <Handle type="source" position={Position.Right} />

            </div>
        </Dropdown>
    );
}

export default Main;