import * as React from "react";
import { Button, Card, message } from 'antd';
import {
    CopyOutlined, FilePptOutlined
} from '@ant-design/icons';

import styled from 'styled-components';
import ChatBotConfig from "./ChatBotConfig";

import PPT from "@components/files/PPT"


/** < ChatBotTalks  callback={} items={}/>
 * 
 * export 是否允许导出
 * avatarUrl 类型suggest，新增此字段，显示角色头像
 * 
 * items:[{
            type, user, html, buttons,export
        }] 

 * items=  [
    {
        type: 'thinking',
        user: false,
        html: '',
        hi:'思考中'
    },
    {
                        type: 'suggest',
                        hi:'其他资料',
                        buttons: [{
                            from: 'Bing',
                            data: {
                                tag,url
                            }
                        }],
                        user: false,
                        html: ''
                    },
                    {
                        type: 'suggest',
                        hi:'相关推荐',
                        buttons: [{
                            from: 'Bing'
                            data: {
                               prompt,tag
                            }
                        }],
                        user: false,
                        html: ''
                    },
    {
        type: 'suggest',
        hi:'hi 我可以为你梳理当前页面的知识',
        avatarUrl:'',
        buttons: [{
            from: 'combo'// ,
            data: {
                combo:2,
                tag: '',
                prompt: '',
                _combo:{}
            }
        }],
        user: false,
        html: ''
    },
    {
        type: 'suggest',
        hi:'hi',
        buttons: [{
            from: 'setup',
            data: {
                tag: '',
                prompt: '',
            }
        }],
        user: false,
        html: ''
    },
    {
        type: 'talk',
        user: true,
        html: ''
    }
]
 * 
 */




// user-select: none !important;
const Base: any = styled.div`
box-sizing: border-box;`

const Flex: any = styled(Base)`
display:${(props: any) => props.display || 'none'};
`

// 定义聊天对话界面的样式
const Content: any = styled(Flex)`
    display:flex;
    height:100%; 
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    margin: 5px 0;
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
`

const createAvatar = (avatar: string, text = 'Data Not Found') => (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
        <img src={avatar} className="logo" style={{
            width: '35px !important',
            height: 'fit-content!important'
        }} />
        {/* <SmileOutlined style={{ fontSize: 20 }} /> */}
        <p>{text}</p>
    </div>
);

const createTalkBubbleStyle = (user = false) => {
    let r: any = {
        background: user == true ? '#D1DBFA' : '#4646460d',
        padding: 10,
        borderRadius: 10,
        cursor: 'text',
        width: user == true ? 'fit-content' : 'inherit',
        maxWidth: user == true ? '80%' : '100%',
        textAlign: 'left',
        minWidth: '70px'
    }
    user == true ? r['float'] = 'right' : ''
    return r
}

const thinkingBtn = (name = '思考中') => <Button type="dashed"
    className="chatbot-thinking"
    loading disabled
>{name}</Button>

const suggestBtn = (i: string, name: string, callback: any) => <Button
    key={i}
    type="primary"
    style={{
        background: '#1677ff',
        // border: 'none',
        margin: '0px 10px 10px 0px',
        color: 'white',
        // fontWeight: '500', height: 'fit-content'
    }}
    onClick={() => callback()}
    className="chatbot-suggest"
>{name}</Button>

const copy = async (data: any) => {
    console.log('copy', data)
    const div = document.createElement('div');
    div.innerHTML = data.html;
    const copyText = div.innerText;

    let type = "text/plain"
    try {
        const blob: any = new Blob([copyText], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        // 写入剪切板
        await navigator.clipboard.write(data);
        message.info('已拷贝');
    } catch (e) {
        console.error('Failed to copy: ', e);
    }
}

const createPPT = (data: any) => {
    console.log('createPPT', data)
    const { type, html } = data;
    let div = document.createElement('div');
    div.innerHTML = html;

    let items: any = [];

    if (type === 'markdown') {

        items.push(
            {
                title: div.innerText,

            }
        );

    } else if (type == 'images') {
        items.push(
            {
                title: type,
                images: Array.from(div.querySelectorAll('img'), im => {
                    return {
                        title: type,
                        base64: im.src
                    }
                })
            }
        );
    }


    const p = new PPT();
    p.create('test-by-shadow', items)

}

const createListItem = (data: any, index: number, debug: boolean) => {

    return <div style={{ margin: '5px 0' }} className={`chatbot-talk-card-${data.type}`}>{
        // 状态判断：思考、建议选项、对话
        data.type == 'thinking' ? thinkingBtn(data.hi) : (
            data.type == 'suggest' ? <>
                {
                    data.hi ?
                        createAvatar(data.avatarUrl || chrome.runtime.getURL('public/icon-34.png'), data.hi) : ''
                }
                {
                    data.html ?
                        <p
                            style={createTalkBubbleStyle(false)}
                            className={`chatbot-text-bubble`}
                            key={index}
                            dangerouslySetInnerHTML={{ __html: data.html }}>
                        </p> : ''
                }
                {
                    data.buttons && data.buttons.length > 0 ? Array.from(
                        data.buttons,
                        (button: any, i) => {
                            return suggestBtn(i + '', button.name, () => button.callback && button.callback())
                        }
                    ) : ''
                }
            </> : (data.html ?
                data.user ? <p
                    style={createTalkBubbleStyle(data.user)}
                    className={`chatbot-text-bubble${data.user ? '-user' : ''}`}
                    key={index}
                    dangerouslySetInnerHTML={{ __html: data.html }}>
                </p> : <Card title={""}
                    headStyle={{
                        minHeight: '10px', backgroundColor: 'white', border: "none", marginBottom: -20
                    }}
                    bordered={false}
                    size={'small'}
                    extra={data.export ?
                        <>
                            <Button type="text"
                                style={{ margin: '5px 0' }}
                                icon={<CopyOutlined />}
                                size={'small'}
                                onClick={() => copy(data)} />
                            {!debug ? <Button type="text"
                                style={{ margin: '5px 0' }}
                                icon={<FilePptOutlined />}
                                size={'small'}
                                onClick={() => createPPT(data)} /> : ''}
                        </> : ''
                    }

                    style={{
                        width: '100%', background: 'rgba(255, 255, 255, 0.00)', marginTop: '10px',
                        marginBottom: '10px', padding: '0px', boxShadow: 'none',
                    }}>
                    <p
                        style={createTalkBubbleStyle(data.user)}
                        className={`chatbot-text-bubble${data.user ? '-user' : ''}`}
                        key={index}
                        dangerouslySetInnerHTML={{ __html: data.html }}>
                    </p>
                </Card> : '')
        )

    }</div>
}


type PropType = {
    callback: any;
    [propName: string]: any;
}

type StateType = {
    name: string;
    items: any
}

interface ChatBotTalks {
    state: StateType;
    props: PropType
}

class ChatBotTalks extends React.Component {

    contentDom: React.RefObject<unknown>;

    constructor(props: any) {
        super(props);

        this.state = {
            name: 'ChatBotTalks',
            items: this._updateItems()
        }

        this.contentDom = React.createRef();
    }



    componentDidMount() {
        // this.setupConnection();
        this._go2Bottom();
    }

    componentDidUpdate(prevProps: { items: any; }, prevState: any) {
        if (
            this.props.items !== prevProps.items
        ) {
            this.setState({
                items: this._updateItems()
            })
        }
        if (
            this.props.items.length !== prevProps.items.length
        ) {
            this._go2Bottom();
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _updateItems() {
        // 当this.props.items 为空
        const defaultItems = [ChatBotConfig.createTalkData('help', {})];

        // 当this.props.items 为空
        let items: any = (!(this.props.items && this.props.items.length > 0) ? defaultItems : [...this.props.items]).filter(i => i);
        // console.log('this.props.items',items)
        items = Array.from(items, (item: any, index: number) => {
            // console.log(item)
            const user = (!!item.user) || false,
                html = item.html;
            const buttons = Array.from(
                item.buttons || [], (button: any) => {
                    if (button.from) {
                        button.callback = () => this.props.callback({ cmd: button.from, data: button.data })
                        button.name = button.data.tag;
                    }
                    return { name: button.name, callback: button.callback }
                }
            );

            // 去除user==true的连续重复
            if (user && items[index - 1] && html == items[index - 1].html) {
                return
            }

            return {
                ...item, user, html, buttons
            }
        }).filter(item => item);

        return items
    }

    _go2Bottom() {
        let dom: any = this.contentDom.current;
        dom.scrollTo(0, 99999999);
        // console.log(dom)
    }

    render() {

        return (
            <Content
                ref={this.contentDom}
                translate="no"
                className="chatbot-talks"
                style={{ overflowY: 'scroll', paddingRight: '12px' }}
            // height={this.state.fullscreen ? 'calc(70vh - 44px)' : ''}
            >
                {
                    (this.state.items && this.state.items.length > 0) && Array.from(
                        this.state.items,
                        (item, index) => createListItem(item, index, !!this.props.debug))}
            </Content>
        );
    }
}



export default ChatBotTalks;