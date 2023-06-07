import React, { useCallback, useRef, useEffect } from 'react';

import ReactFlow, {
  Controls,
  OnConnectEnd,
  OnConnectStart,
  Panel,
  useStoreApi,
  Node,
  useReactFlow,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType,
  SelectionMode, MiniMap, Background, ReactFlowInstance
} from 'reactflow';
import { shallow } from 'zustand/shallow';

import { Button, Input, Checkbox, Card, Divider, Collapse, Popconfirm, Space } from 'antd';

const { Panel: Panel0 } = Collapse;
const { TextArea } = Input;

import Sidebar from './Sidebar'

import { nanoid } from 'nanoid/non-secure';

import useStore, { RFState } from './store';

import BWEdge from './edges/BWEdge';


// we need to import the React Flow styles to make it work
import 'reactflow/dist/style.css';

import { _DEFAULTCOMBO } from './Workflow'
import nodes from './nodeComponents/index';

// 定义节点类型
const nodeTypes: any = {};

for (const node of nodes) {
  const children: any = node.children;
  for (const n of children) {
    nodeTypes[n.key] = n.component
  }

}



// 定义连线类型
const edgeTypes = {
  brainwave: BWEdge,
};


const _VERVISON = '0.1.0',
  _APP = 'brainwave';

_DEFAULTCOMBO.version = _VERVISON;
_DEFAULTCOMBO.app = _APP;

const selector = (state: RFState) => ({
  comboOptions: state.comboOptions,
  id: state.id,
  tag: state.tag,
  defaultNode: state.defaultNode,
  nodes: state.nodes,
  edges: state.edges,
  onComboOptionsChange: state.onComboOptionsChange,
  onTagChange: state.onTagChange,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  newCombo: state.newCombo,
  changeChildNode: state.changeChildNode,
  addChildNode: state.addChildNode,
  addNode: state.addNode
});


const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'brainwave' };

function Flow(props: any) {

  const { debug, loadData, isNew, saveCallback, deleteCallback, exportData } = props;
  // console.log('Flow isNew', isNew)

  const reactFlowInstance = useReactFlow();

  // whenever you use multiple values, you should use shallow for making sure that the component only re-renders when one of the values change
  const {
    comboOptions,
    id,
    tag,
    defaultNode,
    nodes,
    edges,
    onTagChange,
    onComboOptionsChange,
    onNodesChange,
    onEdgesChange,
    newCombo,
    changeChildNode,
    addChildNode,
    addNode
  } = useStore(selector, shallow);

  const connectingNodeId = useRef<string | null>(null);
  const store = useStoreApi();
  const { project } = useReactFlow();

  const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
    const { domNode } = store.getState();

    if (
      !domNode ||
      // we need to check if these properites exist, because when a node is not initialized yet,
      // it doesn't have a positionAbsolute nor a width or height
      !parentNode?.positionAbsolute ||
      !parentNode?.width ||
      !parentNode?.height
    ) {
      return;
    }

    const { top, left } = domNode.getBoundingClientRect();

    // we need to remove the wrapper bounds, in order to get the correct mouse position
    const panePosition = project({
      x: event.clientX - left + 100,
      y: event.clientY - top,
    });

    return {
      x: panePosition.x,
      y: panePosition.y,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event: any) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);
        // console.log(parentNode)
        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      };
      // setTimeout(() => onSave(), 200)
    },
    [getChildNodePosition]
  );

  const onConnect = useCallback((params: any) => {
    console.log('onConnect', params)
    changeChildNode(params.source, params.target)
  }, []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      const dataType = event.dataTransfer.getData('application/dataType');
      // check if the dropped element is valid
      if (typeof nodeType === 'undefined' || !nodeType) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType, dataType, position)

    },
    [reactFlowInstance]
  );


  const panOnDrag = [1, 2];

  const nodeColor: any = (node: { id: any; }) => {
    switch (node.id) {
      case 'root':
        return '#6ede87';
      case 'output':
        return '#6865A5';
      default:
        return '#ff0072';
    }
  };

  const variant: any = 'dots';

  // 导出
  const exportDataToEarth: any = () => {
    const defaultCombo = {
      ..._DEFAULTCOMBO,
      createDate: (new Date()).getTime()
    }

    const workflow: any = {};
    const { edges, nodes } = reactFlowInstance.toObject();
    if (edges.length == 0 && nodes.length == 1) {
      // 只有一个，则导出
      const id = nodes[0].id.match('root_') ? 'root' : nodes[0].id
      workflow[id] = nodes[0].data
    }
    // console.log(nodes)
    for (const edge of edges) {
      let { source, target } = edge;
      source = source.match('root_') ? 'root' : source;
      target = target.match('root_') ? 'root' : target;

      const sourceNode: any = nodes.filter(node => (node.id.match('root_') ? 'root' : node.id) === source)[0];
      const targetNode: any = nodes.filter(node => (node.id.match('root_') ? 'root' : node.id) === target)[0];
      if (sourceNode && targetNode) {
        workflow[source] = {
          ...sourceNode.data,
          type: sourceNode.type,
          nextId: target
        };
        workflow[target] = {
          ...targetNode.data,
          type: targetNode.type
        };
      }
    }
    const items: any = [];
    // console.log(workflow)
    // 按顺序从到尾
    const getItems = (id: string, callback: any) => {
      if (workflow[id]) {
        items.push(workflow[id]);
        let nextId = workflow[id].nextId;
        if (nextId) {
          getItems(nextId, callback)
        } else {
          return callback(items)
        }
      }
    }

    return new Promise((res, rej) => {
      getItems('root', (result: any) => {
        console.log('exportDataToEarth - - ', result)
        const items = JSON.parse(JSON.stringify(result));

        // role节点赋予全部节点的role字段
        const rolePrompt = items.filter((item: any) => item.type == 'role')[0];

        // 按照combo的格式输出
        const combo: any = {
          ...defaultCombo,
          tag,
          id,
          combo: 0,
          role: { ...rolePrompt.role }
        };

        for (let index = 0; index < items.length; index++) {
          const prompt = items[index];
          prompt.role = { ...rolePrompt.role };
          delete prompt.onChange;
          delete prompt.opts;

          if (prompt.type !== 'role') {
            combo.combo++;
            if (combo.combo === 1) {
              combo.prompt = prompt;
            } else {
              combo[`prompt${combo.combo}`] = prompt;
            }
          }
        }

        // interfaces
        combo.interfaces = Array.from(comboOptions, (c: any) => {
          if (c.checked) return c.value
        }).filter(f => f)
        // console.log(combo)
        res(combo)
      })
    })
  }

  if (exportData) {
    //如果父组件传来该方法
    exportData(exportDataToEarth);
  }

  const download = () => {
    exportDataToEarth().then((combo: any) => {
      console.log('download', combo)
      const fileName = `${combo.tag}_${combo.id}`
      const data = [combo]
      const link = document.createElement('a');
      link.href = `data:application/json;charset=utf-8,\ufeff${encodeURIComponent(JSON.stringify(data))}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
  }

  const save = () => {
    if (saveCallback) {
      exportDataToEarth().then((res: any) => {
        saveCallback(res)
      })
    }
  }

  const load = (json: any, debug: any) => {
    if (json && json.length == 1) {

      // 将覆盖
      // if (currentNodes.length > 0) 1

      // 导入
      const combo = json[0];

      let nodes: any = [],
        source = 'root_' + nanoid(),
        edges = [];


      const nodePosition = (index: number) => {
        return {
          height: 597,
          position: { x: (312 + 100) * (index), y: 0 },
          width: 312
        }
      }

      // ----- 如果没有role，则在第一个新加一个role节点
      const comboNew: any = { ..._DEFAULTCOMBO, ...combo };
      const prompts = [
        {
          ...defaultNode.data,
          role: { ...comboNew.role },
          type: 'role',
          input: 'default',
          output: 'default'
        }
      ];
      // console.log(JSON.stringify(prompts, null, 2))
      for (let index = 0; index < combo.combo; index++) {
        const key = `prompt${index > 0 ? index + 1 : ''}`;
        const p = { ...comboNew[key] };
        console.log(p.type)
        if (comboNew[key]) delete comboNew[key]
        if (combo[key] && combo[key].type !== 'role') prompts.push(p)
      }

      comboNew.combo = prompts.length;
      for (let index = 0; index < prompts.length; index++) {
        const key = `prompt${index > 0 ? index + 1 : ''}`;
        comboNew[key] = prompts[index];

      }
      // ----- 如果没有role，则在第一个新加一个role节点
      // console.log('!!!newCombo', JSON.stringify(comboNew,null,2))

      for (let index = 0; index < comboNew.combo; index++) {
        const key = `prompt${index > 0 ? index + 1 : ''}`;
        if (comboNew[key]) {
          const id = index == 0 ? source : key + comboNew.id;

          if (comboNew[key].type == 'role') {
            // role类型需求清空text字段
            comboNew[key].text = ""
          }

          // node
          nodes.push({
            data: comboNew[key],
            id,
            type: comboNew[key].type,
            deletable: comboNew[key].type !== 'role',
            ...nodePosition(index)
          });

          // edge
          if (source != id) edges.push({
            source,
            target: id,
            id: source + '_' + id,
            type: 'straight',
            animated: true,
            label: nodes.filter((node: any) => node.id == source)[0].data.output,
            deletable: true,
          })

          source = id;

        }
      }

      console.log('!!!newCombo', comboNew.id, comboNew.tag, comboNew.interfaces, nodes, edges, debug)
      newCombo(comboNew.id, comboNew.tag, comboNew.interfaces, nodes, edges, debug);

      clearLocalStore()

    }
  }

  const deleteMyCombo = (comboId: string) => {
    if (deleteCallback) deleteCallback(comboId)
  }

  const openMyCombo = () => {
    const currentNodes = nodes;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".json"
    document.body.appendChild(input);
    input.addEventListener('change', (e: any) => {
      const files = e.target.files;
      if (files.length == 1) {
        let file = files[0];
        let fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = function () {
          // 获取得到的结果
          const data: any = this.result;
          const json = JSON.parse(data);
          if (json && json.length == 1) {
            load(json, debug)
          }
        }
      }
      input.remove();
    }, false)
    input.click();
  }

  // if (typeof (window) !== 'undefined') {
  //   var timer = setTimeout(function () {

  //   }, 200);
  // }

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow: any = reactFlowInstance.toObject();

      // interfaces
      flow.interfaces = Array.from(comboOptions, (c: any) => {
        if (c.checked) return c.value
      }).filter(f => f);

      flow.tag = tag;

      localStorage.setItem('flowKey', JSON.stringify({ ...flow, isNew: false }));
    }
  }, [reactFlowInstance, tag, comboOptions]);

  const onRestore = useCallback(() => {
  }, [newCombo, debug]);


  const newWorkflow = () => newCombo(nanoid(), '', [], [defaultNode], [], debug)

  const clearLocalStore = () => localStorage.setItem('flowKey', '{}');

  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    console.log('flow - - - - onInit')
  }

  const onChange = () => {
    console.log('flow - - - - onChange')
  };

  useEffect(() => {
    if (isNew) {
      newWorkflow()
    } else {
      loadData && load(loadData, debug)
    }
  }, [loadData, isNew, debug])


  // console.log('loadData',loadData)


  return (

    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineStyle={connectionLineStyle}
      connectionLineType={ConnectionLineType.Straight}
      onDrop={onDrop}
      onDragOver={onDragOver}
      fitView
      fitViewOptions={{ maxZoom: 0.8 }}
      // defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      panOnScroll
      selectionOnDrag
      panOnDrag={panOnDrag}
      selectionMode={SelectionMode.Partial}
      onInit={onInit}
      onChange={onChange}
    >
      <Controls style={{ display: 'flex', flexDirection: 'row' }} position={'bottom-center'} />
      {/*<MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable inversePan={false} ariaLabel={null} />*/}
      <Background variant={variant} />

      <Panel position="top-left">
        <Sidebar />
      </Panel>
      <Panel position="top-right">
        <Card
          bodyStyle={{
            padding: 10
          }}
        >
          <Collapse ghost size="small">
            <Panel0 header="菜单" key="1">
              <Space direction="horizontal" style={{ width: '100%' }} size={"small"}>
                <span style={{ fontWeight: "bold" }}>工作流名称</span>
                <Input placeholder="输入名称..."
                  name={"标题"}
                  value={tag}
                  onChange={(e: any) => onTagChange(e.target.value)}
                />
              </Space>
              <p style={{ fontWeight: "bold" }}>设置选项</p>
              <Checkbox.Group
                options={comboOptions.filter((c: any) => !c.disabled)}
                value={
                  Array.from(comboOptions,
                    (c: any) => c.checked ? c.value : null)
                    .filter(f => f)}
                onChange={onComboOptionsChange}
              />
              <Divider dashed />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => openMyCombo()} style={{ marginRight: '10px' }}>导入</Button>
                <Button onClick={() => download()} style={{ marginRight: '10px' }}>下载</Button>
                {deleteCallback ? <Popconfirm
                  placement="bottomRight"
                  title={'确定删除？'}
                  onConfirm={() => deleteMyCombo(id)}

                  okText="是的"
                  cancelText="取消"
                  zIndex={100000000}
                >
                  <Button danger
                    style={{ marginRight: '10px' }}
                  >
                    删除
                  </Button>

                </Popconfirm> : ''}


                {saveCallback ?
                  <Button type={"primary"} onClick={() => save()}>保存</Button> : ''}
              </div>
            </Panel0>
          </Collapse>
        </Card>
      </Panel>
    </ReactFlow>
  );
}

export default (props: any) => {
  const { debug, loadData, isNew, saveCallback, deleteCallback, exportData } = props;
  return (<ReactFlowProvider >
    <Flow
      debug={debug}
      loadData={loadData}
      isNew={isNew}
      exportData={exportData}
      saveCallback={saveCallback}
      deleteCallback={deleteCallback} />
  </ReactFlowProvider>)
};



