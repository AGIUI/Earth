import * as React from "react";

import {
    Button
} from 'antd';


import {
    FullscreenExitOutlined,FullscreenOutlined
} from '@ant-design/icons';

type PropType = {
    disabled: boolean;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    disabled: boolean;
    fullscreen:boolean;
}

interface FullscreenButton {
    state: StateType;
    props: PropType
}

class FullscreenButton extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            disabled: this.props.disabled,
            fullscreen:this.props.fullscreen
        }
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: { disabled: boolean; fullscreen:boolean}, prevState: any) {
        if (
            this.props.disabled !== prevProps.disabled
        ) {
            this.setState({ disabled: this.props.disabled })
        }

        if (
            this.props.fullscreen !== prevProps.fullscreen
        ) {
            this.setState({ fullscreen: this.props.fullscreen })
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
                margin: '0px 5px',
                boxShadow: 'none'
            }}
            icon={this.state.fullscreen ?
                <FullscreenExitOutlined style={{ fontSize: 20 }} /> :
                <FullscreenOutlined style={{ fontSize: 20 }} />}
            disabled={this.state.disabled}
            onClick={
                () => this.props.callback({ cmd: 'toggle-fullcreen' })} />
        );
    }
}

export default FullscreenButton;