import * as React from "react";
import {
    Card,
    Button,
    Typography,
    Tag,
    List, Empty, Popconfirm, message, Popover
} from 'antd';

const { Text } = Typography;

import i18n from 'i18next';


import { chromeStorageGet, chromeStorageSet, md5, getConfig } from "@components/Utils"
import { _DEFAULTCOMBO } from '@components/flow/Workflow'

import DownloadButton from '@components/buttons/DownloadButton';
import { FlexRow } from "@components/Style";
import OpenFileButton from "@components/buttons/OpenFileButton";
import config from "src/config/app.json";

import styled from 'styled-components';
import CloseButton from "@components/buttons/CloseButton";


const Base: any = styled.div`
    & .ant-card-body::-webkit-scrollbar{
        width:2px;
    }
    & .ant-card-body::-webkit-scrollbar{
        width:2px;
    }
    & .ant-card-body::-webkit-scrollbar-track{
        border-radius:25px;
        -webkit-box-shadow:inset 0 0 5px rgba(255,255,255, 0.5);
        background:rgba(255,255,255, 0.5);
    }
    & .ant-card-body::-webkit-scrollbar-thumb{
        border-radius:15px;
        -webkit-box-shadow:inset 0 0 5px rgba(0, 0,0, 0.2);
        background:rgba(0, 0,0, 0.2);
    }
    & .ant-list-item{
        width:100%;
    }
    & .ant-btn-primary{
        color: #fff !important;
        background-color: #1677ff !important;
    }
  `

type PropType = {
    myPrompts: any;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    name: string;
    secondTitle: string;
    myPrompts: any,
    showImportModal: boolean;
    version: string;
    app: string;
    open: boolean;
    importJson: any
}

interface ComboEditor {
    state: StateType;
    props: PropType
}

class ComboEditor extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: 'comboEditor',
            secondTitle: i18n.t('myWorkflow'),
            myPrompts: this.props.myPrompts,
            showImportModal: false,
            version: '',
            app: '',
            open: false,
            importJson: null
        }
        const json: any = getConfig()
        this.setState({
            app: json.app,
            version: json.version,
        })
    }

    componentDidMount() {
        // this.setupConnection();
        // console.log('combo edtior')
    }

    componentDidUpdate(prevProps: any, prevState: any) {

        const currentId = md5(JSON.stringify(this.props.myPrompts)),
            prevId = md5(JSON.stringify(prevProps.myPrompts));

        if (
            currentId !== prevId
        ) {
            this.setState({
                myPrompts: this.props.myPrompts
            })
            // this.destroyConnection();
            // this.setupConnection();
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    // _delete(prompt: any) {
    //     console.log('_delete', prompt)
    //     this.props.callback({
    //         cmd: 'delete-combo-confirm', data: { prompt, from: 'combo-editor' }
    //     })
    // }

    _comboHandle(combo: any, from: string) {
        if (this.props.callback) this.props.callback({
            cmd: 'combo',
            data: {
                '_combo': combo,
                from,
                prompt: combo.prompt,
                tag: combo.tag,
                newTalk: true
            }
        })
    }

    _showModal(event: React.MouseEvent<HTMLButtonElement>, prompt: any) {
        const isNew = !!prompt.isNew;
        const data = {
            prompt: {
                ..._DEFAULTCOMBO(this.state.app, this.state.version),
                ...prompt
            },
            from: 'combo-editor',
            isNew
        }
        // console.log('_showModal', data)
        event.stopPropagation();
        event.preventDefault();
        if (this.props.callback) this.props.callback({
            cmd: 'show-combo-modal', data
        })
    };

    _downloadMyCombo(combos: any = []) {
        const data: any = [];
        for (const combo of combos) {
            combo.version = this.state.version;
            combo.app = this.state.app;
            // combo.id = "";
            if (!combo.id) combo.id = md5(JSON.stringify(combo));
            data.push(combo)
        }

        const name = combos[0].tag;
        const id = md5(JSON.stringify(data));

        //通过创建a标签实现
        const link = document.createElement('a')
        //encodeURIComponent解决中文乱码
        link.href = `data:application/json;charset=utf-8,\ufeff${encodeURIComponent(JSON.stringify(data))}`

        const filename = Date.now();

        //下载文件命名
        //link.download = `${name}_${id}`
        link.download = `${config.app}_${filename}`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link);
    }

    // 是否强制导入
    _importMyCombo() {
        console.log(this.state.myPrompts)
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".json"
        document.body.appendChild(input);
        let that = this;
        input.addEventListener('change', (e: any) => {
            // console.log(e);
            const files = e.target.files;
            if (files.length == 1) {
                let file = files[0];
                var fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = () => {
                    // 获取得到的结果
                    const data: any = fileReader.result;
                    const json = JSON.parse(data);
                    console.log(json)

                    chromeStorageGet(['user']).then((items: any) => {
                        let myPrompts = [...that.state.myPrompts];
                        let newUser: any = []

                        if (items && items.user) {
                            newUser = [...items.user]
                        }

                        const oldCombos = []
                        for (const n of json) {
                            let isNew = true;
                            if (newUser.filter((u: any) => u.id == n.id).length > 0) isNew = false;
                            if (isNew) {
                                newUser.push(n);
                                myPrompts.push(n)
                            } else {
                                n.id = md5(new Date() + '')
                                oldCombos.push(n)
                            }
                        };

                        this.setState({
                            importJson: oldCombos,
                            open: oldCombos.length > 0
                        })


                        chromeStorageSet({ 'user': newUser });

                        that.setState({ myPrompts })


                    });

                }
            }
            input.remove();
        }, false)
        input.click();
    }

    importCombo(json: any) {
        chromeStorageGet(['user']).then((items: any) => {
            let myPrompts = [...this.state.myPrompts];
            let newUser: any = []

            if (items && items.user) {
                newUser = [...items.user]
            }
            for (const n of json) {
                newUser.push(n);
                myPrompts.push(n);
            }

            chromeStorageSet({ 'user': newUser });

            this.setState({ myPrompts })

        });
    }

    render() {
        return (<Base>
            <Card
                title={i18n.t('workflow')}
                bordered={true}
                headStyle={{
                    userSelect: 'none',
                    border: 'none',
                    height: '80px',
                    fontSize: 24,
                    fontWeight: "bold",
                }}
                bodyStyle={{
                    // flex: 1,
                    height: 'calc(100% - 80px)',
                    paddingTop: 0,
                    overflowY: 'auto',
                }}

                extra={<div>
                    <CloseButton
                        disabled={false}
                        callback={() => this.props.callback({
                            cmd: 'close-combo-editor'
                        })} />
                </div>}

                style={{
                    width: '500px',
                    padding: '0px',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh'
                }}
            >
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>


                    <FlexRow display="flex"
                        style={{ "marginBottom": "10px" }}
                    >
                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "black" }}>{this.state.secondTitle}</Text>
                        <div>

                            <DownloadButton
                                disabled={false}
                                style={{ marginRight: 10 }}
                                callback={() => this._downloadMyCombo(this.state.myPrompts.filter((p: any) => p.owner != 'official'))} />
                            <Popover
                                content={<><Button
                                    type="dashed"
                                    style={{ marginRight: '20px' }}
                                    onClick={() => {
                                        this.setState({
                                            open: false
                                        })
                                        this.importCombo(this.state.importJson)
                                    }}>导入</Button><Button type="text" onClick={() => this.setState({
                                        open: false
                                    })}>Close</Button></>}
                                title="已存在重复ID，是否继续导入？"
                                trigger="click"
                                open={this.state.open}
                                onOpenChange={(newOpen) => this.setState({
                                    open: newOpen
                                })}
                            >
                                <OpenFileButton
                                    disabled={false}
                                    callback={() => this._importMyCombo()} />
                            </Popover>



                        </div>

                    </FlexRow>

                    {this.state.myPrompts.filter((p: any) => p.owner !== 'official').length > 0 ? (
                        <List
                            style={{ paddingBottom: 40 }}
                        >
                            {this.state.myPrompts.filter((p: any) => p.owner !== 'official').map((p: any, i: number) => {
                                return (
                                    <List.Item
                                        key={i}
                                        style={{
                                            border: 1,
                                            borderColor: '#d9d9d9',
                                            borderStyle: 'solid',
                                            borderRadius: 5,
                                            padding: "5px 0 5px 10px",
                                            marginTop: 10,
                                            marginBottom: 10
                                        }}
                                        actions={[
                                            // <Popconfirm
                                            //     placement="bottomRight"
                                            //     title={'确定删除Prompt？'}
                                            //     onConfirm={() => this._delete(p)}
                                            //     okText="是的"
                                            //     cancelText="取消"
                                            //     zIndex={100000000}
                                            // >
                                            //     <Button danger
                                            //         style={{ color: '#grey', border: "none", boxShadow: "none" }}
                                            //     >
                                            //         删除
                                            //     </Button>

                                            // </Popconfirm>
                                            ,
                                            <Button
                                                onClick={(event: any) => this._showModal(event, p)}
                                                key={'edit'}
                                                type={"text"}
                                                style={{ color: '#grey', border: "none", boxShadow: "none" }}
                                            >
                                                {i18n.t('edit')}
                                            </Button>,
                                            <Button
                                                type={"primary"}
                                                style={{ background: '#1677ff' }}
                                                onClick={() => this._comboHandle(p, "comboEditor")}
                                            >{i18n.t('run')}</Button>
                                        ]}
                                    >
                                        <Text style={{ fontWeight: 'bold', color: "black" }}>
                                            {p.tag}

                                            {
                                                p.combo > 1 ? (
                                                    <Tag style={{ marginLeft: 10 }}>Combo</Tag>) : null
                                            }
                                            {
                                                p.interfaces.includes('role') ? (
                                                    <Tag style={{ marginLeft: 10 }}>Role</Tag>) : null
                                            }

                                        </Text>
                                    </List.Item>
                                )
                            })}
                        </List>
                    ) : (
                        <Empty style={{ marginTop: 100 }} />
                    )}

                </div>
                <Button size={"large"} type={"primary"}
                    style={{ position: "absolute", bottom: 30, width: 450, left: 25 }}
                    onClick={(event: any) => this._showModal(event, {
                        owner: 'user',
                        id: (new Date()).getTime(),
                        isNew: true
                    })}>
                    {i18n.t('new')}
                </Button>

                {/* {this.state.showEdit && ReactDOM.createPortal(showEditModal(), document.body as HTMLElement)} */}

            </Card></Base>
        );
    }
}

export default ComboEditor;
