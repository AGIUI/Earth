import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';


const { TextArea } = Input;
const { Option } = Select;

const menuNames = {
    title: 'API调用',
    url: 'URL',
    method: '方法',
    parama: '参数',
    output: '输出',
    debug: '调试'
}


export type NodeData = {
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



const createUrl = (title: string, method: string, paramas: string, output: string, json: any, onChange: any) => {
    const { protocol, url, init, query, isApi, isQuery } = json;
    const key = 'api'
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
        <p>{title}</p>
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
        <p>{method}</p>
        <Select
            defaultValue={"post"}
            style={{ width: 120 }}
            onChange={(e) => {
                console.log(e)
                let init = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: "{}",
                    mode: 'cors',
                    cache: 'default',
                    responseType: 'text'
                }
                if (e === 'get') init = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: "{}",
                    mode: 'cors',
                    cache: 'default',
                    responseType: 'text'
                }

                const data = {
                    ...json,
                    init
                }

                onChange({
                    key,
                    data
                })

            }}
            options={[
                { value: 'post', label: 'POST' },
                { value: 'get', label: 'GET' }
            ]}
        />

        <p>{paramas}</p>
        <TextArea
            value={JSON.stringify(init, null, 2)}
            rows={4}
            placeholder={JSON.stringify(init, null, 2)}
            autoSize
            onChange={(e) => {
                const data = {
                    ...json,
                    init: JSON.parse(e.target.value)
                }
                onChange({
                    key,
                    data
                })
            }}
        />

        <p>{output}</p>
        <Select
            defaultValue={"text"}
            style={{ width: 120 }}
            onChange={(e) => {
                // console.log(e)
                const data = {
                    ...json,
                    init: {
                        ...json.init,
                        responseType: e
                    }
                };
                onChange({
                    key,
                    data
                })

            }}
            options={[
                { value: 'text', label: '文本' },
                { value: 'images', label: '多张图片' }
            ]}
        />

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
        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
    }


    // input
    const inputs = data.opts.inputs;
    const [input, setInput] = React.useState(data.input)
    const updateInput = (e: any) => {
        // console.log(e)
        if (e.key === 'input') {
            setInput(e.data);
            data.onChange({ id, data: { input: e.data } })
        }

    }


    const createNode = () => {
        const node = [createUrl(menuNames.url, menuNames.method, menuNames.parama, menuNames.output, api, updateApi)];

        if (data.debug) {
            node.push(<Divider dashed />)
            node.push(<Button onClick={(e) => data.debug ? data.debug(data) : ''} >{menuNames.debug}</Button>)
        }

        return <Card
            key={id}
            title={menuNames.title}
            bodyStyle={{ paddingTop: 0 }}
            style={{ width: 300 }}>
            {...node}
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