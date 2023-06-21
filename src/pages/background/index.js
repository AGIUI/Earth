import NewBing from '@components/background/NewBing'
import ChatGPT from '@components/background/ChatGPT'
import ChatBot from '@components/background/ChatBot'
import Agent from "@components/background/Agent";
import Credit from "@components/background/Credit"
import Common from '@components/background/Common'

import { getConfig, chromeStorageGet } from '@components/Utils';
import commonsConfig from '@src/config/commonsConfig.json'
import editableConfig from '@src/config/editableConfig.json'
import selectionConfig from '@src/config/selectionConfig.json'
import config from '@src/config/app.json'

import i18n from 'i18next';
import '@src/locales/i18nConfig'

const _CONFIG_JSON = getConfig()

async function loadContextMenuData() {

    let Menu = [];
    let pdfConfig = [];
    let linkConfig = [];
    let imageConfig = [];
    let videoConfig = [];
    let audioConfig = [];
    let frameConfig = [];
    let launcherConfig = [];
    let browser_actionConfig = [];
    let page_actionConfig = [];
    let actionConfig = [];

    const res = await chromeStorageGet(['user', 'official']);
    let Workflow = [];

    if (res['user'] && res['user'].length > 0) {
        for (let i in res['user']) {
            const infs = res['user'][i].interfaces && res['user'][i].interfaces;

            if (infs.includes('contextMenus') ||
                infs.includes('contextMenus-page') ||
                infs.includes('contextMenus-all')
            ) {
                Workflow.push(res['user'][i])
            } else if (infs.includes('contextMenus-selection')) {
                selectionConfig.push(res['user'][i]);
            } else if (infs.includes('contextMenus_editable')) {
                editableConfig.push(res['user'][i]);
            } else if (infs.includes('contextMenus-pdf')) {
                pdfConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-link')) {
                linkConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-image')) {
                imageConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-video')) {
                videoConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-audio')) {
                audioConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-frame')) {
                frameConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-launcher')) {
                launcherConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-browser_action')) {
                browser_actionConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-page_action')) {
                page_actionConfig.push(res['user'][i])
            } else if (infs.includes('contextMenus-action')) {
                actionConfig.push(res['user'][i])
            }

        }
    }

    if (res['official'] && res['official'].length > 0) {
        for (let i in res['official']) {

            const infs = res['official'][i].interfaces && res['official'][i].interfaces;

            if (infs.includes('contextMenus') ||
                infs.includes('contextMenus-page') ||
                infs.includes('contextMenus-all')) {
                Workflow.push(res['official'][i])
            } else if (infs.includes('contextMenus-selection')) {
                selectionConfig.push(res['official'][i]);
            } else if (infs.includes('contextMenus_editable')) {
                editableConfig.push(res['official'][i]);
            } else if (infs.includes('contextMenus-pdf')) {
                pdfConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-link')) {
                linkConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-image')) {
                imageConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-video')) {
                videoConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-audio')) {
                audioConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-frame')) {
                frameConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-launcher')) {
                launcherConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-browser_action')) {
                browser_actionConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-page_action')) {
                page_actionConfig.push(res['official'][i])
            } else if (infs.includes('contextMenus-action')) {
                actionConfig.push(res['official'][i])
            }
        }
    }

    Menu.push(...commonsConfig);
    Menu.push(...editableConfig);
    Menu.push(...selectionConfig);
    Menu.push(...Workflow);
    Menu.push(...pdfConfig);
    Menu.push(...linkConfig);
    Menu.push(...imageConfig);
    Menu.push(...videoConfig);
    Menu.push(...audioConfig);
    Menu.push(...frameConfig);
    Menu.push(...launcherConfig);
    Menu.push(...browser_actionConfig);
    Menu.push(...page_actionConfig);
    Menu.push(...actionConfig);

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: config.app,
        title: config.app,
        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: 'open-chatbot-panel',
        title: i18n.t('openPanel'),
        type: 'normal',

        parentId: config.app,

        contexts: ['page']
    })

    if (commonsConfig.length !== 0) {
        chrome.contextMenus.create({
            id: 'commonsConfig',
            title: i18n.t('commonFeatures'),
            type: 'normal',

            parentId: config.app,

            contexts: ['page']
        });

        for (let i in commonsConfig) {
            chrome.contextMenus.create({
                id: String(commonsConfig[i].id),
                title: i18n.t(commonsConfig[i].tag),
                type: 'normal',
                parentId: 'commonsConfig'
            })
        }
    }

    if (Workflow.length !== 0) {
        chrome.contextMenus.create({
            id: 'Workflow',
            title: i18n.t('workflow'),
            type: 'normal',

            parentId: config.app,

            contexts: ['page']
        });
        for (let i in Workflow) {
            chrome.contextMenus.create({
                id: String(Workflow[i].id),
                title: i18n.t(Workflow[i].tag) ? i18n.t(Workflow[i].tag) : Workflow[i].tag,
                type: 'normal',
                parentId: 'Workflow'
            })
        }
    }

    if (selectionConfig.length !== 0) {
        for (let i in selectionConfig) {
            chrome.contextMenus.create({
                id: String(selectionConfig[i].id),
                title: i18n.t(selectionConfig[i].tag) ? i18n.t(selectionConfig[i].tag) : selectionConfig[i].tag,
                contexts: ['selection']
            })
        }
    }

    if (editableConfig.length !== 0) {
        for (let i in editableConfig) {
            chrome.contextMenus.create({
                id: String(editableConfig[i].id),
                title: i18n.t(editableConfig[i].tag) ? i18n.t(editableConfig[i].tag) : editableConfig[i].tag,
                contexts: ['editable'],
            })
        }
    }

    if (pdfConfig.length !== 0) {
        for (let i in pdfConfig) {
            chrome.contextMenus.create({
                id: String(pdfConfig[i].id),
                title: i18n.t(pdfConfig[i].tag) ? i18n.t(pdfConfig[i].tag) : pdfConfig[i].tag,
                contexts: ["all"],
                targetUrlPatterns: ["*://*/*.pdf"]
            })
        }
    }

    if (linkConfig.length !== 0) {
        for (let i in linkConfig) {
            chrome.contextMenus.create({
                id: String(linkConfig[i].id),
                title: i18n.t(linkConfig[i].tag) ? i18n.t(linkConfig[i].tag) : linkConfig[i].tag,
                contexts: ['link'],
            })
        }
    }

    if (imageConfig.length !== 0) {
        for (let i in imageConfig) {
            chrome.contextMenus.create({
                id: String(imageConfig[i].id),
                title: i18n.t(imageConfig[i].tag) ? i18n.t(imageConfig[i].tag) : imageConfig[i].tag,
                contexts: ['image'],
            })
        }
    }

    if (videoConfig.length !== 0) {
        for (let i in videoConfig) {
            chrome.contextMenus.create({
                id: String(videoConfig[i].id),
                title: i18n.t(videoConfig[i].tag) ? i18n.t(videoConfig[i].tag) : videoConfig[i].tag,
                contexts: ['video'],
            })
        }
    }

    if (audioConfig.length !== 0) {
        for (let i in audioConfig) {
            chrome.contextMenus.create({
                id: String(audioConfig[i].id),
                title: i18n.t(audioConfig[i].tag) ? i18n.t(audioConfig[i].tag) : audioConfig[i].tag,
                contexts: ['audio'],
            })
        }
    }

    if (frameConfig.length !== 0) {
        for (let i in frameConfig) {
            chrome.contextMenus.create({
                id: String(frameConfig[i].id),
                title: i18n.t(frameConfig[i].tag) ? i18n.t(frameConfig[i].tag) : frameConfig[i].tag,
                contexts: ['frame'],
            })
        }
    }

    if (launcherConfig.length !== 0) {
        for (let i in launcherConfig) {
            chrome.contextMenus.create({
                id: String(launcherConfig[i].id),
                title: i18n.t(launcherConfig[i].tag) ? i18n.t(launcherConfig[i].tag) : launcherConfig[i].tag,
                contexts: ['launcher'],
            })
        }
    }

    if (browser_actionConfig.length !== 0) {
        for (let i in browser_actionConfig) {
            chrome.contextMenus.create({
                id: String(browser_actionConfig[i].id),
                title: i18n.t(browser_actionConfig[i].tag) ? i18n.t(browser_actionConfig[i].tag) : browser_actionConfig[i].tag,
                contexts: ['browser_action'],
            })
        }
    }

    if (page_actionConfig.length !== 0) {
        for (let i in page_actionConfig) {
            chrome.contextMenus.create({
                id: String(page_actionConfig[i].id),
                title: i18n.t(page_actionConfig[i].tag) ? i18n.t(page_actionConfig[i].tag) : page_actionConfig[i].tag,
                contexts: ['page_action'],
            })
        }
    }

    if (actionConfig.length !== 0) {
        for (let i in actionConfig) {
            chrome.contextMenus.create({
                id: String(actionConfig[i].id),
                title: i18n.t(actionConfig[i].tag) ? i18n.t(actionConfig[i].tag) : actionConfig[i].tag,
                contexts: ['action'],
            })
        }
    }

    return Menu;

}

(async() => {

    let Menu = await loadContextMenuData();

    // chrome.commands.getAll().then(commands => {
    //     let isNew = true
    //     for (let command of commands) {
    //         // console.log('command', command)
    //         if (command.name == 'open-chatbot-panel') isNew = false
    //     }
    //     if (isNew) {
    //         chrome.contextMenus.create({
    //             id: 'open-chatbot-panel',
    //             title: json.app,
    //             type: 'normal',
    //             contexts: ['page']
    //         })
    //     }
    // })

    chrome.runtime.onInstalled.addListener(details => {
        console.log(
            `chrome.runtime.onInstalled ${chrome.runtime.id} ${JSON.stringify(
                details,
                null,
                2
            )}`
        )
        if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
            chrome.runtime.setUninstallURL(_CONFIG_JSON.discord)
        }
        return true
    })

    // chrome.runtime.onStartup.addListener(async () => {
    //   console.log(`chrome.runtime.onStartup ${chrome.runtime.id}`)
    //   return true
    // });

    chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
        if (request.cmd === 'update-chromeStorage-data') {
            Menu = await loadContextMenuData();
        }
    })

    chrome.contextMenus.onClicked.addListener(async(item, tab) => {
        const from = 'contextMenus';
        const tabId = tab.id;
        const id = item.menuItemId
        if (!tab.url.match('http')) return

        if (id === 'open-chatbot-panel') {
            chrome.tabs.sendMessage(
                tabId, {
                    cmd: 'open-chatbot-panel',
                    success: true,
                    data: true
                },
                function(response) {
                    // console.log(response)
                }
            )
        } else {
            chrome.tabs.sendMessage(
                tabId, {
                    cmd: 'open-chatbot-panel',
                    success: true,
                    data: true
                },
                function(response) {
                    // console.log(response)
                }
            )

            for (let i in Menu) {
                if (id == Menu[i].id) {
                    let PromptJson = Menu[i];
                    if (PromptJson.interfaces.includes("contextMenus-selection")) {
                        const context = item.selectionText;
                        console.log("context", context);
                        if (context) {
                            // 从用户输入获取文本 , 
                            // 需要设置 prompt.input == "userInput"
                            PromptJson.prompt.input = "userInput";
                            PromptJson.prompt.userInput = context;
                            // console.log("PromptJson", PromptJson.prompt.userInput);
                            // "###相关内容###\n" + context + "\n" + PromptJson.text
                        }
                    }
                    console.log("PromptJson", PromptJson);

                    chrome.tabs.sendMessage(
                        tabId, {
                            cmd: 'contextMenus',
                            success: true,
                            data: {
                                cmd: 'combo',
                                data: {
                                    '_combo': PromptJson,
                                    from,
                                    prompt: PromptJson.prompt,
                                    tag: PromptJson.tag,
                                    newTalk: true
                                }
                            }
                        },
                        function(response) {
                            // console.log(response)
                        }
                    )
                }
            }
        }
    })

    const chatBot = new ChatBot({
        items: []
    })

    const chatGPT = new ChatGPT()
    const bingBot = new NewBing()
    chatBot.add(bingBot)
    chatBot.add(chatGPT)
        // 初始化
    chatBot.getAvailables()

    new Common(_CONFIG_JSON, chatBot, Agent, Credit)
})()