import React, { useState, useEffect, useRef } from 'react';
import { SettingOutlined, PlusOutlined, CloseCircleFilled } from '@ant-design/icons';
import {
    Card,
    Tag,
    Layout,
    theme,
    Col,
    Row,
    Space,
    Popover,
    Affix,
    Modal,
    Empty,
    Select,
    Typography,
    Button,
    message,
    Drawer,
    Tour
} from 'antd';
import {
    AI, Assistant, Assistant_Img, Search_Icon,
    Content_Description,
    Content_Img,
    Content_Title,
    Domain,
    Favicon, Form, Input,
    Link,
    Search,
    F_Copilots,
    All_Copilots, Copilots_Head, Copilots_Title, Copilots_Description, Copilots_Bottom
} from "@pages/newtab/Style";

import Setup from '@components/Setup'

const { Header, Content, Footer } = Layout;
const { Option } = Select;
const { Title } = Typography;

type MainProps = {
    news: string[];
    copilots: string[];
}

const Main: React.FC<MainProps> = ({ news, copilots }) => {
    const [setupShow, setSetupShow] = useState(false)
    const [query, setQuery] = useState('');
    const [activeTabKey, setActiveTabKey] = useState('News');
    const [placeholderText, setPlaceholderText] = useState("");
    const [isBingDisabled, setIsBingDisabled] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const copilot = () => {
        const result = localStorage.getItem("copilot");
        if (result === null || (result !== "Bing" && result !== "Google" && result !== "ChatGPT")) {
            localStorage.setItem("copilot", "Bing");
            return "Bing";
        }
        return result;
    }
    const [searchEngine, setSearchEngine] = useState(copilot());
    const [open, setOpen] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();

    const all = chrome.runtime.getURL('public/all.svg');
    const logo = chrome.runtime.getURL('public/logo.png');
    const backgroundImg = chrome.runtime.getURL('public/background.png');
    const webIcon = chrome.runtime.getURL('public/Web.svg');
    const GPT = chrome.runtime.getURL('public/GPT.png');
    const google = chrome.runtime.getURL('public/google.svg');
    const bing = chrome.runtime.getURL('public/bing.svg');

    const chatgpt = chrome.runtime.getURL('public/chatgpt-icon.png');
    const semanticscholar = chrome.runtime.getURL('public/semanticscholar.png');
    const perplexity = chrome.runtime.getURL('public/perplexity-ai.webp');
    const chatdoc = chrome.runtime.getURL('public/chatdoc.png');
    const deepL = chrome.runtime.getURL('public/DeepL.svg');
    const TourImage = chrome.runtime.getURL('public/Tour.png');

    const { CheckableTag } = Tag;
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const [openTour, setOpenTour] = useState(false);
    const steps = [
        {
            title: ' ',
            description: '您可以随时选择多种大语言模型和搜索引擎进行交互',
            cover: (
                <img
                    alt="tour.png"
                    src={TourImage}
                />
            ),
            target: () => ref1.current,
        },
        {
            title: ' ',
            description: '在这里您可以选择使用更多需要的AI助手并保存到新标签页',
            target: () => ref2.current,
        },
        {
            title: ' ',
            description: '在这里设置您的大语言模型和快捷键',
            target: () => ref3.current,
        },
    ];
    const init = [
        ["ChatGPT", "Chat", "https://chat.openai.com/chat"]
    ]


    let Favourite_Copilots: any = localStorage.getItem("Favourite");
    if (Favourite_Copilots == null) {
        let init: any = [
            ["ChatGPT", "https://chat.openai.com/chat", ["Chat"], chatgpt, "null", "ChatGPT，全称聊天生成型预训练变换模型（英語：Chat Generative Pre-trained Transformer），是OpenAI开发的人工智能聊天机器人程序，于2022年11月推出。 该程序使用基于GPT-3.5架构的大型语言模型並以强化学习训练。"],
            ["Perplexity", "https://www.perplexity.ai/", ["Search"], perplexity, "null", "Perplexity AI是一个人工智能搜索引擎。这是一个受OpenAI WebGPT启发的演示，不是商业产品。他们使用大型语言模型(OpenAI API)和搜索引擎。还通过将自然语言翻译为SQL代码来回答Twitter图形查询。"],
            ["ChatDoc", "https://chatdoc.com/", ["Document"], chatdoc, "null", "ChatDOC的优势在于，精准识别和解析PDF中的表格和段落，让AI回答都可以溯源至文档内容。后续还会支持图片、扫描件格式，以及多个文档交叉问答。"],
            ["DeepL", "https://www.deepl.com/translator?ref=allthingsai", ["Translate"], deepL, "null", "准确的翻译服务，即使是最细微的差别也能捕捉到。"],
            ["Semantic Scholar", "https://www.semanticscholar.org/", ["Research"], semanticscholar, "null", "一个免费的、人工智能驱动的科学文献研究工具"]
        ];
        init = JSON.stringify(init);
        localStorage.setItem("Favourite", init);
        Favourite_Copilots = localStorage.getItem("Favourite");
    }
    const Favourite = JSON.parse(Favourite_Copilots);
    const [favourite, setFavourites] = useState(Favourite);

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const tagsData1 = ['Movies', 'Books', 'Music', 'Sports'];
    const tagsData2 = ['Movies', 'Sports'];
    const tagsData3 = ['Movies', 'Books', 'Sports'];

    const handleInputChange = (event: any) => {
        setQuery(event.target.value);
    };

    const handleSearchEngineChange = (value: any) => {
        if (value === "Bing" || value === "Google" || value === "ChatGPT") {
            localStorage.setItem("copilot", value);
            setSearchEngine(value);
        }
    };

    const handleFormSubmit = (event: any) => {
        event.preventDefault();
        if (searchEngine === "Google") {
            window.location.href = `https://www.google.com/search?q=${query}`;

        } else if (searchEngine === "Bing" || searchEngine === "ChatGPT") {
            //接chatgpt面板

            chrome.runtime.sendMessage({
                cmd: 'open-bing-insight',
                data: {
                    url: `http://www.mix-copilot.com/?from=${searchEngine}`,
                    // url: 'https://www.bing.com/?setmkt=en-US&setlang=en-US',
                    fullscreen: true,
                    userInput: query
                }
            },
                response => {
                    console.log("Received response", response);
                }
            );

        }
    };

    const getBrowserLang = () => {
        const userLang = navigator.language;
        return userLang;
    };
    const BrowserLang = getBrowserLang();

    useEffect(() => {
        const getPlaceholderText = async () => {
            let isWork: any = true;
            // TODO chatgpt api的接入
            // if (searchEngine == 'Bing' || searchEngine == 'ChatGPT') {
            //     isWork = await BingIsWork(searchEngine);
            // }

            // setIsBingDisabled(searchEngine === "Bing" && !isWork);

            if (searchEngine === "Bing" && isWork == true) {
                setPlaceholderText("Ask Bing AI");
            } else if (searchEngine === "Bing" && isWork == false) {
                setPlaceholderText("请确保当前可运行Bing AI，或者切换为Google");
            } else if (searchEngine === "Google") {
                setPlaceholderText("Search Google");
            } else if (searchEngine === "ChatGPT") {
                setPlaceholderText("Ask ChatGPT");
            }
            //  else if (searchEngine === "ChatGPT" && isWork == false) {
            //     setPlaceholderText("请填写你的密钥");
            // }
        };

        getPlaceholderText();
        window.onfocus = function (e) {
            console.log('激活状态！')
            if (document.readyState == 'complete') getPlaceholderText();
        }
    }, [searchEngine]);

    const BingIsWork = (type = 'Bing') => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                cmd: 'chat-bot-init-by-type',
                data: {
                    type
                }
            }, response => {
                // console.log("Received response chat-bot-init-by-type-result", response);
                const isHas = !!(response && response.data && response.data.available && response.cmd == 'chat-bot-init-by-type-result');
                console.log(`#${type} available`, isHas ? 1 : 2, response)
                if (isHas) {
                    resolve(isHas);
                } else {
                    setTimeout(() => chrome.runtime.sendMessage({
                        cmd: 'chat-bot-init-by-type',
                        data: { type }
                    }, response => {
                        // console.log("Received response chat-bot-init-by-type", response);
                        const isHas = !!(response && response.data && response.data.available && response.cmd == 'chat-bot-init-by-type-result');
                        resolve(isHas);
                    }), 3000)
                }
            });
        });
    };
    const handleTabChange = (key: any) => {
        setActiveTabKey(key);
    }

    const handleTour = () => {
        setOpenTour(false);
        setSetupShow(true)
    }

    const initTour = () => {
        const result = localStorage.getItem("haveInit");
        if (result !== "true") {
            setOpenTour(true);
            localStorage.setItem("haveInit", "true");
            console.log(openTour);
        }
        return null;
    }

    const Show_Favourite_Copilots = (key: any) => {
        const [showCloseButton, setShowCloseButton] = useState<string | null>(null);
        const [currentHoverIndex, setCurrentHoverIndex] = useState(-1);

        const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>, title: string) => {
            event.stopPropagation();
            event.preventDefault();
            const updatedFavourites = favourite.filter((fav: string[]) => fav[0] !== title);
            console.log(updatedFavourites);
            setFavourites(updatedFavourites);
            setCurrentHoverIndex(-1);
            localStorage.setItem("Favourite", JSON.stringify(updatedFavourites));
        };

        const handleMouseEnter = (index: number) => {
            setCurrentHoverIndex(index);
        };

        const handleMouseLeave = () => {
            setCurrentHoverIndex(-1);
        };

        if (key == 1) {
            const results = Favourite.map((value: any) => {
                const title = value[0];
                const url = value[1];
                const image_url = value[3];
                const description_EN = value[4];
                const description_CN = value[5];

                let description;
                if (BrowserLang == 'zh-CN') {
                    description = description_CN;
                } else {
                    description = description_CN; //屏蔽英文
                }
                return (
                    <Popover key={value}
                        content={
                            <div style={{ width: 200 }}>
                                <p>{description}</p>
                            </div>
                        }
                        title={title}>
                        <Link href={url}>
                            <Assistant>
                                <Assistant_Img
                                    src={image_url}
                                    onError={(e: any) => {
                                        e.target.src = webIcon; // 设置黑色图像的URL
                                    }}
                                    alt={title} />
                                <br />
                                <text style={{ fontSize: "small" }}>{title}</text>
                            </Assistant>
                        </Link>
                    </Popover>
                )
            });
            const add = (<Link onClick={showModal}>
                <Assistant ref={ref2}>
                    <Assistant_Img src={all} alt="all" />
                    <text style={{ fontSize: "small" }}>More</text>
                </Assistant>
            </Link>);
            results.push(add);
            return results; // 确保 hook 完全调用后再返回组件

        } else if (key == 2) {
            const results = favourite.map((value: any, index: number) => {
                const showCloseButton = currentHoverIndex === index;
                // console.log('showCloseButton',showCloseButton,currentHoverIndex,index)
                const title = value[0];
                const url = value[1];
                const image_url = value[3];

                return (
                    <Link key={value} href={url}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => handleMouseLeave()}
                    >
                        <Assistant
                            onMouseEnter={() => setShowCloseButton(title)}
                            onMouseLeave={() => setShowCloseButton(null)}
                        >
                            {showCloseButton && (
                                <Button
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        border: "none",
                                    }}
                                    size={"small"}
                                    shape="circle"
                                    danger
                                    onClick={(event: any) => handleButtonClick(event, title)}
                                    icon={<CloseCircleFilled />}
                                />
                            )}
                            <Assistant_Img
                                src={image_url}
                                onError={(e: any) => {
                                    e.target.src = webIcon; // 设置黑色图像的URL
                                }}
                                alt={title} />
                            <br />
                            <text style={{ fontSize: "small" }}>{title}</text>
                        </Assistant>
                    </Link>
                );
            });
            return results; // 确保 hook 完全调用后再返回组件
        }
    }

    class CopilotCard extends React.Component<{
        handleButtonClick: any, index: number, url: string,
        image_url: string, title: string, description: string, tag: string
    }, {
        showCloseButton: boolean
    }>  {
        constructor(props: any) {
            super(props)
            this.state = {
                showCloseButton: false
            }
        }

        setShowCloseButton(b: boolean) {
            this.setState({
                showCloseButton: b
            })
        }

        render() {
            const { showCloseButton } = this.state;
            const { index, url, image_url, title, description, tag, handleButtonClick } = this.props;
            return (
                <Col key={index} xs={24} sm={24} md={12} lg={8} xl={6} xxl={4}>
                    <Link href={url}>
                        <Card
                            hoverable={true}
                            bodyStyle={{ padding: 12 }}
                            style={{ marginBottom: 20 }}
                            onMouseEnter={() => this.setShowCloseButton(true)}
                            onMouseLeave={() => this.setShowCloseButton(false)}
                        >
                            <Copilots_Head>
                                <Assistant_Img
                                    src={image_url}
                                    alt={title}
                                    onError={(e: any) => {
                                        e.target.src = webIcon; // 设置黑色图像的URL
                                    }}
                                />
                                <Copilots_Title>{title}</Copilots_Title>
                            </Copilots_Head>
                            <Copilots_Description>{description}</Copilots_Description>
                            <Copilots_Bottom>
                                <Tag style={{ fontSize: "small", padding: 4 }}>{tag}</Tag>

                                <Button
                                    style={{
                                        position: "absolute",
                                        bottom: 12,
                                        right: 12,
                                        display: showCloseButton ? 'inline-block' : 'none'
                                    }}
                                    onClick={handleButtonClick}
                                    shape="circle"
                                    icon={<PlusOutlined />}
                                />

                            </Copilots_Bottom>
                        </Card>
                    </Link>
                </Col>
            )
        }
    }

    const renderCopilots = () => {
        let data: any = localStorage.getItem("Favourite");
        data = data ? JSON.parse(data) : [];
        const count = data.length;
        // console.log('copilots', copilots);
        if (copilots && copilots.length > 0) {
            const results = Array.from(copilots, (value, index) => {
                const [title, url, tag, image_url, description_EN, description_CN] = value;
                const description = BrowserLang === 'zh-CN' ? description_CN : description_CN;
                const warning = BrowserLang === 'zh-CN' ? '首页最多显示5个Copilots' : 'The homepage displays up to 5 Copilots';
                const warning1 = BrowserLang === 'zh-CN' ? '已经选中该Copilots' : 'The Copilots has been selected';

                const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
                    // 处理按钮点击事件
                    event.stopPropagation();
                    event.preventDefault(); // 防止链接跳转
                    if (count > 4) {
                        messageApi.open({
                            type: 'warning',
                            content: warning,
                        });
                    } else {
                        if (favourite.includes(value)) {
                            messageApi.open({
                                type: 'warning',
                                content: warning1,
                            });
                        } else {
                            const updatedFavourites = [...favourite, value];
                            setFavourites(updatedFavourites);
                            localStorage.setItem("Favourite", JSON.stringify(updatedFavourites));
                        }

                    }
                };
                return (<CopilotCard
                    handleButtonClick={handleButtonClick}
                    index={index}
                    title={title}
                    description={description}
                    tag={tag} url={url}
                    image_url={image_url}
                />
                )
            })

            return results

        }

    }


    const renderContent = () => {
        let number = 0;
        const activeTab = activeTabKey;
        const results = news.map((value) => {
            let url;
            if (activeTab == "News") {
                url = value[1];
            } else {
                url = value[1] + "?blockId=" + value[2] + "&reader=1";
            }
            const image_url = value[4];
            const favicon_url = value[5];
            const title = value[0];
            const description = value[6];
            const domain = value[1].split("/")[2];
            const tagArray = value[3];
            if (activeTab == tagArray) {
                number++;
                const result = (
                    <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                        <Link href={url} key={value}>
                            <Card
                                hoverable
                                style={{ marginTop: 10, marginBottom: 10 }}
                                cover={<Content_Img
                                    src={image_url}
                                    alt={title}
                                    onError={(e: any) => {
                                        e.target.src = backgroundImg; // 设置黑色图像的URL
                                    }} />}
                                bodyStyle={{ padding: 16 }}
                            >
                                <Content_Title>{title}</Content_Title>
                                {description !== "null" ? (
                                    <Content_Description>{description}</Content_Description>
                                ) : null}
                                <Domain>
                                    <Favicon src={favicon_url} alt={"tab icon"} onError={(e: any) => {
                                        e.target.src = webIcon; // 设置黑色图像的URL
                                    }} />
                                    {domain}
                                </Domain>
                            </Card>
                        </Link>
                    </Col>
                )
                return result;
            }
        })
        if (number == 0) {
            return (
                <Row
                    gutter={{
                        xs: 8,
                        sm: 16,
                        md: 24,
                        lg: 24,
                    }}
                    style={{ marginTop: 10 }}
                    justify={"center"}
                >
                    <Empty style={{ marginTop: 100 }} />
                </Row>
            )
        } else {
            return (<Row
                gutter={{
                    xs: 8,
                    sm: 16,
                    md: 24,
                    lg: 24,
                }}
                style={{ marginTop: 10 }}
                justify={"start"}
            >
                {results}
            </Row>
            )
        }

    };

    const [selectedTags, setSelectedTags] = useState(['Books']);
    const handleChange = (tag: string, checked: boolean) => {
        const nextSelectedTags = checked
            ? [...selectedTags, tag]
            : selectedTags.filter((t) => t !== tag);
        console.log('You are interested in: ', nextSelectedTags);
        setSelectedTags(nextSelectedTags);
    };
    const children1 = (
        <>
            <Row>
                <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>
                <Col xs={24} sm={24} md={22} lg={22} xl={20} xxl={18}>
                    <Space size={[0, 8]} wrap>
                        {tagsData1.map((tag) => (
                            <CheckableTag
                                key={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={(checked) => handleChange(tag, checked)}
                                style={{ fontSize: 16 }}
                            >
                                {tag}
                            </CheckableTag>
                        ))}
                    </Space>
                </Col>
                <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>
            </Row>
        </>
    )

    const children2 = (
        <>
            <Row>
                <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>
                <Col xs={24} sm={24} md={22} lg={22} xl={20} xxl={18}>
                    <Space size={[0, 8]} wrap>
                        {tagsData2.map((tag) => (
                            <CheckableTag
                                key={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={(checked) => handleChange(tag, checked)}
                                style={{ fontSize: 16 }}
                            >
                                {tag}
                            </CheckableTag>
                        ))}
                    </Space>
                </Col>
                <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>
            </Row>
        </>
    )

    const children3 = (
        <>
            <Row>
                <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>
                <Col xs={24} sm={24} md={22} lg={22} xl={20} xxl={18}>
                    <Space size={[0, 8]} wrap>
                        {tagsData3.map((tag) => (
                            <CheckableTag
                                key={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={(checked) => handleChange(tag, checked)}
                                style={{ fontSize: 16 }}
                            >
                                {tag}
                            </CheckableTag>
                        ))}
                    </Space>
                </Col>
                <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>
            </Row>
        </>
    )
    const items = [
        {
            key: 'News',
            label: `科技资讯`,
            children: "",
        },
        {
            key: 'Paper',
            label: `论文分析`,
            children: "",
        },
        {
            key: 'Patent',
            label: `专利分析`,
            children: "",
        },
        {
            key: 'Interview',
            label: `个人访谈`,
            children: "",
        },
        {
            key: '报告',
            label: `报告分析`,
            children: "",
        },
    ];

    return (
        <Layout className="layout">
            <Header
                style={{
                    backgroundColor: colorBgContainer,
                    // boxShadow: '0 1px 2px 0 rgba(0,0,0,.2)',
                    position: 'fixed',
                    zIndex: 1,
                    width: '100%',
                    display: "flex"
                }}
            >
                {/*<Logo src={logo} alt="logo"/>*/}
                <Button ref={ref3} style={{
                    border: "none", position: "absolute", fontSize: 20, top: 10, right: 20, outline: 'none',
                    boxShadow: 'none'
                }}
                    icon={<SettingOutlined />}
                    onClick={() => setSetupShow(true)}
                />
            </Header>
            <Content
                style={{
                    padding: '0 50px',
                    backgroundColor: colorBgContainer,
                }}
            >
                <Search>
                    <img src={logo} style={{ width: 100, marginBottom: 30 }} />
                    <Affix offsetTop={7}>
                        <Form ref={ref1}>
                            <Select bordered={false} value={searchEngine} onChange={handleSearchEngineChange}>
                                <Option value="Bing">
                                    <Search_Icon src={bing} alt="Bing logo" />
                                </Option>
                                <Option value="Google">
                                    <Search_Icon src={google} alt="Google logo" />
                                </Option>
                                <Option value="ChatGPT">
                                    <Search_Icon src={GPT} alt="GPT logo" />
                                </Option>
                            </Select>
                            <form onSubmit={handleFormSubmit}>
                                <Input
                                    type="text"
                                    placeholder={placeholderText}
                                    value={query}
                                    onChange={handleInputChange}
                                    disabled={searchEngine === "Bing" ? isBingDisabled : false}
                                />

                                {/* https://www.bing.com/?setmkt=en-US&setlang=en-US */}
                            </form>
                        </Form>
                    </Affix>
                </Search>
                <AI>

                    {setupShow ? <Drawer
                        closable={false}
                        maskClosable={false}
                        mask={false}
                        open={setupShow}
                        onClose={(action: any) => setSetupShow(false)}
                        width="fit-content"
                        bodyStyle={{ padding: 0, }}
                    >
                        <Setup
                            callback={(action: any) => setSetupShow(false)} />

                    </Drawer> : ''}

                    {Show_Favourite_Copilots(1)}
                    <Modal
                        open={open}
                        onCancel={handleCancel}
                        width="80%"
                        style={{ top: 40 }}
                        footer={null}
                    >
                        <Title level={3}>Favourite Copilots</Title>
                        <F_Copilots>
                            {contextHolder}
                            {Show_Favourite_Copilots(2)}
                        </F_Copilots>
                        <Title level={3}>ALL Copilots</Title>
                        <All_Copilots>
                            <Row gutter={{
                                xs: 8,
                                sm: 16,
                                md: 24,
                                lg: 24,
                            }}>
                                {open ? renderCopilots() : ''}
                            </Row>
                        </All_Copilots>
                    </Modal>
                </AI>
                {/*<Affix offsetTop={64}>*/}
                {/*    <Tabs style={{backgroundColor: colorBgContainer, paddingBottom: 10}}*/}
                {/*          centered*/}
                {/*          defaultActiveKey="News"*/}
                {/*          size='large'*/}
                {/*          onChange={handleTabChange}*/}
                {/*          items={items}/>*/}
                {/*</Affix>*/}
                {/*<Row*/}
                {/*    style={{minHeight: 800}}*/}
                {/*>*/}
                {/*    <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>*/}
                {/*    <Col xs={24} sm={24} md={22} lg={22} xl={20} xxl={18}>*/}
                {/*        {renderContent()}*/}
                {/*    </Col>*/}
                {/*    <Col xs={0} sm={0} md={1} lg={1} xl={2} xxl={3}></Col>*/}
                {/*</Row>*/}

            </Content>
            <Tour arrow={false} open={openTour} steps={steps} onClose={() => { setOpenTour(false); setSetupShow(true) }}
                onFinish={() => setSetupShow(true)} />
            {initTour()}
            <Footer
                style={{
                    textAlign: 'center',
                    backgroundColor: colorBgContainer,
                }}
            >
            </Footer>
        </Layout>
    )
        ;
}

export default Main;
