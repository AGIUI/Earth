import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';
import i18n from "i18next";
import { selectNodeInput, createText, nodeStyle, getI18n } from './Base';

function Main({ id, data, selected }: any) {
  // i18nInit();
  const { contextMenus } = getI18n();
  // input
  const [input, setInput] = React.useState(data.input)
  const [nodeInputId, setNodeInputId] = React.useState(data.nodeInputId)
  // text
  const [text, setText] = React.useState(data.text)


  const updateData = (e: any) => {

    if (e.key === 'text') {
      setText(e.data);
      data.onChange({ id, data: { text: e.data, debugInput: "" } });
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


  const createNode = () => {
    const node = [
      <p>{i18n.t('queryInputNodeTitle')}</p>
    ];

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)]
    let selectNodeValue = input === "nodeInput" ? (nodeInputId) : null

    // node.push(
    //   createText('text', i18n.t('queryInputNodeTitle'), '', text, '', updateData)
    // )
    // node.push(
    //   selectNodeInput(i18n.t('getFromBefore'), selectNodeValue, nodeOpts, updateData)
    // )

    return <Card
      key={id}
      title={
        <>
          <p style={{ marginBottom: 0 }}>{i18n.t('userInputNodeTitle')}</p>
          <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', padding: '0px', paddingTop: '10px', margin: 0, fontWeight: "normal", marginBottom: 10 }}>
            ID: {id}
          </p>
        </>
      }
      bodyStyle={{ paddingTop: 0 }}
      // extra={createType(type, agents, updateType)}
      style={{ width: 300 }}>
      {...node}
    </Card>
  }

  return (
    <Dropdown menu={contextMenus(id, data, ['copy', 'delete'])} trigger={['contextMenu']}>
      <div style={selected ? {
        ...nodeStyle,
        backgroundColor: 'cornflowerblue'
      } : nodeStyle}
        key={id}>
        {createNode()}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    </Dropdown>
  );
}

export default Main;