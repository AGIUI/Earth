import * as React from "react";
import { Card, Button } from 'antd';
const { Meta } = Card;

class ChatBotMiniCard extends React.Component<{
    title: string,
    yes: any,
    no: any
}, {
    open: boolean
}> {
    constructor(props: any) {
        super(props)
        this.state = {
            open: false
        }
    }

    componentDidMount(): void {

        setTimeout(() => {
            this.setState({
                open: true
            });
            setTimeout(() => this.setState({
                open: false
            }), 8000)
        }, 2000)
    }

    render() {
        return <>
            {this.state.open ? <Card
                className="my_te"
                bordered={false}
                style={{
                    position: 'fixed',
                    bottom: '44px',
                    right: '44px',
                    zIndex: 9999,
                    width: 200,
                    height: 132
                }}

                hoverable
            // cover={<img alt="example" src={chrome.runtime.getURL('public/logo.png')} />}

            >
                <div style={{
                    display: 'flex',
                    marginBottom: '12px'
                }}>
                    <img style={{
                        width: '36px',
                        height: 'fit-content',
                        marginRight: '12px'
                    }} src={chrome.runtime.getURL('public/logo.png')} />
                    <Meta title={this.props.title}
                        description="" />
                </div>

                <div style={{
                    display: 'flex'
                }}><Button style={{
                    marginRight: '32px',
                    'minWidth': '66px'
                }} type="primary"
                    onClick={() => {
                        if (this.props.yes) this.props.yes();
                        this.setState({
                            open: false
                        })
                    }}>是</Button>
                    <Button onClick={() => {
                        if (this.props.no) this.props.no();
                        this.setState({
                            open: false
                        })
                    }}>否</Button></div>

            </Card> : ''}
        </>
    }
}

export default ChatBotMiniCard;
