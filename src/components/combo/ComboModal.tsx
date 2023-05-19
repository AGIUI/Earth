import * as React from "react";

import {
    Button,
    Modal,
    Input,
    Checkbox,
    Form,
    Popconfirm,
    Divider, Select, Slider, Radio
} from 'antd';
const { Option } = Select;
const { TextArea } = Input;

import { md5 } from '@components/Utils'

import { PROMPT_MAX_LENGTH, promptOptions, comboOptions, defaultCombo, defaultPrompt } from "@components/combo/ComboData"

import styled from 'styled-components';

const Form1 = styled(Form)`
    &.ant-form{
        display: block!important;
    }
    .ant-form-item-control-input-content{
        text-align: left!important;
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
            step: 0.1
        }
        console.log('currentPrompt', this.props.currentPrompt)
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

    /**
     * 结果
     */
    _onFinish() {
        let data: any = {}, prompts: any = {};
        const promptKeys = Array.from([1, 2, 3, 4, 5, 6, 7], i => `prompt${i != 1 ? i : ''}`);
        // console.log('this.state.currentPrompt', JSON.stringify(this.state.currentPrompt, null, 2))
        for (const key in this.state.currentPrompt) {
            if (this.state.currentPrompt[key] !== undefined || this.state.currentPrompt[key] !== "") {
                if (key.match('prompt')) {
                    if (promptKeys.includes(key) && ((this.state.currentPrompt[key].text && this.state.currentPrompt[key].text != '') || (this.state.currentPrompt[key].queryObj && this.state.currentPrompt[key].queryObj.isQuery))) prompts[key] = this.state.currentPrompt[key];
                } else {
                    data[key] = this.state.currentPrompt[key];
                }
            }
        }
        // console.log('_onFinish', data, this.state.currentPrompt)
        const timestamp = new Date().getTime();
        const uniqueId = timestamp.toString(16);
        if (data && !data.id) data.id = uniqueId;

        let combo = 0, newPrompts: any = {};
        for (const key in prompts) {
            if (promptKeys.includes(key)) {
                combo++;
                newPrompts[`prompt${combo == 1 ? '' : combo}`] = prompts[key]
            }
        }

        data = {
            prompt: {
                ...defaultCombo,
                ...data,
                ...newPrompts,
                combo
            },
            from: 'combo-editor'
        }

        this.props.callback({
            cmd: 'edit-combo-finish', data
        })
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
     */
    _handlePromptSetting(promptIndex: number, value: any) {
        const currentPrompt = this.state.currentPrompt;
        const key = promptIndex == 0 ? `prompt` : `prompt${promptIndex + 1}`;
        // console.log(currentPrompt[key])
        if (currentPrompt[key] == undefined) currentPrompt[key] = { ...defaultPrompt }

        /**单选的 */
        const opts = [...this.state.promptOptions],
            inputs = opts.filter((f: any) => f.input),
            outputs = opts.filter((f: any) => f.output);

        let output = currentPrompt[key].output,
            input = currentPrompt[key].input;

        console.log(value)
        if (value && value.target && value.target.value) {
            if (Array.from(inputs, (o: any) => o.value).includes(value.target.value)) {
                input = value.target.value;
            }
            if (Array.from(outputs, (o: any) => o.value).includes(value.target.value)) {
                output = value.target.value;
            }
        };


        let json: any = {};

        json[key] = {
            ...currentPrompt[key],
            queryObj: {
                ...currentPrompt[key].queryObj,
                isQuery: input == 'isQuery'
            },
            api: {
                ...currentPrompt[key].api,
                isApi: input == 'isApi'
            },
            input,
            output
        }

        // console.log('_handlePromptSetting:', key, JSON.stringify(json, null, 2))

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


        if (type == 'model') {
            if (value == "Bing") {
                this.setState({
                    step: 0.5,
                })
            } else {
                this.setState({
                    step: 0.1,
                })
            }
        }

        this._updateCurrentPrompt(json);
    }

    /**
     * 
     * @param value // ['bindCurrentPage', 'Combo', 'ShowInChat']
     */
    _handleComboSetting(value: any) {
        // console.log('_handleComboSetting', value)
        let checked = false, isInfinite = false;

        if (value && value.length > 0) {
            checked = value.includes("ShowInChat");
        };
        if (value && value.length > 0) {
            isInfinite = value.includes('Infinite');
        }

        let currentPrompt = { ...this.state.currentPrompt, checked, isInfinite }

        let updateData: any = { currentPrompt }

        if (value.includes('Combo')) {
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
            this.setState({
                currentPrompt: prompt
            })
        }
    }

    _addOptions(prompt: any) {
        const options: any = {
            input: 'defalut',
            output: 'defalut',
            temperature: prompt.temperature || 0.6,
            model: prompt.model || 'ChatGPT',
            url: prompt.queryObj.url,
            query: prompt.queryObj.query
        };

        options['output'] = prompt.output;
        options['input'] = prompt.input;
       
        return options;
    }

    _createOptionUI(index = 1, isQuery = false) {
        // console.log('_createOptionUI', index, isQuery)
        return <>
            {
                isQuery ? <div style={{
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
                                // data[`prompt${i}`].queryObj.isQuery = data[`prompt${i}`].queryObj.url && data[`prompt${i}`].queryObj.query;
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
                </div> : <Form.Item
                    name={`Prompt${index}Text`}
                    label={`Prompt Combo ${index}`}
                    rules={[
                        {
                            required: index == 1,
                            message: '请填写Prompt',
                        },
                    ]}>
                    <TextArea
                        placeholder={index == 1 ? `必填，Prompt Combo ${index}` : ''}
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


            <Form.Item
                name={`Prompt${index}EditOptionsForInput`}
                label="输入">
                <Radio.Group
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'baseline'
                    }}
                    options={this.state.promptOptions.filter((p: any) => p.type == 'checkbox' && p.input)}
                    onChange={(e) => this._handlePromptSetting(index - 1, e)} />
            </Form.Item>

            <Form.Item name={`Prompt${index}EditOptionsForOutput`} label="输出">
                <Radio.Group
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'baseline'
                    }}
                    options={this.state.promptOptions.filter((p: any) => p.type == 'checkbox' && p.output)}
                    onChange={(e) => this._handlePromptSetting(index - 1, e)} />
            </Form.Item>

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
                    {Array.from(this.state.promptOptions.filter((ps: any) => ps.value == 'model')[0].options,
                        (p: any) => {
                            return <Radio.Button
                                value={p.value}
                            >{p.label}</Radio.Button>
                        })}
                </Radio.Group>
            </Form.Item>
            <Form.Item name={`Prompt${index}EditOptionsForTemperature`}
                label="严谨程度 Temperature"
            >
                <Slider
                    style={{ width: '120px' }}
                    range={false}
                    max={1}
                    min={0}
                    step={this.state.step}
                    defaultValue={0.7}
                    onChange={(e) => this._handlePromptModelAndTemperatureSetting(index - 1, e, 'temperature')}
                />
            </Form.Item></>
    }

    render() {
        const promptValue = this.state.currentPrompt;
        const hasCombo = promptValue && promptValue.combo > 1;
        const comboCount = promptValue.combo || 5;

        // console.log('this.state.currentPrompt---', JSON.stringify(this.state.currentPrompt, null, 2))
        const formData: any = {
            tag: promptValue.tag || '',
            role: promptValue.role || '',
            uniqueId: promptValue.id,
            EditOptions: (() => {
                const options = [];
                if (hasCombo) {
                    options.push('Combo');
                }
                if (promptValue.checked === true) {
                    options.push('ShowInChat');
                }
                if (promptValue.isInfinite === true) {
                    options.push('Infinite')
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
            formData[`Prompt${index + 1}EditOptionsForInput`] = options['input'];
            formData[`Prompt${index + 1}EditOptionsForOutput`] = options['output'];
            formData[`Prompt${index + 1}EditOptionsForTemperature`] = options['temperature'];
            formData[`Prompt${index + 1}EditOptionsForModel`] = options['model'];
            formData[`Prompt${index + 1}Url`] = options['url'];
            formData[`Prompt${index + 1}Query`] = options['query'];
        }

        // console.log('formData---', JSON.stringify(formData, null, 2))

        return (<>

            <Modal
                width={640}
                zIndex={1200}
                maskClosable={false}
                title="添加Prompts"
                open={true}
                onOk={() => this._onFinish()} onCancel={() => this._handleCancel()}
                footer={null}
                style={{top: 20, userSelect: 'none'  }}
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

                    {this._createOptionUI(1, formData.Prompt1EditOptionsForInput.includes('isQuery'))}

                    {(this.state.isCombo || hasCombo) && comboCount > 1 ?
                        Array.from(new Array(comboCount - 1),
                            (_, index: number) => this._createOptionUI(index + 2,
                                formData[`Prompt${index + 2}EditOptionsForInput`].includes('isQuery')))

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
                    <Form.Item name="uniqueId">
                        <Input type="hidden" />
                    </Form.Item>
                    <Form.Item style={{ display: "flex", justifyContent: "flex-end" }}>
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

