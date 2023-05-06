import * as React from "react";

import {
    Button
} from 'antd';


import {
    DownloadOutlined
} from '@ant-design/icons';

type PropType = {
    disabled: boolean;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    disabled: boolean
}

interface DownloadButton {
    state: StateType;
    props: PropType
}

class DownloadButton extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            disabled: this.props.disabled
        }
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: { disabled: boolean; }, prevState: any) {
        if (
            this.props.disabled !== prevProps.disabled
        ) {
            this.setState({ disabled: this.props.disabled })
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    render() {
        return (
            <Button
                style={{
                    outline: 'none',
                    border: 'none',
                    margin: '0px 5px 0px 10px',
                    boxShadow: 'none'
                }}
                icon={<DownloadOutlined style={{ fontSize: 20 }} />}
                disabled={this.state.disabled}
                onClick={() => this.props.callback({ cmd: 'download-file' })} />
        );
    }
}

export default DownloadButton;