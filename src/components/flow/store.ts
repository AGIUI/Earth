import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from 'reactflow';
import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';

import { defaultNode, comboOptions, _DEFAULTCOMBO, parsePrompt2ControlEvent } from './Workflow'



export type RFState = {
  init: any;
  debugStatus: any;
  defaultNode: any;
  id: string;
  debug: any;
  merge: any;
  newCombo: any;
  comboOptions: any;
  tag: string;
  nodes: Node[];
  edges: Edge[];
  onComboOptionsChange: any;
  onTagChange: any;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addChildNode: (parentNode: Node, position: XYPosition) => void;
  changeChildNode: any;
  addNode: any;
  deleteNode: any;
  exportData: any
};

const createId = (type: string, id: string) => `${type}_${id}`.toLocaleUpperCase()

const getNodes = (currentId: string, nodes: any, edges: any) => {
  const edge = edges.filter((e: any) => e.target == currentId)[0];
  console.log('getNodes edge::', edge)
  const nodeOpts = Array.from(nodes, (node: any, i) => {
    return {
      value: node.id,
      label: node.id,
      id: node.id,
      index: edge && node.id == edge.source ? 1 : 0
    }
  }).filter((n: any) => n.id != currentId && !n.id.match("root_")).sort((b, a) => a.index - b.index)
  return nodeOpts
}

const onChangeForNodes = (event: any, getNodes: any) => {
  const nodes = [];
  for (const node of getNodes) {
    if (node.id === event.id) {
      nodes.push({
        ...node, data: {
          ...node.data, ...event.data
        },
        draggable: !!event.data.draggable
      })
    } else {
      nodes.push(node)
    }
  }
  return nodes
}


const debugRun = (id: string, prompt: any, combo: any, debug: any, onChange: any) => {
  let lastTalk = '';
  if (prompt.input == 'nodeInput') {
    // 从上一个节点获得输入
    const nodeInputId = prompt.nodeInputId;
    for (let i = 0; i < combo.combo; i++) {
      const prompt2 = combo[`prompt${i > 0 ? (i + 1) : ''}`];
      if (nodeInputId == prompt2.id) {
        lastTalk = prompt2._debugOutput;
      }
    }
  }

  // 用于调试
  prompt._nodeInputTalk = lastTalk;

  if (combo.combo > 0) {
    for (let i = 0; i < combo.combo; i++) {
      const prompt2 = combo[`prompt${i > 0 ? (i + 1) : ''}`];
      if (prompt2.id == id && prompt2.role) {
        prompt.role = prompt2.role;
        // merged去掉
        // delete prompt.role.merged
      }
      if (prompt2.id == id) {
        prompt.merged = prompt2.merged;
        // prompt.debugInput = prompt2.debugInput;
      }
    }
  };

  console.log('debug combo', combo, prompt)
  // merged去掉
  // delete prompt.merged
  // delete prompt.debugInput

  const controlEvent: any = parsePrompt2ControlEvent(id, prompt)
  controlEvent.onChange = onChange
  debug.callback(controlEvent)
}

const mergeRun = (id: string, prompt: any, onChange: any, callback: any) => {
  console.log('mergeRun:', prompt)
  let merged, success = false;
  try {
    merged = JSON.parse(prompt.debugInput);
    success = true;
  } catch (error) {
  }

  let data: any = {
    merged
  }

  onChange(
    {
      id,
      data
    }
  )

  callback({
    success, data
  })

}


const _VERVISON = '0.1.0',
  _APP = 'brainwave';

const initRootNode = () => {
  return {
    id: 'root_' + nanoid(),
    type: 'role',
    data: {
      ...defaultNode(),
      role: { ..._DEFAULTCOMBO(_APP, _VERVISON).role },
      type: 'role',
    },
    position: { x: 0, y: 0 },
    deletable: false
  }
}


// 导出
const exportData: any = (comboId: string, tag: string, comboOptions: any, edges: any, nodes: any) => {
  const defaultCombo = {
    ..._DEFAULTCOMBO(_APP, _VERVISON),
    createDate: (new Date()).getTime()
  }

  const workflow: any = {};
  // const { edges, nodes } = reactFlowInstance.toObject();

  for (const node of nodes) {
    // 只有一个，则导出
    if (node.id.match('root_')) workflow['root'] = node.data
  }

  // console.log(nodes, edges, workflow)
  for (const edge of edges) {
    let { source, target } = edge;
    source = source.match('root_') ? 'root' : source;
    target = target.match('root_') ? 'root' : target;

    const sourceNode: any = nodes.filter((node: any) => (node.id.match('root_') ? 'root' : node.id) === source)[0];
    const targetNode: any = nodes.filter((node: any) => (node.id.match('root_') ? 'root' : node.id) === target)[0];
    if (sourceNode && targetNode) {
      workflow[source] = {
        ...sourceNode.data,
        type: sourceNode.type,
        id: sourceNode.id,
        nextId: target
      };
      workflow[target] = {
        ...targetNode.data,
        type: targetNode.type,
        id: targetNode.id
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
    } else {
      return callback(items)
    }
  }

  return new Promise((res, rej) => {
    getItems('root', (result: any) => {
      console.log('exportData - - ', result)
      if (result.length === 0) return

      const items = JSON.parse(JSON.stringify(result));

      // role节点赋予全部节点的role字段
      const rolePrompt = items.filter((item: any) => item.type == 'role')[0];

      if (rolePrompt) {
        rolePrompt.role.merged = rolePrompt.merged?.filter((m: any) => m.role === 'system')
      }

      // 按照combo的格式输出
      const combo: any = {
        ...defaultCombo,
        tag,
        id: comboId,
        combo: 0,
        role: {
          ...rolePrompt.role
        }
      };

      for (let index = 0; index < items.length; index++) {

        const prompt = {
          id: items[index].id,
          nextId: items[index].nextId,
          nodeInputId: items[index].nodeInputId,
          role: { ...rolePrompt.role },
          text: items[index].text,
          url: items[index].url,
          api: items[index].api,
          file: items[index].file,
          queryObj: items[index].queryObj,
          temperature: items[index].temperature,
          model: items[index].model,
          input: items[index].input,
          userInput: items[index].userInput,
          translate: items[index].translate,
          output: items[index].output,
          type: items[index].type,
          merged: items[index].merged,
          // 用来调试
          _debugOutput: items[index].debugOutput
        }

        // 针对prompt的数据进行处理，只保留有用的
        if ([
          "queryRead",
          "queryDefault",
          "queryClick",
          "queryInput"
        ].includes(prompt.type)) {
          delete prompt.api;
          delete prompt.file;
        }
        if (prompt.type == "prompt") {
          delete prompt.api;
          delete prompt.queryObj;
          delete prompt.file;
        }

        if (prompt.type == "api") {
          delete prompt.queryObj;
          delete prompt.file;
        }

        if (prompt.type == "file") {
          delete prompt.api;
          delete prompt.queryObj;
        }

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
        if (c.children && c.checked) {
          // 有子级的，需要拼接
          return Array.from(c.children, (child: any) => child.checked && `${c.value}-${child.value}`)

        };

        if (c.checked) return c.value;

      }).flat().filter(f => f)
      // console.log(combo)
      res(combo)
    })
  })
}

/**
 * 默认的节点
 */
const useStore = create<RFState>((set, get) => ({
  comboOptions: [],
  id: '',
  debug: { open: false },
  merge: {},
  tag: 'combo',
  defaultNode: initRootNode(),
  nodes: [],
  edges: [],
  init: () => {
    set({
      comboOptions: comboOptions(),
      defaultNode: initRootNode
    })
  },
  onComboOptionsChange: (type: number, changes: any) => {
    console.log('onComboOptionsChange', type, changes);

    let comboOptions = get().comboOptions;

    if (type === 0) {
      // 父级
      comboOptions = Array.from(comboOptions, (c: any) => {
        c.checked = changes.includes(c.value);
        return c
      })
    } else if (type == 1) {
      // 子级
      comboOptions = Array.from(comboOptions, (c: any) => {
        if (c.children && changes.includes(c.value)) {
          c.children = Array.from(c.children, (child: any) => {
            child.checked = changes.includes(child.value);
            return child
          })
        }
        return c
      })
    }
    // console.log(changes, comboOptions)
    set({ comboOptions })
  },
  onTagChange: (tag: string) => {
    set({ tag })
  },
  debugStatus: (event: any) => {
    const nodes = onChangeForNodes(event, get().nodes);
    // console.log('debugStatus', nodes)
    set({ nodes })
  },
  // 完成调试状态和节点的导入、初始化等
  newCombo: (id: string, tag: string, interfaces: any, ns: any, edges: any, debug: any, merge: any) => {
    const oId = get().id;
    if (id == oId) return;
    set({
      nodes: [], edges: [],
    });
    console.log('newCombo - tag -debug', tag, interfaces, debug, merge)

    const nodes = [...Array.from(ns, (nd: any) => {
      nd.data = {
        ...defaultNode(),
        ...nd.data,
        getNodes: (currentId: string) => getNodes(currentId, get().nodes, get().edges),
        onChange: (e: any) => {
          const nodes = onChangeForNodes(e, get().nodes);
          set({
            nodes
          });
        },
      }

      nd.type = nd.data.type;

      if (nd.data.merged) {
        nd.data.debugInput = JSON.stringify(nd.data.merged, null, 2)
      }

      if (debug && debug.open && debug.callback) nd.data['debug'] = (prompt: any) => {
        get().exportData().then((combo: any) => {
          debugRun(nd.id, prompt, combo, debug, nd.data.onChange)
        });
      }
      nd.data['delete'] = (id: string) => get().deleteNode(id);
      if (merge && merge.callback) nd.data['merge'] = (prompt: any) => mergeRun(nd.id, prompt, nd.data.onChange, merge.callback);

      return nd
    })];

    // interfaces的处理，把子级提出来
    const interfacesChildren: any = {};
    for (const inf of interfaces) {
      const infs = inf.split("-");
      if (infs.length === 2) {
        if (!interfacesChildren[infs[0]]) {
          interfacesChildren[infs[0]] = []
        }
        interfacesChildren[infs[0]].push(infs[1])
      }
    };

    let comboOpts = comboOptions();
    comboOpts = Array.from(comboOpts, (c: any) => {
      c.checked = interfaces.includes(c.value);
      if (c.children) {
        c.checked = !!interfacesChildren[c.value];
        if (interfacesChildren[c.value]) c.children = Array.from(c.children, (child: any) => {
          child.checked = interfacesChildren[c.value].includes(child.value);
          return child
        })
      }
      return c
    })
    // console.log(changes, comboOptions)
    console.log('newCombo - nodes', id, tag, nodes, debug, comboOpts, comboOptions())

    setTimeout(() => set({
      id,
      nodes,
      edges,
      debug,
      tag,
      comboOptions: comboOpts
    }), 200)

  },
  onNodesChange: (changes: any) => {
    const nodes = get().nodes;
    // console.log('onNodesChange', changes,nodes)
    set({
      nodes: applyNodeChanges(changes, nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    // console.log('onEdgesChange')
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  addNode: (nodeType: string, dataType: string, position = { x: 0, y: 0 }) => {
    // role 只能放一张
    if (nodeType == 'role' && get().nodes.filter((n: any) => n.type == nodeType).length > 0) return

    const newNode: any = {
      id: createId(nodeType, nanoid()),
      type: nodeType,
      data: {
        ...defaultNode(),
        type: nodeType,
        getNodes: (currentId: string) => getNodes(currentId, get().nodes, get().edges),
        onChange: (e: any) => {
          const nodes = onChangeForNodes(e, get().nodes);
          set({
            nodes
          });
        },
      },
      position,
      deletable: true,
    };

    const debug = get().debug, merge = get().merge;


    if (debug && debug.open && debug.callback) newNode.data['debug'] = (prompt: any) => {
      get().exportData().then((combo: any) => {
        debugRun(newNode.id, prompt, combo, debug, newNode.data.onChange)
      });
    }
    newNode.data['delete'] = (id: string) => get().deleteNode(id);
    if (merge && merge.callback) newNode.data['merge'] = (prompt: any) => mergeRun(newNode.id, prompt, newNode.data.onChange, merge.callback);


    set({
      nodes: [...get().nodes, newNode]
    });
  },
  changeChildNode: (source: string, target: string) => {
    const nodes = get().nodes;

    // source 
    const edges = get().edges.filter(e => e.source != source && e.target != target)
    // console.log(edges)

    const newEdge = {
      id: createId('edge', nanoid()),
      source,
      target,
      type: 'straight',
      // animated: true,
      label: nodes.filter((node: any) => node.id == source)[0].data.output,
      deletable: true,
    };

    set({
      edges: [...edges, newEdge],
    });

  },
  addChildNode: (parentNode: Node, position: XYPosition) => {
    // console.log('addChildNode', parentNode, get().edges)
    const pId = parentNode.id;

    // 已经作为source了
    if (get().edges.filter(e => e.source == pId).length > 0) return

    // 可根据 parentNode 判断下一个节点类型

    const newNode: any = {
      id: createId('prompt', nanoid()),
      type: 'prompt',
      data: {
        ...defaultNode(),
        getNodes: (currentId: string) => getNodes(currentId, get().nodes, get().edges),
        onChange: (e: any) => {
          const nodes = onChangeForNodes(e, get().nodes);
          set({
            nodes
          });
        },
      },
      position,
      // parentNode: parentNode.id,
      deletable: true
    };

    const debug = get().debug, merge = get().merge;

    if (debug && debug.open && debug.callback) newNode.data['debug'] = (prompt: any) => {
      get().exportData().then((combo: any) => {
        debugRun(newNode.id, prompt, combo, debug, newNode.data.onChange)
      });
    }

    newNode.data['delete'] = (id: string) => get().deleteNode(id);

    if (merge && merge.callback) newNode.data['merge'] = (prompt: any) => mergeRun(newNode.id, prompt, newNode.data.onChange, merge.callback);

    // console.log('addChildNode', parentNode)
    const newEdge = {
      id: createId('edge', nanoid()),
      source: parentNode.id,
      target: newNode.id,
      type: 'straight',
      // animated: true,
      label: get().nodes.filter((node: any) => node.id == parentNode.id)[0].data.output,
      deletable: true,
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });
  },
  deleteNode(deletedId: any) {
    // console.log(deletedId)

    const nodes = get().nodes.filter(n => n.id != deletedId);
    const edges = get().edges.filter(n => n.target != deletedId && n.source != deletedId);

    set({
      nodes,
      edges
    });

  },
  exportData: () => {
    const comboId = get().id,
      tag = get().tag,
      comboOptions = get().comboOptions,
      edges = get().edges,
      nodes = get().nodes;

    return exportData(comboId, tag, comboOptions, edges, nodes)
  }
}));

export default useStore;
