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
  useLastText: '从上一节点获取文本',
  debug: '调试'
}

export type NodeData = {
  debug: any;
  queryObj: any,
  type: string,
  onChange: any
};



/**
 * API / queryObj
 * @param title 
 * @param protocol 
 * @param url 
 * @param json init / query
 * @returns 
 */

const createUrl = (title1: string, placeholder1: string, title2: string, json: any, onChange: any) => {
  const { query, content } = json;
  const key = 'query'
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
          query: e.target.value,
          action: 'input'
        }

        onChange({
          key,
          data
        })
      }}
    />
    <Divider dashed />
    <Checkbox onChange={(e) => {
      // console.log(e)
      const data = {
        ...json
      }
      data['action'] = e.target.checked ? 'input' : ''

      onChange({
        key,
        data
      })

    }}>{title2}</Checkbox>
  </div>
}



function QueryInputNode({ id, data, selected }: NodeProps<NodeData>) {
  const [type, setType] = React.useState(data.type)
  // console.log('QueryURLNode', data)

  // queryObj
  data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj)
  const updateQueryObj = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }


  const createNode = () => {


    const node = [
      createUrl(menuNames.selectQuery, menuNames.selectQueryPlaceholder, menuNames.useLastText, queryObj, updateQueryObj)
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