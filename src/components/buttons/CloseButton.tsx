import * as React from "react";

import {
    Button
} from 'antd';


import {
    CloseOutlined
} from '@ant-design/icons';

type PropType = {
    disabled: boolean;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    disabled: boolean
}

interface CloseButton {
    state: StateType;
    props: PropType
}

class CloseButton extends React.Component {
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
                    margin: '0px 0px 0px 5px',
                    boxShadow: 'none'
                }}

                onClick={ () => this.props.callback({  cmd: 'close-click' }) }

                icon={<CloseOutlined style={{ fontSize: 20 }} />}
                />
        )
    }
}

export default CloseButton;