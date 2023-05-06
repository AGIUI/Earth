import React from "react";
import { createRoot } from "react-dom/client";
import Main from "@src/pages/newtab/Main";

import { chromeStorageGet, chromeStorageSet } from "@src/components/Utils";
import Base from "@components/datas/Base";
import { defaultCombo } from '@src/components/combo/ComboData'

import { getConfig } from "@components/Utils"

async function init() {
    let json: any = await getConfig() || {};
    document.title=json.app;
    
    const rootContainer = document.querySelector("#__root");
    if (!rootContainer) throw new Error("Can't find Newtab root element");
    const root = createRoot(rootContainer);

    const renderRoot = (news: any, copilots: any) => {
        const newtab = React.createElement(Main, { news, copilots });
        root.render(newtab);
    };

    const copilotsParseData = (data: any) => {
        let cards = [];
        // console.log(data)
        for (let i = 0; i < data.length; i++) {
            let Value = [];
            const item = data[i];
            const name = item.properties.Name.title[0].plain_text;
            const tags = item.properties.Tags.multi_select;
            const url = item.properties.URL.url;
            const image = item.properties.Image.url;
            const description = item.properties.Description.rich_text[0].text.content;
            const description_CN = item.properties.Description_CN.rich_text[0].text.content;
            let TagArray = [];
            for (let j = 0; j < tags.length; j++) {
                const tag = tags[j].name;
                TagArray.push(tag)
            }
            Value.push(name, url, TagArray, image, description, description_CN);
            cards.push(Value)
        }
        return cards
    }

    const newsParseData = (data: any) => {
        let cards = [];
        // console.log(data)
        for (let i = 0; i < data.length; i++) {
            let Value = [];
            const item = data[i];
            const name = item.properties.Name.title[0].plain_text;
            const tags = item.properties.Tags.multi_select;
            const url = item.properties.URL.url;
            const image = item.properties.Image.url;
            const favicon = item.properties.Favicon.url;
            const description = item.properties.Description.rich_text[0].text.content;
            let TagArray = [];
            for (let j = 0; j < tags.length; j++) {
                const tag = tags[j].name;
                TagArray.push(tag)
            }
            const blockid = item.id;
            Value.push(name, url, blockid, TagArray, image, favicon, description);
            cards.push(Value)
        }
        return cards
    }

    const comboParse = (data: any) => {
        let combo: any[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const tag = item.properties.PromptName.title[0].plain_text;
            const prompt1 = item.properties.prompt1.rich_text[0].text.content;
            const prompt2 = item.properties.prompt2.rich_text[0] ? item.properties.prompt2.rich_text[0].text.content : null;
            const prompt3 = item.properties.prompt3.rich_text[0] ? item.properties.prompt3.rich_text[0].text.content : null;
            const prompt4 = item.properties.prompt4.rich_text[0] ? item.properties.prompt4.rich_text[0].text.content : null;
            const prompt5 = item.properties.prompt5.rich_text[0] ? item.properties.prompt5.rich_text[0].text.content : null;
            const bindCurrentPage = item.properties.BindCurrentPage.checkbox;
            const from = item.properties.ShowInChat.checkbox;
            // console.log(prompt1,prompt2,prompt3)

            const prompt: any = {
                ...defaultCombo,
                tag: tag,
                prompt: {
                    ...defaultCombo.prompt,
                    text: prompt1,
                    bindCurrentPage
                },
                // from: from ? '默认' : false,
                checked: !!from,
                combo: 1,
                owner: 'official'
            };

            if (prompt2) {
                prompt.prompt2 = {
                    ...defaultCombo.prompt, text: prompt2,
                    bindCurrentPage
                };
                prompt.combo = 2;
            }

            if (prompt3) {
                prompt.prompt3 = {
                    ...defaultCombo.prompt, text: prompt3,
                    bindCurrentPage
                };
                prompt.combo = 3;
            }

            if (prompt4) {
                prompt.prompt4 = {
                    ...defaultCombo.prompt, text: prompt4,
                    bindCurrentPage
                };
                prompt.combo = 4;
            }

            if (prompt5) {
                prompt.prompt5 = {
                    ...defaultCombo.prompt, text: prompt5,
                    bindCurrentPage
                };
                prompt.combo = 5;
            }

            combo.push(prompt);
            // console.log('prompt',JSON.stringify(prompt,null,2))
        }
        return combo
    }


    function comboDataUpdate(prompts: any) {
        // console.log('parsePromptsDataAndUpdate', data);
        chromeStorageGet('official').then((items: any) => {
            // console.log('indexofficial',items.official,prompts);
            if (!items.official) {
                // 如果value不存在，则创建一个空数组，并将data添加到其中
                const official: any[] = prompts;
                chromeStorageSet({
                    official
                }).then(() => console.log('新建了一个空数组，并将data添加到其中'))
            } else {
                const official = items.official;

                for (let i = 0; i < prompts.length; i++) {
                    let found = false;
                    for (let j = 0; j < official.length; j++) {
                        const JsonOfficial = official[j];
                        const JsonPrompt = prompts[i];
                        // console.log(JsonOfficial,JsonPrompt)
                        if (JsonPrompt.tag === JsonOfficial.tag) {
                            // If the ID already exists, update the data with the new values
                            JsonPrompt.from = JsonOfficial.from;
                            official[j] = JsonPrompt;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        const official = items.official;
                        official.push(prompts[i]);
                    }
                }
                chromeStorageSet({ official });
                // 如果value存在，则将data添加到数组中
            }
        });

    }


    const keys =
    {
        copilots: {
            parseData: copilotsParseData,
            onUpdate: (data: any) => {
                renderRoot(data.news, data.copilots)
            }
        },
        news: {
            parseData: newsParseData,
            onUpdate: (data: any) => {
                renderRoot(data.news, data.copilots)
            }
        },
        prompts: {
            parseData: comboParse,
            onUpdate: (data: any) => {
                // console.log('prompts:',data.prompts)
                comboDataUpdate(data.prompts)
            }
        }
    }


    let base = new Base(keys);

    const data = base.get();

    if (data && data.news && data.copilots && data.news.length > 0 && data.copilots.length > 0) renderRoot(data.news, data.copilots)

    window.onfocus = function (e) {
        if (document.readyState == 'complete') base.getData(base.keys)
    }
}

init();

