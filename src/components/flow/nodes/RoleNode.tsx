import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

import { roleAvatars } from '../Workflow'

export type NodeData = {
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

const menuName = {
    cardTitle: '角色',
    createText: '角色定义'
}

const createType = (type: string, agents: any, onChange: any) => {
    const label = agents.filter((a: any) => a.key == type)[0]?.label || '-';
    return <Dropdown menu={{
        items: agents, onClick: (e) => {
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

const createName = (title: string, name: string, onChange: any) =>
    <Input addonBefore="@" defaultValue={name}
        placeholder={title}
        onChange={(e) => {
            onChange({
                key: 'name',
                data: e.target.value
            })
        }} />

const createText = (title: string, text: string, onChange: any) => <>
    <p>{menuName.createText}</p>
    <TextArea
        defaultValue={text}
        rows={4}
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
        autoSize
        placeholder={title}
        onChange={(e) => {
            onChange({
                key: 'text',
                data: e.target.value
            })
        }}
    /></>;



const createModel = (model: string, temperature: number, opts: any, onChange: any) => <>
    <p>{opts.filter((m: any) => m.value == 'model')[0].label}</p>
    <Radio.Group
        onChange={(e) => {

            onChange({
                key: 'model',
                data: e.target.value
            })

        }}
        defaultValue={model}
    >
        {Array.from(opts.filter((m: any) => m.value == 'model')[0].options,
            (p: any, i: number) => {
                return <Radio.Button
                    key={i}
                    value={p.value}
                >{p.label}</Radio.Button>
            })}
    </Radio.Group>
    <p>{opts.filter((m: any) => m.value == 'temperature')[0].label}</p>
    <InputNumber
        stringMode
        step="0.01"
        size="large"
        min={'0'}
        max={'1'}
        value={temperature.toString()} onChange={(e: any) => {
            // console.log(e)
            onChange({
                key: 'temperature',
                data: parseFloat(e)
            })

        }} />

</>


function RoleNode({ id, data, selected }: NodeProps<NodeData>) {
    // console.log('RoleNode', JSON.stringify(data, null, 2))
    // 类型
    const agents = data.opts.agents;
    const [type, setType] = React.useState(data.type)
    const updateType = (e: any) => {
        if (e.key === 'type') {
            setType(e.data);
            data.onChange({ id, data: { type: e.data } })
        }
    }
    // 模型
    const models = data.opts.models;
    const [model, setModel] = React.useState(data.model)
    const [temperature, setTemperature] = React.useState(data.temperature)
    const updateModel = (e: any) => {
        // console.log(e)
        if (e.key === 'model') {
            setModel(e.data);
            data.onChange({ id, data: { model: e.data } })
        }
        if (e.key === 'temperature') {
            setTemperature(e.data);
            data.onChange({ id, data: { temperature: e.data } })
        }
    }

    // text
    const [role, setRole] = React.useState(data.role)
    const updateRole = (e: any) => {
        // console.log(e)

        let r = { ...role };

        if (e.key == 'role') {
            r[e.key] = e.data;
            setRole({
                ...r
            })
            data.onChange({ id, data: { role: r } })
        }

        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    }


    const createNode = (role: any, updateRole: any) => {
        // console.log('createNode', role)
        const keys: any = {
            guide: '你的AI员工是个拥有情感、喜恶、过往、抱负、目标、梦想与恐惧的AI机器人，就和一个真人一样。编辑这个员工将重新生成它，赋予它新的简介与小传（除非已被锁定），也可能因此改变它的言论与行为。在编辑AI员工前，请确保您可以接受因此带来的后果。',
            name: '姓名',
            text: '请描述角色的特征，我是...'
        }

        const items: any = Array.from(roleAvatars, (avatar: any) => {
            return {
                label: avatar.label,
                key: avatar.key,
                icon: <UserOutlined />,
                disabled: !!avatar.disabled,
                checked: avatar.key === role.avatar
            }
        });

        const avatarChecked = roleAvatars.filter((item: any) => item.key == role.avatar)[0];
        const avatarCheckedLabel = avatarChecked && avatarChecked.label || '角色类型'

        const handleMenuClick: any = (e: any) => {
            // console.log('roleAvatars click', e);
            updateRole({
                key: 'avatar', data: e.key
            })
        };

        const menuProps: any = {
            items,
            onClick: handleMenuClick,
        };
        return <Card
            key={id}
            title={menuName.cardTitle}
            //   extra={createType(type, agents, updateType)}
            style={{ width: 300 }}>
            {/* <Dropdown menu={menuProps}>
                    <Button>
                        <Space>
                            {avatarCheckedLabel}
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown> */}

            {/* {createName(keys['name'], role.name, updateRole)} */}

            {createText(keys['text'], role.text, updateRole)}

            {/* {createModel(model, temperature, models, updateModel)} */}

            {/* <Space direction="horizontal" size="middle" style={{ display: 'flex' }}>
                    {data.debug ? <Button onClick={(e) => data.debug ? data.debug(data) : ''} >调试</Button> : ''}
                </Space> */}

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

    return (
        <div style={nodeStyle}>

            {createNode(role, updateRole)}
            {/* <Handle type="target" position={Position.Left} /> */}

            <Handle type="source" position={Position.Right} />

        </div>
    );
}

export default RoleNode;