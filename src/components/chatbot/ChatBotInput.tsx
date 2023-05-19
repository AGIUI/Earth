import * as React from "react";
import { Card, Button, Input, Checkbox, Radio, message } from 'antd';
import { PlusOutlined, SendOutlined, SettingOutlined, LoadingOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { defaultCombo, defaultPrompt } from "../combo/ComboData";
import ChatBotConfig from "./ChatBotConfig";

/**
 * <ChatBotInput callback={({data,cmd})=>{console.log(cmd,data)}} isLoading={false} leftButton={label:'My Prompts'}/>
 * 
 */


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
    output: any
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
        this.state = {
            name: 'ChatBotInput',
            isLoading: this.props.isLoading,
            userInput: {
                prompt: '',
                tag: ''
            },
            placeholder: 'Ask or search anything',


            input: ChatBotConfig.getInput(),
            // 输出格式
            output: ChatBotConfig.getOutput()
        }

        // document.addEventListener("selectionchange", () => {
        //     const text = this._userSelection();

        //     this.setState({
        //         placeholder: text.length > 0 ? this._userSelection() : 'Ask or search anything',
        //         userSelected: text.length > 0
        //     })

        // });

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
        const prompt = (userInput && userInput.prompt ? userInput.prompt : '').trim();
        const tag = (userInput && userInput.tag ? userInput.tag : '').trim();

        if (prompt) {
            const combo = {
                ...defaultCombo,
                prompt: {
                    ...defaultPrompt,
                    text: prompt
                },
                combo: -1
            }
            this.props.callback({
                cmd: "send-talk",
                data: {
                    prompt: combo.prompt,
                    tag,
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


    // _userSelectionAdd() {
    //     if (this.state.placeholder != 'Ask or search anything') this.setState({
    //         userInput: {
    //             prompt: this.state.placeholder,
    //             tag: this.state.placeholder
    //         }
    //     })
    // }


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
            content: '绑定当前网页可能会消耗大量Token，建议在需要时绑定',
        });
    }

    _change(t: string, key: string) {

        if (t == 'bindCurrentPage') {
            this._toast();
            // this.setState({
            //     bindCurrentPage: true,
            //     bindCurrentPageTooltip: '绑定当前网页，将消耗大量token'
            // })
        }

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

        let data: any = {}
        data[key] = items[key].filter((d: any) => d.checked)[0].value;
        this.props.callback({
            cmd: key + "-change", data: {
                ...data
            }
        })
    }

    render() {
        const flexStyle = {
            display: 'flex', justifyContent: 'flex-start',
            alignItems: 'center'
        }
        return (
            <Card
                type="inner"
                bordered={false}
                translate="no"
                style={{ boxShadow: 'none' }}
                bodyStyle={{
                    padding: '4px',
                    background: 'rgb(238, 238, 238)',
                    marginBottom: '16px',
                    border: 'none'
                }}
                actions={[
                    <div style={flexStyle} >

                        {
                            this.props.leftButton && this.props.leftButton.label ? <Button
                                style={buttonStyle}
                                type="dashed"
                                icon={<SettingOutlined />}
                                onClick={() => this._leftBtnClick()}
                                disabled={this.state.isLoading}
                            >
                                {
                                    this.props.leftButton.label
                                }
                            </Button> : ''
                        }


                    </div>
                    ,
                    <div style={{
                        ...flexStyle,
                        justifyContent: 'flex-end'
                    }}
                    >

                        <Button
                            style={{
                                ...buttonStyle, marginRight: '12px'
                            }}
                            icon={<PlusOutlined />}
                            onClick={() => this._newTalk()}
                            disabled={this.state.isLoading}
                        >新建</Button>

                        <Button
                            style={buttonMainStyle}
                            type="primary"
                            icon={this.state.isLoading ? <LoadingOutlined /> : <SendOutlined key="ellipsis" />}
                            onClick={() => this._sendBtnClick()}
                        >
                            {!this.state.isLoading ? '发送' : '停止'}
                        </Button>
                    </div>

                ]}
            >

                <div style={flexStyle}>
                    <LoginOutlined style={{marginRight:'12px'}}/>
                    <Radio.Group
                        options={this.state.input}
                        onChange={(e) => this._change(e.target.value, 'input')}
                        value={this.state.input.filter((m: any) => m.checked)[0].value}
                        optionType="button"
                        buttonStyle="solid"
                        size="small"
                    />
                </div>
                <div style={flexStyle}><LogoutOutlined  style={{marginRight:'12px'}}/><Radio.Group
                    options={this.state.output}
                    onChange={(e) => this._change(e.target.value, 'output')}
                    value={this.state.output.filter((m: any) => m.checked)[0].value}
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                /></div>

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
                    style={this.state.userInput.prompt ? { height: 'auto' } : {}}
                />

            </Card>
        );
    }
}

export default ChatBotInput;