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
  addNode: any
};

const createId = (type: string, id: string) => `${type}_${id}`.toLocaleUpperCase()

const getNodes = (currentId: string, nodes: any) => {
  const nodeOpts = Array.from(nodes, (node: any, i) => {
    return {
      value: node.id,
      label: node.type + '_' + node.id,
      id: node.id
    }
  }).filter((n: any) => n.id != currentId)
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


const debugRun = (id: string, prompt: any, debug: any, onChange: any) => {
  const controlEvent: any = parsePrompt2ControlEvent(id, prompt)
  controlEvent.onChange = onChange
  debug.callback(controlEvent)
}

const _VERVISON = '0.1.0',
  _APP = 'brainwave';

const initRootNode = () => {
  return {
    id: 'root',
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

/**
 * 默认的节点
 */
const useStore = create<RFState>((set, get) => ({
  comboOptions: [],
  id: '',
  debug: { open: false },
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
  newCombo: (id: string, tag: string, interfaces: any, ns: any, edges: any, debug: any) => {
    const oId = get().id;
    if (id == oId) return;
    set({
      nodes: [], edges: [],
    });
    console.log('newCombo - tag -debug', tag, interfaces, debug)

    const nodes = [...Array.from(ns, (nd: any) => {
      nd.data = {
        ...defaultNode(),
        ...nd.data,
        getNodes: (currentId: string) => getNodes(currentId, get().nodes),
        onChange: (e: any) => {
          const nodes = onChangeForNodes(e, get().nodes);
          set({
            nodes
          });
        },
      }

      nd.type = nd.data.type;

      if (debug && debug.open && debug.callback) {
        nd.data['debug'] = (prompt: any) => debugRun(nd.id, prompt, debug, get().debugStatus);
      }
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
        type: dataType,
        getNodes: (currentId: string) => getNodes(currentId, get().nodes),
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

    const debug = get().debug;
    if (debug && debug.open && debug.callback) {
      newNode.data['debug'] = (prompt: any) => debugRun(newNode.id, prompt, debug, get().debugStatus)
    }


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
        getNodes: (currentId: string) => getNodes(currentId, get().nodes),
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

    const debug = get().debug;
    if (debug && debug.open && debug.callback) {
      newNode.data['debug'] = (prompt: any) => debugRun(newNode.id, prompt, debug, get().debugStatus)
    }

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
}));

export default useStore;
