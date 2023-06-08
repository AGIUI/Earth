import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const menuNames = {
  title: '进入网页',
  url: 'URL',
  urlPlaceholder: "请填写url",
  delay: "等待时间",
  delayPlaceholder: "输入时间",
  ms: '毫秒',
  s: '秒',
  debug: '调试'
}

export type NodeData = {
  debug: any;
  queryObj: any,
  type: string,
  onChange: any
};


const createUI = (json: any, delay: number, delayFormat: string, onChange: any) => {
  const { protocol, url } = json;

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

    <p>{menuNames.url}</p>
    <Input addonBefore={
      <Select defaultValue={protocol} onChange={(e: string) => {
        onChange({
          key: 'query',
          data: {
            ...json, protocol: e
          }
        })

      }}>
        <Option value="http://">http://</Option>
        <Option value="https://">https://</Option>
      </Select>
    }
      placeholder={menuNames.urlPlaceholder}
      defaultValue={url}
      onChange={(e: any) => {
        // console.log('input url',e)
        onChange({
          key: 'query',
          data: {
            ...json,
            url: e.target.value,
            action: 'default'
          }
        })
      }}
    />

    <p>{menuNames.delay}</p>
    <Input addonAfter={
      <Select defaultValue={delayFormat} onChange={(e: string) => {

        onChange({
          key: 'delayFormat',
          data: e
        })

      }}>
        <Option value="ms">{menuNames.ms}</Option>
        <Option value="s">{menuNames.s}</Option>
      </Select>
    }
      placeholder={menuNames.delayPlaceholder}
      defaultValue={delay}
      onChange={(e: any) => {
        let t = parseFloat(e.target.value);
        if (delayFormat == 's') t = 1000 * t;
        onChange({
          key: 'delay',
          data: {
            ...json,
            delay: t,
          }
        })
      }}
    />

  </div>
}


function QueryDefaultNode({ id, data, selected }: NodeProps<NodeData>) {
  // console.log(data)
  const [type, setType] = React.useState(data.type)
  // console.log('QueryDefaultNode', data)

  // queryObj
  data.queryObj.isQuery = type === "query";
  const [queryObj, setQueryObj] = React.useState(data.queryObj)

  const [delay, setDelay] = React.useState(queryObj.delay || 1000)
  const [delayFormat, setDelayFormat] = React.useState('ms')


  const updateQueryObj = (e: any) => {
    // console.log(e)
    if (e.key === 'query') {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    if (e.key === "delay") {
      setQueryObj(e.data);
      data.onChange({ id, data: { queryObj: e.data } })
    }
    if (e.key == "delayFormat") {
      setDelayFormat(e.data);
    }

  }


  const createNode = () => {

    const node = [createUI(queryObj, delay, delayFormat, updateQueryObj)];

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

export default QueryDefaultNode;