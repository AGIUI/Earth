import { chromeStorageGet } from "../../components/Utils.js";

console.log('Service Worker')

import NewBing from '@components/background/NewBing'
import ChatGPT from '@components/background/ChatGPT'
import ChatBot from '@components/background/ChatBot'
import Agent from "@components/background/Agent";
import Credit from "@components/background/Credit"
import Common from '@components/background/Common'

import { getConfig } from '@components/Utils';


(async() => {
    let json = await getConfig()
    chrome.contextMenus.create({
        "id": json.app,
        "title": json.app,
        "contexts": ['page']
    });

    chrome.contextMenus.create({
        id: 'toggle-insight',
        title: "打开面板",
        type: 'normal',
        "parentId": json.app,
        contexts: ['page']
    })

    const res = await chromeStorageGet(['user', 'official']);
    let Menu = [];
    for (let i in res['user']) {
        if (res['user'][i].interfaces.includes('contextMenus')) {
            Menu.push(res['user'][i])
        }
    }
    for (let i in res['official']) {
        if (res['official'][i].interfaces.includes('contextMenus')) {
            Menu.push(res['official'][i])
        }
    }

    for (let i in Menu) {
        chrome.contextMenus.create({
            id: Menu[i].tag,
            title: Menu[i].tag,
            type: 'normal',
            "parentId": json.app,
            contexts: ['page']
        })
    }

    chrome.contextMenus.onClicked.addListener(async(item, tab) => {
        const from = 'contextMenus';
        const tabId = tab.id;
        const id = item.menuItemId
        console.log(id);
        console.log(tab.id);
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
                console.log(Menu[i]);
                if (id === Menu[i].tag) {
                    chrome.tabs.sendMessage(
                        tabId, {
                            cmd: 'contextMenus',
                            success: true,
                            data: {
                                cmd: 'combo',
                                data: {
                                    '_combo': Menu[i],
                                    from,
                                    prompt: Menu[i].prompt,
                                    tag: Menu[i].tag,
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