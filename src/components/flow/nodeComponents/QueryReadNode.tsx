import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Checkbox, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const menuNames = {
  title: '内容读取',
  content: '获取网页内容',
  selectQuery: 'SelectQuery',
  placeholder: '不填默认获取整个网页',
  debug: '调试'
}

export type NodeData = {
  debug: any;
  queryObj: any,
  type: string,
  onChange: any
};

const createUrl = (title1: string, title2: string, placeholder2: string, json: any, onChange: any) => {
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
    <Select
      defaultValue={content || "bindCurrentPage"}
      style={{ width: 120 }}
      onChange={(e) => {
        // console.log(e)
        const data = {
          ...json,
          content: e,
          action: 'read'
        }

        onChange({
          key,
          data
        })

      }}
      options={[
        { value: 'bindCurrentPageHTML', label: '网页HTML' },
        { value: 'bindCurrentPage', label: '网页正文' },
        { value: 'bindCurrentPageURL', label: '网页URL' },
        { value: 'bindCurrentPageTitle', label: '网页标题', disabled: true },
      ]}
    />
    <p>{title2}</p>
    <TextArea
      defaultValue={query}
      rows={4}
      placeholder={placeholder2}
      autoSize
      onChange={(e) => {
        const data = {
          ...json,
          action: 'read',
          query: e.target.value
        }
        onChange({
          key,
          data
        })
      }}
    />
  </div>
}



function QueryReadNode({ id, data, selected }: NodeProps<NodeData>) {
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
      createUrl(menuNames.content, menuNames.selectQuery, menuNames.placeholder, queryObj, updateQueryObj)
    ];

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

export default QueryReadNode;