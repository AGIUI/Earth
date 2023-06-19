import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider, MenuProps } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

import { createDebug, createText, nodeStyle, getI18n } from './Base'

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';
import { roleAvatars } from '../Workflow'


function Main({ id, data, selected }: any) {

    i18nInit();
    const { debugMenu, contextMenus } = getI18n();
    const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
    const [debugInput, setDebugInput] = React.useState(data.debugInput || (data.merged ? JSON.stringify(data.merged, null, 2) : " "));
    const [shouldRefresh, setShouldRefresh] = React.useState(false)

    // text
    const [role, setRole] = React.useState(data.role);

    const updateData = (e: any) => {
        // console.log(e)
        let r = { ...role };
        if (e.key == 'text' || e.key == 'name' || e.key == 'avatar') {
            r[e.key] = e.data;
            setRole({
                ...r
            })
            data.onChange({ id, data: { role: r } })
        };

        if (e.key == "debug") data.onChange({ id, data: e.data })

        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
    }


    const createNode = (role: any, updateData: any) => {
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
        //     updateData({
        //         key: 'avatar', data: e.key
        //     })
        // };

      
        if (shouldRefresh&&data.debugInput!=debugInput) {
            setDebugInput(data.debugInput);
        }

        return <Card
            key={id}
            title={i18n.t('roleNodeTitle')}
            bodyStyle={{ paddingTop: 0 }}
            // extra={}
            style={{ width: 300 }}>

            {
                createText('text', i18n.t('createRole'), i18n.t('inputTextPlaceholder'), role.text, '', updateData)
            }

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
                    () => {
                        data.debug && data.debug(data)
                        setShouldRefresh(true)
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
            onClick: () => data.debug && data.debug(data)
        }}
            trigger={['contextMenu']}
        >
            <div style={selected ? {
                ...nodeStyle,
                backgroundColor: 'cornflowerblue'
            } : nodeStyle}>

                {createNode(role, updateData)}
                {/* <Handle type="target" position={Position.Left} /> */}

                <Handle type="source" position={Position.Right} />

            </div>
        </Dropdown>
    );
}

export default Main;