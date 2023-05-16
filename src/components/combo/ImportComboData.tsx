import {chromeStorageGet, chromeStorageSet} from "@components/Utils";
import {defaultCombo} from "@components/combo/ComboData";
import requestUpdateCheck = chrome.runtime.requestUpdateCheck;

async function parsePromptsData(data: any){
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
    }

    await chromeStorageGet('official').then((items: any) => {
        // console.log('indexofficial',items.official,prompts);
        if (!items.official) {
            // 如果value不存在，则创建一个空数组，并将data添加到其中
            const official: any[] = combo;
            chromeStorageSet({
                official
            }).then(() => console.log('新建了一个空数组，并将data添加到其中'))
        } else {
            const official = items.official;

            for (let i = 0; i < combo.length; i++) {
                let found = false;
                for (let j = 0; j < official.length; j++) {
                    const JsonOfficial = official[j];
                    const JsonPrompt = combo[i];
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
                    official.push(combo[i]);
                }
            }
            chromeStorageSet({ official });
            // 如果value存在，则将data添加到数组中
        }
    });

    const newCombo = await _getPromptsData();
    return newCombo;
}

async function _getPromptsData() {
    let prompts: any[] = [];
    const res: any = await chromeStorageGet(['user', 'official']);

    if (res && res.user) for (const userPrompt of res.user) {
        prompts.push(userPrompt);
    }

    if (res && res.official) for (const officialPrompt of res.official) {
        prompts.push(officialPrompt);
    }

    // console.log(prompts)

    return prompts;
}

export {parsePromptsData};