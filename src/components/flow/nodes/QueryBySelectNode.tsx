import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const menuNames = {
  title: '模拟点击事件',
  selectQuery: 'SelectQuery',
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
const createUrl = (key: string, title: string, json: any, onChange: any) => {
  const { protocol, url, init, query, isApi, isQuery } = json;

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
    <p>{title}</p>
    <TextArea
      defaultValue={query}
      rows={4}
      placeholder="xxxx"
      autoSize
      onChange={(e) => {
        const data = {
          ...json
        }
        data['query'] = e.target.value;
        onChange({
          key,
          data
        })

      }}
    />
  </div>
}


function QueryBySelectNode({ id, data, selected }: NodeProps<NodeData>) {
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
    const node = [];

    ['query'].includes(type) && node.push(createUrl('query', menuNames.selectQuery, queryObj, updateQueryObj));

    if (data.debug) {
      node.push(<Divider dashed />)
      node.push(<Button onClick={(e) => data.debug ? data.debug(data) : ''} >调试</Button>)
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

export default QueryBySelectNode;