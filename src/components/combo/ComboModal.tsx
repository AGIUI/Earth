import * as React from "react";

import {
    Button,
    Modal,
    Input,
    Checkbox,
    Form,
    Popconfirm,
    Divider, Select, Slider, Radio, Tabs, message
} from 'antd';

const { Option } = Select;
const { TextArea } = Input;

import { md5, getConfig } from '@components/Utils'

import { PROMPT_MAX_LENGTH, promptOptions, inputs, outputs, models, comboOptions, defaultCombo, defaultPrompt } from "@components/combo/ComboData"

import styled from 'styled-components';

const Form1 = styled(Form)`
    &.ant-form{
        display: block!important;
    }
    &.ant-form-item-control-input-content{
        text-align: left!important;
    }
    &.ant-btn-primary{
        color: #fff !important;
        background-color: #1677ff !important;
    }
`;


/**
 currentPrompt:{
    tag:'x',
    role:'coder',
    combo:3,
    prompt:{
        text,isNextUse:true,bindCurrentPage
    }
 }
 */


type PropType = {
    currentPrompt: any;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    name: string;
    isCombo: boolean;
    currentPrompt: any;
    options: any;
    promptOptions: any;
    step: number;
    app: string;
    version: string;
}

interface ComboModal {
    state: StateType;
    props: PropType
}

class ComboModal extends React.Component {
    constructor(props: any) {
        super(props);
        // console.log('propts', this.props.currentPrompt)
        this.state = {
            name: 'comboModal',
            isCombo: this.props.currentPrompt && this.props.currentPrompt.combo > 1,
            currentPrompt: this.props.currentPrompt,
            options: comboOptions,
            promptOptions,
            step: 0.1,
            app: '',
            version: ''
        }
        console.log('currentPrompt', this.props.currentPrompt)
        getConfig().then(json => {
            this.setState({
                app: json.app,
                version: json.version
            })
        })
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: { currentPrompt: any }, prevState: any) {

        if (this.props.currentPrompt && prevProps.currentPrompt) {
            const currentId = md5(JSON.stringify(this.props.currentPrompt)),
                prevId = md5(JSON.stringify(prevProps.currentPrompt));
            if (currentId != prevId) {
                this.setState({
                    currentPrompt: this.props.currentPrompt
                })
            }

            // this.destroyConnection();
            // this.setupConnection();

        }

    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _createTabKey(prompt: any) {
        let tabKey = "prompt";
        if (prompt.queryObj && prompt.queryObj.isQuery) {
            tabKey = 'isQuery'
        }
        // if(prompt.queryObj&&prompt.queryObj.isQuery){
        //     tabKey='isQuery'
        // }
        this.setState({
            tabKey
        })
    }

    _saveMyCombo() {
        const currentPrompt = this.state.currentPrompt
        let data: any = {}, prompts: any = {};
        const promptKeys = Array.from([1, 2, 3, 4, 5, 6, 7], i => `prompt${i != 1 ? i : ''}`);
        // console.log('_onFinish', JSON.stringify(currentPrompt, null, 2))
        for (const key in currentPrompt) {
            if (currentPrompt[key]) {
                if (promptKeys.includes(key)) {
                    // 判断类型
                    const type = currentPrompt[key].type;
                    let isEmpty = false;
                    if (type == 'api') {
                        currentPrompt[key].api.isApi = true;
                        currentPrompt[key].queryObj = { ...defaultPrompt.queryObj };
                        currentPrompt[key].text = '';
                    } else if (type == 'query') {
                        currentPrompt[key].api = { ...defaultPrompt.api };
                        currentPrompt[key].queryObj.isQuery = true;
                        currentPrompt[key].text = '';
                    } else if (type == 'tasks' || type == 'prompt' || type == 'highlight') {
                        currentPrompt[key].api = { ...defaultPrompt.api };
                        currentPrompt[key].queryObj = { ...defaultPrompt.queryObj };
                        isEmpty = !currentPrompt[key].text
                    }

                    if (isEmpty == false) prompts[key] = currentPrompt[key];

                } else {
                    data[key] = currentPrompt[key];
                }
            }
        }
        // console.log('_onFinish', data, prompts)

        let combo = 0, newPrompts: any = {};
        for (const key in prompts) {
            if (promptKeys.includes(key)) {
                combo++;
                const prompt = prompts[key];
                newPrompts[`prompt${combo == 1 ? '' : combo}`] = prompt

            }
        }

        data = {
            ...defaultCombo,
            ...data,
            ...newPrompts,
            combo
        }

        data.version = this.state.version;
        data.app = this.state.app;
        if (data.id == "" || data.id === undefined) data.id = md5((new Date()).getTime() + '');

        this.setState({
            currentPrompt: data
        })

        return data;
    }

    /**
     * 结果
     */
    _onFinish() {
        const combo = this._saveMyCombo();
        console.log('_onFinish', combo)
        const data = {
            prompt: combo,
            from: 'combo-editor'
        }
        this.props.callback({
            cmd: 'edit-combo-finish', data
        })
    }

    _downloadMyCombo() {
        const combos = [this._saveMyCombo()];

        const data: any = [];
        for (const combo of combos) {
            combo.version = this.state.version;
            combo.app = this.state.app;
            combo.id = "";
            combo.id = md5(JSON.stringify(combo));
            data.push(combo)
        }

        const name = combos[0].tag;
        const id = md5(JSON.stringify(data));

        //通过创建a标签实现
        const link = document.createElement('a')
        //encodeURIComponent解决中文乱码
        link.href = `data:application/json;charset=utf-8,\ufeff${encodeURIComponent(JSON.stringify(data))}`

        //下载文件命名
        link.download = `${name}_${id}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link);

    }



    _handleCancel() {
        this.setState({
            isCombo: false
        })
        this.props.callback({
            cmd: 'edit-combo-cancel'
        })
    }

    /**
     * 
     * @param value // ['bindCurrentPage','isNextUse']
     * type :input output  
     */
    _handlePromptSetting(promptIndex: number, value: any, type: string) {
        const currentPrompt = this.state.currentPrompt;
        const key = promptIndex == 0 ? `prompt` : `prompt${promptIndex + 1}`;

        if (currentPrompt[key] == undefined) currentPrompt[key] = { ...defaultPrompt }

        /**单选的 */
        let output = currentPrompt[key].output,
            input = currentPrompt[key].input;

        console.log(value)
        if (value && value.target && value.target.value) {
            if (Array.from(inputs, (o: any) => o.value).includes(value.target.value) && type == 'input') {
                input = value.target.value;
            }
            if (Array.from(outputs, (o: any) => o.value).includes(value.target.value) && type == 'output') {
                output = value.target.value;
            }

        };


        let json: any = {};

        json[key] = {
            ...currentPrompt[key],
            queryObj: {
                ...currentPrompt[key].queryObj,
                isQuery: input == 'query'
            },
            api: {
                ...currentPrompt[key].api,
                isApi: input == 'api'
            },
            input,
            output
        }

        this._updateCurrentPrompt(json);

    }


    _handlePromptModelAndTemperatureSetting(promptIndex: number, value: any, type = 'model') {
        let json: any = {};
        const currentPrompt = this.state.currentPrompt;

        const key = promptIndex == 0 ? `prompt` : `prompt${promptIndex + 1}`;

        json[key] = {
            ...currentPrompt[key]
        }

        json[key][type] = value

        // if (type == 'model') {
        //     if (value == "Bing") {
        //         this.setState({
        //             step: 0.5,
        //         })
        //     } else {
        //         this.setState({
        //             step: 0.1,
        //         })
        //     }
        // }

        this._updateCurrentPrompt(json);
    }



    _handlePromptTypeSetting(promptIndex = 1, value: any) {
        const currentPrompt = this.state.currentPrompt;
        const key = promptIndex == 0 ? `prompt` : `prompt${promptIndex + 1}`;
        let json: any = {};
        json[key] = {
            ...currentPrompt[key],
            type: value
        }

        // 如果output只有1个选项，则默认选中
        const out = promptOptions.filter((p: any) => p.key == value)[0].outputs
        if (out.length == 1) json[key].output = out[0].value

        // 如果input只有1个选项，则默认选中
        const inp = promptOptions.filter((p: any) => p.key == value)[0].inputs
        if (inp.length == 1) json[key].input = inp[0].value

        // console.log(json, currentPrompt)
        this._updateCurrentPrompt(json);
    }

    /**
     * 
     * @param value // ['bindCurrentPage', 'Combo', 'showInChat']
     */
    _handleComboSetting(value: any) {
        // console.log('_handleComboSetting', value)
        let interfaces: string[] = [],
            isInfinite = false;

        if (value && value.length > 0) {
            if (value.includes("showInChat")) {
                interfaces.push("showInChat")
            }
            if (value.includes("contextMenus")) {
                interfaces.push("contextMenus")
            }
            if (value.includes("home")) {
                interfaces.push("home")
            }

        };
        if (value && value.length > 0) {
            isInfinite = value.includes('infinite');
        }

        let currentPrompt = { ...this.state.currentPrompt, interfaces, isInfinite }

        let updateData: any = { currentPrompt }

        if (value.includes('combo')) {
            let combo = this.state.currentPrompt.combo || 5;
            combo = combo <= 1 ? 5 : combo;
            updateData['currentPrompt'] = { ...updateData['currentPrompt'], combo }
            updateData['isCombo'] = true

            const dp = { ...defaultPrompt };
            dp.queryObj.isQuery = false;
            for (let index = 1; index < combo; index++) {
                if (!updateData['currentPrompt'][`prompt${index + 1}`]) updateData['currentPrompt'][`prompt${index + 1}`] = { ...dp }
            }
            // console.log('updateData1',updateData['currentPrompt'])

        } else {
            updateData['isCombo'] = false;
            updateData['currentPrompt'].combo = 1;
            // for (let index = 1; index < 6; index++) {
            //     if (updateData['currentPrompt'][`prompt${index + 1}`]) delete updateData['currentPrompt'][`prompt${index + 1}`]
            // }
        }
        // console.log('updateData2', updateData)
        this.setState(updateData)
    }

    _deleteConfirm(prompt: any) {
        this.props.callback({
            cmd: 'delete-combo-confirm', data: { prompt, from: 'combo-editor' }
        })
    }

    _updateCurrentPrompt(newData: any) {
        if (newData) {
            const prompt = {
                ...this.state.currentPrompt, ...newData
            }
            // console.log('_updateCurrentPrompt', JSON.stringify(prompt, null, 2))
            this.setState({
                currentPrompt: prompt
            })
        }
    }

    _addOptions(prompt: any) {

        const init = prompt.api.init;
        if (typeof (init) == 'object' && init.body && typeof (init.body) == 'string') {
            try {
                init.body = JSON.parse(init.body)
            } catch (error) {

            }
        }
        const options: any = {
            input: prompt.input,
            output: prompt.output,
            // agent: prompt.agent,
            temperature: prompt.temperature,
            model: prompt.model,
            url: prompt.queryObj.url,
            query: prompt.queryObj.query,
            init: typeof (init) == 'object' ? JSON.stringify(init, null, 2) : init,
            type: prompt.type
        };

        if (prompt.type == 'api') options.url = prompt.api.url;
        if (prompt.type == 'query') options.url = prompt.queryObj.url;

        return options;
    }

    _createInputsForOpts(index = 1, inputs: any = []) {
        return <Form.Item
            name={`Prompt${index}EditOptionsForInput`}
            label="输入"
        >
            <Radio.Group
                style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'baseline'
                }}

                options={inputs.filter((p: any) => p.type == 'checkbox' && p.input)}
                onChange={(e) => this._handlePromptSetting(index - 1, e, 'input')} />
        </Form.Item>
    }

    _createOutputsForOpts(index = 1, outputs = []) {
        // const d:any={};
        // d[`Prompt${index}EditOptionsForOutput`]=this.state.currentPrompt[`prompt${index==1?"":index}`].output
        // console.log(d)
        return <Form.Item
            name={`Prompt${index}EditOptionsForOutput`}
            label="输出"
        // initialValue={d}
        >
            {/* <Select
                onChange={(e) => this._handlePromptSetting(index - 1, e, 'output')}
                style={{ width: 200 }}
                options={outputs.filter((p: any) => p.type == 'checkbox' && p.output)}
            /> */}

            <Radio.Group
                style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'baseline'
                }}
                options={outputs.filter((p: any) => p.type == 'checkbox' && p.output)}
                onChange={(e) => this._handlePromptSetting(index - 1, e, 'output')} />
        </Form.Item>
    }

    _createModelsForOpts(index = 1) {
        const m: any = models.filter((ps: any) => ps.value == 'model')[0];
        return <>
            <Form.Item
                name={`Prompt${index}EditOptionsForModel`}
                label="模型"
                rules={[
                    {
                        required: false,
                        message: 'Please pick an item!',
                    },
                ]}
            >
                <Radio.Group
                    onChange={(e) => this._handlePromptModelAndTemperatureSetting(index - 1, e.target.value, 'model')}
                    defaultValue={'ChatGPT'}
                >
                    {Array.from(m.options,
                        (p: any) => {
                            return <Radio.Button
                                value={p.value}
                            >{p.label}</Radio.Button>
                        })}
                </Radio.Group>
            </Form.Item>
            <Form.Item
                name={`Prompt${index}EditOptionsForTemperature`}
                label="发散程度 Temperature"
            >
                <Slider
                    style={{ width: '120px' }}
                    range={false}
                    max={1}
                    min={0}
                    step={this.state.step}
                    defaultValue={0.2}
                    onChange={(e) => this._handlePromptModelAndTemperatureSetting(index - 1, e, 'temperature')}
                />
            </Form.Item></>
    }

    _createPromptForOpts(type = 'prompt', index = 1) {
        // 'prompt' || 'tasks' ||   'highlight'
        return <Form.Item
            name={`Prompt${index}Text`}
            label={`${type == 'tasks' ? '目标' : 'Prompt Combo'} ${index}`}
            rules={[
                {
                    required: index == 1,
                    message: `请填写${type == 'tasks' ? '目标' : 'Prompt'}`,
                },
            ]}>
            <TextArea
                placeholder={index == 1 ? `必填，${type == 'tasks' ? '目标' : 'Prompt Combo'} ${index}` : ''}
                showCount
                maxLength={PROMPT_MAX_LENGTH}
                onChange={(e: any) => {
                    const data: any = {};
                    const i = index > 1 ? index : '';
                    data[`prompt${i}`] = {
                        ...defaultPrompt,
                        ...this.state.currentPrompt[`prompt${i}`],
                        text: e.currentTarget.value.trim()
                    }
                    console.log('TextArea', JSON.stringify(data[`prompt${i}`], null, 2))
                    this._updateCurrentPrompt(data)
                }}
            />
        </Form.Item>
    }

    _createZSXQForOpts(index = 1) {
        return <div style={{
            padding: '0px'
        }}><Form.Item
            name={`Prompt${index}Url`}
            label={`url`}
            rules={[
                {
                    required: true,
                    message: '请填写url',
                },
            ]}>
                <Input addonBefore="https://"
                    placeholder={`请填写url`}
                    defaultValue=""
                    onChange={(e: any) => {
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`]
                        }
                        data[`prompt${i}`].queryObj.url = e.currentTarget.value.trim();
                        data[`prompt${i}`].url = e.currentTarget.value.trim();
                        this._updateCurrentPrompt(data)
                    }}
                />

            </Form.Item>
            <Form.Item
                name={`Prompt${index}Text`}
                label={`Text`}
                rules={[
                    {
                        required: false,
                        message: '请填写Text',
                    },
                ]}>

                <TextArea
                    placeholder={'请填写Text'}
                    showCount
                    maxLength={PROMPT_MAX_LENGTH}
                    onChange={(e: any) => {
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`],
                            text: e.currentTarget.value.trim()
                        }
                        // console.log('TextArea', JSON.stringify(data[`prompt${i}`], null, 2))
                        this._updateCurrentPrompt(data)
                    }}
                />
            </Form.Item>
        </div>
    }

    _createQueryForOpts(index = 1) {
        return <div style={{
            padding: '0px'
        }}><Form.Item
            name={`Prompt${index}Url`}
            label={`url`}
            rules={[
                {
                    required: true,
                    message: '请填写url',
                },
            ]}>
                <Input addonBefore="https://"
                    placeholder={`请填写url`}
                    defaultValue=""
                    onChange={(e: any) => {
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`]
                        }
                        data[`prompt${i}`].queryObj.url = e.currentTarget.value.trim();
                        data[`prompt${i}`].url = e.currentTarget.value.trim();
                        this._updateCurrentPrompt(data)
                    }}
                />

            </Form.Item>
            <Form.Item
                name={`Prompt${index}Query`}
                label={`Query`}
                rules={[
                    {
                        required: true,
                        message: '请填写Query',
                    },
                ]}>
                <Input
                    placeholder={`请填写Query`}

                    onChange={(e: any) => {
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`]
                        }
                        data[`prompt${i}`].queryObj.query = e.currentTarget.value.trim();
                        // data[`prompt${i}`].queryObj.isQuery = data[`prompt${i}`].queryObj.url && data[`prompt${i}`].queryObj.query;
                        this._updateCurrentPrompt(data)
                    }}
                />
            </Form.Item>
        </div>
    }

    _createApiForOpts(index = 1) {

        // const i = index > 1 ? index : '';
        // const prompt=this.state.currentPrompt[`prompt${i}`];

        let isError = false;
        return <div style={{
            padding: '0px'
        }}>
            <Form.Item
                name={`Prompt${index}Url`}
                label={`url`}
                rules={[
                    {
                        required: true,
                        message: '请填写url',
                    },
                ]}>
                <Input addonBefore={
                    <Select defaultValue="https://" onChange={(e: string) => {
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`]
                        };
                        data[`prompt${i}`].api.protocol = e;
                        this._updateCurrentPrompt(data)
                    }}>
                        <Option value="http://">http://</Option>
                        <Option value="https://">https://</Option>
                    </Select>
                }
                    placeholder={`请填写url`}
                    defaultValue=""
                    onChange={(e: any) => {
                        // console.log(e)
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`]
                        }
                        data[`prompt${i}`].api.url = e.currentTarget.value.trim();
                        data[`prompt${i}`].url = e.currentTarget.value.trim();
                        data[`prompt${i}`].api.protocol = data[`prompt${i}`].api.protocol || 'https://';
                        this._updateCurrentPrompt(data)
                    }}
                />

            </Form.Item>
            <Form.Item
                name={`Prompt${index}FetchInit`}
                label={`FetchInit`}
                // hasFeedback 
                // validateStatus={isError ? "error" : 'success'}
                rules={[
                    {
                        required: true,
                        message: '请填写init',
                    },
                ]}>
                <TextArea rows={3}
                    placeholder="请填写init"
                    autoSize
                    onChange={(e: any) => {
                        const data: any = {};
                        const i = index > 1 ? index : '';
                        data[`prompt${i}`] = {
                            ...defaultPrompt,
                            ...this.state.currentPrompt[`prompt${i}`]
                        }
                        try {
                            const init = JSON.parse(e.currentTarget.value.trim());
                            if (init.body && typeof (init.body) === 'object') {
                                try {
                                    init.body = JSON.stringify(init.body)
                                } catch (error) {
                                    isError = true;
                                }
                            }

                            data[`prompt${i}`].api.init = init;

                        } catch (error) {
                            // message.error('请检查init格式');
                            isError = true;
                            data[`prompt${i}`].api.init = e.currentTarget.value.trim();
                        }
                        // console.log(data[`prompt${i}`].api.init)
                        // data[`prompt${i}`].api.error=isError;
                        this._updateCurrentPrompt(data)

                    }}
                />

            </Form.Item>
        </div>
    }

    // _createHighlightForOpts(index = 1) {
    //     return <Form.Item name={`Prompt${index}EditOptionsForAgent`} label="代理">
    //         <Radio.Group
    //             style={{
    //                 flexDirection: 'column',
    //                 justifyContent: 'center',
    //                 alignItems: 'baseline'
    //             }}
    //             options={this.state.promptOptions.filter((p: any) => p.type == 'checkbox' && p.agent)}
    //             onChange={(e) => this._handlePromptSetting(index - 1, e, 'agent')} />
    //     </Form.Item>
    // }

    _createOptionUI(index = 1, type = 'prompt') {
        // console.log('_createOptionUI', index, isQuery)
        const currentPrompt = this.state.currentPrompt;
        const promptIndex = index == 1 ? `prompt` : `prompt${index}`;

        const items: any = []

        for (const opts of promptOptions) {
            const inputs: any = opts.inputs,
                outputs: any = opts.outputs,
                models = opts.models;
            const key = opts.key;
            const children = [],
                childrenOfInputs = [],
                childrenOfOutputs = [],
                childrenOfModels = [];

            if (key == currentPrompt[promptIndex].type) {
                if (key == 'query') {
                    children.push(this._createQueryForOpts(index))
                } else if (key == 'api') {
                    children.push(this._createApiForOpts(index))
                } else if (key == 'send-to-zsxq') {
                    children.push(this._createZSXQForOpts(index))
                } else {
                    children.push(this._createPromptForOpts(key, index))
                }

                if (inputs.length > 0) childrenOfInputs.push(this._createInputsForOpts(index, inputs))
                if (outputs.length > 0) childrenOfOutputs.push(this._createOutputsForOpts(index, outputs))
                if (models.length > 0) childrenOfModels.push(this._createModelsForOpts(index))
            }

            items.push({
                key: opts.key,
                label: opts.label,
                children: <>
                    <div>{...children}</div>
                    <div>{...childrenOfInputs}</div>
                    <div>{...childrenOfOutputs}</div>
                    <div>{...childrenOfModels}</div>
                </>
            })
        }

        // <>
        // <Select
        // showSearch
        // style={{ width: 200 }}
        // placeholder="Search to Select"
        // optionFilterProp="children"
        // filterOption={(input:any, option:any) => (option?.label ?? '').includes(input)}
        // filterSort={(optionA, optionB) =>
        //   (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
        // }
        // options={items}
        // onChange={(e) => console.log(e)}
        // />
        // {
        //     items.filter((item:any)=>item.value===type)[0].children
        // }
        // </> 


        return <Tabs defaultActiveKey={type}
            tabPosition={'left'}
            style={{ height: 720 }}
            items={items} onChange={(e) => this._handlePromptTypeSetting(index - 1, e)} />

    }

    render() {
        const promptValue: any = this.state.currentPrompt;
        const hasCombo = promptValue && promptValue.combo > 1;
        const comboCount = promptValue.combo || 5;

        // console.log('this.state.currentPrompt---', JSON.stringify(this.state.currentPrompt, null, 2))
        const formData: any = {
            tag: promptValue.tag || '',
            role: promptValue.role || '',
            EditOptions: (() => {
                const options = [];
                if (hasCombo) {
                    options.push('combo');
                }
                for (const i of (promptValue.interfaces || [])) {
                    if (i === 'showInChat') {
                        options.push('showInChat');
                    }
                    if (i === 'contextMenus') {
                        options.push('contextMenus');
                    }
                    if (i === 'home') {
                        options.push('home');
                    }
                }
                if (promptValue.isInfinite === true) {
                    options.push('infinite')
                }
                return options;
            })(),
        };

        // console.log('promptValue---', JSON.stringify(promptValue, null, 2))

        // 添加 prompt
        for (let index = 0; index < comboCount; index++) {
            let prompt = promptValue[`prompt${index == 0 ? '' : index + 1}`];
            if (!prompt) prompt = { ...defaultPrompt };
            if (!prompt.queryObj) prompt.queryObj = { ...defaultPrompt.queryObj, isQuery: false }
            const options = this._addOptions({ ...prompt });
            // console.log(index, promptValue, `prompt${index + 1}`, options)
            formData[`Prompt${index + 1}Text`] = prompt.text || '';
            formData[`Prompt${index + 1}Type`] = options['type'];
            formData[`Prompt${index + 1}EditOptionsForInput`] = options['input'];
            formData[`Prompt${index + 1}EditOptionsForOutput`] = options['output'];
            // formData[`Prompt${index + 1}EditOptionsForAgent`] = options['agent'];
            formData[`Prompt${index + 1}EditOptionsForTemperature`] = options['temperature'];
            formData[`Prompt${index + 1}EditOptionsForModel`] = options['model'];
            formData[`Prompt${index + 1}Url`] = options['url'];
            formData[`Prompt${index + 1}FetchInit`] = options['init'];
            formData[`Prompt${index + 1}Query`] = options['query'];
        }

        // console.log('formData---', JSON.stringify(formData, null, 2))

        return (<>

            <Modal
                width={720}
                zIndex={900}
                maskClosable={false}
                title="添加Prompts"
                open={true}
                onOk={() => this._onFinish()}
                onCancel={() => this._handleCancel()}
                footer={null}
                style={{ top: 20, userSelect: 'none' }}
            >
                <Form1
                    name="promptsForm"
                    layout="vertical"
                    onFinish={() => this._onFinish()}
                    autoComplete="off"
                    initialValues={formData}
                >
                    < Form.Item name="tag" label={'标题'}
                        rules={[
                            {
                                required: true,
                                message: '请填写标题',
                            },
                        ]}>
                        <Input placeholder={'必填，请填写标题'} showCount maxLength={48}
                            onChange={(e) => this._updateCurrentPrompt({ 'tag': e.target.value.trim() })}
                        />
                    </Form.Item>
                    {/* < Form.Item name="role" label={'角色'}
                        rules={[
                            {
                                required: false,
                                message: '请填写角色',
                            },
                        ]}>

                        <TextArea
                            placeholder={'请填写角色'}
                            showCount maxLength={120}
                            onChange={(e) => this._updateCurrentPrompt({ role: e.target.value.trim() })}
                        />

                    </Form.Item> */}

                    {this._createOptionUI(1, formData.Prompt1Type)}

                    {(this.state.isCombo || hasCombo) && comboCount > 1 ?
                        Array.from(new Array(comboCount - 1),
                            (_, index: number) => this._createOptionUI(index + 2,
                                formData[`Prompt${index + 2}Type`]))
                        : null}

                    <Divider />
                    <Form.Item name="EditOptions">
                        <Checkbox.Group value={this.state.isCombo ? ['Combo'] : []}
                            style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'baseline'
                            }}
                            options={this.state.options} onChange={(e) => this._handleComboSetting(e)} />
                    </Form.Item>

                    <Form.Item style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button style={{ marginRight: 10 }} onClick={() => this._downloadMyCombo()}>下载</Button>
                        <Popconfirm
                            placement="bottomRight"
                            title={'确定删除Prompt？'}
                            onConfirm={() => this._deleteConfirm(promptValue)}
                            okText="是的"
                            cancelText="取消"
                            zIndex={1250}
                        >
                            <Button danger>删除</Button>
                        </Popconfirm>
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 10 }}
                        >保存</Button>
                    </Form.Item>
                </Form1>
            </Modal>
        </>
        );
    }
}

export default ComboModal;

