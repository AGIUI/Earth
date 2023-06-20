import * as React from "react";

import {
    Card,
    Spin,
} from 'antd';

import { Content } from "@components/Style";

import ChatBotSelect from '@components/chatbot/ChatBotSelect'
import ChatBotTalks from '@components/chatbot/ChatBotTalks'
import ChatBotInput from '@components/chatbot/ChatBotInput'

import SetupButton from '@components/buttons/SetupButton';
import FullscreenButton from '@components/buttons/FullscreenButton';
import CloseButton from '@components/buttons/CloseButton';
import CopyButton from "@components/buttons/CopyButton";



type PropType = {
    name: string;
    /**
     *  key: subject.text,
        tab: subject.text,
        index:subject.index
     */
    tabList: any;
    activeIndex: number;
    // 对话数据
    datas: any;
    fullscreen: boolean;
    disabled: boolean;
    callback: any;
    config: any;
    [propName: string]: any;
}

type StateType = {
    name: string;
    tabList: any;
    fullscreen: boolean;
    loading: boolean;
    disabled: boolean;
    activeIndex: number;
    datas: any;
    config: any
}

interface ChatBotPanel {
    state: StateType;
    props: PropType
}

class ChatBotPanel extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: this.props.name || 'ChatBotPanel',
            fullscreen: this.props.fullscreen || false,
            loading: false,
            disabled: this.props.disabled,
            tabList: this.props.tabList || [],
            activeIndex: this.props.activeIndex,
            datas: this.props.datas,
            config: this.props.config
        }
    }

    componentDidMount() {
        // this.setupConnection();

    }

    componentDidUpdate(prevProps: {
        disabled: boolean;
        datas: any;
        tabList: any;
        config: any;
        activeIndex: number
    }, prevState: any) {

        if (
            this.props.disabled !== prevProps.disabled
        ) {
            this.setState({ disabled: this.props.disabled })

        }

        if (this.props.datas != prevProps.datas) {
            this.setState({
                datas: this.props.datas
            })
        }

        if (this.props.tabList != prevProps.tabList) {
            this.setState({
                tabList: this.props.tabList
            })
        }

        if (this.props.activeIndex != prevProps.activeIndex) {
            this.setState({
                activeIndex: this.props.activeIndex
            })
        }

        if (this.props.config != prevProps.config) {
            this.setState({ config: this.props.config })
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _switchSubject(index: number) {
        this.setState({
            activeIndex: index
        });

        if (index != -1) {
            // 预处理数据
        } else {
            this.props.callback({
                cmd: 'activate-chatbot'
            })
        }

    }

    _createContentList(activeIndex: number) {
        const tabList = this.state.tabList,
            datas = this.state.datas;
        const activeTabKey = tabList.filter((tab: any) => activeIndex == tab['index'])[0]?.key;
        // console.log(activeTabKey,tabList,activeIndex)
        let contentList: Record<string, React.ReactNode> = {};

        for (const subject of tabList) {

            if (subject.index == -1) {
                // 聊天机器人
                // console.log('对话：', datas)
                contentList[subject.key] = <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    paddingTop: '10px'
                }}>

                    <ChatBotTalks
                        debug={this.props.debug}
                        callback={(e: any) => this.props.callback(e)}
                        items={datas[subject.index + 1]} />

                    {this.state.config ? <ChatBotInput
                        callback={(e: any) => this.props.callback(e)}
                        isLoading={this.state.disabled}
                        config={this.state.config}
                        leftButton={{ label: 'Combo' }}
                        debug={this.props.debug}
                    /> : ""}
                </div>

            } else {
                let nds = Array.from(datas[subject.index + 1], (data: any, i) => {
                    if (data && data.html) return { html: data.html, i }
                }).filter(n => n)
                const listItem = nds.map((data: any) => <div key={data.i}
                    dangerouslySetInnerHTML={{ __html: data.html }}></div>)
                contentList[subject.key] = <Content display='flex' translate="no">
                    <div>{listItem}</div>
                </Content>
            }
        }

        return { contentList, activeTabKey }
    }


    render() {

        const { contentList, activeTabKey } = this._createContentList(this.state.activeIndex)
        // console.log('chatbot-pane-datas',contentList,activeTabKey)

        const btns = [
            // <CopyButton
            //     disabled={this.state.disabled}
            //     data={this.props.datas}
            //     callback={(e: any) => this.props.callback({
            //         cmd: 'copy-action', data: { type: e }
            //     })}
            // />,
            <SetupButton
                disabled={this.state.disabled}
                callback={() => this.props.callback({
                    cmd: 'open-setup'
                })} />,
            <FullscreenButton
                fullscreen={this.state.fullscreen}
                disabled={false}
                callback={() => this.setState({
                    fullscreen: !this.state.fullscreen
                })} />
        ];

        // if (!this.props.debug) 
        btns.push(<CloseButton
            disabled={false}
            callback={() => this.props.callback({
                cmd: 'close-chatbot-panel'
            })} />)

        return (
            <Card
                // type="inner"
                hoverable
                bordered={true}
                headStyle={{
                    userSelect: 'none',
                    height: '80px',
                    border: 'none',
                    //display: 'block',
                    fontSize: 24,
                    fontWeight: "bold"
                }}
                bodyStyle={{
                    //display: 'flex',
                    height: 'calc(100% - 80px)',
                    //flexDirection: 'column',
                    //justifyContent: 'space-around',
                    cursor: 'auto',
                    paddingTop: 0,
                    paddingBottom: 20
                }}
                style={{
                    width: this.state.fullscreen ? '100vw' : '500px',
                    padding: this.state.fullscreen ? '0px 10%' : '0px',
                    borderRadius: 0,
                    minWidth: '360px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                }}
                title={this.state.name}
                extra={btns}
            // tabList={this.state.tabList}
            // activeTabKey={activeTabKey}
            // onTabChange={(key: string) => {
            //     this._switchSubject(this.state.tabList.filter((s: any) => s.key == key)[0].index)
            // }}
            >
                {this.state.loading ? <Spin tip="Loading" size="large">
                    <div className="content" />
                </Spin> : contentList[activeTabKey]}
            </Card>
        );
    }
}

export default ChatBotPanel;