import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

import { roleAvatars } from '../Workflow'
import { createDebug, createText } from './Base'

export type NodeData = {
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

const menuName = {
    cardTitle: '角色',
    createText: '角色定义',
    placeholder: '输入...'
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



function RoleNode({ id, data, selected }: NodeProps<NodeData>) {
    // console.log('RoleNode', JSON.stringify(data, null, 2))

    // text
    const [role, setRole] = React.useState(data.role)
    const updateRole = (e: any) => {
        console.log(e)
        let r = { ...role };
        if (e.key == 'text' || e.key == 'name' || e.key == 'avatar') {
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
            bodyStyle={{ paddingTop: 0 }}
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

            {/* {createText(keys['text'], role.text, updateRole)} */}
            {
                createText('text', menuName.createText, menuName.placeholder, role.text, '', updateRole)
            }

            {/* {createModel(model, temperature, models, updateModel)} */}

            {/* <Space direction="horizontal" size="middle" style={{ display: 'flex' }}>
                    {data.debug ? <Button onClick={(e) => data.debug ? data.debug(data) : ''} >调试</Button> : ''}
                </Space> */}

            {
                createDebug(id, data.debugInput, data.debugOutput, (event: any) => {
                    if (event.key == 'input') { }
                }, () => data.debug ? data.debug(data) : '', {})
            }

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