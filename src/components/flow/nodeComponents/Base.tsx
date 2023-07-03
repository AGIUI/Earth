import React from 'react'


import { Tooltip, Input, Collapse, Divider, Button, Checkbox, Select, Radio, Slider, Popconfirm } from 'antd';

const { Panel } = Collapse;
import { CaretRightOutlined, QuestionCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';


const { TextArea } = Input;

const { Option } = Select;

import i18n from "i18next";

export const createCardTitle = (title: string, id: string, data: any) => {

    return <>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <p style={{ marginBottom: 0 }}>{title}</p>
            <Tooltip title={<TextArea
                style={{
                    color: 'white',
                    background: 'none',
                    width: '480px',
                    fontSize: '12px'
                }}
                autoSize
                value={JSON.stringify(parsePrompt({ ...data, id }), null, 2)} />} placement="rightBottom">
                <InfoCircleOutlined style={{ marginBottom: 0 }} rev={undefined} />
            </Tooltip>
        </div>
        <p style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            padding: '0px',
            paddingTop: '10px',
            margin: 0,
            fontWeight: "normal",
            marginBottom: 10
        }}>
            ID: {id}
        </p>
    </>
}

export const createName = (title: string, name: string, onChange: any) =>
    <Input addonBefore="@" defaultValue={name}
        placeholder={title}
        onChange={(e) => {
            onChange({
                key: 'name',
                data: e.target.value
            })
        }} />

export const createURL = (urlTitle: string, urlPlaceholder: string, protocol: string, url: string, onChange: any) => {
    const handleUrlChange = (e: any) => {
        let value = e.target.value;
        if (value.startsWith("http://")) {
            value = value.substr(7);
        } else if (value.startsWith("https://")) {
            value = value.substr(8);
        }
        onChange({
            key: 'url',
            data: value
        });
    };

    let displayedUrl = url;
    if (displayedUrl.startsWith("http://")) {
        displayedUrl = displayedUrl.substr(7);
    } else if (displayedUrl.startsWith("https://")) {
        displayedUrl = displayedUrl.substr(8);
    }

    return (
        <>
            <p>{urlTitle}</p>
            <Input
                addonBefore={
                    <Select defaultValue={protocol} onChange={(e: string) => {
                        onChange({
                            key: 'protocol',
                            data: e
                        });
                    }}>
                        <Option value="http://">http://</Option>
                        <Option value="https://">https://</Option>
                    </Select>
                }
                placeholder={urlPlaceholder}
                defaultValue={displayedUrl}
                onChange={handleUrlChange}
            />
        </>
    );
};


export const createSelect = (title: string, value: string, opts: any, onChange: any) => <div

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
    <Select
        value={value}
        style={{ width: 200 }}
        onChange={(e) => {
            onChange({
                key: title,
                data: e,
            })
        }}
        options={opts}
    />
</div>

export const createTextArea = (title: string, value: string, placeholder: string, status: any, onChange: any, help: any = null) => <>

    <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
    }}>
        <p>{title}</p>

        {help ? <Popconfirm
            showCancel={false}
            title={title}
            description={
                <TextArea
                    // disabled={true}
                    bordered={false}
                    value={help}
                    autoSize
                ></TextArea>}
            onConfirm={() =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(null), 100);
                })}
            onOpenChange={() => console.log('open change')}
        >
            <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f', marginLeft: '8px' }} rev={undefined} />
        </Popconfirm> : ""}

    </div>

    <TextArea
        value={value}
        rows={4}
        placeholder={placeholder}
        autoSize
        showCount={false}
        status={status}
        onChange={(e) => {
            onChange({
                key: title,
                data: e.target.value
            })
        }}
    /></>


export const createOutput = (title: string, key: string, value: string, opts: any, onChange: any) => <>
    <p>{title}</p>
    <Radio.Group
        style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'baseline'
        }}
        defaultValue={value}
        value={value}
        options={opts}
        onChange={(e: any) => {
            // console.log(e)
            onChange({
                key: key,
                data: e.target.value
            })
        }} />
</>


export const selectNodeInputBase = (nodeInputId: string, nodeOpts: any, onChange: any) => {

    return <div
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
        <Select
            value={nodeInputId}
            style={{ width: '100%', marginTop: '8px', marginBottom: '12px' }}
            onChange={(e) => {
                onChange({
                    key: 'nodeInput',
                    data: e
                })
            }}
            options={nodeOpts}
            onClick={() => {
                onChange({
                    key: 'nodeInput-onClick',
                    data: nodeInputId
                })
            }}
        />
    </div>
}


// 从上一节点获取文本
export const SelectNodeInput: any = (props: any) => {

    let { title,
        nodeInputId,
        nodeOpts,
        onChange } = props;

    // console.log('selectNodeInput:', nodeOpts)
    const [checked, setChecked] = React.useState(nodeOpts && nodeOpts[0] ?
        nodeOpts.filter((n: any) => n.value === nodeInputId).length > 0 : false)


    return <div
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

        <Checkbox
            style={{ marginTop: '12px' }}
            defaultChecked={checked}
            // checked={input == "nodeInput"}
            onChange={(e) => {
                setChecked(e.target.checked)
                if (!nodeInputId && nodeOpts && nodeOpts[0] && nodeOpts[0].index === 1) nodeInputId = nodeOpts[0].value;
                console.log("Checkbox ", nodeInputId, nodeOpts)
                onChange({
                    key: 'nodeInput',
                    data: e.target.checked ? nodeInputId : ""
                })

            }}>{title}</Checkbox>

        {
            checked ?
                <>
                    <Select
                        value={nodeInputId}
                        style={{ width: '100%', marginTop: '8px', marginBottom: '12px' }}
                        onChange={(e) => {
                            onChange({
                                key: 'nodeInput',
                                data: e
                            })
                        }}
                        options={nodeOpts || []}
                    />
                    <p style={{ marginTop: 0, color: "red", fontSize: 12 }}>{i18n.t('getFromBeforeTips')}</p>
                </>
                : ''
        }
    </div>
}

// 选择输入，从用户输入 or 从节点

export const SelectInput: any = (props: any) => {

    let { nodeInputLabel,
        userInputLabel,
        nodeInputId,
        userInput,
        nodeOpts,
        onChange } = props;

    const [uinp, setUserInput] = React.useState(userInput || '');
    return <>
        <Select
            defaultValue={nodeInputId ? 'nodeInput' : "userInput"}
            style={{ width: '100%' }}
            onChange={(e) => {
                onChange({
                    key: 'setInput',
                    data: e,
                    userInput: uinp
                })
            }}
            options={[
                { value: 'nodeInput', label: nodeInputLabel },
                { value: 'userInput', label: userInputLabel },
            ]}
        />
        {
            nodeInputId ? <Select
                value={nodeInputId}
                style={{ width: '100%', marginTop: '8px', marginBottom: '12px' }}
                onChange={(e) => {
                    onChange({
                        key: 'nodeInput',
                        data: e
                    })
                }}
                options={nodeOpts}
            /> : <TextArea
                style={{ marginTop: '8px' }}
                value={uinp}
                rows={4}
                showCount={false}
                placeholder={"input ..."}
                autoSize={{ minRows: 2, maxRows: 10 }}
                onChange={(e) => {
                    setUserInput(e.target.value)
                    onChange({
                        key: 'userInput',
                        data: e.target.value
                    })
                }}
            />
        }
    </>
}


// 标题 + 长文本输入框
export const createText = (key: string, header: string, placeholder: string, value: string, status: any, onChange: any) => {
    // const [text, setText] = React.useState(value || '')
    const text = value || ''
    return <>
        <p>{header}</p>
        <TextArea
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
            style={{
                marginBottom: '12px'
            }}
            showCount
            allowClear
            status={status}
            rows={4}
            autoSize={{ minRows: 2, maxRows: 10 }}
            // defaultValue={text}
            value={text}
            placeholder={placeholder}
            disabled={!onChange}
            onChange={(e) => {
                onChange && onChange({
                    key,
                    data: e.target.value
                })
                // setText(e.target.value)
            }}
        />
    </>

}

// debug组件
// 增加 merge 功能，把prompt保存下来
export const createDebug = (
    menuNames: any,
    id: string,
    input: string,
    output: string,
    onChange: any,
    debugFun: any,
    mergeFun: any,
    status: any
) => {
    const {
        header,
        inputText,
        inputTextPlaceholder,
        outputText,
        outputTextPlaceholder,
        debugRun,
        mergeRun
    } = menuNames;
    const {
        statusInput, statusOutput
    } = status || {};


    // console.log('createDebug:::', input)

    return <>


        {/*<p style={{*/}
        {/*    textOverflow: 'ellipsis',*/}
        {/*    overflow: 'hidden',*/}
        {/*    padding: '0px',*/}
        {/*    paddingTop: '12px',*/}
        {/*    margin: 0*/}
        {/*}}>ID: {id} </p>*/}


        <Collapse bordered={false}
            size="small"
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} rev={undefined} />}
            style={{ background: '#eee', marginTop: '14px' }}
        >
            <Panel header={header} key="1">

                {
                    createText('input', inputText, inputTextPlaceholder, input || '', statusInput, onChange)
                }
                {/* {
                    output && createText('output', outputText, outputTextPlaceholder, output, statusOutput || '-', onChange)
                } */}

                <Divider dashed />

                {debugFun ? <Button onClick={(e) => {
                    debugFun()
                }}
                    style={{
                        margin: '8px',
                        marginLeft: 0
                    }}
                >{debugRun}</Button> : ''}

                {mergeFun ? <Button onClick={(e) => mergeFun()}
                    style={{
                        marginLeft: '0px'
                    }}
                >{mergeRun}</Button> : ''}

                {/* {debugRun ? <Button onClick={(e) => debugFun(input)}
                    style={{
                        marginLeft: '12px'
                    }}
                >{debugRun}</Button> : ''} */}

            </Panel>
        </Collapse></>
}

export const createModel = (model: string, temperature: number, opts: any, onChange: any) => <>
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

    <p>{opts.filter((m: any) => m.value == 'temperature')[0].label}
        <span style={{ fontSize: '12px', marginLeft: '12px' }}>: {temperature}</span>
    </p>

    <div
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
        <Slider
            style={{ width: '200px' }}
            range={false}
            max={1}
            min={0}
            step={0.01}
            defaultValue={temperature}
            value={temperature}
            onChange={(e: any) => {
                // console.log('temperature', e)
                onChange({
                    key: 'temperature',
                    data: e
                })

            }}

        />
    </div>
</>


export const createDelay = (title: string, delayFormat: string, delay: string, opts: any, onChange: any) => <>
    <p>{title}</p>
    <Input addonAfter={
        <Select defaultValue={delayFormat} onChange={(e: string) => {
            let d = parseFloat(delay)
            if (e == 's') d = d / 1000;
            if (e == 'ms') d = d * 1000;
            onChange({
                key: 'delay',
                data: {
                    delay: d,
                    delayFormat: e
                }
            })
        }}>
            {
                Array.from(opts, (o: any, i) => <Option key={i} value={o.value}>{o.label}</Option>)
            }
        </Select>
    }
        // placeholder={i18n.t('delayPlaceholder')}
        value={delay}
        onChange={(e: any) => {
            let t = parseFloat(e.target.value);
            onChange({
                key: 'delay',
                data: {
                    delay: t,
                    delayFormat
                }
            })
        }}
    />
</>


export const nodeStyle = {
    border: '1px solid transparent',
    padding: '2px 5px',
    borderRadius: '12px',
};

export const getI18n = () => {
    const debugMenu = {
        header: i18n.t('debug'),
        inputText: i18n.t('inputText'),
        inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
        outputText: i18n.t('outputText'),
        outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
        debugRun: i18n.t('debugRun'),
        mergeRun: i18n.t('mergeRun'),
    }

    const contextMenus = (id: string, data: any, keys: any = ['debug', 'clone', 'delete']) => {

        const items = Array.from(keys, (key: string) => ({
            label: i18n.t(key),
            key
        }))

        return {
            items,
            onClick: (e: any) => {
                if (e.key == 'debug' && data.debug && keys.includes(e.key)) {
                    data.debug(data)
                };
                if (e.key == 'delete' && keys.includes(e.key)) {
                    data.delete(id)
                }
                if (e.key == 'clone' && keys.includes(e.key)) {
                    data.clone(id)
                }
            }
        }

    }
    return { debugMenu, contextMenus }
}

export const parsePrompt = (data: any) => {
    let prompt: any = {
        id: data.id,
        nextId: data.nextId,
        nodeInputId: data.nodeInputId,
        role: data.role,
        text: data.text,
        url: data.url,
        api: data.api,
        file: data.file,
        inputs: data.inputs,
        queryObj: data.queryObj,
        temperature: data.temperature,
        model: data.model,
        input: data.input,
        userInput: data.userInput,
        translate: data.translate,
        output: data.output,
        type: data.type,
        merged: data.merged,
        // 用来调试
        _debugOutput: data.debugOutput,
        _debugInput: data.debugInput,
    }

    // 针对prompt的数据进行处理，只保留有用的
    if (prompt.type.match('query') &&
        prompt.type.startsWith('query')) {
        delete prompt.api;
        delete prompt.file;
        delete prompt.inputs;
        delete prompt.model;
        delete prompt.temperature;
        delete prompt.translate;
        delete prompt.merged;
        delete prompt.output;
        delete prompt.text;
    }

    if (prompt.type.match('prompt') &&
        prompt.type.startsWith('prompt')) {
        delete prompt.api;
        delete prompt.queryObj;
        delete prompt.file;
        delete prompt.inputs;
    }

    if ([
        "userInputText", "inputMerge"
    ].includes(prompt.type)) {
        prompt = {
            id: prompt.id,
            type: prompt.type,
            inputs: prompt.inputs,
            userInput:prompt.userInput //提示文案
        }
    }

    if (prompt.type == "api") {
        delete prompt.queryObj;
        delete prompt.file;
        delete prompt.inputs;
        delete prompt.model;
        delete prompt.temperature;
        delete prompt.translate;
        delete prompt.merged;
        delete prompt.output;
        delete prompt.text;
    }


    if (prompt.type.match('file') &&
        prompt.type.startsWith('file')) {
        delete prompt.api;
        delete prompt.queryObj;
        delete prompt.inputs;
        delete prompt.model;
        delete prompt.temperature;
        delete prompt.translate;
        delete prompt.merged;
        delete prompt.output;
        delete prompt.text;
    }

    if (prompt.type == 'role') {
        prompt = {
            role: prompt.role,
            type: prompt.type,
            id: prompt.id
        }
    }

    delete prompt._debugOutput
    delete prompt._debugInput

    return prompt

}