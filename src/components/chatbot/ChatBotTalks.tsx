import * as React from "react";
import { Button, Card, message, Image, Dropdown } from 'antd';
import {
    CopyOutlined, FilePptOutlined, DownSquareOutlined, SmileOutlined
} from '@ant-design/icons';

import styled from 'styled-components';
import ChatBotConfig from "./ChatBotConfig";

import PPT from "@components/files/PPT"
import { hashJson,getNowDate } from "../Utils";


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
    &title{
        display:block;
    }
    &url{
        display:block;
    }
    &text{
        display:block;
    }
 
`

const createAvatar = (avatar: string, text = 'Data Not Found') => (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
        <img src={avatar} className="logo" style={{
            width: '35px',
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
    for (const d of data) {
        div.innerHTML += d.html;
    }

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
    // console.log('createPPT', data)

    let items: any = [];

    for (const d of data) {
        let div = document.createElement('div');
        const { type, html } = d;
        div.innerHTML = html;
        // div.querySelector('h1');
        if (div.innerText) items.push(
            {
                text: div.innerText,
            }
        );


        if (div.querySelectorAll('img').length > 0) items.push(
            {
                title: '',
                images: Array.from(div.querySelectorAll('img'), im => {
                    return {
                        title: '',
                        base64: im.src
                    }
                })
            }
        );

    }

    console.log('createPPT', items)
    const p = new PPT();
    p.create(getNowDate(), items)

}

const createImages = (html: string, selected: boolean) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.innerText;
    const urls = Array.from(div.querySelectorAll('img'), img => img.src);
    return <Image.PreviewGroup
        preview={{
            onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
        }}
    >
        {
            Array.from(urls, (u: string) => <Image width={180} src={u}
                style={selected ? { outline: '1px dashed gray' } : {}}
            />)
        }
        {
            text && <p>{text}</p>
        }
    </Image.PreviewGroup>

}

const createListItem = (data: any, index: number, debug: boolean) => {
    // console.log('createListItem', data.id)
    let items: any = [
        {
            label: '拷贝纯文本',
            key: 'copy-text',
        },
    ];

    if (!debug) items.push({
        label: '导出PPT',
        key: 'ppt',
    })

    items = [...items, {
        type: 'divider',
    },
    ];

    items.push({
        label: data.selected ? '已选' : "选择",
        key: 'select',
        icon: data.selected ? <SmileOutlined /> : '',
    })




    // console.log('createListItem',data)
    return <div style={{ margin: '5px 0' }} className={`chatbot-talk-card-${data.type}`}>{
        // 状态判断：思考、建议选项、对话
        data.type == 'thinking' ? thinkingBtn(data.hi) : (
            data.type == 'suggest' && !debug ? <>
                {
                    data.hi ?
                        createAvatar(data.avatarUrl || chrome.runtime.getURL('public/icon-34.png'), data.hi) : ''
                }
                {
                    data.html ?
                        <p
                            style={{ ...createTalkBubbleStyle(false), background: 'transparent' }}
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
                    className={`chatbot-text-bubble${data.user ? '-user' : ''}-${data.type}`}
                    key={index}
                    dangerouslySetInnerHTML={{ __html: data.html }}>
                </p> : <Card title={""}
                    headStyle={{
                        minHeight: '10px',
                        backgroundColor: 'white',
                        border: "none",
                        marginBottom: -20,
                        width: "100%"
                    }}
                    bordered={false}
                    size={'small'}
                    key={index}
                    extra={data.export ?
                        <>
                            <Dropdown menu={{
                                items, onClick: (e) => {
                                    let key = e.key;
                                    let ds = [data];
                                    if (data.getAll) {
                                        ds = data.getAll(data.id);
                                    }
                                    if (key == "select") {
                                        data.select && data.select(data.id)
                                    } else if (key === "copy-text") {
                                        copy(ds)
                                    } else if (key == 'ppt') {
                                        createPPT(ds)
                                    }
                                }
                            }} trigger={['click']}

                            >
                                {/* <a onClick={(e) => e.preventDefault()}>
                                    <DownOutlined />
                                </a> */}
                                <Button type="text"
                                    style={{ margin: '5px 0' }}
                                    icon={<DownSquareOutlined />}
                                    size={'small'}
                                    onClick={(e) => e.preventDefault()} />
                            </Dropdown>

                            {/* <Button type="text"
                        style={{ margin: '5px 0' }}
                        icon={<CopyOutlined />}
                        size={'small'}
                        onClick={() => console.log(1111)} /> */}
                            {/* {!debug ? <Button type="text"
                                style={{ margin: '5px 0' }}
                                icon={<FilePptOutlined />}
                                size={'small'}
                                onClick={() => createPPT(data)} /> : ''} */}
                        </> : ''
                    }

                    style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.00)',
                        marginTop: '10px',
                        marginBottom: '10px',
                        padding: '0px',
                        boxShadow: 'none',
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}>
                    {
                        data.type == "images" ?
                            createImages(data.html, data.selected)
                            : <p
                                style={data.selected ? {
                                    ...createTalkBubbleStyle(data.user),
                                    outline: '1px dashed gray'
                                } : createTalkBubbleStyle(data.user)}
                                className={`chatbot-text-bubble${data.user ? '-user' : ''}-${data.type}`}
                                key={index}
                                dangerouslySetInnerHTML={{ __html: data.html }}>
                            </p>
                    }

                </Card> : '')
        )

    }</div >
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
            items: this._updateItems({})
        }

        this.contentDom = React.createRef();
    }



    componentDidMount() {
        // this.setupConnection();
        this._go2Bottom();
    }

    componentDidUpdate(prevProps: { items: any; }, prevState: any) {
        const itemsId = hashJson(Array.from(this.props.items, (i: any) => {
            return {
                id: i.id,
                html: i.html,
                markdown: i.markdown
            }
        })),
            prevItemsId = hashJson(Array.from(prevProps.items, (i: any) => {
                return {
                    id: i.id,
                    html: i.html,
                    markdown: i.markdown
                }
            }));
        if (
            itemsId !== prevItemsId
        ) {
            console.log('componentDidUpdate', this.props.items, prevProps.items)

            let oldItemsMap: any = {}
            Array.from(this.state.items, (item: any) => {
                oldItemsMap[item.id] = item.selected
            })

            this.setState({
                items: this._updateItems(oldItemsMap)
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

    _updateItems(oldItemsMap: any) {
        // 当this.props.items 为空

        const defaultItems = [!this.props.debug ? ChatBotConfig.createTalkData('help', {}) : null].filter(f => f);

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

            if (item.export && item.id) {
                console.log(item.id, item.type)
                item.select = (id: string) => {
                    const items = Array.from(this.state.items, (i: any) => {
                        if (i.id == id) i.selected = !i.selected;
                        return i
                    })
                    this.setState({
                        items
                    })
                }
                item.getAll = (id: string) => {
                    return this.state.items.filter((i: any) => i.selected || i.id == id);
                }
            }

            if (item.id && oldItemsMap && oldItemsMap[item.id]) item.selected = oldItemsMap[item.id]

            return {
                ...item,
                user,
                html,
                buttons,
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