import * as React from "react";
import { DownSquareOutlined } from '@ant-design/icons';

type PropType = {
    disabled: boolean;
    callback: any;
    onClick: (e: React.MouseEvent) => void;
    [propName: string]: any;
}

type StateType = {
    isHovered: boolean;
}

class DownSquareButton extends React.Component<PropType, StateType> {
    state: StateType = {
        isHovered: false
    };

    handleMouseEnter = () => {
        this.setState({ isHovered: true });
    }

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
    }

    render() {
        const { onClick, ...restProps } = this.props;
        const { isHovered } = this.state;
        return (
            <DownSquareOutlined
                style={{
                    color: isHovered ? 'rgb(22, 119, 255)' : 'black',
                    outline: 'none',
                    border: 'none',
                    margin: '0px 5px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    fontSize: 16
                }}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                onClick={onClick}
                {...restProps}
            />
        );
    }
}

export default DownSquareButton;
