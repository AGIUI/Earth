/**
 * 配置文件json
 * { team, token,apis,api,models,model,apisFreezed,modelsFreezed,helpUrl,creditUrl,creditHelpUrl }
 */



import React from 'react'
import { Space, Divider, Tag, Typography, Input, Button, Select, Popover, Spin } from 'antd';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
import { chromeStorageGet, chromeStorageSet } from '@src/components/Utils';
import { getConfig } from '@components/Utils';
import OpenFileButton from "@components/buttons/OpenFileButton";
import HelpButton from "@components/buttons/HelpButton";
import styled from 'styled-components';


// user-select: none !important;
const Base: any = styled.div`
box-sizing: border-box;`

const Flex: any = styled(Base)`
display:${(props: any) => props.display || 'none'};
`

const Content: any = styled(Flex)`
    display:flex;
    height:100%; 
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: white;
    &::-webkit-scrollbar
    {
      width:2px;
    }
    &::-webkit-scrollbar-track
    {
      border-radius:25px;
      -webkit-box-shadow:inset 0 0 5px rgba(255,255,255, 0.5);
      background:rgba(255,255,255, 0.5);
    }
    &::-webkit-scrollbar-thumb
    {
      border-radius:15px;
      -webkit-box-shadow:inset 0 0 5px rgba(0, 0,0, 0.2);
      background:rgba(0, 0,0, 0.2);
    }
    & h1,h2{
      margin: 12px 0;
      font-weight: 800;
    }
    & p,li{
      margin: 6px 0;
    }
`


class Setup extends React.Component<{
    callback: any
}, {
    os: any,
    chatGPTConfig: any,
    status: any,
    shortcut: string,
    loading: boolean,
    checked: boolean,
    credit: string,
    name: string
}> {
    constructor(props: any) {
        super(props)
        this.state = {
            os: 'win',
            chatGPTConfig: {
                token: '',
                apis: ['https://api.openai.com'],
                api: 'https://api.openai.com',
                models: ['gpt-3.5-turbo'],
                model: 'gpt-3.5-turbo',
            },
            status: {
                Bing: '-', ChatGPT: '-'
            },
            shortcut: '',
            loading: false,
            checked: false,
            credit: '',
            name: ''
        }

        chrome.storage.sync.onChanged.addListener(() => {
            this._updateChatBotAvailables()
        })

        setTimeout(() => this._updateChatBotAvailables(), 200);

        window.onfocus = (e) => {
            if (document.readyState == 'complete') {
                if (Object.values(this.state.status).filter(t => t != "OK").length > 0) {
                    this._check({}, this.state.checked);
                    this._updateChatBotAvailables()
                };
            }
        }

        this._load();

        getConfig().then(json => {
            this.setState({
                name: `${json.app} _版本: ${json.version}`
            })
        });

    }

    _check(data = {}, checked = false) {
        if (checked === false) {
            chrome.runtime.sendMessage({
                cmd: 'chat-bot-init',
                data
            })

            this.setState({
                checked: true
            })
        }
    }

    _getCredit(url: string, token: string) {
        if (url.match('api2d')) chrome.runtime.sendMessage({
            cmd: 'get-my-points', data: {
                apiName: 'api2d', token
            }
        });
    }
    _load() {
        chromeStorageGet('myConfig').then((res: any) => {

            if (res.myConfig) {
                let myConfig = res.myConfig;
                // console.log(myConfig)
                let chatGPTConfig = { ...this.state.chatGPTConfig, ...myConfig };
                if (myConfig && myConfig.api && !chatGPTConfig.apis.includes(myConfig.api)) {
                    chatGPTConfig.apis.push(myConfig.api);
                }
                // console.log(this.state.chatGPTConfig, chatGPTConfig)
                if (chatGPTConfig.creditUrl) {
                    this._getCredit(chatGPTConfig.creditUrl, chatGPTConfig.token)
                }
                this.setState({ chatGPTConfig })
            } else {
                getConfig().then(json => {
                    if (json.chatGPT) {
                        this.setState({
                            chatGPTConfig: json.chatGPT
                        })
                        if (json.chatGPT.creditUrl) {
                            this._getCredit(json.chatGPT.creditUrl, json.chatGPT.token)
                        }
                    }

                })
            }
        })
    }

    _save(config = null) {

        let { team, api, apis, model, models, token, helpUrl, modelsFreezed, apisFreezed, creditUrl, creditHelpUrl } = config || this.state.chatGPTConfig;

        let myConfig: any = { api, model, token }

        if (team) myConfig['team'] = team;
        if (apis) myConfig['apis'] = apis;
        if (models) myConfig['models'] = models;
        if (helpUrl) myConfig['helpUrl'] = helpUrl;
        if (creditUrl) myConfig['creditUrl'] = creditUrl;
        if (creditHelpUrl) myConfig['creditHelpUrl'] = creditHelpUrl;
        if (modelsFreezed) myConfig['modelsFreezed'] = modelsFreezed;
        if (apisFreezed) myConfig['apisFreezed'] = apisFreezed;

        chromeStorageSet({ myConfig });
        return myConfig
    }

    _update() {
        if (this.state.loading) {
            this.setState({
                loading: false
            })
            return
        }

        const myConfig = this._save();

        // bg 初始化chatbot
        this._check(myConfig, false)

        this.setState({
            loading: true
        })

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
                console.log(status)
                this.setState({
                    status, loading: false
                })
            };
            if (res.myPoints) {
                // api2d
                // console.log(res.myPoints)
                if (res.myPoints.points) this.setState({
                    credit: `剩余点数：${res.myPoints.points}P`
                })
            }
        })
    }

    _importConfig() {
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
                    const chatGPTConfig = { ...json.chatGPT }

                    that.setState({
                        chatGPTConfig, loading: true
                    })

                    const myConfig = that._save(chatGPTConfig);

                    if (!chatGPTConfig.api.match('api2d')) {
                        // bg 初始化chatbot
                        that._check(myConfig, false)
                    }

                    if (chatGPTConfig.creditUrl) that._getCredit(chatGPTConfig.creditUrl, chatGPTConfig.token)

                    // console.log(json)
                }
            }
            input.remove();
        }, false)
        input.click();
    }

    _openUrl(url: string) {
        if (url) {
            window.open(url)
        }
    }

    componentDidMount() {


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

    componentWillUnmount(): void {
        console.log('componentWillUnmount')
    }

    render(): JSX.Element {
        // console.log(this.state.chatGPTConfig, 'chatGPTConfigchatGPTConfig')
        return (
            <Content>
                <Space direction="vertical" size="small"
                    style={{ width: 500, padding: 20, display: 'flex' }}>

                    <Spin spinning={this.state.loading}>

                        <Title level={3}>设置 <p style={{ fontSize: '12px' }}>{this.state.name}</p></Title>
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
                                            } title="详情">
                                                <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                            </Popover>
                                        </Space>
                                        <Button
                                            onClick={() => {
                                                chrome.runtime.sendMessage({
                                                    cmd: 'open-url', data: { url: "https://www.bing.com" }
                                                });
                                                // setTimeout(() => chrome.runtime.sendMessage({
                                                //     cmd: 'chat-bot-init'
                                                // }), 2000)
                                            }}>登录Bing账号</Button>
                                    </Space>
                                )
                            } else {
                                return (
                                    <Space direction={"horizontal"} size={0} style={{ marginBottom: 0 }}>
                                        <Tag color={"#cd201f"}>环境异常</Tag>
                                        <Popover zIndex={1200} content={
                                            <div>{this.state.status['Bing']}</div>
                                        } title="详情">
                                            <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                        </Popover>
                                    </Space>
                                )
                            }
                        })()}
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        <Title level={4} style={{ marginTop: 0 }}>ChatGPT设置
                            <OpenFileButton
                                callback={(e: any) => this._importConfig()}
                                disabled={false} />
                        </Title>
                        {(() => {
                            if (this.state.status['ChatGPT'] == 'OK') {
                                return <Tag color="#87d068">当前可用</Tag>
                            } else {
                                return <Space direction={"horizontal"} size={0}>
                                    <Tag color={"#cd201f"}>暂不可用</Tag>
                                    <Popover zIndex={1200} content={
                                        <div>{this.state.status['ChatGPT']}</div>
                                    } title="详情">
                                        <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                    </Popover>
                                </Space>
                            }
                        })()}
                        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                        <Space direction="vertical" size={'small'} style={{ display: 'flex' }}>

                            {
                                this.state.chatGPTConfig.helpUrl ? <div
                                    style={{
                                        display: 'flex', flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <p>使用帮助</p>
                                    <HelpButton callback={(e: any) => this._openUrl(this.state.chatGPTConfig.helpUrl)}
                                        disabled={false} />
                                </div> : ''
                            }

                            {
                                this.state.chatGPTConfig.creditUrl ? <div
                                    style={{
                                        display: 'flex', flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <p>{this.state.credit}</p>

                                    <Button style={{
                                        marginLeft: '12px',
                                        marginTop: 0
                                    }} onClick={() => this._openUrl(this.state.chatGPTConfig.creditHelpUrl)}>充值</Button>

                                </div> : ''
                            }

                            {
                                this.state.chatGPTConfig.team ? <>
                                    <Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>API Team设置</Title>
                                    <Input.Password placeholder="input team"
                                        value={this.state.chatGPTConfig.team}
                                        onChange={(e: any) => {
                                            let chatGPTConfig = this.state.chatGPTConfig;
                                            chatGPTConfig.team = e.target.value
                                            this.setState({
                                                chatGPTConfig
                                            })
                                        }} />
                                </> : ''
                            }



                            <Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>API Key设置</Title>
                            <Input.Password placeholder="input token"
                                value={this.state.chatGPTConfig.token}
                                onChange={(e: any) => {
                                    let chatGPTConfig = this.state.chatGPTConfig;
                                    chatGPTConfig.token = e.target.value
                                    this.setState({
                                        chatGPTConfig
                                    })
                                }} />

                            {
                                this.state.chatGPTConfig.apisFreezed ? '' : <><Title level={5} style={{ marginTop: 10, marginBottom: 0 }}>API Host设置</Title>
                                    <Select
                                        maxTagCount={3}
                                        mode="tags"
                                        optionFilterProp="label"
                                        style={{ width: '100%' }}
                                        placeholder="https://api.openai.com"
                                        value={this.state.chatGPTConfig.api}
                                        onChange={(e: any) => {
                                            // console.log(e)
                                            let chatGPTConfig = this.state.chatGPTConfig;
                                            chatGPTConfig.api = e[0];
                                            this.setState({
                                                chatGPTConfig
                                            })
                                        }}
                                        options={Array.from(this.state.chatGPTConfig.apis, c => {
                                            return {
                                                value: c,
                                                label: c
                                            }
                                        })}
                                    /></>
                            }

                            {
                                this.state.chatGPTConfig.modelsFreezed ? "" : <>
                                    <Title level={5} style={{ marginTop: 10, marginBottom: 0 }}>API Model设置</Title>
                                    <Select
                                        maxTagCount={3}
                                        mode="tags"
                                        optionFilterProp="label"
                                        placeholder={this.state.chatGPTConfig.models[0]}
                                        style={{ width: '100%' }}
                                        value={this.state.chatGPTConfig.model}
                                        onChange={(value: any) => {
                                            // console.log(value);
                                            let chatGPTConfig = this.state.chatGPTConfig;
                                            chatGPTConfig.model = value[0];
                                            this.setState({
                                                chatGPTConfig
                                            })
                                        }}
                                        options={
                                            Array.from(this.state.chatGPTConfig.models, c => {
                                                return {
                                                    value: c,
                                                    label: c
                                                }
                                            })
                                        }
                                    /></>
                            }


                        </Space>
                    </Spin>
                    <Space direction={"horizontal"}>
                        <Button style={{ marginTop: 10 }} onClick={() => this._update()}>{this.state.loading ? '更新中' : '更新状态'}</Button>

                    </Space>
                </Space></Content>
        )
    }
}


export default Setup
