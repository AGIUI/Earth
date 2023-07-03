import React from 'react'
import { Handle, Position } from 'reactflow';
import { Card, Dropdown } from 'antd';
import i18n from "i18next";
import { createCardTitle, nodeStyle, getI18n, createText } from './Base';

function Main({ id, data, selected }: any) {
  // i18nInit();
  const { contextMenus } = getI18n();

  const [userInput, setUserInput] = React.useState(data.userInput)

  const updateData = (e: any) => {

    if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } });

    if (e.key == 'userInput') {
      setUserInput(e.data);
      data.onChange({ id, data: { userInput: e.data } });
    }
  }

  const createNode = () => {

    let nodeOpts: any[] = [];
    if (data.getNodes) nodeOpts = [...data.getNodes(id)]

    return <Card
      key={id}
      title={createCardTitle(i18n.t('userInputNodeTitle'), id, data)}
      bodyStyle={{ paddingTop: 0 }}
      style={{ width: 300 }}>
      {/* <p >{i18n.t('queryInputNodeTitle')}</p> */}
      {
        createText('userInput', i18n.t('userInputTextTip'), '...', userInput, '', updateData)
      }
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