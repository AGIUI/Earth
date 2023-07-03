import React, { useEffect } from 'react';
import { Collapse } from 'antd';
const { Panel } = Collapse;
import getNodes from '../nodeComponents/index'
import i18n from "i18next";

export default (props: any) => {
    const onDragStart = (event: any, nodeType: string, dataType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/dataType', dataType);
        event.dataTransfer.effectAllowed = 'move';
    };
    const onChange: any = (key: string) => {
        console.log(key);
    };

    const { newNodes } = props;

    const [nodes, setNodes] = React.useState(getNodes());

    useEffect(() => {
        console.log('sidebar newNodes:', newNodes)
        if (newNodes && newNodes.length > 0) setNodes(newNodes)
    }, [newNodes])

    // console.log(Array.from(nodes.filter((n: any) => n.open), n => n.title))
    return (
        <Collapse
            defaultActiveKey={Array.from(nodes.filter((n: any) => n.open), n => n.title)[0]}
            onChange={onChange}
            style={{
                width: 180, userSelect: 'none',
                background: 'white', 
            }}>
            <p style={{ paddingLeft: '24px' }}>{i18n.t('component')}</p>
            {
                Array.from(nodes, (node: any) => {
                    return <Panel header={node.title} key={node.title}>
                        <aside>
                            {
                                Array.from(node.children,
                                    (child: any,i) => {
                                        return <div
                                            key={i}
                                            style={{
                                                outline: '1px solid #ddd',
                                                borderRadius: '5px',
                                                padding: '10px',
                                                fontSize: '14px',
                                                fontWeight: 800,
                                                background: '#eee',
                                                margin: '10px 0',
                                                cursor: 'pointer',
                                            }}
                                            onDragStart={(event) => onDragStart(event, child.key, child.parent)}
                                            draggable>
                                            {
                                                child.name
                                            }
                                        </div>
                                    })
                            }

                        </aside>
                    </Panel>
                })
            }
        </Collapse>
    );
};
