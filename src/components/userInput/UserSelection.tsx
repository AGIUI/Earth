import * as React from "react";

type PropType = {
    name: string;
    [propName: string]: any;
}

type StateType = {
    name: string;
}

interface UserSelection {
    state: StateType;
    props: PropType
}

class UserSelection extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: this.props.name || 'UserSelection'
        }
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: { name: string; }, prevState: any) {
        if (
            this.props.name !== prevProps.name
        ) {
            // this.destroyConnection();
            // this.setupConnection();
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    _get() {
        const selObj: any = window.getSelection();
        let textContent = selObj.type !== 'None' ? (selObj.getRangeAt(0)).startContainer.textContent : '';
        return textContent.trim();
    }

    render() {
        return (
            <div className="test">
                <div>
                    <span>hello world ~ ${this.state.name}</span>
                </div>
            </div>
        );
    }
}

export default UserSelection;