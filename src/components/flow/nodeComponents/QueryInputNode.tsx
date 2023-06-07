import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const menuNames = {
  title: '文本输入',
  selectQuery: 'SelectQuery',
  selectQueryPlaceholder: '- - ',
  inputText: '文本来源',
  debug: '调试'
}

export type NodeData = {
  debug: any;
  queryObj: any,
  type: string,
  onChange: any
};



const createUrl = (title1: string, placeholder1: string, title2: string, json: any, onChange: any) => {
  const { queryObj, userInput, input } = json;
  const { query, action } = queryObj;
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
    <p>{title2}</p>
    <Select
    
      defaultValue={input}
      style={{ width: '100%' }}
      onChange={(e) => {
        const data = {
          ...json,
          queryObj: {
            ...json.queryObj,
            content: '',
            action: 'input'
          },
          input: e
        };
        if (e === "nodeInput") data['userInput'] = "";
        onChange({
          key: 'data',
          data
        })
      }}
      options={[
        { value: 'nodeInput', label: '从上一节点获取文本' },
        { value: 'userInput', label: '输入文本' },
      ]}
    />
    {
      input === "userInput" ? <TextArea
        style={{ marginTop: '8px' }}
        value={userInput}
        rows={4}
        placeholder={placeholder1}
        autoSize
        onChange={(e) => {
          const data = {
            ...json,
            queryObj: {
              ...json.queryObj,
              content: '',
              action: 'input'
            },
            input: "userInput",
            userInput: e.target.value
          }
          onChange({
            key: 'data',
            data
          })
        }}
      /> : ''
    }
  </div>
}



function QueryInputNode({ id, data, selected }: NodeProps<NodeData>) {
  const [type, setType] = React.useState(data.type)
  // console.log('QueryURLNode', data)

  // queryObj
  data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj)

  // 更新数据
  const updateData = (e: any) => {
    // console.log(e)
    if (e.key === 'data') {
      if (e.data.queryObj) setQueryObj(e.data.queryObj);
      data.onChange({ id, data: { ...data, ...e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }


  const createNode = () => {

    const node = [
      createUrl(menuNames.selectQuery, menuNames.selectQueryPlaceholder, menuNames.inputText, data, updateData)
    ];

    if (data.debug) {
      node.push(<Divider dashed />)
      node.push(<Button onClick={(e) => data.debug ? data.debug(data) : ''} >{menuNames.debug}</Button>)
    }

    return <Card
      key={id}
      title={menuNames.title}
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