import * as React from "react";
import {
    Card,
    Button,
    Typography,
    Tag,
    List,
    Switch, Divider, Empty,
} from 'antd';

const { Text } = Typography;

import {
    CloseOutlined
} from '@ant-design/icons';

import { chromeStorageGet, chromeStorageSet, md5 } from "@components/Utils"


import { defaultCombo } from '@components/combo/ComboData'

import DownloadButton from '@components/buttons/DownloadButton';
import { FlexRow } from "@components/Style";
import OpenFileButton from "@components/buttons/OpenFileButton";


type PropType = {
    myPrompts: any;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    name: string;
    title: string;
    secondTitle: string;
    myPrompts: any
}

interface ComboEditor {
    state: StateType;
    props: PropType
}

class ComboEditor extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: 'comboEditor',
            title: '官方Prompts',
            secondTitle: '我的Prompts',
            myPrompts: this.props.myPrompts
        }
    }

    componentDidMount() {
        // this.setupConnection();
        // console.log('combo edtior')
    }

    componentDidUpdate(prevProps: any, prevState: any) {

        const currentId = md5(JSON.stringify(this.props.myPrompts)),
            prevId = md5(JSON.stringify(prevProps.myPrompts));

        if (
            currentId !== prevId
        ) {
            this.setState({
                myPrompts: this.props.myPrompts
            })
            // this.destroyConnection();
            // this.setupConnection();
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _comboHandle(combo: any, from: string) {
        if (this.props.callback) this.props.callback({
            cmd: 'combo',
            data: {
                '_combo': combo,
                from, prompt: combo.prompt,
                tag: combo.tag,
                newTalk: true
            }
        })
    }


    _editSwitch = (checked: boolean, event: React.MouseEvent<HTMLButtonElement>, prompt: any) => {
        // console.log('EditSwitch');
        event.stopPropagation();
        event.preventDefault();

        chromeStorageGet(['official']).then((items: any) => {
            if (items && items.official) {
                const official = items.official;
                for (let i = 0; i < official.length; i++) {
                    const officePrompt = official[i];
                    if (officePrompt.tag === prompt.tag) {
                        officePrompt.checked = checked;
                        official[i] = officePrompt;
                    }
                }
                chromeStorageSet({ 'official': official });
            }

        });
    };


    _showModal(event: React.MouseEvent<HTMLButtonElement>, prompt: any) {

        event.stopPropagation();
        event.preventDefault();
        if (this.props.callback) this.props.callback({
            cmd: 'show-combo-modal', data: {
                prompt: {
                    ...defaultCombo,
                    ...prompt
                },
                from: 'combo-editor'
            }
        })
    };

    _downloadMyCombo() {
        const prompts=this.state.myPrompts.filter((p:any)=>p.owner!='official')
        const data = JSON.stringify(prompts)

        //通过创建a标签实现
        const link = document.createElement('a')
        //encodeURIComponent解决中文乱码
        link.href = `data:application/json;charset=utf-8,\ufeff${encodeURIComponent(data)}`

        //对下载的文件命名
        const jsonName = `my-combo-${(new Date()).getTime()}`
        link.download = jsonName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link);
    }
    _importMyCombo() {
        console.log(this.state.myPrompts)
    }
    render() {
        return (
            <Card
                title={'Combo'}
                bordered={true}
                headStyle={{
                    userSelect: 'none',
                    border: 'none',
                    fontSize: 24,
                    fontWeight: "bold",
                    paddingTop: 16
                }}
                bodyStyle={{
                    // flex: 1,
                    padding: '24px 24px 8px 24px',
                    height: '100%',
                    overflowY: 'scroll',
                    paddingBottom: '99px'
                }}

                extra={<div>
                    <Button
                        style={{
                            outline: 'none',
                            border: 'none',
                            margin: '0px 0px 0px 5px',
                            boxShadow: 'none'
                        }}
                        onClick={
                            () => this.props.callback && this.props.callback({ cmd: 'close-combo-editor' })
                        }
                        icon={<CloseOutlined style={{ fontSize: 20 }} />}
                    />
                </div>}

                style={{
                    width: '500px',
                    padding: '0px',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh'
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: "bold"
                    }}>{this.state.title}</Text>

                    {this.state.myPrompts.filter((p: any) => p.owner === 'official').length > 0 ? (
                        <List>
                            {[...Array.from(this.state.myPrompts.filter((p: any) => p.owner === 'official'), (p: any, i) => {
                                return (
                                        <List.Item
                                            key={i}
                                            style={{
                                                border: 1,
                                                borderColor: '#d9d9d9',
                                                borderStyle: 'solid',
                                                borderRadius: 5,
                                                paddingTop: 15,
                                                paddingBottom: 15,
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                                marginTop: 10,
                                                marginBottom: 10
                                            }}
                                            actions={[
                                                <Switch key='switch' checkedChildren="显示"
                                                    unCheckedChildren="隐藏"
                                                    defaultChecked={p.checked}
                                                    onClick={(checked: boolean, event: any) => this._editSwitch(checked, event, p)} />,
                                                <Button onClick={() => this._comboHandle(p, "getPromptPage")}>运行</Button>
                                            ]}
                                        ><Text style={{ fontWeight: "bold" }}>{p.tag}
                                                {
                                                    p.combo > 1 ? (<Tag style={{ marginLeft: 10 }}>Combo</Tag>) : null
                                                }

                                            </Text></List.Item>

                                )
                            })]}
                        </List>
                    ) : (
                        <Empty style={{ marginTop: 100, marginBottom: 100 }} />
                    )}

                    <Divider />

                    <FlexRow display="flex">
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{this.state.secondTitle}</Text>
                        <DownloadButton
                            disabled={false}
                            callback={() => this._downloadMyCombo()} />
                        {/* <OpenFileButton
                            disabled={false}
                            callback={() => this._importMyCombo()} /> */}

                    </FlexRow>

                    {this.state.myPrompts.filter((p: any) => p.owner !== 'official').length > 0 ? (
                        <List>
                            {this.state.myPrompts.filter((p: any) => p.owner !== 'official').map((p: any, i: number) => {
                                return (
                                        <List.Item
                                            key={i}
                                            style={{
                                                border: 1,
                                                borderColor: '#d9d9d9',
                                                borderStyle: 'solid',
                                                borderRadius: 5,
                                                paddingTop: 15,
                                                paddingBottom: 15,
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                                marginTop: 10,
                                                marginBottom: 10
                                            }}
                                            actions={[
                                                <Button
                                                    onClick={(event: any) => this._showModal(event, p)}
                                                    key={'edit'}
                                                    type={'text'}
                                                >
                                                    编辑
                                                </Button>,
                                                <Button onClick={() => this._comboHandle(p, "getPromptPage")}
                                                >运行</Button>
                                            ]}
                                        >
                                            <Text style={{ fontWeight: 'bold' }}>
                                                {p.tag}
                                                {
                                                    p.combo > 1 ? (
                                                        <Tag style={{ marginLeft: 10 }}>Combo</Tag>) : null
                                                }
                                            </Text>
                                        </List.Item>
                                )
                            })}
                        </List>
                    ) : (
                        <Empty style={{ marginTop: 100 }} />
                    )}

                </div>
                <Button size={"large"} type={"primary"}
                    style={{ position: "absolute", bottom: 30, width: 450, left: 25 }}
                    onClick={(event: any) => this._showModal(event, { owner: 'user' })}>
                    新建我的Prompts
                </Button>

                {/* {this.state.showEdit && ReactDOM.createPortal(showEditModal(), document.body as HTMLElement)} */}

            </Card>
        );
    }
}

export default ComboEditor;
