import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import type { MenuProps } from 'antd';

const { TextArea } = Input;


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


const createUrl = (title: string, json: any, onChange: any) => {
  const { protocol, url, init, query, isApi, isQuery } = json;
  const key = 'query';
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
          ...json,
          query: e.target.value,
          action: 'click'
        }

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
    const node = [createUrl(menuNames.selectQuery, queryObj, updateQueryObj)];
    if (data.debug) {
      node.push(<Divider dashed />)
      node.push(<Button onClick={(e) => data.debug ? data.debug(data) : ''} >{menuNames.debug}</Button>)
    }

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

export default QueryBySelectNode;