console.log('Service Worker')

import Notion from '@components/background/Notion'
import NewBing from '@components/background/NewBing'
import ChatGPT from '@components/background/ChatGPT'
import ChatBot from '@components/background/ChatBot'
import Agent from "@components/background/Agent";
import Api2d from "@components/background/Api2d"
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
            chrome.runtime.setUninstallURL('https://discord.gg/DtAYT2Pt')
        }
        return true
    })

    // chrome.runtime.onStartup.addListener(async () => {
    //   console.log(`chrome.runtime.onStartup ${chrome.runtime.id}`)
    //   return true
    // });

    const notion = new Notion(json.notionToken)

    const chatBot = new ChatBot({
        items: []
    })

    const chatGPT = new ChatGPT()
    const bingBot = new NewBing()
    chatBot.add(bingBot)
    chatBot.add(chatGPT)
        // 初始化
    chatBot.getAvailables()

    new Common(json, notion, chatBot, Agent, Api2d)
})()