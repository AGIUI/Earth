import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

import { selectInput, createDebug } from "./Base"

const menuNames = {
  title: '文本输入',
  selectQuery: 'SelectQuery',
  selectQueryPlaceholder: '- - ',
  inputText: '文本来源',
  debug: '调试'
}

export type NodeData = {
  input: string;
  getNodes: any;
  debug: any;
  queryObj: any,
  type: string,
  onChange: any
};



const createUrl = (title1: string, placeholder1: string, title2: string, input: string, json: any, onChange: any) => {

  const { queryObj, userInput, nodeInputId } = json;
  const { query, action } = queryObj;

  let nodeOpts: any[] = [];
  if (json.getNodes) nodeOpts = [...json.getNodes()]
  let selectNodeValue = input === "nodeInput" ? (nodeInputId || nodeOpts[0].value) : null
  // console.log(input, selectNodeValue)
  return <div onMouseOver={() => {
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
    }}>
    <p>{title1}</p>
    <TextArea
      defaultValue={query}
      rows={4}
      placeholder={placeholder1}
      autoSize
      onChange={(e) => {
        const data = {
          ...json,
          queryObj: {
            ...json.queryObj,
            content: '',
            query: e.target.value,
            action: 'input'
          }
        }
        onChange({
          key: 'data',
          data
        })
      }}
    />
    <Divider dashed />
    {
      selectInput(selectNodeValue, userInput, nodeOpts, onChange)
    }

  </div>
}



function QueryInputNode({ id, data, selected }: NodeProps<NodeData>) {
  const [type, setType] = React.useState(data.type)
  // console.log('QueryURLNode', data)

  // queryObj
  data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj);

  const [input, setInput] = React.useState(data.input);

  // 更新数据
  const updateData = (e: any) => {

    if (e.key === 'data') {
      if (e.data.queryObj) setQueryObj(e.data.queryObj);
      data.onChange({ id, data: { ...data, ...e.data } })
    }


    if (e.key === "setInput") {
      setInput(e.data);
      const d: any = {
        ...data,
        input: e.data
      };
      if (e.data == 'userInput' && e.userInput) {
        d.userInput = e.userInput;
      };
      data.onChange({
        id,
        data: d
      })
    }
    if (e.key === "nodeInput") {
      data.onChange({
        id,
        data: {
          ...data,
          nodeInputId: e.data
        }
      })
    }

    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }


  const createNode = () => {

    const node = [
      createUrl(
        menuNames.selectQuery,
        menuNames.selectQueryPlaceholder,
        menuNames.inputText,
        input,
        data,
        updateData),
      createDebug(id, "", '', (event: any) => {
        if (event.key == 'input') { }
      }, () => data.debug ? data.debug(data) : '', {})
    ];

    return <Card
      key={id}
      title={menuNames.title}
      bodyStyle={{ paddingTop: 0 }}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }

  const nodeStyle = selected ? {
    border: '1px solid transparent',
    padding: '2px 5px',
    borderRadius: '12px',
    backgroundColor: 'cornflowerblue'
  } : {
    border: '1px solid transparent',
    padding: '2px 5px'
  };

  const items: MenuProps['items'] = [
    {
      label: menuNames.debug,
      key: 'debug',
    }
  ];

  return (
    <Dropdown menu={{ items, onClick: () => data.debug ? data.debug() : '' }} trigger={['contextMenu']}>
      <div style={nodeStyle} key={id}>
        {createNode()}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    </Dropdown>
  );
}

export default QueryInputNode;