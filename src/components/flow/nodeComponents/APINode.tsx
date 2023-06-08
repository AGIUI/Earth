import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Collapse, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
const { Panel } = Collapse;
import { DownOutlined, CaretRightOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

import { createDebug } from './Debug';

const menuNames = {
    title: 'API调用',
    url: 'URL',
    method: '方法',
    parama: '参数(字符串)',
    getFromBefore:"从上一节点获取文本 ${text} ",
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

const createType = (type: string, agents: any, onChange: any) => {
    const label = agents.filter((a: any) => a.key == type)[0]?.label || '-';

    const parents: any = {};
    for (const agent of agents) {
        if (!parents[agent.parent]) parents[agent.parent] = {
            key: agent.parent,
            type: 'group',
            label: agent.parent,
            children: []
        }
        parents[agent.parent].children.push(agent)
    }

    const items = [];
    for (const key in parents) {
        items.push(parents[key])
    }

    return <Dropdown
        trigger={['click']}
        menu={{
            items,
            onClick: (e) => {
                // console.log(e)
                onChange({
                    data: e.key,
                    key: 'type'
                })
            }
        }}>
        <Space>
            {label}
            <DownOutlined />
        </Space>

    </Dropdown>
}

const createText = (title: string, text: string, onChange: any) => <>
    <p>{title}</p>
    <TextArea
        defaultValue={text}
        showCount
        allowClear
        autoSize
        placeholder="maxLength is 6"
        // maxLength={6}
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
        onChange={(e) => {
            onChange({
                key: 'text',
                data: e.target.value
            })
        }}
    /></>;




const createUI = (data: any, json: any, input: string, selectNodeValue: string, nodeOpts: any, onChange: any) => {

    const { protocol, url, init, responseType } = json;
    const key = 'api';

    const extract = {
        ...(init.extract || {
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
                        ...init,
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
            value={JSON.stringify(init.body, null, 2)}
            rows={4}
            placeholder={JSON.stringify(init.body, null, 2)}
            autoSize
            onChange={(e) => {
                const data = {
                    ...json,
                    init: {
                        ...init,
                        body: JSON.parse(e.target.value)
                    }
                }
                onChange({
                    key,
                    data
                })
            }}
        />

        <Checkbox
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
                style={{ width: '100%', marginTop: '8px',marginBottom:'12px' }}
                onChange={(e) => {
                    onChange({
                        key: 'nodeInput',
                        data: e
                    })
                }}
                options={nodeOpts}
            /> : ''
        }

        <p>{menuNames.responseType}</p>
        <Select
            defaultValue={responseType}
            style={{ width: 120,marginBottom:'12px' }}
            onChange={(e) => {
                // console.log(e)
                const data = {
                    ...json,
                    init: {
                        ...init,
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
                    ...(init.extract || {
                        key: '', type: ''
                    }),
                    type: e
                }
                const data = {
                    ...json,
                    init: {
                        ...init,
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
                    ...(init.extract || {
                        key: '', type: ''
                    }),
                    key: e.target.value
                }
                const data = {
                    ...json,
                    init: {
                        ...init,
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
            createDebug(key, data, onChange)
        }


    </div>

}


function Main({ id, data, selected }: NodeProps<NodeData>) {

    // 类型
    const [type, setType] = React.useState(data.type)

    // api
    data.api.isApi = type === "api";
    const [api, setApi] = React.useState(data.api)

    const updateApi = (e: any) => {
        if (e.key === 'api') {
            setApi(e.data);
            data.onChange({ id, data: { api: e.data } })
        }

        if (e.key === 'input') {
            setInput(e.data);
            data.onChange({
                id, data: {
                    input: e.data
                }
            })
        }

        if (e.key == "nodeInput") {
            setNodeInputId(e.data);
            data.onChange({
                id, data: {
                    nodeInputId: e.data
                }
            })
        }



        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
    }

    const [input, setInput] = React.useState(data.input)
    const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)

    const createNode = () => {

        let allNodes: any[] = [];
        if (data.getNodes) allNodes = [...data.getNodes()]

        const nodeOpts = Array.from(allNodes, (node, i) => {
            return {
                value: node.id, label: node.type
            }
        });

        let selectNodeValue = nodeInputId || nodeOpts[0].value


        return <Card
            key={id}
            title={menuNames.title}
            bodyStyle={{ paddingTop: 0 }}
            style={{ width: 300 }}>
            {createUI(
                data,
                api,
                input,
                selectNodeValue,
                nodeOpts,
                updateApi)}
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