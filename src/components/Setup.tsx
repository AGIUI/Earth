import React from 'react'
import { Space, Divider, Tag, Typography, Input, Button, Select, Popover } from 'antd';

import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

import { chromeStorageGet, chromeStorageSet } from '@src/components/Utils';


class Setup extends React.Component<{
    callback: any
}, {
    os: any,
    chatGPTToken: string,
    chatGPTAPIs: any,
    chatGPTAPI: string,
    chatGPTModels: any,
    chatGPTModel: string,
    status: any,
    shortcut: string
}> {
    constructor(props: any) {
        super(props)
        this.state = {
            os: 'win',
            chatGPTToken: '',
            chatGPTAPIs: ['https://api.openai.com'],
            chatGPTAPI: 'https://api.openai.com',
            chatGPTModels: ['gpt-3.5-turbo'],
            chatGPTModel: 'gpt-3.5-turbo',
            status: {
                Bing: '-', ChatGPT: '-'
            },
            shortcut: ''
        }

        chrome.storage.sync.onChanged.addListener(() => {
            this._updateChatBotAvailables()
        })

        setTimeout(() => this._updateChatBotAvailables(), 3000);

        window.onfocus = (e) => {
            if (document.readyState == 'complete') {
                chrome.runtime.sendMessage({
                    cmd: 'chat-bot-init'
                })
                this._updateChatBotAvailables()
            }
        }

    }

    _updateChatBotAvailables() {
        chrome.storage.sync.get().then(res => {
            if (res.chatBotAvailables) {
                // 判断 c.available.success == false or true
                // UnauthorizedRequest
                // Forbidden
                // ChatGPT API key not set
                let status: any = {};
                Array.from(res.chatBotAvailables, (c: any) => {
                    if (c && c.available && c.available.success) {
                        status[c.type] = 'OK'
                    } else if (c && c.available && c.available.success == false) {
                        status[c.type] = c.available.info || ''
                    }
                })
                this.setState({
                    status
                })
            };
            if(res.myPoints){
                // api2d
                console.log(res.myPoints)
            }
        })
    }

    componentDidMount() {

        chromeStorageGet('myConfig').then((res: any) => {
            let myConfig = res.myConfig;
            if (myConfig && myConfig.chatGPTAPI && this.state.chatGPTAPIs.includes(myConfig.chatGPTAPI)) {
                this.state.chatGPTAPIs.push(myConfig.chatGPTAPI);
            }
            this.setState(myConfig)
        })
        chrome.runtime.sendMessage({ cmd: 'get-my-points-for-api2d' });
        chrome.runtime.sendMessage({ cmd: 'get-shortcuts' });
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // console.log('send-shortcuts-result', request)
            if (request.cmd === 'send-shortcuts-result') {
                if (request.data != "") {
                    this.setState({
                        shortcut: request.data
                    })
                } else {
                    this.setState({
                        shortcut: '暂未设置'
                    })
                }
            } else if (request.cmd == 'chat-bot-init-result') {
                // this._updateChatBotAvailables();
            }
        });

        setTimeout(() => chrome.runtime.sendMessage({ cmd: 'get-shortcuts' }), 3000)

    }

    render(): JSX.Element {
        return (
            <Space direction="vertical" size="small"
                style={{ width: 500, padding: 20, display: 'flex', backgroundColor: "white" }}>

                <Title level={3}>设置</Title>
                <Button icon={<CloseOutlined style={{ fontSize: 20 }} />} style={{
                    position: 'absolute',
                    top: 10,
                    right: 20,
                    border: 0,
                    boxShadow: 'none'
                }}
                    onClick={() => {
                        if (this.props.callback) this.props.callback({
                            cmd: 'close-setup'
                        })
                    }} />

                <Title level={4} style={{ marginTop: 0 }}>快捷键设置</Title>
                <Space direction={"horizontal"} align={"center"}>
                    <Text style={{ fontSize: "medium", marginRight: 10 }}>{this.state.shortcut}</Text>
                    <Button
                        onClick={() => chrome.runtime.sendMessage({
                            cmd: 'set-shortcuts'
                        })}>
                        修改
                    </Button>
                </Space>

                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Title level={4} style={{ marginTop: 0 }}>Bing Chat设置</Title>
                {(() => {
                    if (this.state.status['Bing'] == 'OK') {
                        return <Tag color="#87d068">当前可用</Tag>
                    } else if (this.state.status['Bing'] == 'UnauthorizedRequest') {
                        return (
                            <Space direction={"vertical"}>
                                <Space direction={"horizontal"} size={0} style={{ marginBottom: 10 }}>
                                    <Tag color={"#cd201f"}>Bing未授权</Tag>
                                    <Popover zIndex={1200} content={
                                        <div>Bing Chat无法使用，请重新登录Bing账号</div>
                                    } title="相关建议">
                                        <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                    </Popover>
                                </Space>
                                <Button
                                    onClick={() => {
                                        chrome.runtime.sendMessage({
                                            cmd: 'open-url', data: { url: "https://www.bing.com" }
                                        });
                                        setTimeout(() => chrome.runtime.sendMessage({
                                            cmd: 'chat-bot-init'
                                        }), 2000)
                                    }}>登录Bing账号</Button>
                            </Space>
                        )
                    } else {
                        return (
                            <Space direction={"horizontal"} size={0} style={{ marginBottom: 0 }}>
                                <Tag color={"#cd201f"}>环境异常</Tag>
                                <Popover zIndex={1200} content={
                                    <div>Bing Chat无法使用，请检查网络配置</div>
                                } title="相关建议">
                                    <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                </Popover>
                            </Space>
                        )
                    }
                })()}
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Title level={4} style={{ marginTop: 0 }}>ChatGPT设置</Title>
                {(() => {
                    if (this.state.status['ChatGPT'] == 'OK') {
                        return <Tag color="#87d068">当前可用</Tag>
                    } else {
                        return <Space direction={"horizontal"} size={0}>
                            <Tag color={"#cd201f"}>暂不可用</Tag>
                            <Popover zIndex={1200} content={
                                <div>ChatGPT无法使用，请检查网络或者重新配置API Key</div>
                            } title="相关建议">
                                <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                            </Popover>
                        </Space>
                    }
                })()}
                <Space direction="vertical" size={'small'} style={{ display: 'flex' }}>
                    <Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>API Key设置</Title>
                    <Input.Password placeholder="input token"
                        value={this.state.chatGPTToken}
                        onChange={(e: any) => {
                            this.setState({
                                chatGPTToken: e.target.value
                            })
                        }} />

                    <Title level={5} style={{ marginTop: 10, marginBottom: 0 }}>API Host设置</Title>
                    <Select
                        maxTagCount={1}
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="https://api.openai.com"
                        value={this.state.chatGPTAPI}
                        onChange={(e: any) => {
                            console.log(e)
                            this.setState({
                                chatGPTAPI: e[0]
                            })
                        }}
                        options={Array.from(this.state.chatGPTAPIs, c => {
                            return {
                                value: c,
                                label: c
                            }
                        })}
                    />
                    <Title level={5} style={{ marginTop: 10, marginBottom: 0 }}>API Model设置</Title>

                    <Select
                        maxTagCount={1}
                        mode="tags"
                        placeholder={this.state.chatGPTModels[0]}
                        style={{ width: '100%' }}
                        value={this.state.chatGPTModel}
                        onChange={(value: string) => {
                            // console.log(`selected ${value}`);
                            this.setState({
                                chatGPTModel: value
                            })
                        }}
                        options={
                            Array.from(this.state.chatGPTModels, c => {
                                return {
                                    value: c,
                                    label: c
                                }
                            })
                        }
                    />

                </Space>

                <Space direction={"horizontal"}>
                    <Button style={{ marginTop: 10 }} onClick={() => {
                        let { chatGPTAPI, chatGPTModel, chatGPTToken } = this.state;
                        const myConfig = { chatGPTAPI, chatGPTModel, chatGPTToken }
                        chromeStorageSet({ myConfig });

                        // bg 初始化chatbot
                        chrome.runtime.sendMessage({
                            cmd: 'chat-bot-init',
                            data: myConfig
                        });
                        // if (this.props.callback) this.props.callback({
                        //     cmd:"close-"
                        // })
                    }}>更新状态</Button>

                </Space>
            </Space>
        )
    }
}


export default Setup
