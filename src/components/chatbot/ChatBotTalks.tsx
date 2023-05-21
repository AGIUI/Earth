import * as React from "react";
import { Button } from 'antd';
import styled from 'styled-components';
import ChatBotConfig from "./ChatBotConfig";

/** < ChatBotTalks  callback={} items={}/>
 * 
 * items:[{
            type, user, html, buttons,
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

const Content: any = styled(Flex)`
    display:flex;
    height:100%; 
    flex-direction: column;
    overflow-y: scroll;
    overflow-x: hidden;
    margin: 4px 0;
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

const customizeRenderEmpty = (text = 'Data Not Found') => (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
        <img src={chrome.runtime.getURL('public/logo.png')} style={{
            width: '44px'
        }} />
        {/* <SmileOutlined style={{ fontSize: 20 }} /> */}
        <p>{text}</p>
    </div>
);

const createTalkBubbleStyle = (user = false) => {
    let r: any = {
        background: user == true ? '#D1DBFA' : '#4646460d',
        padding: user == true ? '8px' : '16px',
        borderRadius: '8px',
        cursor: 'text',
        width: user == true ? 'fit-content' : 'inherit',
        maxWidth: user == true ? '80%' : '100%',
        textAlign: 'left',
        minWidth: '72px'
    }
    user == true ? r['float'] = 'right' : ''
    return r
}

const thinkingBtn = (name = '思考中') => <Button type="primary" loading disabled>{name}</Button>
const suggestBtn = (i: string, name: string, callback: any) => <Button key={i} 
style={{
    background: '#1677ff',
    border: 'none',
    margin: '0px 12px 12px 0px',
    color: 'white',
    fontWeight: '500', height: 'fit-content'
}} 
onClick={() => callback()}
className="chatbot-suggest"
>{name}</Button>



const createListItem = (data: any, index: number) => <div style={{ margin: '2px 0' }}>{
    // 状态判断：思考、建议选项、对话
    data.type == 'thinking' ? thinkingBtn(data.hi) : (
        data.type == 'suggest' ? <>
            {
                data.buttons
                    && data.buttons.length > 0
                    && data.hi ?
                    customizeRenderEmpty(data.hi) : ''
            }
            {
                data.buttons && data.buttons.length > 0 ? Array.from(
                    data.buttons,
                    (button: any, i) => suggestBtn(i + '', button.name, () => button.callback && button.callback())
                ) : ''
            }
        </> : (data.html ? <p
            style={createTalkBubbleStyle(data.user)}
            key={index}
            dangerouslySetInnerHTML={{ __html: data.html }}>
        </p> : '')
    )

}</div>


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
            this._go2Bottom();
            // this.destroyConnection();
            // this.setupConnection();
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _updateItems() {
        // 当this.props.items 为空
        const defaultItems = [ChatBotConfig.createTalkData('help', {})];

        // 当this.props.items 为空
        let items: any = !(this.props.items && this.props.items.length > 0) ? defaultItems : [...this.props.items];
        // console.log('this.props.items',items)
        items = Array.from(items, (item: any, index: number) => {
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
            // height={this.state.fullscreen ? 'calc(70vh - 44px)' : ''}
            >
                {
                    (this.state.items && this.state.items.length > 0) && Array.from(this.state.items, (item, index) => createListItem(item, index))}
            </Content>
        );
    }
}



export default ChatBotTalks;