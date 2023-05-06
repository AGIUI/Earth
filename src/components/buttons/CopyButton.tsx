import * as React from "react";


import {
    Dropdown,
    Space,
} from 'antd';

import type { MenuProps } from 'antd';


import {
    DownOutlined
} from '@ant-design/icons';


type PropType = {
    callback: any;
    data: any;
    disabled: boolean;
    [propName: string]: any;
}

type StateType = {
    data: any;
    open: boolean;
    disabled: boolean;
    items: any;
}

interface CopyButton {
    state: StateType;
    props: PropType
}

class CopyButton extends React.Component {
    constructor(props: any) {
        super(props);


        const items = [
            {
                label: '拷贝MarkDown格式',
                key: 'markdown',
            },
            {
                label: '拷贝富文本',
                key: 'html',
            },
            {
                label: '拷贝纯文本',
                key: 'text',
            },
        ];

        this.state = {
            open: false,
            data: this.props.data,
            disabled: false,
            items: items
        }
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: { data: any; disabled: boolean }, prevState: any) {
        if (
            this.props.data !== prevProps.data
        ) {
            this.setState({ data: this.props.data })
            // this.destroyConnection();
            // this.setupConnection();
        }
        if (this.props.disabled != prevProps.disabled) {
            this.setState({ disabled: this.props.disabled })
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _handleMenuClick: MenuProps['onClick'] = (e) => {
        // console.log(e)
        // this.props.onClick(e.key)
        this._copy(e.key)
        this.setState({
            open: false
        })

    };

    _handleOpenChange = (flag: boolean) => {
        this.setState({
            open: flag
        })
    };

    async _copy(e: any) {

        const { text, html, markdown, talks } = this.props.data;
        // console.log(text, html, markdown, talks)
        let type = "text/html", copyText: any = text;
        if (e == 'html') {
            type = "text/html";
            copyText = html
        } else if (e == 'markdown') {

        } else if (e === 'text') {
            type = 'text/plain'
            copyText = text;
        }

        let isSuccess = false;

        try {
            const blob: any = new Blob([copyText], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            // 写入剪切板
            await navigator.clipboard.write(data);

            isSuccess = true;

        } catch (e) {
            console.error('Failed to copy: ', e);
        }

        this.props.callback({ cmd: `copy-${e}`, data: { success: isSuccess } })

    }

    render() {
        return (
            <Dropdown
                disabled={this.state.disabled}
                menu={{
                    items: this.state.items,
                    onClick: this._handleMenuClick,
                }}
                onOpenChange={this._handleOpenChange}
                open={this.state.open}
            >
                <a onClick={(e) => this._copy('text')}>
                    <Space>
                        拷贝
                        <DownOutlined />
                    </Space>
                </a>
            </Dropdown>
        );
    }
}

export default CopyButton;