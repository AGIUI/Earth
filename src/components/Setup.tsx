/**
 * 配置文件json
 * { team, token,apis,api,models,model,apisFreezed,modelsFreezed,helpUrl,creditUrl,creditHelpUrl，canImport }
 */

import React from 'react'
import { Space, Divider, Tag, Typography, Input, Button, Select, Popover, Spin, Card } from 'antd';
import { QuestionCircleOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
import { chromeStorageGet, chromeStorageSet } from '@src/components/Utils';
import { getConfig } from '@components/Utils';
import OpenFileButton from "@components/buttons/OpenFileButton";
import HelpButton from "@components/buttons/HelpButton";
import styled from 'styled-components';
import CloseButton from "@components/buttons/CloseButton";


// user-select: none !important;
// const Base: any = styled.div`
// box-sizing: border-box;`

// const Flex: any = styled(Base)`
// display:${(props: any) => props.display || 'none'};
// `

// const Content: any = styled(Flex)`
//     display:flex;
//     height:100%;
//     flex-direction: column;
//     overflow-y: scroll;
//     overflow-x: hidden;
//     background-color: white;
//     &::-webkit-scrollbar
//     {
//       width:2px;
//     }
//     &::-webkit-scrollbar-track
//     {
//       border-radius:25px;
//       -webkit-box-shadow:inset 0 0 5px rgba(255,255,255, 0.5);
//       background:rgba(255,255,255, 0.5);
//     }
//     &::-webkit-scrollbar-thumb
//     {
//       border-radius:15px;
//       -webkit-box-shadow:inset 0 0 5px rgba(0, 0,0, 0.2);
//       background:rgba(0, 0,0, 0.2);
//     }
//     & h1,h2{
//       margin: 12px 0;
//       font-weight: 800;
//     }
//     & p,li{
//       margin: 6px 0;
//     }
// `


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
    name: string,
    isChange: boolean,
    issues: string
}> {
    constructor(props: any) {
        super(props)

        const json: any = getConfig();

        this.state = {
            os: 'win',
            chatGPTConfig: {
                token: '',
                apis: [{
                    "value": 'https://api.openai.com',
                    "label": 'openai'
                }],
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
            name: `${json.app}_${json.version}`,
            isChange: false,
            issues: json.issues
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

    }

    _check(data = {}, checked = false) {
        if (checked === false) {
            chrome.runtime.sendMessage({
                cmd: 'chat-bot-init',
                data
            }, res => {

                const { cmd, data } = res;
                console.log(cmd)

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

                if (myConfig && myConfig.api && chatGPTConfig.apis.filter((a: any) => a.value == myConfig.api).length == 0) {
                    chatGPTConfig.apis.push({ value: myConfig.api, label: myConfig.displayApiName });
                }
                // console.log(this.state.chatGPTConfig, chatGPTConfig)
                if (chatGPTConfig.creditUrl) {
                    this._getCredit(chatGPTConfig.creditUrl, chatGPTConfig.token)
                }
                // console.log(chatGPTConfig)
                this.setState({ chatGPTConfig })
            } else {
                const json: any = getConfig()

                if (json.chatGPT) {
                    this.setState({
                        chatGPTConfig: json.chatGPT
                    })
                    if (json.chatGPT.creditUrl) {
                        this._getCredit(json.chatGPT.creditUrl, json.chatGPT.token)
                    }
                }


            }
        })
    }

    _save(config = null) {

        let { team, api, apis, model, models, token, helpUrl, modelsFreezed, apisFreezed, creditUrl, creditHelpUrl, canImport } = config || this.state.chatGPTConfig;

        let myConfig: any = { api, model, token }

        if (team) myConfig['team'] = team;
        if (apis) myConfig['apis'] = apis;
        if (models) myConfig['models'] = models;
        if (helpUrl) myConfig['helpUrl'] = helpUrl;
        if (creditUrl) myConfig['creditUrl'] = creditUrl;
        if (creditHelpUrl) myConfig['creditHelpUrl'] = creditHelpUrl;
        if (modelsFreezed) myConfig['modelsFreezed'] = modelsFreezed;
        if (apisFreezed) myConfig['apisFreezed'] = apisFreezed;
        if (canImport) myConfig['canImport'] = canImport;

        chromeStorageSet({ myConfig });
        return myConfig
    }

    _update() {
        if (this.state.loading) {
            this.setState({
                loading: false,
                isChange: false
            })
            return
        }

        const myConfig = this._save();

        // bg 初始化chatbot
        this._check(myConfig, false)


        if (myConfig.creditUrl) {
            setTimeout(() => this._getCredit(myConfig.creditUrl, myConfig.token), 1000)
        }

        this.setState({
            loading: true,
            isChange: false
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
                console.log(status, res.chatBotAvailables)
                this.setState({
                    status, loading: false
                })
            };
            let credit = `剩余点数：0 P`
            if (res.myPoints) {
                // api2d
                console.log(res.myPoints)
                if (res.myPoints.points) credit = `剩余点数：${res.myPoints.points}P`
            }
            this.setState({
                credit
            })
        })
    }

    _importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".json"

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
            const { cmd, data } = request;
            if (cmd === 'send-shortcuts-result') {
                if (request.data != "") {
                    this.setState({
                        shortcut: request.data
                    })
                } else {
                    this.setState({
                        shortcut: '暂未设置'
                    })
                }
            } else if (cmd == 'chat-bot-init-result') {
                // this._updateChatBotAvailables();
                console.log(cmd, data)
            }
        });

        setTimeout(() => chrome.runtime.sendMessage({ cmd: 'get-shortcuts' }), 3000)

    }

    componentWillUnmount(): void {
        console.log('componentWillUnmount')
    }

    render(): JSX.Element {
        console.log(this.state.name)
        return (
            <Card
                title={'设置'}
                bordered={true}
                headStyle={{
                    userSelect: 'none',
                    height: '80px',
                    border: 'none',
                    fontSize: 24,
                    fontWeight: "bold",
                    // paddingTop: 16
                }}
                bodyStyle={{
                    // flex: 1,
                    padding: '25px',
                    height: 'calc(100% - 80px)',
                    // overflowY: 'scroll',
                    // paddingBottom: '100px'
                }}

                extra={<div>
                    <CloseButton
                        disabled={false}
                        callback={() => this.props.callback({
                            cmd: 'close-setup'
                        })} />
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
                <Spin spinning={this.state.loading}>
                    {/*TODO  清空缓存 ，显示缓存的prompt数量 */}
                    <Title level={4} style={{ marginTop: 0 }}>版本号</Title>
                    <Space direction={"horizontal"} align={"center"}>
                        <Text style={{ fontSize: "medium", marginRight: 10 }}>{this.state.name}</Text>
                        <Button
                            style={{
                                marginTop: 0
                            }} onClick={() => this._openUrl(this.state.issues)}>
                            问题反馈
                        </Button>
                    </Space>

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />
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

                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />
                    <Title level={4} style={{ marginTop: 0 }}>Bing Chat设置</Title>
                    {(() => {
                        if (this.state.status['Bing'] == 'OK') {
                            return <Tag color="#87d068">当前可用</Tag>
                        } else if (this.state.status['Bing'] == 'UnauthorizedRequest') {
                            return (
                                <Space direction={"vertical"}>
                                    <Space direction={"horizontal"} size={0} style={{ marginBottom: 10 }}>
                                        <Tag color={"#cd201f"}>Bing未授权</Tag>
                                        <Popover zIndex={99999999} content={
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
                                    <Popover zIndex={99999999} content={
                                        <div>{this.state.status['Bing']}</div>
                                    } title="详情">
                                        <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                    </Popover>
                                </Space>
                            )
                        }
                    })()}
                    <Divider style={{ marginTop: 15, marginBottom: 15 }} />
                    <Title level={4} style={{ marginTop: 0 }}>ChatGPT设置
                        {this.state.chatGPTConfig.canImport ? <OpenFileButton
                            callback={(e: any) => this._importConfig()}
                            disabled={false} /> : ''}

                        {this.state.chatGPTConfig.helpUrl ? <FileTextOutlined alt={'使用教程'} style={{ marginLeft: 4 }} onClick={(e: any) => this._openUrl(this.state.chatGPTConfig.helpUrl)}
                            disabled={false} /> : ''}

                    </Title>
                    {(() => {
                        if (this.state.status['ChatGPT'] == 'OK' && this.state.isChange == false) {
                            return <Tag color="#87d068">当前可用</Tag>
                        } else {
                            return <Space direction={"horizontal"} size={0}>
                                <Tag color={"#cd201f"}>{this.state.isChange ? '待更新' : '暂不可用'}</Tag>
                                <Popover zIndex={99999999} content={
                                    <div>{this.state.status['ChatGPT']}</div>
                                } title="详情">
                                    <QuestionCircleOutlined style={{ fontSize: 20, color: '#cd201f' }} />
                                </Popover>
                            </Space>
                        }
                    })()}
                    <Space direction="vertical" size={'small'} style={{ display: 'flex' }}>

                        {
                            this.state.chatGPTConfig.helpUrl ? <div
                                style={{
                                    display: 'flex', flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                            </div> : ''
                        }

                        {
                            this.state.chatGPTConfig.creditUrl && this.state.chatGPTConfig.api && this.state.chatGPTConfig.api.match('api2d') ? <div
                                style={{
                                    display: 'flex', flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                {
                                    this.state.credit != "" ? <p style={{ marginRight: '12px' }}>{this.state.credit}</p> : ''
                                }
                                <Button style={{
                                    marginTop: 0
                                }} onClick={() => this._openUrl(this.state.chatGPTConfig.creditHelpUrl)}>购买Key</Button>

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
                                            chatGPTConfig,
                                            credit: '',
                                            isChange: true
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
                                    chatGPTConfig,
                                    credit: '',
                                    isChange: true
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
                                        console.log(e)
                                        let chatGPTConfig = this.state.chatGPTConfig;
                                        chatGPTConfig.api = e[0];
                                        this.setState({
                                            chatGPTConfig,
                                            credit: '',
                                            isChange: true
                                        })
                                    }}
                                    options={this.state.chatGPTConfig.apis}
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
                                            chatGPTConfig,
                                            credit: '',
                                            isChange: true
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
                    <Button
                        type={this.state.isChange ? 'primary' : 'default'}
                        style={{ marginTop: 10 }}
                        onClick={() => this._update()}>
                        {this.state.loading ? '更新中' : '更新状态'}
                    </Button>
                </Space>
            </Card>
        )
    }
}


export default Setup
