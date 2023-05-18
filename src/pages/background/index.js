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
            id: 'toggle-insight',
            title: json.app,
            type: 'normal',
            contexts: ['page']
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