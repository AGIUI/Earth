import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { createDebug, selectNodeInput, createURL, createSelect, createTextArea } from './Base';

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

const resources = {
    en: {
        translation: {
            title: 'API Call',
            url: 'URL',
            urlPlaceholder: "Please enter www.xxxx.com",
            method: 'Method',
            parama: 'Parameters (String)',
            getFromBefore: "Get text from previous node ${text}",
            responseType: 'Response Data Type',
            output: 'Output',
            outputKeyword: "Output Field",
            debug: "Debug",
            debugRun: 'Run',
            debugParama: 'Request Parameters',
            text: 'Text',
            images: 'Images',
            audio: 'Audio',

            inputText: 'Input',
            inputTextPlaceholder: '',
            outputText: 'Output',
            outputTextPlaceholder: '',

        },
    },
    zh: {
        translation: {
            title: 'API调用',
            url: 'URL',
            urlPlaceholder: "请输入www.xxxx.com",
            method: '方法',
            parama: '参数(字符串)',
            getFromBefore: "从上一节点获取文本 ${text} ",
            responseType: '返回的数据类型',
            output: '输出',
            outputKeyword: "输出字段",
            debug: "调试",
            debugRun: '运行',
            debugParama: '请求参数',
            text: '文本',
            images: '多张图片',
            audio: '音频',

            inputText: '输入',
            inputTextPlaceholder: '',
            outputText: '输出',
            outputTextPlaceholder: '',
        },
    },
};


function Main({ id, data, selected }: NodeProps<NodeData>) {

    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
            lng: navigator.language,
            debug: false,
            interpolation: {
                escapeValue: false, // 不需要对翻译文本进行转义
            },
        });

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

    const { protocol, url, responseType } = data.api;
    const key = 'api';

    const extract = {
        ...(data.api.init.extract || {
            key: '', type: ''
        })
    }


    return (
        <Dropdown menu={{ items: contextMenus, onClick: () => data.debug ? data.debug() : '' }} trigger={['contextMenu']}>
            <div
                style={selected ? {
                    ...nodeStyle,
                    backgroundColor: 'cornflowerblue'
                } : nodeStyle}

                key={id}>

                <Card
                    key={id}
                    title={i18n.t('title')}
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
                            createTextArea(i18n.t('parama'), body, bodyStatus, (e: any) => {
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
                            createSelect(i18n.t('output'), extract.type || 'text', [
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
                                            ...extract,
                                            type: e.data
                                        }
                                    }
                                };
                                onChange({
                                    key,
                                    data: d
                                })
                            })
                        }


                        {
                            createTextArea(i18n.t('outputKeyword'), extract.key, "", (e: any) => {
                                const d = {
                                    ...data.api,
                                    init: {
                                        ...data.api.init,
                                        extract: {
                                            ...extract,
                                            key: e.data
                                        }
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
                                header:i18n.t('debug'),
                                inputText:i18n.t('inputText'),
                                inputTextPlaceholder:i18n.t('inputTextPlaceholder'),
                                outputText:i18n.t('outputText'),
                                outputTextPlaceholder:i18n.t('outputTextPlaceholder'),
                                debugRun:i18n.t('debugRun'),
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