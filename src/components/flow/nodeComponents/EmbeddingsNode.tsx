import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card,Dropdown} from 'antd';

import { createDebug, createText, nodeStyle, getI18n } from './Base'

import i18n from "i18next";



function Main({ id, data, selected }: any) {

    // i18nInit();
    const { debugMenu, contextMenus } = getI18n();
    const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
    const [debugInput, setDebugInput] = React.useState((data.merged ? JSON.stringify(data.merged, null, 2) : ""));
    const [shouldRefresh, setShouldRefresh] = React.useState(true)

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
            data.onChange({ id, data: { role: r, debugInput: "" } });

            setShouldRefresh(true);

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

        // console.log(data.debugInput, debugInput)
        if (data.debugInput != debugInput && shouldRefresh) {
            setDebugInput(data.debugInput);
            setShouldRefresh(false)
        }

        return <Card
            key={id}
            title={
                <>
                    <p style={{ marginBottom: 0 }}>{i18n.t('roleNodeTitle')}</p>
                    <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', padding: '0px', paddingTop: '10px', margin: 0, fontWeight: "normal", marginBottom: 10 }}>
                        ID: {id}
                    </p>
                </>
            }
            bodyStyle={{ paddingTop: 0 }}
            // extra={}
            style={{ width: 300 }}>

            {
                // createText('text', i18n.t('createRole'), i18n.t('inputTextPlaceholder'), role.text, '', updateData)
            }

            {/* {
                createDebug(debugMenu, id,
                    debugInput,
                    data.debugOutput,
                    (event: any) => {
                        if (event.key == 'input') {
                            const { data } = event;
                            setDebugInput(data)
                            let json: any;
                            try {
                                json = JSON.parse(data);
                                setStatusInputForDebug('')
                            } catch (error) {
                                setStatusInputForDebug('error')
                            }
                        };
                        if (event.key == 'draggable') updateData(event)
                    },
                    () => {
                        console.log('debugFun debugInput', debugInput)
                        if (debugInput != "" && debugInput.replace(/\s/ig, "") != "[]" && statusInputForDebug != 'error') {
                            let merged;
                            try {
                                merged = JSON.parse(debugInput)
                            } catch (error) {

                            }
                            console.log('debugFun merged', merged)
                            data.merged = merged;
                            data.debugInput = JSON.stringify(merged, null, 2);
                            if (data.role) data.role.merged = merged.filter((f: any) => f.role == 'system');
                            data.debug && data.debug(data);
                        } else if (debugInput == "" || debugInput.replace(/\s/ig, "") == "[]") {
                            data.merged = null;
                            data.debugInput = "";
                            if (data.role) data.role.merged = null;
                            console.log('debugFun no merged', data)
                            data.debug && data.debug(data)
                            setShouldRefresh(true);
                        }
                    },
                    () => data.merge && data.merge(data),
                    {
                        statusInput: statusInputForDebug,
                        statusOutput: ""
                    })
            } */}

        </Card>
    }


    return (
        <Dropdown menu={contextMenus(id, data)}
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