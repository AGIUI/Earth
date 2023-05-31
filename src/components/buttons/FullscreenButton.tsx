import * as React from "react";
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

type PropType = {
    disabled: boolean;
    callback: any;
    [propName: string]: any;
}

type StateType = {
    disabled: boolean;
    fullscreen: boolean;
    isHovered: boolean; // 新增 isHovered 状态
}

class FullscreenButton extends React.Component<PropType, StateType> {
    constructor(props: PropType) {
        super(props);
        this.state = {
            disabled: props.disabled,
            fullscreen: props.fullscreen,
            isHovered: false, // 初始化 isHovered 为 false
        }
    }

    componentDidUpdate(prevProps: PropType) {
        if (this.props.disabled !== prevProps.disabled) {
            this.setState({ disabled: this.props.disabled })
        }

        if (this.props.fullscreen !== prevProps.fullscreen) {
            this.setState({ fullscreen: this.props.fullscreen })
        }
    }

    handleMouseEnter = () => {
        this.setState({ isHovered: true });
    }

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
    }

    render() {
        const { disabled, fullscreen, isHovered } = this.state;

        return (
            <>
                {fullscreen ? (
                    <FullscreenExitOutlined
                        style={{
                            color: isHovered ? 'rgb(22, 119, 255)' : 'black', // 根据 isHovered 设置颜色
                            outline: 'none',
                            border: 'none',
                            margin: '0px 5px',
                            boxShadow: 'none',
                            cursor: 'pointer',
                            fontSize: 24
                        }}
                        onClick={() => this.props.callback({ cmd: 'toggle-fullscreen' })}
                        onMouseEnter={this.handleMouseEnter} // 绑定 onMouseEnter 事件处理程序
                        onMouseLeave={this.handleMouseLeave} // 绑定 onMouseLeave 事件处理程序
                    />
                ) : (
                    <FullscreenOutlined
                        style={{
                            color: isHovered ? 'rgb(22, 119, 255)' : 'black', // 根据 isHovered 设置颜色
                            outline: 'none',
                            border: 'none',
                            margin: '0px 5px',
                            boxShadow: 'none',
                            cursor: 'pointer',
                            fontSize: 24
                        }}
                        onClick={() => this.props.callback({ cmd: 'toggle-fullscreen' })}
                        onMouseEnter={this.handleMouseEnter} // 绑定 onMouseEnter 事件处理程序
                        onMouseLeave={this.handleMouseLeave} // 绑定 onMouseLeave 事件处理程序
                    />
                )}
            </>
        );
    }
}

export default FullscreenButton;
