import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, InputNumber, Dropdown, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

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



// const items: any = [
//   {
//     key: '1',
//     type: 'group',
//     label: 'Group title',
//     children: [
//       {
//         key: '1-1',
//         label: '1st menu item',
//       },
//       {
//         key: '1-2',
//         label: '2nd menu item',
//       },
//     ],
//   },
//   {
//     key: '2',
//     label: 'sub menu',
//     children: [
//       {
//         key: '2-1',
//         label: '3rd menu item',
//       },
//       {
//         key: '2-2',
//         label: '4th menu item',
//       },
//     ],
//   },
//   {
//     key: '3',
//     label: 'disabled sub menu',
//     disabled: true,
//     children: [
//       {
//         key: '3-1',
//         label: '5d menu item',
//       },
//       {
//         key: '3-2',
//         label: '6th menu item',
//       },
//     ],
//   },
// ];



const createType = (type: string, agents: any, onChange: any) => {
  const label = agents.filter((a: any) => a.key == type)[0]?.label || '-';
  return <Dropdown menu={{
    items: agents, onClick: (e) => {
      onChange({
        data: e.key,
        key: 'type'
      })
    }
  }}>
    <Space>
      {label}
      <DownOutlined rev={undefined} />
    </Space>

  </Dropdown>
}

const createText = (title: string, text: string, onChange: any) => <>
  <p>{title}</p>
  <TextArea
    defaultValue={text}
    rows={4}
    autoSize
    placeholder="maxLength is 6"
    // maxLength={6}
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
 * @param text init / query
 * @returns 
 */
const createUrl = (title: string, api: any, onChange: any) => {
  const { protocol, url, init, query, isApi, isQuery } = api;

  return <>
    <p>{title}</p>
    <Input addonBefore={
      <Select defaultValue={protocol} onChange={(e: string) => {
        onChange({
          key: isApi ? 'api' : 'query',
          data: {
            ...api, protocol: e
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
        onChange({
          key: isApi ? 'api' : 'query',
          data: {
            ...api, url: e
          }
        })
      }}
    />
    <TextArea
      defaultValue={JSON.stringify(init, null, 2)}
      rows={4}
      placeholder="maxLength is 6"
      autoSize
      onChange={(e) => {
        const data = {
          ...api
        }
        isApi ? data['init'] = JSON.parse(e.target.value) : data['query'] = e.target.value
        onChange({
          key: isApi ? 'api' : 'query',
          data: {
            ...api, init: JSON.parse(e.target.value)
          }
        })

      }}
    /></>
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
  <InputNumber
    stringMode
    step="0.01"
    size="large"
    min={'0'}
    max={'1'}
    value={temperature.toString()} onChange={(e: any) => {
      // console.log(e)
      onChange({
        key: 'temperature',
        data: parseFloat(e)
      })

    }} />

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
  }
  // text
  const [text, setText] = React.useState(data.text)
  const updateText = (e: any) => {
    // console.log(e)
    if (e.key === 'text') {
      setText(e.data);
      data.onChange({ id, data: { text: e.data } })
    }

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
      node.push(createInputAndOutput('Output', 'output', output, outputs, updateOutput))
    } else {
      api.isApi && node.push(createUrl('API', api, updateApi))
      queryObj.isQuery && node.push(createUrl('query', queryObj, updateQueryObj))
    }


    if (data.debug) {
      node.push(<Button onClick={(e) => data.debug?data.debug():''} >调试</Button>)
    }

    return <Card
      key={id}
      title="Agent"
      extra={createType(type, agents, updateType)}
      style={{ width: 300 }}>
      {node}
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

  return (
    <div style={nodeStyle}>

      {createNode()}
      <Handle type="target" position={Position.Left} />

      <Handle type="source" position={Position.Right} />

    </div>
  );
}

export default BWNode;