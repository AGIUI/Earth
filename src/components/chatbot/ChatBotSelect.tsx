import * as React from "react";
import { Select, Radio, Slider } from 'antd';
const { Option } = Select


/**
 * <ChatBotSelect callback={({data,cmd})=>{console.log(cmd,data)}} isLoading={false} 
 * config={
 * 
 [ { type,name,style,checked } ]
      [{type:'Bing',name:'New Bing',icon:'',style:{type:'select', label:'风格',values:[
      
       { label: '创造力', value: 'Creative' },
                        { label: '平衡', value: 'Balanced', },
                        { label: '严谨', value: 'Precise', }
      ],value:'' },checked:false },{type:'ChatGPT',name:'ChatGPT',icon:'',style:{type:'range', label:'temperature',value:0.6 ,values:[0,1]},checked:false }]
 * }
 * />
 * 
 */


type PropType = {
    name: string;

    /** 回调 
    * 更改chatbot类型，更改chatbot的风格
    * {cmd:'chatbot-select',data:{ type,style: {label,value} }}
    */
    callback: any;


    /**isLoading 正在加载 
    * 状态：true - 禁用输入 、 false - 可以输入
   */
    isLoading: boolean;

    /**
     * config
     * 传入chatbot类型的配置 [ { type,name,style,checked } ]
     * [{type:'Bing',name:'New Bing',icon:'',style:{type:'select', label:'风格',values:[
     * 
     *  { label: '创造力', value: 'Creative' },
                        { label: '平衡', value: 'Balanced', },
                        { label: '严谨', value: 'Precise', }
     * ],value:'' },checked:false },{type:'ChatGPT',name:'ChatGPT',icon:'',style:{type:'range', label:'temperature',value:0.6 ,values:[0,1]},checked:false }]
     */
    config: any;


    [propName: string]: any;
}

type StateType = {
    name: string;
    isLoading: boolean;
    type: string;
    currentName: string;
    value: any;
    label: string;
    icon: string;
    config: any;
    style: any;
}

interface ChatBotSelect {
    state: StateType;
    props: PropType
}

class ChatBotSelect extends React.Component {
    constructor(props: any) {
        super(props);

        const currentBot = (this.props.config.filter((c: any) => c.checked)[0]) || {

            type: 'ChatGPT',
            name: 'ChatGPT',
            icon: chrome.runtime.getURL(`public/chatgpt.png`),
            style: { type: 'range', label: 'temperature', value: 0.6, values: [0, 1] }

        };
        // console.log(currentBot)

        this.state = {
            name: this.props.name || 'ChatBotSelect',
            isLoading: this.props.isLoading,
            type: currentBot?.type,
            currentName: currentBot?.name,
            style: currentBot?.style,
            value: currentBot?.style?.value,
            label: currentBot?.style?.label,
            icon: currentBot?.icon,
            config: this.props.config
        }

    }

    _updateStyle(type: string) {
        const currentBot = this.state.config.filter((c: any) => c.type == type)[0];
        const data = {
            type: currentBot?.type,
            currentName: currentBot?.name,
            style: currentBot?.style,
            value: currentBot?.style?.value,
            label: currentBot?.style?.label,
            icon: currentBot?.icon,
        };
        this.setState({
            ...data
        })
        return data
    }

    componentDidMount() {
        console.log('ChatBotSelect componentDidMount')
    }

    componentDidUpdate(prevProps: { isLoading: boolean; }, prevState: any) {
        if (
            this.props.isLoading !== prevProps.isLoading
        ) {
           this.setState({
            isLoading:this.props.isLoading
           })
        }
    }

    componentWillUnmount() { }

    _onChange(type: string) {

        this.setState({
            type
        })

        const { label, value } = this._updateStyle(type);

        this.props.callback({
            cmd: 'chatbot-select', data: {
                type: type,
                // 根据当前机器人返回设定的值
                style: {
                    label,
                    value
                }
            }
        })
    }

    _onChangeValue(value: string) {
        this.setState({
            value
        })
        this.props.callback({
            cmd: 'chatbot-select', data: {
                type: this.state.type,
                style: {
                    label: this.state.label,
                    value
                }
            }
        })
    }


    render() {
        // console.log(this.state.style)
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px'
            }}>
                <Select
                    disabled={this.state.isLoading}
                    style={{ width: 'fit-content', zIndex: 999999 }}
                    bordered={false}
                    value={this.state.type}
                    onChange={(e) => this._onChange(e)}>
                    {
                        Array.from(this.state.config, (t: any) =>
                                <Option value={t.type}>
                                    <img style={{
                                        width: '26px', height: '26px'
                                    }} src={t.icon} alt={`${t.name} logo`} />
                                </Option>
                        )
                    }
                </Select>

                {/* select : bing 的三个选项 */}
                {
                    this.state.style && this.state.style.type == 'select' ? <Radio.Group
                        style={{
                            textAlign: 'center'
                        }}
                        buttonStyle="solid"

                        defaultValue={this.state.style.value}
                        value={this.state.value}

                        onChange={(e: any) => this._onChangeValue(e.target.value)}>

                        {
                            this.state.style.values.map((v: any) => <Radio.Button
                                disabled={this.state.isLoading}
                                value={v.value}
                            >{v.label}</Radio.Button>)
                        }

                    </Radio.Group> : ''
                }

                {/* range - chatgpt的选项 temperature: 0.6, */}
                {
                    this.state.style && this.state.style.type == 'range' ? <Slider
                        disabled={this.state.isLoading}
                        style={{ width: '200px' }}
                        tooltip={this.state.style.label}
                        range
                        max={this.state.style.values[1]}
                        min={this.state.style.values[0]}
                        step={0.01}
                        value={this.state.value}
                        onChange={(value: any) => this._onChangeValue(value[0])}
                    /> : ''
                }

            </div>
        )
    }
}

export default ChatBotSelect;