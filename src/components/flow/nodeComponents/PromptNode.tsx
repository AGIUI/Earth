import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Card, Select, Radio, Checkbox, Slider, Dropdown, Divider, Space, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
const { TextArea } = Input;
const { Option } = Select;

import { createDebug, selectNodeInput, createText } from './Base';


const menuNames = {
  title: '提示工程',
  userInput: '指令',
  input: '输入',
  output: '输出',
  translate: '翻译',
  format: '-',
  debug: '调试'
}


export type NodeData = {
  debugInput: any;
  debugOutput: any;
  getNodes: any;
  nodeInputId: string;
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
  onChange: any,
  translate: any
};



const createTextAndInput = (
  title: string, text: string, input: string,
  nodeOpts: any,
  selectNodeValue: string,
  onChange: any) => < div
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
    {/* <p>{title}</p>
    <TextArea
      defaultValue={text}
      showCount
      allowClear
      autoSize
      placeholder=""
      // maxLength={6}
      onChange={(e) => {
        onChange({
          key: 'text',
          data: e.target.value
        })
      }}
    /> */}

    {
      createText('text', title, '', text, '', onChange)
    }

    {selectNodeInput(selectNodeValue, nodeOpts, onChange)}

  </div>;



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
      step={0.02}
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


</>

const createInput = (title: string, key: string, value: string, opts: any, onChange: any) => <>
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

const createTranslate = (title: string, key: string, value: string, opts: any, onChange: any) => {
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
    <Select
      defaultValue={value}
      style={{ width: 120 }}
      onChange={(e) => {
        onChange({
          key: key,
          data: e
        })
      }}
      options={opts}
    /></div>
}

const createOutput = (title: string, key: string, value: string, opts: any, onChange: any) => <>
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



function Main({ id, data, selected }: NodeProps<NodeData>) {

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

  // input
  const inputs = data.opts.inputs;
  const [input, setInput] = React.useState(data.input)
  const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)
  // text
  const [text, setText] = React.useState(data.text)
  const updateTextAndInput = (e: any) => {
    // console.log(e)
    if (e.key === 'text') {
      setText(e.data);
      data.onChange({ id, data: { text: e.data } })
    }

    if (e.key === 'input') {
      setInput(e.data);
      data.onChange({
        id, data: {
          input: e.data
        }
      })
    }


    if (e.key == "nodeInput") {
      setNodeInputId(e.data);
      data.onChange({
        id,
        data: {
          nodeInputId: e.data,
          input: e.data ? 'nodeInput' : 'default'
        }
      })
    }


    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

  }


  // output
  const translates = data.opts.translates;
  const [translate, setTranslate] = React.useState(data.translate)
  const updateTranslate = (e: any) => {
    // console.log(e)
    if (e.key === 'translate') {
      setTranslate(e.data);
      data.onChange({ id, data: { translate: e.data } })
    }
    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })
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

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes()]
    let selectNodeValue = input === "nodeInput" ? (nodeInputId || nodeOpts[0].value) : null
    // console.log('selectNodeValue',selectNodeValue,nodeInputId,nodeOpts[0],data)

    node.push(createTextAndInput(menuNames.userInput, text, input, nodeOpts, selectNodeValue, updateTextAndInput))
    node.push(createModel(model, temperature, models, updateModel))
    node.push(createTranslate(menuNames.translate, 'translate', translate, translates, updateTranslate))
    node.push(createOutput(menuNames.output, 'output', output, outputs, updateOutput))


    node.push(createDebug(id, data.debugInput, data.debugOutput, (event: any) => {
      if (event.key == 'input') { }
    }, () => data.debug ? data.debug(data) : '', {}))

    return <Card
      key={id}
      title={menuNames.title}
      bodyStyle={{ paddingTop: 0 }}
      // extra={createType(type, agents, updateType)}
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

export default Main;