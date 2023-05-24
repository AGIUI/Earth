import * as React from "react";
import {
    Card,
    Button,
    Typography,
    Tag,
    List, Empty,
} from 'antd';

const { Text } = Typography;

import {
    CloseOutlined
} from '@ant-design/icons';

import { chromeStorageGet, chromeStorageSet, md5, getConfig } from "@components/Utils"
import { defaultCombo } from '@components/combo/ComboData'

import DownloadButton from '@components/buttons/DownloadButton';
import { FlexRow } from "@components/Style";
import OpenFileButton from "@components/buttons/OpenFileButton";

import styled from 'styled-components';

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
            secondTitle: '我的Prompts',
            myPrompts: this.props.myPrompts,
            showImportModal: false,
            version: '',
            app: ''
        }
        getConfig().then(json => this.setState({
            app: json.app,
            version: json.version
        }))
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

    _comboHandle(combo: any, from: string) {
        if (this.props.callback) this.props.callback({
            cmd: 'combo',
            data: {
                '_combo': combo,
                from, prompt: combo.prompt,
                tag: combo.tag,
                newTalk: true
            }
        })
    }

    _showModal(event: React.MouseEvent<HTMLButtonElement>, prompt: any) {
        const data = {
            prompt: {
                ...defaultCombo,
                ...prompt
            },
            from: 'combo-editor'
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

        //下载文件命名
        link.download = `${name}_${id}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link);
    }

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
                fileReader.onload = function () {
                    // 获取得到的结果
                    const data: any = this.result;
                    const json = JSON.parse(data);
                    // console.log(json)

                    chromeStorageGet(['user']).then((items: any) => {
                        let myPrompts = [...that.state.myPrompts];
                        let newUser: any = []

                        if (items && items.user) {
                            newUser = [...items.user]
                        }

                        for (const n of json) {
                            let isNew = true;
                            if (newUser.filter((u: any) => u.id == n.id).length > 0) isNew = false;
                            if (isNew) {
                                newUser.push(n);
                                myPrompts.push(n)
                            }
                            ;
                        }

                        chromeStorageSet({ 'user': newUser });

                        that.setState({ myPrompts })


                    });

                }
            }
            input.remove();
        }, false)
        input.click();
    }

    render() {
        return (<Base>
            <Card
                title={'Combo'}
                bordered={true}
                headStyle={{
                    userSelect: 'none',
                    border: 'none',
                    fontSize: 24,
                    fontWeight: "bold",
                    paddingTop: 16
                }}
                bodyStyle={{
                    // flex: 1,
                    padding: '24px 24px 8px 24px',
                    height: '100%',
                    overflowY: 'scroll',
                    paddingBottom: '99px'
                }}

                extra={<div>
                    <Button
                        style={{
                            outline: 'none',
                            border: 'none',
                            margin: '0px 0px 0px 5px',
                            boxShadow: 'none'
                        }}
                        onClick={
                            () => this.props.callback && this.props.callback({ cmd: 'close-combo-editor' })
                        }
                        icon={<CloseOutlined style={{ fontSize: 20 }} />}
                    />
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


                    <FlexRow display="flex">
                        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{this.state.secondTitle}</Text>
                        <div>

                            <DownloadButton
                                disabled={false}
                                callback={() => this._downloadMyCombo(this.state.myPrompts.filter((p: any) => p.owner != 'official'))} />
                            <OpenFileButton
                                disabled={false}
                                callback={() => this._importMyCombo()} />

                        </div>

                    </FlexRow>

                    {this.state.myPrompts.filter((p: any) => p.owner !== 'official').length > 0 ? (
                        <List>
                            {this.state.myPrompts.filter((p: any) => p.owner !== 'official').map((p: any, i: number) => {
                                return (
                                    <List.Item
                                        key={i}
                                        style={{
                                            border: 1,
                                            borderColor: '#d9d9d9',
                                            borderStyle: 'solid',
                                            borderRadius: 5,
                                            paddingTop: 15,
                                            paddingBottom: 15,
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                            marginTop: 10,
                                            marginBottom: 10
                                        }}
                                        actions={[
                                            <Button
                                                onClick={(event: any) => this._showModal(event, p)}
                                                key={'edit'}
                                                type={'text'}
                                            >
                                                编辑
                                            </Button>,
                                            <Button onClick={() => this._comboHandle(p, "getPromptPage")}
                                            >运行</Button>
                                        ]}
                                    >
                                        <Text style={{ fontWeight: 'bold' }}>
                                            {p.tag}
                                            {
                                                p.combo > 1 ? (
                                                    <Tag style={{ marginLeft: 10 }}>Combo</Tag>) : null
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
                    onClick={(event: any) => this._showModal(event, { owner: 'user',id:(new Date()).getTime() })}>
                    新建我的Prompts
                </Button>

                {/* {this.state.showEdit && ReactDOM.createPortal(showEditModal(), document.body as HTMLElement)} */}

            </Card></Base>
        );
    }
}

export default ComboEditor;
