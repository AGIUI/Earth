import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider, MenuProps } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

import { createDebug, createText } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';
import { roleAvatars } from '../Workflow'

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
        // const items: any = Array.from(roleAvatars, (avatar: any) => {
        //     return {
        //         label: avatar.label,
        //         key: avatar.key,
        //         icon: <UserOutlined />,
        //         disabled: !!avatar.disabled,
        //         checked: avatar.key === role.avatar
        //     }
        // });

        // const handleMenuClick: any = (e: any) => {
        //     // console.log('roleAvatars click', e);
        //     updateRole({
        //         key: 'avatar', data: e.key
        //     })
        // };


        return <Card
            key={id}
            title={i18n.t('roleNodeTitle')}
            bodyStyle={{ paddingTop: 0 }}
            //   extra={createType(type, agents, updateType)}
            style={{ width: 300 }}>

            {
                createText('text', i18n.t('createRole'), i18n.t('inputTextPlaceholder'), role.text, '', updateRole)
            }

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
            } : nodeStyle}>

                {createNode(role, updateRole)}
                {/* <Handle type="target" position={Position.Left} /> */}

                <Handle type="source" position={Position.Right} />

            </div>
        </Dropdown>
    );
}

export default Main;