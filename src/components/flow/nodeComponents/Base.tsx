import React from 'react'

import { Input, Collapse, Divider, Button, Checkbox, Select, Radio, Slider } from 'antd';

const { Panel } = Collapse;
import { CaretRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const { Option } = Select;

export const createName = (title: string, name: string, onChange: any) =>
    <Input addonBefore="@" defaultValue={name}
        placeholder={title}
        onChange={(e) => {
            onChange({
                key: 'name',
                data: e.target.value
            })
        }} />

export const createURL = (urlTitle: string, urlPlaceholder: string, protocol: string, url: string, onChange: any) => <>
    <p>{urlTitle}</p>
    <Input addonBefore={
        <Select defaultValue={protocol} onChange={(e: string) => {
            onChange({
                key: 'protocol',
                data: e
            })
        }}>
            <Option value="http://">http://</Option>
            <Option value="https://">https://</Option>
        </Select>
    }
        placeholder={urlPlaceholder}
        defaultValue={url}
        onChange={(e: any) => {
            onChange({
                key: 'url',
                data: e.target.value
            })
        }}
    />
</>

export const createSelect = (title: string, value: string, opts: any, onChange: any) => <>
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
</>

export const createTextArea = (title: string, value: string, placeholder: string, status: any, onChange: any) => <>
    <p>{title}</p>
    <TextArea
        value={value}
        rows={4}
        placeholder={placeholder}
        autoSize
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
    return <Select
        value={nodeInputId}
        style={{ width: '100%', marginTop: '8px', marginBottom: '12px' }}
        onChange={(e) => {
            onChange({
                key: 'nodeInput',
                data: e
            })
        }}
        options={nodeOpts}
        onClick={()=>{
            onChange({
                key: 'nodeInput-onClick',
                data: nodeInputId
            })
        }}
     
    />
}


// 从上一节点获取文本
export const selectNodeInput = (title: string, nodeInputId: string, nodeOpts: any, onChange: any) => {
    // console.log(nodeInputId,nodeOpts)

    const [checked, setChecked] = React.useState(nodeOpts.filter((n: any) => n.value === nodeInputId).length > 0)

    // console.log(nodeOpts.filter((n: any) => n.value === nodeInputId))
    return <>
        <Checkbox
            style={{ marginTop: '12px' }}
            defaultChecked={checked}
            // checked={input == "nodeInput"}
            onChange={(e) => {
                setChecked(e.target.checked)
                onChange({
                    key: 'nodeInput',
                    data: e.target.checked ? nodeInputId : ""
                })

            }}>{title}</Checkbox>

        {
            checked ? <Select
                value={nodeInputId}
                style={{ width: '100%', marginTop: '8px', marginBottom: '12px' }}
                onChange={(e) => {
                    onChange({
                        key: 'nodeInput',
                        data: e
                    })
                }}
                options={nodeOpts}
            /> : ''
        }
    </>
}

// 选择输入，从用户输入 or 从节点

export const selectInput = (
    nodeInputLabel: string,
    userInputLabel: string,
    nodeInputId: string,
    userInput: string,
    nodeOpts: any,
    onChange: any) => {

    // const [inp, setInp] = React.useState(nodeInputId ? 'nodeInput' : "userInput");
    // console.log(inp)
    const [uinp, setUserInput] = React.useState(userInput);
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
export const createText = (key: string, header: string, placeholder: string, value: string, status: any, onChange: any) => <>
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
        value={value}
        placeholder={placeholder}
        disabled={!onChange}
        onChange={(e) => {
            onChange && onChange({
                key,
                data: e.target.value
            })
        }}
    />
</>


// debug组件
export const createDebug = (
    menuNames: any,
    id: string,
    input: string,
    output: string,
    onChange: any,
    debugFun: any,
    status: any
) => {
    const { header,
        inputText,
        inputTextPlaceholder,
        outputText,
        outputTextPlaceholder,
        debugRun } = menuNames;
    const {
        statusInput, statusOutput
    } = status || {};

    // console.log('createDebug:::',input)

    return <Collapse bordered={false}
        size="small"
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        style={{ background: '#eee', marginTop: '32px' }}
    >
        <Panel header={header} key="1">
            <p style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }}>ID: {id}</p>
            {
                input && createText('input', inputText, inputTextPlaceholder, input, statusInput, onChange)
            }
            {
                output && createText('output', outputText, outputTextPlaceholder, output, statusOutput || '-', onChange)
            }

            <Divider dashed />
            {debugFun ? <Button onClick={(e) => debugFun()} >{debugRun}</Button> : ''}
        </Panel>
    </Collapse>
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
            onChange({
                key: 'delayFormat',
                data: e
            })
        }}>
            {
                Array.from(opts, (o: any) => <Option value={o.value}>{o.label}</Option>)
            }
        </Select>
    }
        // placeholder={i18n.t('delayPlaceholder')}
        defaultValue={delay}
        onChange={(e: any) => {
            let t = parseFloat(e.target.value);
            if (delayFormat == 's') t = 1000 * t;
            onChange({
                key: 'delay',
                data: t
            })
        }}
    />
</>
