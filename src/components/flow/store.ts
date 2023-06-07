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


/**
 * 默认的节点
 */
const useStore = create<RFState>((set, get) => ({
  comboOptions,
  id: '',
  debug: { open: false },
  tag: 'combo',
  defaultNode: {
    id: 'root',
    type: 'role',
    data: {
      ...defaultNode,
      role: { ..._DEFAULTCOMBO.role },
      type: 'role',
    },
    position: { x: 0, y: 0 },
    deletable: false
  },
  nodes: [],
  edges: [],
  onComboOptionsChange: (changes: any) => {
    let comboOptions = get().comboOptions;
    comboOptions = Array.from(comboOptions, (c: any) => {
      c.checked = changes.includes(c.value);
      return c
    })
    // console.log(changes, comboOptions)
    set({ comboOptions })
  },
  onTagChange: (tag: string) => {
    set({ tag })
  },
  // 完成调试状态和节点的导入、初始化等
  newCombo: (id: string, tag: string, interfaces: any, ns: any, edges: any, debug: any) => {
    const oId = get().id;
    if (id == oId) return;
    set({
      nodes: [], edges: []
    });
    console.log('newCombo - tag -debug', tag, interfaces, debug)

    const nodes = [...Array.from(ns, (nd: any) => {
      nd.data = {
        ...defaultNode,
        ...nd.data,
        getNodes:()=>get().nodes,
        onChange: (e: any) => {
          // console.log('store-onchange', e)
          const nodes = [];
          for (const node of get().nodes) {
            if (node.id === e.id) {
              nodes.push({
                ...node,
                data: {
                  ...node.data,
                  ...e.data
                },
                draggable: !!e.data.draggable
              })
            } else {
              nodes.push(node)
            }
          }
          set({
            nodes
          });
        },
      }

      nd.type = nd.data.type;

      if (debug && debug.open && debug.callback) {
        nd.data['debug'] = (prompt: any) => {
          const controlEvent = parsePrompt2ControlEvent(prompt)
          debug.callback(controlEvent)
        }
      }
      return nd
    })]

    let comboOptions = get().comboOptions;
    comboOptions = Array.from(comboOptions, (c: any) => {
      c.checked = interfaces.includes(c.value);
      return c
    })
    // console.log(changes, comboOptions)
    console.log('newCombo - nodes', id, tag, nodes, debug, comboOptions)

    setTimeout(() => set({
      id,
      nodes,
      edges,
      debug,
      tag,
      comboOptions
    }), 800)

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
      id: nanoid(),
      type: nodeType,
      data: {
        ...defaultNode,
        type: dataType,
        getNodes:()=>get().nodes,
        onChange: (e: any) => {
          // console.log('store-onchange', e)
          const nodes = [];
          for (const node of get().nodes) {
            if (node.id === e.id) {
              nodes.push({
                ...node, data: {
                  ...node.data, ...e.data
                },
                draggable: !!e.data.draggable
              })
            } else {
              nodes.push(node)
            }
          }
          set({
            nodes
          });
        }
      },
      position,
      deletable: true,
    };

    const debug = get().debug;
    if (debug && debug.open && debug.callback) {
      newNode.data['debug'] = (prompt: any) => {
        const controlEvent = parsePrompt2ControlEvent(prompt)
        debug.callback(controlEvent)
      }
    }


    set({
      nodes: [...get().nodes, newNode]
    });
  },
  changeChildNode: (source: string, target: string) => {
    const nodes = get().nodes;

    // source 
    const edges = get().edges.filter(e => e.source != source && e.target != target)
    console.log(edges)

    const newEdge = {
      id: nanoid(),
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
      id: nanoid(),
      type: 'prompt',
      data: {
        ...defaultNode,
        getNodes:()=>get().nodes,
        onChange: (e: any) => {
          // console.log('store-onchange', e)
          const nodes = [];
          for (const node of get().nodes) {
            if (node.id === e.id) {
              nodes.push({
                ...node, data: {
                  ...node.data, ...e.data
                },
                draggable: !!e.data.draggable
              })
            } else {
              nodes.push(node)
            }
          }
          set({
            nodes
          });
        }
      },
      position,
      // parentNode: parentNode.id,
      deletable: true
    };

    const debug = get().debug;
    if (debug && debug.open && debug.callback) {
      newNode.data['debug'] = (prompt: any) => {
        const controlEvent = parsePrompt2ControlEvent(prompt)
        debug.callback(controlEvent)
      }
    }

    // console.log('addChildNode', parentNode)
    const newEdge = {
      id: nanoid(),
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
