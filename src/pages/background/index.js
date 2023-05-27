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

const _CONFIG_JSON = getConfig()

async function loadContextMenuData() {

    let Menu = [];
    let pdfConfig = [];
    let linkConfig = [];

    const res = await chromeStorageGet(['user', 'official']);
    let Workflow = [];

    if (res['user'] && res['user'].length > 0) {
        for (let i in res['user']) {
            if (res['user'][i].interfaces && res['user'][i].interfaces.includes('contextMenus')) {
                Workflow.push(res['user'][i])
            } else if (res['user'][i].interfaces && res['user'][i].interfaces.includes('contextMenus_Selection')) {
                selectionConfig.push(res['user'][i]);
            } else if (res['user'][i].interfaces && res['user'][i].interfaces.includes('contextMenus_Editable')) {
                editableConfig.push(res['user'][i]);
            } else if (res['user'][i].interfaces && res['user'][i].interfaces.includes('contextMenus_PDF')) {
                pdfConfig.push(res['user'][i])
            } else if (res['user'][i].interfaces && res['user'][i].interfaces.includes('contextMenus_Link')) {
                linkConfig.push(res['user'][i])
            }
        }
    }

    if (res['official'] && res['official'].length > 0) {
        for (let i in res['official']) {
            if (res['official'][i].interfaces && res['official'][i].interfaces.includes('contextMenus')) {
                Workflow.push(res['official'][i])
            } else if (res['official'][i].interfaces && res['official'][i].interfaces.includes('contextMenus_Selection')) {
                selectionConfig.push(res['official'][i]);
            } else if (res['official'][i].interfaces && res['official'][i].interfaces.includes('contextMenus_Editable')) {
                editableConfig.push(res['official'][i]);
            } else if (res['official'][i].interfaces && res['official'][i].interfaces.includes('contextMenus_PDF')) {
                pdfConfig.push(res['official'][i])
            } else if (res['official'][i].interfaces && res['official'][i].interfaces.includes('contextMenus_Link')) {
                linkConfig.push(res['official'][i])
            }
        }
    }

    Menu.push(...commonsConfig);
    Menu.push(...editableConfig);
    Menu.push(...selectionConfig);
    Menu.push(...Workflow);
    Menu.push(...pdfConfig);
    Menu.push(...linkConfig);

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({

        id: 'Earth',
        title: 'Earth',

        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: 'toggle-insight',
        title: "打开面板",
        type: 'normal',

        parentId: 'Earth',

        contexts: ['page']
    })

    if (commonsConfig.length !== 0) {
        chrome.contextMenus.create({
            id: 'commonsConfig',
            title: '常用功能',
            type: 'normal',

            parentId: 'Earth',

            contexts: ['page']
        });

        for (let i in commonsConfig) {
            chrome.contextMenus.create({
                id: String(commonsConfig[i].id),
                title: commonsConfig[i].tag,
                type: 'normal',
                parentId: 'commonsConfig'
            })
        }
    }

    if (Workflow.length !== 0) {
        chrome.contextMenus.create({
            id: 'Workflow',
            title: '工作流',
            type: 'normal',

            parentId: 'Earth',

            contexts: ['page']
        });
        for (let i in Workflow) {
            chrome.contextMenus.create({
                id: String(Workflow[i].id),
                title: Workflow[i].tag,
                type: 'normal',
                parentId: 'Workflow'
            })
        }
    }

    if (selectionConfig.length !== 0) {
        for (let i in selectionConfig) {
            chrome.contextMenus.create({
                id: String(selectionConfig[i].id),
                title: selectionConfig[i].tag,
                contexts: ['selection']
            })
        }
    }

    if (editableConfig.length !== 0) {
        for (let i in editableConfig) {
            chrome.contextMenus.create({
                id: String(editableConfig[i].id),
                title: editableConfig[i].tag,
                contexts: ['editable'],
            })
        }
    }

    if (pdfConfig.length !== 0) {
        for (let i in pdfConfig) {
            chrome.contextMenus.create({
                id: String(pdfConfig[i].id),
                title: pdfConfig[i].tag,
                contexts: ["all"],
                targetUrlPatterns: ["*://*/*.pdf"]
            })
        }
    }

    if (linkConfig.length !== 0) {
        for (let i in linkConfig) {
            chrome.contextMenus.create({
                id: String(linkConfig[i].id),
                title: linkConfig[i].tag,
                contexts: ['link'],
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
    //         if (command.name == 'toggle-insight') isNew = false
    //     }
    //     if (isNew) {
    //         chrome.contextMenus.create({
    //             id: 'toggle-insight',
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

        if (id === 'toggle-insight') {
            chrome.tabs.sendMessage(
                tabId, {
                    cmd: 'toggle-insight',
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
                    cmd: 'toggle-insight',
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
                    if (PromptJson.input === "userSelection") {
                        const context = item.selectionText;
                        if (context) {
                            PromptJson.text = "###相关内容###\n" + context + "\n" + PromptJson.text
                        }
                    }
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