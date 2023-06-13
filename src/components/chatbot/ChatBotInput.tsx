import * as React from "react";
import { Card, Button, Input, Collapse, Radio, message } from 'antd';
import { PlusOutlined, SendOutlined, BranchesOutlined, LoadingOutlined, LoginOutlined, LogoutOutlined, RobotOutlined } from '@ant-design/icons';
const { TextArea } = Input;
const { Panel } = Collapse;

import i18n from 'i18next';

import { _DEFAULTCOMBO, defaultNode } from "@components/flow/Workflow";

import ChatBotConfig from "@components/chatbot/ChatBotConfig";
import ChatBotSelect from "@components/chatbot/ChatBotSelect"

/**
 * <ChatBotInput callback={({data,cmd})=>{console.log(cmd,data)}} isLoading={false} leftButton={label:'My Prompts'}/>
 * 
 */

const defaultPrompt: any = { ...defaultNode }
delete defaultPrompt.opts;


type PropType = {
    /** 回调
     * 返回cmd：New-talk、Send-talk、Stop-talk、left-button-action
     * {cmd,data:{ prompt,tag,}}
     */
    callback: any;

    /**isLoading 正在加载 
     * 状态：true - 禁用输入 、 false - 可以输入
    */
    isLoading: boolean;

    /**
     * leftButton
     */
    leftButton: {
        label: string
    };

    // debug状态
    debug: boolean;

    [propName: string]: any;
}

type StateType = {
    name: string;
    isLoading: boolean;
    userInput: {
        prompt: string,
        tag: string
    },
    placeholder: string;
    input: any;
    output: any;
    agent: any;
    chatBotType: string;
    chatBotStyle: any;
    debug: boolean
}

interface ChatBotInput {
    state: StateType;
    props: PropType
}

const buttonStyle = {
    outline: 'none',
    border: 'none',
}, buttonMainStyle = {
    outline: 'none',
    border: 'none',
    color: '#fff',
    backgroundColor: '#1677ff',
    boxShadow: '0 2px 0 rgb(5 145 255 / 10%)'
}, flexStyle = {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    marginTop: '4px'
}



class ChatBotInput extends React.Component {
    constructor(props: any) {
        super(props);

        const input: any = ChatBotConfig.getInput(),
            output: any = ChatBotConfig.getOutput(),
            agent: any = ChatBotConfig.getAgentOpts();


        let config = this.props.config.filter((c: any) => c.checked)[0];
        if (!config) config = this.props.config[0]
        // console.log('ChatBotInput',this.props.config,config)
        this.state = {
            name: 'ChatBotInput',
            isLoading: this.props.isLoading,
            userInput: {
                prompt: '',
                tag: ''
            },
            placeholder: 'Ask or search anything',

            // 输入
            input,
            // 输出格式
            output,
            // agent
            agent,
            chatBotType: config.type,
            chatBotStyle: config.style,

            debug: this.props.debug
        }

    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        if (this.props.isLoading != prevState.isLoading) {
            this.setState({
                isLoading: this.props.isLoading
            })
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _newTalk() {
        this.props.callback({
            cmd: "new-talk"
        })
    }

    _sendTalk(userInput: any = {}) {
        // console.log(userInput)
        let prompt = (userInput && userInput.prompt ? userInput.prompt : '').trim();
        const tag = (userInput && userInput.tag ? userInput.tag : '').trim();
        if (this.state.output.filter((ot: any) => ot.checked)[0].value !== 'defalut' && !prompt) prompt = "."
        if (prompt) {
            const output = this.state.output.filter((oup: any) => oup.checked)[0].value;
            const combo = {
                ..._DEFAULTCOMBO,
                prompt: {
                    ...defaultPrompt,
                    text: prompt,
                    input: this.state.input.filter((inp: any) => inp.checked)[0].value,
                    output,
                    type: this.state.agent.filter((a: any) => a.checked)[0].value,
                },
                combo: -1
            }
            this.props.callback({
                cmd: "send-talk",
                data: {
                    prompt: combo.prompt,
                    tag,
                    from: 'chatbot-input',
                    prePrompt: {
                        output
                    },
                    _combo: combo,
                }
            });
            this.setState({
                userInput: {
                    prompt: '',
                    tag: ''
                },
                isLoading: true
            })
        }
    }

    _leftBtnClick() {
        this.props.callback({
            cmd: 'left-button-action'
        })
    }

    _onPressEnter(e: any) {
        if (e.shiftKey === false && e.key == 'Enter' && !this.state.isLoading) {
            this._sendTalk(this.state.userInput)
        };
    }

    _sendBtnClick() {
        if (this.state.isLoading) {
            this.props.callback({
                cmd: "stop-talk"
            })
            this.setState({
                isLoading: false
            })
        } else {
            this._sendTalk({ ...this.state.userInput })
        }
    }

    _toast() {
        message.open({
            type: 'warning',
            content: i18n.t('tokenConsumptionWarning'),
        });
    }

    _change(t: string, key: string) {

        if (t.match('bindCurrentPage')) this._toast();

        const state: any = this.state;
        let items: any = {};
        items[key] = Array.from(state[key], (o: any) => {
            return {
                ...o, checked: t == o.value
            }
        });

        this.setState({
            ...items
        })

    }

    _changeChatbot(res: any) {
        const { cmd, data } = res;
        const { type, style } = data;
        // const { label, value } = style;
        this.setState({
            chatBotType: type,
            chatBotStyle: style
        })
        // console.log(type, value)
        this.props.callback(res)
    }

    render() {
        // console.log(this.state, this.props.config)
        const flexStyle = {
            display: 'flex', justifyContent: 'flex-start',
            alignItems: 'center', padding: '10px'
        }

        const { input, output, agent, chatBotType, chatBotStyle } = this.state;
        const node = `In-${input.filter(
            (i: any) => i.checked)[0].label} Agent-${agent.filter(
                (i: any) => i.checked)[0].label} Out-${output.filter(
                    (i: any) => i.checked)[0].label}  Model-${chatBotType} ${chatBotStyle.label}-${chatBotStyle.value}`

        return (
            <Card
                type="inner"
                bordered={false}
                translate="no"
                style={{ boxShadow: 'none' }}
                bodyStyle={{
                    padding: '10px',
                    paddingBottom: '25px',
                    background: 'rgb(245, 245, 245)',
                    marginBottom: '10px',
                    border: 'none',
                    borderRadius: '10px'
                }}
                actions={[
                    <div style={flexStyle} >

                        {
                            !this.props.debug && this.props.leftButton && this.props.leftButton.label ? <Button
                                style={buttonStyle}
                                type="dashed"
                                icon={<BranchesOutlined />}
                                onClick={() => this._leftBtnClick()}
                                disabled={this.state.isLoading}
                            >
                                {i18n.t('workflow')}
                            </Button> : ''
                        }

                        {
                            this.props.debug ? <Button
                                style={buttonStyle}
                                type="dashed"
                                icon={<BranchesOutlined />}
                                onClick={() => this.props.callback({
                                    cmd: 'debug-combo'
                                })}
                                disabled={this.state.isLoading}
                            >
                                {i18n.t('debug')}
                            </Button> : ''
                        }

                    </div>
                    ,
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        paddingRight: '0px',
                        justifyContent: 'flex-end'
                    }}
                    >

                        <Button
                            style={{
                                ...buttonStyle, marginRight: '10px'
                            }}
                            icon={<PlusOutlined />}
                            onClick={() => this._newTalk()}
                            disabled={this.state.isLoading}
                        >{i18n.t('reset')}</Button>

                        <Button
                            style={buttonMainStyle}
                            type="primary"
                            icon={this.state.isLoading ? <LoadingOutlined /> : <SendOutlined key="ellipsis" />}
                            onClick={() => this._sendBtnClick()}
                        >
                            {!this.state.isLoading ? i18n.t('send') : i18n.t('stop')}
                        </Button>
                    </div>

                ]}
            >

                {
                    this.props.debug ? '' : <Collapse expandIconPosition={'start'} size="small">
                        <Panel header={node} key="node" >
                            <div style={flexStyle}>
                                <LoginOutlined style={{ marginRight: '10px' }} />
                                <Radio.Group
                                    options={this.state.input}
                                    onChange={(e) => this._change(e.target.value, 'input')}
                                    value={this.state.input.filter((m: any) => m.checked)[0].value}
                                    optionType="button"
                                    buttonStyle="solid"
                                    size="small"
                                />
                            </div>
                            <div style={flexStyle}>
                                <RobotOutlined style={{ marginRight: '10px' }} />
                                <Radio.Group
                                    options={this.state.agent}
                                    onChange={(e) => this._change(e.target.value, 'agent')}
                                    value={this.state.agent.filter((m: any) => m.checked)[0].value}
                                    optionType="button"
                                    buttonStyle="solid"
                                    size="small"
                                />
                            </div>
                            <div style={flexStyle}>
                                <LogoutOutlined style={{ marginRight: '10px' }} /><Radio.Group
                                options={this.state.output}
                                onChange={(e) => this._change(e.target.value, 'output')}
                                value={this.state.output.filter((m: any) => m.checked)[0].value}
                                optionType="button"
                                buttonStyle="solid"
                                size="small"
                            /></div>

                            <ChatBotSelect
                                callback={(res: any) => this._changeChatbot(res)}
                                isLoading={this.state.isLoading}
                                config={this.props.config}
                                name={''} />

                        </Panel>
                    </Collapse>
                }


                <TextArea
                    maxLength={2000}
                    allowClear={true}
                    showCount={true}
                    value={this.state.userInput.prompt}
                    onPressEnter={(e: any) => this._onPressEnter(e)}
                    onChange={(e: { target: { value: any; }; }) => {
                        this.setState({
                            userInput: {
                                prompt: e.target.value,
                                tag: e.target.value
                            }
                        })
                    }}
                    placeholder={this.state.placeholder}
                    autoSize={{ minRows: 2, maxRows: 15 }}
                    disabled={this.state.isLoading}
                    style={this.state.userInput.prompt ? { height: 'auto', marginTop: 5 } : { marginTop: 5 }}
                />

            </Card>
        );
    }
}

export default ChatBotInput;