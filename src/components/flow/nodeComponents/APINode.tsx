import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, Dropdown, Button, Popconfirm } from 'antd';

import { createCardTitle, createDebug, selectNodeInput, createURL, createSelect, createTextArea, nodeStyle, getI18n } from './Base';

import i18n from "i18next";
// import { i18nInit } from '../../locales/i18nConfig';

function Main({ id, data, selected }: any) {
    // i18nInit();
    const { debugMenu, contextMenus } = getI18n();
    const [statusInputForDebug, setStatusInputForDebug] = React.useState('');
    const [debugInput, setDebugInput] = React.useState((data.merged ? JSON.stringify(data.merged, null, 2) : ""));
    const [shouldRefresh, setShouldRefresh] = React.useState(true)


    const [api, setApi] = React.useState(data.api)

    const [init, setInit] = React.useState(JSON.stringify(api.init, null, 2));

    const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)

    const [statusInput, setStatusInput] = React.useState('')

    const [body, setBody] = React.useState(typeof (api.init.body) == 'object' ? JSON.stringify(api.init.body, null, 2) : '{}')

    const [bodyStatus, setBodyStatus] = React.useState('');


    const updateData = (e: any) => {
        if (e.key != 'draggable') console.log(JSON.stringify(e, null, 2))

        if (e.key === 'api') {
            data.onChange({ id, data: { api: e.data, debugInput: "" } })
            setApi(e.data);
            setInit(JSON.stringify(e.data.init, null, 2))
            setStatusInput('success');
            setShouldRefresh(true);
        }

        if (e.key === 'error-input') {
            setStatusInput('error');
            setInit(e.data)
        }

        if (e.key === 'body') {
            setBody(e.data);
            try {
                let b = JSON.parse(e.data);
                const init = {
                    ...api.init,
                    body: b
                };
                data.onChange({
                    id,
                    data: {
                        api: {
                            ...api,
                            init
                        },
                        debugInput: ""
                    }
                })
                setInit(JSON.stringify(init, null, 2))
                setBodyStatus('')
                setShouldRefresh(true);
            } catch (error) {
                setBodyStatus('error')
            }
        }

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

        if (e.key == "debug") data.onChange({ id, data: e.data })
        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    }

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)];

    let { protocol, url, responseType, extract } = data.api;

    if (!extract) extract = data.api.init.responseExtract
    // const extract = {
    //     ...(data.api.init.extract || {
    //         key: '', type: ''
    //     })
    // }
    console.log('setShouldRefresh(true)', data.debugInput, debugInput, shouldRefresh)
    if (data.debugInput != debugInput && shouldRefresh) {
        setDebugInput(data.debugInput);
        setShouldRefresh(false)
    }

    return (
        <Dropdown menu={contextMenus(id, data)} trigger={['contextMenu']}>
            <div
                style={selected ? {
                    ...nodeStyle,
                    backgroundColor: 'cornflowerblue'
                } : nodeStyle}

                key={id}>

                <Card
                    key={id}
                    title={
                        createCardTitle(i18n.t('apiNodeTitle'), id, data)
                    }
                    bodyStyle={{ paddingTop: 0 }}
                    style={{ width: 300 }}>
                    <div
                        style={{ cursor: 'default' }}
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
                        {
                            createURL(i18n.t('url'), i18n.t('urlPlaceholder'), protocol, url, (e: any) => {
                                let d = {
                                    ...data.api,
                                    protocol: e.data
                                }
                                if (e.key == 'url') {
                                    d = {
                                        ...data.api,
                                        url: e.data
                                    }
                                }
                                updateData({
                                    key: 'api',
                                    data: d
                                })
                            })
                        }
                        {
                            createSelect(i18n.t('method'), data.api.init.method || 'POST', [
                                { value: 'POST', label: 'POST' },
                                { value: 'GET', label: 'GET' }
                            ], (e: any) => {
                                if (e.key == i18n.t('method')) {
                                    const d = {
                                        ...data.api,
                                        init: {
                                            ...data.api.init,
                                            method: e.data,
                                        }
                                    }
                                    updateData({
                                        key: 'api',
                                        data: d
                                    })
                                }

                            })
                        }

                        {
                            createTextArea(i18n.t('paramaBody'), body, '', bodyStatus, (e: any) => {
                                updateData({
                                    key: "body",
                                    data: e.data
                                })
                            }, JSON.stringify({
                                "batchCount": 3,
                                "prompt": "\${context}",
                                "steps": 22
                            }, null, 2))
                        }


                        {
                            selectNodeInput(i18n.t('getFromBefore'), nodeInputId, nodeOpts, updateData)
                        }

                        {
                            createSelect(i18n.t('responseType'), responseType, [
                                { value: 'text', label: i18n.t('text') },
                                { value: 'json', label: 'JSON' }
                            ], (e: any) => {
                                if (e.key === i18n.t('responseType')) {
                                    const d = {
                                        ...data.api,
                                        init: {
                                            ...data.api.init,
                                            responseType: e.data,
                                        },
                                        responseType: e.data
                                    }
                                    // console.log(JSON.stringify(e,null,2))
                                    updateData({
                                        key: 'api',
                                        data: d
                                    })
                                }

                            })
                        }

                        {
                            createSelect(i18n.t('output'), extract?.type || 'text', [
                                { value: 'text', label: i18n.t('text') },
                                { value: 'images', label: i18n.t('images') },
                                { value: 'json', label: 'JSON', disabled: true },
                                { value: 'audio', label: i18n.t('audio'), disabled: false }
                            ], (e: any) => {
                                if (e.key == i18n.t('output')) {
                                    const d = {
                                        ...data.api,
                                        init: {
                                            ...data.api.init,
                                            extract: {
                                                ...extract || {},
                                                type: e.data
                                            }
                                        },
                                        extract: {
                                            ...extract || {},
                                            type: e.data
                                        }
                                    };
                                    updateData({
                                        key: 'api',
                                        data: d
                                    })
                                }

                            })
                        }


                        {
                            createTextArea(i18n.t('outputKeyword'), extract.key, "key", "", (e: any) => {
                                const d = {
                                    ...data.api,
                                    init: {
                                        ...data.api.init,
                                        extract: {
                                            ...extract || {},
                                            key: e.data
                                        }
                                    },
                                    extract: {
                                        ...extract || {},
                                        key: e.data
                                    }
                                };
                                updateData({
                                    key: 'api',
                                    data: d
                                })
                            })
                        }


                        {
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
                                    if (debugInput != "" && debugInput && debugInput.replace(/\s/ig, "") != "[]" && statusInputForDebug != 'error') {
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
                                    } else if (debugInput == "" || debugInput && debugInput.replace(/\s/ig, "") == "[]") {
                                        data.merged = null;
                                        data.debugInput = "";
                                        if (data.role) data.role.merged = null;
                                        console.log('debugFun no merged', data)
                                        data.debug && data.debug(data);
                                        setShouldRefresh(true);
                                    } else if (debugInput === undefined) {
                                        data.debug && data.debug(data);
                                        setShouldRefresh(true);
                                    }
                                },
                                () => data.merge && data.merge(data),
                                {
                                    statusInput: statusInputForDebug,
                                    statusOutput: ""
                                })
                        }

                    </div>
                </Card>
                <Handle type="target" position={Position.Left} />
                <Handle type="source" position={Position.Right} />

            </div>
        </Dropdown>
    );
}

export default Main;