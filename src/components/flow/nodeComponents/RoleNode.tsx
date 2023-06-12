import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow';
import { Input, Avatar, Card, Select, Radio, InputNumber, Dropdown, Space, Button, Divider } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { roleAvatars } from '../Workflow'
import { createDebug, createText } from './Base'

export type NodeData = {
    debugInput: any;
    debugOutput: any;
    role: any;
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


const resources = {
    zh: {
        translation: {
            cardTitle: '角色',
            createText: '角色定义',
            placeholder: '输入...',

            debug: "调试",
            debugRun: '运行',
            inputText: '输入',
            inputTextPlaceholder: '',
            outputText: '输出',
            outputTextPlaceholder: '',
        },
    },
    en: {
        translation: {
            cardTitle: 'Role',
            createText: 'Create Role',
            placeholder: 'Enter...',

            debug: "Debug",
            debugRun: 'Run',
            inputText: 'Input',
            inputTextPlaceholder: '',
            outputText: 'Output',
            outputTextPlaceholder: '',
        },
    },
};

const nodeStyle = {
    border: '1px solid transparent',
    padding: '2px 5px',
    borderRadius: '12px',
};


function RoleNode({ id, data, selected }: NodeProps<NodeData>) {
    // console.log('RoleNode', JSON.stringify(data, null, 2))
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
            lng: navigator.language,
            debug: false,
            interpolation: {
                escapeValue: false, // 不需要对翻译文本进行转义
            },
        });

    // text
    const [role, setRole] = React.useState(data.role)
    const updateRole = (e: any) => {
        console.log(e)
        let r = { ...role };
        if (e.key == 'text' || e.key == 'name' || e.key == 'avatar') {
            r[e.key] = e.data;
            setRole({
                ...r
            })
            data.onChange({ id, data: { role: r } })
        }

        if (e.key == 'draggable') data.onChange({ id, data: { draggable: e.data } })

    }


    const createNode = (role: any, updateRole: any) => {
        // console.log('createNode', role)
        const keys: any = {
            guide: '你的AI员工是个拥有情感、喜恶、过往、抱负、目标、梦想与恐惧的AI机器人，就和一个真人一样。编辑这个员工将重新生成它，赋予它新的简介与小传（除非已被锁定），也可能因此改变它的言论与行为。在编辑AI员工前，请确保您可以接受因此带来的后果。',
            name: '姓名',
            text: '请描述角色的特征，我是...'
        }

        const items: any = Array.from(roleAvatars, (avatar: any) => {
            return {
                label: avatar.label,
                key: avatar.key,
                icon: <UserOutlined />,
                disabled: !!avatar.disabled,
                checked: avatar.key === role.avatar
            }
        });

        const avatarChecked = roleAvatars.filter((item: any) => item.key == role.avatar)[0];
        const avatarCheckedLabel = avatarChecked && avatarChecked.label || '角色类型'

        const handleMenuClick: any = (e: any) => {
            // console.log('roleAvatars click', e);
            updateRole({
                key: 'avatar', data: e.key
            })
        };

        const menuProps: any = {
            items,
            onClick: handleMenuClick,
        };
        return <Card
            key={id}
            title={i18n.t('cardTitle')}
            bodyStyle={{ paddingTop: 0 }}
            //   extra={createType(type, agents, updateType)}
            style={{ width: 300 }}>


            {
                createText('text', i18n.t('createText'), i18n.t('placeholder'), role.text, '', updateRole)
            }

            {
                createDebug({
                    header: i18n.t('debug'),
                    inputText: i18n.t('inputText'),
                    inputTextPlaceholder: i18n.t('inputTextPlaceholder'),
                    outputText: i18n.t('outputText'),
                    outputTextPlaceholder: i18n.t('outputTextPlaceholder'),
                    debugRun: i18n.t('debugRun'),
                }, id, data.debugInput, data.debugOutput, (event: any) => {
                    if (event.key == 'input') { }
                }, () => data.debug ? data.debug(data) : '', {})
            }

        </Card>
    }

    


    return (
        <div style={selected ? {
            ...nodeStyle,
            backgroundColor: 'cornflowerblue'
        } : nodeStyle}>

            {createNode(role, updateRole)}
            {/* <Handle type="target" position={Position.Left} /> */}

            <Handle type="source" position={Position.Right} />

        </div>
    );
}

export default RoleNode;