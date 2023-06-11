import React from 'react'
import { Input, Collapse, Divider, Button } from 'antd';
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
}

const textUI = (key: string, header: string, placeholder: string, value: string, onChange: any) => <>
    <p>{header}</p>
    <TextArea
        rows={4}
        autoSize
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
            onChange({
                key,
                data: e.target.value
            })
        }}
    />
</>


export const createDebug = (input: string, output: string, onChange: any, debugFun: any) => {
    const { header,
        inputText,
        inputTextPlaceholder,
        outputText,
        outputTextPlaceholder,
        debugRun } = menuNames;
    return <Collapse bordered={false}
        size="small"
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        style={{ background: '#eee', marginTop: '24px' }}
    >
        <Panel header={header} key="1">
            {
                textUI('input', inputText, inputTextPlaceholder, input, onChange)
            }
            {
                textUI('output', outputText, outputTextPlaceholder, output, onChange)
            }

            <Divider dashed />
            {debugFun ? <Button onClick={(e) => debugFun()} >{debugRun}</Button> : ''}
        </Panel>
    </Collapse>
}


// export const createDebug = (key: string, data: any, onChange: any) => {
//     const { api } = data;
//     const { init } = api;

    

//     return <Collapse bordered={false}
//         size="small"
//         expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
//         style={{ background: '#eee', marginTop: '24px' }}
//     >
//         <Panel header={menuNames.more} key="1">
//             <p>{menuNames.debugParama}</p>
//             <TextArea
//                 rows={4}
//                 autoSize
//                 value={JSON.stringify(init, null, 2)}
//                 placeholder={JSON.stringify(init, null, 2)}
//                 onChange={(e) => {
//                     const data = {
//                         ...api,
//                         init: JSON.parse(e.target.value)
//                     }
//                     onChange({
//                         key,
//                         data
//                     })
//                 }}
//             />
//             {data.debug ? <><Divider dashed />
//                 <Button onClick={(e) => data.debug ? data.debug(data) : ''} >{menuNames.debugRun}</Button></> : ''}
//         </Panel>
//     </Collapse>
// }