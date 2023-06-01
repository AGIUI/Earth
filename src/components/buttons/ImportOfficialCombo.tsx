import * as React from "react";
import {
    PlusOutlined
} from '@ant-design/icons';
import FullscreenButton from "@components/buttons/FullscreenButton";

type PropType = {
    disabled: boolean;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    disabled: boolean;
    isHovered: boolean; // 新增 isHovered 状态
}

interface ImportButton {
    state: StateType;
    props: PropType
}

class ImportButton extends React.Component {
    constructor(props: PropType) {
        super(props);
        this.state = {
            disabled: props.disabled,
            isHovered: false, // 初始化 isHovered 为 false
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

    handleMouseEnter = () => {
        this.setState({ isHovered: true });
    }

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
    }

    render() {
        const { disabled, isHovered } = this.state;

        return (
            <PlusOutlined
                style={{
                    color: isHovered ? 'rgb(22, 119, 255)' : 'black', // 根据 isHovered 设置颜色
                    outline: 'none',
                    border: 'none',
                    margin: '0px 5px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    fontSize: 24
                }}
                disabled={this.state.disabled}
                onClick={ () => this.props.callback({ cmd: 'import-official-combo' })}
                onMouseEnter={this.handleMouseEnter} // 绑定 onMouseEnter 事件处理程序
                onMouseLeave={this.handleMouseLeave} // 绑定 onMouseLeave 事件处理程序
            />
        )
    }
}

export default ImportButton;