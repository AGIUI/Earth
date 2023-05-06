import * as React from "react";

type PropType = {
    name: string;
    [propName: string]: any;
}

type StateType = {
    name: string;
}

interface Template {
    state: StateType;
    props: PropType
}

class Template extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: this.props.name || 'template'
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

export default Template;