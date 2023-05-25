import {chromeStorageGet} from "../../components/Utils.js";

console.log('Service Worker')

import NewBing from '@components/background/NewBing'
import ChatGPT from '@components/background/ChatGPT'
import ChatBot from '@components/background/ChatBot'
import Agent from "@components/background/Agent";
import Credit from "@components/background/Credit"
import Common from '@components/background/Common'
import {getConfig} from '@components/Utils';

async function loadContextMenuData() {
    let json = await getConfig();
    let Menu = [];

    let Commons = await fetch(chrome.runtime.getURL('public/Common.json'));
    Commons = await Commons.json();
    Menu.push(...Commons);

    let Editable = await fetch(chrome.runtime.getURL('public/Editable.json'));
    Editable = await Editable.json();
    Menu.push(...Editable);

    let Selection = await fetch(chrome.runtime.getURL('public/Selection.json'));
    Selection = await Selection.json();
    Menu.push(...Selection);

    const res = await chromeStorageGet(['user', 'official']);
    let Workflow = [];

    if (res['user'] && res['user'].length > 0)
        for (let i in res['user']) {
            if (res['user'][i].interfaces && res['user'][i].interfaces.includes('contextMenus')) {
                Workflow.push(res['user'][i])
            }
        }
    if (res['official'] && res['official'].length > 0)
        for (let i in res['official']) {
            if (res['official'][i].interfaces && res['official'][i].interfaces.includes('contextMenus')) {
                Workflow.push(res['official'][i])
            }
        }

    Menu.push(...Workflow);

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: json.app,
        title: json.app,
        contexts: ['page']
    });

    chrome.contextMenus.create({
        id: 'toggle-insight',
        title: "打开面板",
        type: 'normal',
        parentId: json.app,
        contexts: ['page']
    })

    if (Commons.length !== 0) {
        chrome.contextMenus.create({
            id: 'Commons',
            title: '常用功能',
            type: 'normal',
            parentId: json.app,
            contexts: ['page']
        });

        for (let i in Commons) {
            chrome.contextMenus.create({
                id: String(Commons[i].id),
                title: Commons[i].tag,
                type: 'normal',
                parentId: 'Commons'
            })
        }
    }

    if (Workflow.length !== 0) {
        chrome.contextMenus.create({
            id: 'Workflow',
            title: '工作流',
            type: 'normal',
            parentId: json.app,
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

    if (Selection.length !== 0) {
        for (let i in Selection) {
            chrome.contextMenus.create({
                id: String(Selection[i].id),
                title: Selection[i].tag,
                contexts: ['selection']
            })
        }
    }

    if (Editable.length !== 0) {
        for (let i in Editable) {
            chrome.contextMenus.create({
                id: String(Editable[i].id),
                title: Editable[i].tag,
                contexts: ['editable'],
            })
        }
    }

    return Menu;

}

(async () => {
    let json = await getConfig()
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
            chrome.runtime.setUninstallURL(json.discord)
        }
        return true
    })

    // chrome.runtime.onStartup.addListener(async () => {
    //   console.log(`chrome.runtime.onStartup ${chrome.runtime.id}`)
    //   return true
    // });

    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        if (request.cmd === 'update-chromeStorage-data') {
            Menu = await loadContextMenuData();
        }
    })

    chrome.contextMenus.onClicked.addListener(async (item, tab) => {
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
                function (response) {
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
                function (response) {
                    // console.log(response)
                }
            )

            for (let i in Menu) {
                if (id == Menu[i].id) {
                    let PromptJson = Menu[i];
                    if(PromptJson.input==="userSelection"){
                        const context = item.selectionText;
                        if(context){
                            PromptJson.text = "###相关内容###\n"+context+"\n"+PromptJson.text
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
                        function (response) {
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

    new Common(json, chatBot, Agent, Credit)
})()