import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { createDebug, selectNodeInput, createURL, createSelect, createTextArea } from './Base';

import i18n from "i18next";
import { i18nInit } from '../locales/i18nConfig';

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


    const [api, setApi] = React.useState(data.api)

    const [init, setInit] = React.useState(JSON.stringify(api.init, null, 2));

    const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)

    const [statusInput, setStatusInput] = React.useState('')

    const [body, setBody] = React.useState(JSON.stringify(api.init.body, null, 2))

    const [bodyStatus, setBodyStatus] = React.useState('');

    const onChange = (e: any) => {
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
                        }
                    }
                })
                setInit(JSON.stringify(init, null, 2))
                setBodyStatus('')
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

        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    }

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)];

    let { protocol, url, responseType, extract } = data.api;
    const key = 'api';
    if (!extract) extract = data.api.init.responseExtract
    // const extract = {
    //     ...(data.api.init.extract || {
    //         key: '', type: ''
    //     })
    // }

    return (
        <Dropdown menu={{ items: contextMenus, onClick: () => data.debug ? data.debug(data) : '' }} trigger={['contextMenu']}>
            <div
                style={selected ? {
                    ...nodeStyle,
                    backgroundColor: 'cornflowerblue'
                } : nodeStyle}

                key={id}>

                <Card
                    key={id}
                    title={i18n.t('apiNodeTitle')}
                    bodyStyle={{ paddingTop: 0 }}
                    style={{ width: 300 }}>
                    <div
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
                                onChange({
                                    key,
                                    data: d
                                })
                            })
                        }
                        {
                            createSelect(i18n.t('method'), data.api.init.method || 'POST', [
                                { value: 'POST', label: 'POST' },
                                { value: 'GET', label: 'GET' }
                            ], (e: any) => {
                                if (e.key == "method") {
                                    const d = {
                                        ...data.api,
                                        init: {
                                            ...data.api.init,
                                            method: e.data,
                                        }
                                    }
                                    onChange({
                                        key,
                                        data: d
                                    })
                                }

                            })
                        }

                        {
                            createTextArea(i18n.t('parama'), body, '', bodyStatus, (e: any) => {
                                onChange({
                                    key: "body",
                                    data: e.data
                                })
                            })
                        }

                        {
                            selectNodeInput(i18n.t('getFromBefore'), nodeInputId, nodeOpts, onChange)
                        }

                        {
                            createSelect(i18n.t('responseType'), responseType, [
                                { value: 'text', label: i18n.t('text') },
                                { value: 'json', label: 'JSON' }
                            ], (e: any) => {
                                const d = {
                                    ...data.api,
                                    init: {
                                        ...data.api.init,
                                        responseType: e.data,
                                    },
                                    responseType: e.data
                                }
                                onChange({
                                    key,
                                    data: d
                                })
                            })
                        }

                        {
                            createSelect(i18n.t('output'), extract?.type || 'text', [
                                { value: 'text', label: i18n.t('text') },
                                { value: 'images', label: i18n.t('images') },
                                { value: 'json', label: 'JSON', disabled: true },
                                { value: 'audio', label: i18n.t('audio'), disabled: true }
                            ], (e: any) => {

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
                                onChange({
                                    key,
                                    data: d
                                })
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
                                onChange({
                                    key,
                                    data: d
                                })
                            })
                        }


                        {
                            createDebug({
                                header: i18n.t('debug'),
                                inputText: i18n.t('inputText'),
                                inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
                                outputText: i18n.t('outputText'),
                                outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
                                debugRun: i18n.t('debugRun'),
                            }, id, init, data.api.debugOutput, (event: any) => {
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
                </Card>
                <Handle type="target" position={Position.Left} />
                <Handle type="source" position={Position.Right} />

            </div>
        </Dropdown>
    );
}

export default Main;