import * as React from "react";
import {
    Card,
    Button,
    Typography,
    Tag,
    List,
    Switch, Divider, Empty,
    Modal, Input, Form,
    message
} from 'antd';

const { Text } = Typography;

import {
    CloseOutlined
} from '@ant-design/icons';

import { chromeStorageGet, chromeStorageSet, md5 } from "@components/Utils"


import { defaultCombo, defaultPrompt } from '@components/combo/ComboData'

import DownloadButton from '@components/buttons/DownloadButton';
import { FlexRow } from "@components/Style";
import OpenFileButton from "@components/buttons/OpenFileButton";
import ImportButton from "@components/buttons/ImportOfficialCombo";
import {parsePromptsData} from "@components/combo/ImportComboData";

type PropType = {
    myPrompts: any;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    name: string;
    title: string;
    secondTitle: string;
    myPrompts: any,
    showImportModal: boolean;
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
            myPrompts: this.props.myPrompts,
            showImportModal: false,
        }
        chrome.runtime.onMessage.addListener(async (
            request,
            sender,
            sendResponse
        ) => {
            if (request.cmd == 'get-data-from-notion-result') {
                const {results, type} = request.data;
                if (type) {
                    if (request.success && results && results.length > 0) {
                        const newCombo = await parsePromptsData(results);
                        // console.log('newCombo', newCombo);
                        this.setState({
                            myPrompts: newCombo,
                            showImportModal: false
                        });
                    } else {
                        message.open({
                            type: 'error',
                            content: '导入失败，请稍后重试',
                        });
                    }
                }
            }
        })
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
        const data={
            prompt: {
                ...defaultCombo,
                ...prompt
            },
            from: 'combo-editor'
        }
        console.log('_showModal',data)
        event.stopPropagation();
        event.preventDefault();
        if (this.props.callback) this.props.callback({
            cmd: 'show-combo-modal', data
        })
    };

    _importOfficialCombo(value: any) {
        chrome.runtime.sendMessage({
                cmd: 'get-data-from-notion',
                data: {
                    type: 'other',
                    expirationTime: 0,
                    dataBase: value.key
                }
            },
            response => {
                console.log("Received response", response);
            }
        )
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                const {cmd, data} = request;
            }
        )

    }

    _downloadMyCombo() {
        const prompts = this.state.myPrompts.filter((p: any) => p.owner != 'official')

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
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".json"
        document.body.appendChild(input);
        let that = this;
        input.addEventListener('change', (e: any) => {
            // console.log(e);
            const files = e.target.files;
            if (files.length == 1) {
                let file = files[0];
                var fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = function () {
                    // 获取得到的结果
                    const data: any = this.result;
                    const json = JSON.parse(data);
                    // console.log(json)

                    chromeStorageGet(['user']).then((items: any) => {
                        let myPrompts = [...that.state.myPrompts];

                        if (items && items.user) {
                            let newUser = [...items.user]
                            for (const n of json) {
                                let isNew = true;
                                if (items.user.filter((u: any) => u.id == n.id).length > 0) isNew = false;
                                if (isNew) {
                                    newUser.push(n);
                                    myPrompts.push(n)
                                };
                            }

                            chromeStorageSet({ 'user': newUser });

                            that.setState({ myPrompts })
                        }


                    });

                }
            }
            input.remove();
        }, false)
        input.click();
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
                    <FlexRow display="flex">
                        <Text style={{
                            fontSize: 20,
                            fontWeight: "bold"
                        }}>{this.state.title}</Text>
                        <div>
                            <ImportButton
                                disabled={false}
                                callback={() => this.setState({
                                    showImportModal: true
                                })}/>
                        </div>
                    </FlexRow>
                    <Modal centered={true} footer={false} title="填写信息" open={this.state.showImportModal}
                           onOk={() => this.setState({
                               showImportModal: false
                           })}
                           onCancel={() => this.setState({
                               showImportModal: false
                           })}
                           maskClosable={false}>
                        <Form onFinish={(e) => this._importOfficialCombo(e)}>
                            <Form.Item
                                style={{marginTop: 16, marginBottom: 0}}
                                name={'key'}
                                rules={[
                                    {
                                        required: true,
                                    },
                                    {
                                        type: 'string',
                                        len: 32,
                                    },
                                ]}
                            >
                                <Input placeholder="填写32位字符"/>
                            </Form.Item>
                            <Form.Item
                                style={{display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 0}}>
                                <Button type="primary" htmlType="submit">导入</Button>
                            </Form.Item>
                        </Form>
                    </Modal>
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
                        <div >

                            <DownloadButton
                                disabled={false}
                                callback={() => this._downloadMyCombo()} />
                            <OpenFileButton
                                disabled={false}
                                callback={() => this._importMyCombo()} />

                        </div>

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
