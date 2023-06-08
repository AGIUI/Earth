import React from 'react'
import { Input, Collapse,Divider, Button } from 'antd';
const { Panel } = Collapse;
import { CaretRightOutlined } from '@ant-design/icons';

const { TextArea } = Input;


const menuNames = {
    more: "调试",
    debugRun: '运行',
    debugParama: '输入',
    debugResult: '输出'
}



export const createDebug = (key, data, onChange) => {
    const { api } = data;
    const { init } = api;
    return <Collapse bordered={false}
        size="small"
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        style={{ background: '#eee', marginTop: '24px' }}
    >
        <Panel header={menuNames.more} key="1">
            <p>{menuNames.debugParama}</p>
            <TextArea
                rows={4}
                autoSize
                value={JSON.stringify(init, null, 2)}
                placeholder={JSON.stringify(init, null, 2)}
                onChange={(e) => {
                    const data = {
                        ...api,
                        init: JSON.parse(e.target.value)
                    }
                    onChange({
                        key,
                        data
                    })
                }}
            />
            {data.debug ? <><Divider dashed />
                <Button onClick={(e) => data.debug ? data.debug(data) : ''} >{menuNames.debugRun}</Button></> : ''}
        </Panel>
    </Collapse>
}