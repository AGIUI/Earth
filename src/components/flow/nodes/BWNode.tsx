import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Slider, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';


const { TextArea } = Input;
const { Option } = Select;

export type NodeData = {
  debug: any;
  text: string,
  api: any,
  queryObj: any,
  temperature: number,
  model: string,
  input: string,
  output: string,
  type: string,
  opts: any,
  onChange: any
};

const createType = (type: string, agents: any, onChange: any) => {
  const label = agents.filter((a: any) => a.key == type)[0]?.label || '-';

  const parents: any = {};
  for (const agent of agents) {
    if (!parents[agent.parent]) parents[agent.parent] = {
      key: agent.parent,
      type: 'group',
      label: agent.parent,
      children: []
    }
    parents[agent.parent].children.push(agent)
  }

  const items = [];
  for (const key in parents) {
    items.push(parents[key])
  }

  return <Dropdown
    trigger={['click']}
    menu={{
      items,
      onClick: (e) => {
        // console.log(e)
        onChange({
          data: e.key,
          key: 'type'
        })
      }
    }}>
    <Space>
      {label}
      <DownOutlined />
    </Space>

  </Dropdown>
}

const createText = (title: string, text: string, onChange: any) => <>
  <p>{title}</p>
  <TextArea
    defaultValue={text}
    showCount
    allowClear
    autoSize
    placeholder="maxLength is 6"
    // maxLength={6}
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
    onChange={(e) => {
      onChange({
        key: 'text',
        data: e.target.value
      })
    }}
  /></>;


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

  return <div
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
  >
    <p>{title}</p>
    <Input addonBefore={
      <Select defaultValue={protocol} onChange={(e: string) => {
        onChange({
          key,
          data: {
            ...json, protocol: e
          }
        })

      }}>
        <Option value="http://">http://</Option>
        <Option value="https://">https://</Option>
      </Select>
    }
      placeholder={`请填写url`}
      defaultValue={url}
      onChange={(e: any) => {
        // console.log('input url',e)
        onChange({
          key,
          data: {
            ...json, url: e.target.value
          }
        })
      }}
    />
    {json && (json.init || json.query) ? <>
      <p>-</p>
      <TextArea
        defaultValue={key == 'api' ? JSON.stringify(init, null, 2) : query}
        rows={4}
        placeholder="xxxx"
        autoSize
        onChange={(e) => {
          const data = {
            ...json
          }
          key == 'api' ? data['init'] = JSON.parse(e.target.value) : data['query'] = e.target.value;

          onChange({
            key,
            data
          })

        }}
      />
    </> : ''}
  </div>
}

const createModel = (model: string, temperature: number, opts: any, onChange: any) => <>
  <p>{opts.filter((m: any) => m.value == 'model')[0].label}</p>
  <Radio.Group
    onChange={(e) => {

      onChange({
        key: 'model',
        data: e.target.value
      })

    }}
    defaultValue={model}
  >
    {Array.from(opts.filter((m: any) => m.value == 'model')[0].options,
      (p: any, i: number) => {
        return <Radio.Button
          key={i}
          value={p.value}
        >{p.label}</Radio.Button>
      })}
  </Radio.Group>
  <p>{opts.filter((m: any) => m.value == 'temperature')[0].label}</p>

  <div
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
  >
    <Slider
      style={{ width: '200px' }}
      range={false}
      max={1}
      min={0}
      step={0.05}
      defaultValue={temperature}
      value={temperature}
      onChange={(e: any) => {
        // console.log('temperature', e)
        onChange({
          key: 'temperature',
          data: e
        })

      }}

    />
  </div>



  {/* <InputNumber
    stringMode
    step="0.01"
    size="large"
    min={'0'}
    max={'1'}
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
    value={temperature.toString()} onChange={(e: any) => {
      // console.log(e)
      onChange({
        key: 'temperature',
        data: parseFloat(e)
      })

    }} /> */}

</>

const createInputAndOutput = (title: string, key: string, value: string, opts: any, onChange: any) => <>
  <p>{title}</p>
  <Radio.Group
    style={{
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'baseline'
    }}
    defaultValue={value}
    value={value}
    options={opts}
    onChange={(e: any) => {
      // console.log(e)
      onChange({
        key: key,
        data: e.target.value
      })
    }} />
</>



function BWNode({ id, data, selected }: NodeProps<NodeData>) {

  // 类型
  const agents = data.opts.agents;
  const [type, setType] = React.useState(data.type)
  const updateType = (e: any) => {
    if (e.key === 'type') {
      setType(e.data);
      data.onChange({ id, data: { type: e.data } })
    }
  }
  // 模型
  const models = data.opts.models;
  const [model, setModel] = React.useState(data.model)
  const [temperature, setTemperature] = React.useState(data.temperature)
  const updateModel = (e: any) => {
    // console.log(e)
    if (e.key === 'model') {
      setModel(e.data);
      data.onChange({ id, data: { model: e.data } })
    }
    if (e.key === 'temperature') {
      setTemperature(e.data);
      data.onChange({ id, data: { temperature: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }
  // text
  const [text, setText] = React.useState(data.text)
  const updateText = (e: any) => {
    // console.log(e)
    if (e.key === 'text') {
      setText(e.data);
      data.onChange({ id, data: { text: e.data } })
    }

    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

  }

  // api
  data.api.isApi = type === "api";
  const [api, setApi] = React.useState(data.api)
  const updateApi = (e: any) => {
    // console.log(e)
    if (e.key === 'api') {
      setApi(e.data);
      data.onChange({ id, data: { api: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
  }


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

  // input
  const inputs = data.opts.inputs;
  const [input, setInput] = React.useState(data.input)
  const updateInput = (e: any) => {
    // console.log(e)
    if (e.key === 'input') {
      setInput(e.data);
      data.onChange({ id, data: { input: e.data } })
    }

  }

  // output
  const outputs = data.opts.outputs;
  const [output, setOutput] = React.useState(data.output)
  const updateOutput = (e: any) => {
    // console.log(e)
    if (e.key === 'output') {
      setOutput(e.data);
      data.onChange({ id, data: { output: e.data } })
    }

  }

  const createNode = () => {
    const node = [];
    if (!['api', 'query', 'send-to-zsxq'].includes(type)) {
      node.push(createInputAndOutput('Input', 'input', input, inputs, updateInput))
      node.push(createText('Prompt', text, updateText))
      node.push(createModel(model, temperature, models, updateModel))
    } else {
      ['api'].includes(type) && node.push(createUrl('api', 'URL', api, updateApi));
      ['query'].includes(type) && node.push(createUrl('query', 'URL', queryObj, updateQueryObj));
      ['send-to-zsxq'].includes(type) && node.push(
        createUrl('query', 'URL',
          {
            protocol: queryObj.protocol,
            url: queryObj.url
          },
          updateQueryObj));
    }

    node.push(createInputAndOutput('Output', 'output', output, outputs, updateOutput))

    if (data.debug) {
      node.push(<Divider dashed />)
      node.push(<Button onClick={(e) => data.debug ? data.debug(data) : ''} >调试</Button>)
    }

    return <Card
      key={id}
      title="Agent"
      extra={createType(type, agents, updateType)}
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
      label: '调试',
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

export default BWNode;