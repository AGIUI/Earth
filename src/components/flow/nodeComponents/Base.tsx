import React from 'react'
import { Input, Collapse, Divider, Button, Checkbox, Select } from 'antd';
const { Panel } = Collapse;
import { CaretRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;


const menuNames = {
    header: "调试",
    inputText: '输入',
    inputTextPlaceholder: '',
    outputText: '输出',
    outputTextPlaceholder: '',
    debugRun: '运行',
    getFromBefore: "从上一节点获取文本 ${text} ",
    getUserInput: '输入文本',
    userInput: "请输入任意文本"
}

// 从上一节点获取文本
export const selectNodeInput = (nodeInputId: string, nodeOpts: any, onChange: any) => {
    const [checked, setChecked] = React.useState(false)
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

            }}>{menuNames.getFromBefore}</Checkbox>
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
export const selectInput = (nodeInputId: string, userInput: string, nodeOpts: any, onChange: any) => {
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
                { value: 'nodeInput', label: menuNames.getFromBefore },
                { value: 'userInput', label: menuNames.getUserInput },
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
                placeholder={menuNames.userInput}
                autoSize
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
        autoSize
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
