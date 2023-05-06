import * as React from "react";

import {
    Button,
    Modal,
    Input,
    Checkbox,
    Form,
    Popconfirm,
    Divider,
} from 'antd';

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
    promptOptions: any
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
            promptOptions
        }
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

        let data: any = {};
        for (const key in this.state.currentPrompt) {
            if (this.state.currentPrompt[key] !== undefined || this.state.currentPrompt[key] !== "") {
                if (key.match('prompt')) {
                    if (this.state.currentPrompt[key].text) data[key] = this.state.currentPrompt[key];
                } else {
                    data[key] = this.state.currentPrompt[key];
                }
            }
        }
        console.log('_onFinish', data)
        const timestamp = new Date().getTime();
        const uniqueId = timestamp.toString(16);
        if (data && !data.id) data.id = uniqueId;

        let combo = 0,
            datas: any = {};
        for (const key in data) {
            if (key.match('prompt')) {
                let index = parseInt(key.replace('prompt', '') || '0')
                datas[`prompt${index > 0 ? (combo + 1) : ''}`] = data[key];
                combo++;
            }
        }

        data = {
            prompt: {
                ...defaultCombo,
                ...data,
                combo,
                ...datas
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
    //临时方案，JSON.parse('{url,query}')
    _parseQuery = (text: string, isQuery: boolean) => {

        try {
            const { url, query } = JSON.parse(text);
            return { url, query, isQuery }
        } catch (error) {

        }
        return
    }

    /**
     * 
     * @param value // ['bindCurrentPage','isNextUse']
     */
    _handlePromptSetting(promptIndex: number, value: any) {

        let bindCurrentPage = false, isNextUse = false, isQuery = false, isApi = false;

        if (value && value.length > 0) {
            console.log(value)
            bindCurrentPage = value.includes("bindCurrentPage");
            isNextUse = value.includes("isNextUse");
            isQuery = value.includes("isQuery");
            isApi = value.includes("isApi");
        };

        let json: any = {};
        const currentPrompt = this.state.currentPrompt;

        const key = promptIndex == 0 ? `prompt` : `prompt${promptIndex + 1}`;

        if (currentPrompt[key].queryObj == undefined) {
            currentPrompt[key].queryObj = { ...defaultPrompt.queryObj, isQuery };
        }

        json[key] = {
            ...currentPrompt[key], bindCurrentPage, isNextUse, queryObj: {
                ...currentPrompt[key].queryObj, isQuery
            }, isApi
        }

        if (isQuery) {
            const queryObj = this._parseQuery(currentPrompt[key].text, isQuery);
            json[key] = { ...json[key], queryObj }
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
            // console.log('updateData', combo, combo <= 1 ? 5 : combo)
            updateData['currentPrompt'] = { ...updateData['currentPrompt'], combo }
            updateData['isCombo'] = true
        } else {
            updateData['isCombo'] = false;
        }
        // console.log('updateData', updateData)
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

            for (const key in prompt) {
                if (key.match('prompt') && prompt[key].queryObj && prompt[key].queryObj.isQuery) {
                    const q = this._parseQuery(prompt[key].text, prompt[key].queryObj.isQuery);
                    if (q) prompt[key].queryObj = q
                }
            }

            this.setState({
                currentPrompt: prompt
            })
        }
    }

    _addOptions(prompt: any) {
        const options = [];
        if (prompt.isNextUse) {
            options.push('isNextUse');
        }
        if (prompt.bindCurrentPage) {
            options.push('bindCurrentPage');
        }
        if (prompt.queryObj && prompt.queryObj.isQuery) {
            options.push('isQuery');
        }
        // if (prompt.isApi) {
        //     options.push('isApi');
        // }
        return options;
    }

    render() {
        const promptValue = this.state.currentPrompt;
        const hasCombo = promptValue && promptValue.combo > 1;
        const comboCount = promptValue.combo || 5;
        const hasPrompt = promptValue && Object.keys(promptValue).length > 0;
        // console.log('this.state.currentPrompt---', this.state.currentPrompt)
        const formData: any = hasPrompt ? {
            tag: promptValue.tag || '',
            role: promptValue.role || '',
            Prompt1Text: promptValue.prompt.text || '',
            Prompt1EditOptions: this._addOptions(promptValue.prompt),
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
        } : {};

        if (hasCombo && comboCount > 1) {
            // 添加其他的prompt

            for (let index = 0; index < comboCount; index++) {
                console.log(index, promptValue, `prompt${index + 1}`)
                const prompt = promptValue[`prompt${index + 1}`];
                if (prompt) {
                    formData[`Prompt${index + 1}Text`] = prompt.text || '';
                    formData[`Prompt${index + 1}EditOptions`] = this._addOptions(prompt);
                }
            }
        }

        // console.log('formData---', formData, promptValue)
        return (<>

            <Modal zIndex={1200} maskClosable={false} title="添加Prompts"
                open={true}
                onOk={() => this._onFinish()} onCancel={() => this._handleCancel()}
                footer={null}
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

                    <Form.Item name="Prompt1Text" label={this.state.isCombo ? ('Prompt Combo 1') : ('Prompt')}
                        rules={[
                            {
                                required: true,
                                message: '请填写Prompt',
                            },
                        ]}>
                        <TextArea
                            placeholder={this.state.isCombo ? ('必填，Prompt Combo 1') : ('必填，请填写Prompt')}
                            showCount
                            maxLength={PROMPT_MAX_LENGTH}
                            onChange={(e: any) => this._updateCurrentPrompt({
                                prompt:
                                    { ...this.state.currentPrompt.prompt, text: e.currentTarget.value.trim() }
                            })}
                        />
                    </Form.Item>

                    <Form.Item name="Prompt1EditOptions">
                        <Checkbox.Group
                            style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'baseline'
                            }}
                            options={this.state.promptOptions} onChange={(e) => this._handlePromptSetting(0, e)} />
                    </Form.Item>

                    {(this.state.isCombo || hasCombo) && comboCount > 1 ? (
                        <>
                            {Array.from(new Array(comboCount - 1), (_, index: number) => {
                                return <><Form.Item name={`Prompt${index + 2}Text`} label={`Prompt Combo ${index + 2}`}>
                                    <TextArea placeholder={`选填，Prompt Combo ${index + 2}`}
                                        showCount
                                        maxLength={PROMPT_MAX_LENGTH}
                                        onChange={(e: any) => {
                                            const data: any = {};

                                            data[`prompt${index + 2}`] = {
                                                ...this.state.currentPrompt[`prompt${index + 2}`],
                                                text: e.currentTarget.value.trim()
                                            }

                                            this._updateCurrentPrompt(data)

                                        }} />

                                </Form.Item>
                                    <Form.Item name={`Prompt${index + 2}EditOptions`}>
                                        <Checkbox.Group
                                            style={{
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'baseline'
                                            }}
                                            options={this.state.promptOptions} onChange={(e) => this._handlePromptSetting(index + 1, e)} />
                                    </Form.Item>
                                </>
                            })}
                        </>
                    ) : null}

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

