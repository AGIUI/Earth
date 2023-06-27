import { Readability } from '@mozilla/readability'
import { encode, decode } from '@nem035/gpt-3-encoder'

import { getConfig } from '@components/Utils'

const json = getConfig();
// const str = '这是什么句子？'
// const encoded = encode(str)
// console.log('Encoded this string looks like: ', encoded)
// console.log('We can look at each token and what it represents')
// for(let token of encoded){
//   console.log({token, string: decode([token])})
// }
// const decoded = decode(encoded)
// console.log('We can decode it back into:\n', decoded)

import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
// import LanguageDetector from "i18next-browser-languagedetector";

// const resources = {
//     en: {
//         translation: {
//             'prompt-role': "Role simulation",
//             'prompt-task': "Specific task",
//             'prompt-translate': "Translation",
//             'prompt-output': "Output requirements",
//             'prompt-title': "Webpage title",
//             'prompt-url': "Webpage link",
//             'prompt-text': "Webpage content",
//             'prompt-html': "Webpage HTML",
//             'prompt-images': "Webpage images",
//             'prompt-context': "Context",
//             'prompt-userInput': "User input",
//             'prompt-translate-zh': 'Translate into Chinese',
//             'prompt-translate-en': 'Translate into English',

//             'prompt-table': 'The answer to the user must be in table format',
//             'prompt-markdown': 'The answer to the user must be in Markdown format',
//             'prompt-json': 'The answer to the user must be a JSON array or object',
//             'prompt-list': 'The answer to the user must be in list format',
//             'prompt-extract': 'Analyze entity words and categorize them'
//         },
//     },
//     zh: {
//         translation: {
//             'prompt-role': "角色模拟",
//             'prompt-task': "具体的任务",
//             'prompt-translate': "翻译",
//             'prompt-output': "输出要求",
//             'prompt-title': "网页标题",
//             'prompt-url': "网页链接",
//             'prompt-text': "网页正文",
//             'prompt-html': "网页",
//             'prompt-images': "网页图片",
//             'prompt-context': "上下文",
//             'prompt-userInput': "用户输入",

//             'prompt-translate-zh': `翻译成中文`,
//             'prompt-translate-en': `翻译成英文`,

//             'prompt-table': '回答user的结果只允许是table结构',
//             'prompt-markdown': `回答user的结果只允许是Markdown格式`,
//             'prompt-json': `回答user的结果只允许是JSON数组或对象`,
//             'prompt-list': '回答user的结果只允许是list数组',
//             'prompt-extract': `分析实体词，并分类`


//         },
//     },
// };

// i18n
//     .use(LanguageDetector)
//     .use(initReactI18next)
//     .init({
//         resources,
//         fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
//         lng: navigator.language,
//         debug: false,
//         interpolation: {
//             escapeValue: false, // 不需要对翻译文本进行转义
//         },
//     });




import { hashJson, md5, textSplitByLength } from '@components/Utils'

const MAX_LENGTH = 2800;
const delimiter = (key: string) => `[${key}]`;

const systemKeys: any = {
    role: i18n.t('prompt-role'),
    task: i18n.t('prompt-task'),
}

const assistantKeys: any = {

}

const userKeys: any = {
    title: i18n.t('prompt-title'),//网页标题
    url: i18n.t('prompt-url'),//网页url
    text: i18n.t('prompt-text'),//网页正文
    html: i18n.t('prompt-html'),//网页html
    images: i18n.t('prompt-images'),//网页图片
    context: i18n.t('prompt-context'),//上一个节点信息
    userInput: i18n.t('prompt-userInput'),//用户指令
    translate: i18n.t('prompt-translate'),//翻译
    output: i18n.t('prompt-output')
}


const cropText = (
    text: string,
    startLength = 400,
    endLength = 300,
    tiktoken = true,
) => {
    const splits = text.split(/[,，。?？!！;；]/).map((s) => s.trim())
    const splitsLength = splits.map((s) => (tiktoken ? encode(s).length : s.length))
    const length = splitsLength.reduce((sum, length) => sum + length, 0)

    const cropLength = length - startLength - endLength
    const cropTargetLength = MAX_LENGTH - startLength - endLength
    const cropPercentage = cropTargetLength / cropLength
    const cropStep = Math.max(0, 1 / cropPercentage - 1)

    if (cropStep === 0) return text

    let croppedText = ''
    let currentLength = 0
    let currentStep = 0

    for (let currentIndex = 0; currentIndex < splits.length; currentIndex++) {
        if (currentLength + splitsLength[currentIndex] + 1 <= startLength) {
            croppedText += splits[currentIndex] + ','
            currentLength += splitsLength[currentIndex] + 1
        } else if (currentLength + splitsLength[currentIndex] + 1 + endLength <= MAX_LENGTH) {
            if (currentStep < cropStep) {
                currentStep++
            } else {
                croppedText += splits[currentIndex] + ','
                currentLength += splitsLength[currentIndex] + 1
                currentStep = currentStep - cropStep
            }
        } else {
            break
        }
    }

    let endPart = ''
    let endPartLength = 0
    for (let i = splits.length - 1; endPartLength + splitsLength[i] <= endLength; i--) {
        endPart = splits[i] + ',' + endPart
        endPartLength += splitsLength[i] + 1
    }
    currentLength += endPartLength
    croppedText += endPart

    console.log(
        `maxLength: ${MAX_LENGTH}\n`,
        `desiredLength: ${currentLength}\n`,
        `content: ${croppedText}`,
    )
    return croppedText
}


/**
 * 
 * @param prompt
 * @returns 
 */

function promptParse(prompt: any) {
    prompt = {
        role: {
            name: "",
            text: ""
        }
        , ...prompt
    };

    console.log('promptParse:::::', JSON.stringify(prompt, null, 2))

    let system: any = {
        role: "system",
        content: []
    };

    const roleText = (prompt['role'] && prompt['role'].name ? prompt['role'].name + ',' : '') + (prompt['role'] && prompt['role'].text ? prompt['role'].text : "");
    if (roleText.trim()) {
        system.content.push({
            key: delimiter(systemKeys['role']),
            value: roleText
        })
    }

    for (const key in systemKeys) {
        if (key != 'role') {
            if (prompt[key] && prompt[key].trim()) system.content.push({
                key: delimiter(systemKeys[key]),
                value: prompt[key].trim()
            })
        }
    }

    system.content = Array.from(
        system.content,
        (c: any, i: number) =>
            `${system.content.length > 1 ? (i + 1) + '.' : ""}${c.value}`)
        .join('\n').trim();

    const user: any = {
        role: 'user',
        content: []
    };

    for (const key in userKeys) {
        if (prompt[key]
            && prompt[key].trim() && ![
                'userInput',
                'context'
            ].includes(key)
        ) user.content.push({
            key: userKeys[key],
            value: prompt[key]
        });
    };

    // 判断是否有${context} 替换进去
    // console.log(prompt['userInput'].match(/\${context}/), prompt, prompt['userInput'].replaceAll("${context}", prompt['context']))
    if (prompt['userInput'] && prompt['context'] && prompt['userInput'].match(/\${context}/)) {
        user.content.push({
            key: userKeys['userInput'],
            value: prompt['userInput'].replaceAll("${context}", prompt['context'])
        });
    } else {
        for (const key of [
            'context',
            'userInput'
        ]) {
            if (prompt[key]
                && prompt[key].trim()
            ) user.content.push({
                key: userKeys[key],
                value: prompt[key]
            });
        };
    }

    user.content = Array.from(
        user.content,
        (c: any, i: number) =>
            `${user.content.length > 1 ? (i + 1) + '.' : ""}${c.value}`)
        .join('\n').trim();


    const assistant: any = {
        role: 'assistant',
        content: []
    }

    for (const key in assistantKeys) {
        if (prompt[key]
            && prompt[key].trim()
        ) assistant.content.push({
            key: assistantKeys[key],
            value: prompt[key]
        });
    };

    assistant.content = Array.from(
        assistant.content,
        (c: any, i: number) =>
            `${assistant.content.length > 1 ? (i + 1) + '.' : ""}${c.value}`)
        .join('\n').trim();


    const id = hashJson([system, user, assistant, new Date()]);

    return { system, user, assistant, id }

}

const bindUserInput = (userInput: string) => {
    return {
        userInput: cropText(userInput.trim())
    }
}


// 划选的监听
const userSelectionInit = () => {
    document.addEventListener("selectionchange", () => {
        const text = userSelection();
        if (text != '') localStorage.setItem('___userSelection', text)
        // console.log(text)
        return text
    });
}
// 划选
const userSelection = () => {
    const selObj: any = window.getSelection();
    // let textContent = selObj.type !== 'None' ? (selObj.getRangeAt(0)).startContainer.textContent : '';
    let textContent = selObj.toString();
    return textContent.trim();
}
// 剪切板
const checkClipboard = async () => {
    const queryOpts: any = { name: 'clipboard-read', allowWithoutGesture: false };
    const permissionStatus = await navigator.permissions.query(queryOpts);
    // Will be 'granted', 'denied' or 'prompt':
    console.log(permissionStatus.state);

    // Listen for changes to the permission state
    permissionStatus.onchange = () => {
        console.log(permissionStatus.state);
    };
}

// 绑定用户划选的内容
const promptBindUserSelection = (userInput: string) => {
    const userText = localStorage.getItem('___userSelection') || '';
    const prompt = promptBindText(userText, userInput)
    return prompt
}
// 绑定剪切板信息
const promptBindUserClipboard = async (userInput: string) => {
    let text = await navigator.clipboard.readText()
    // console.log('navigator.clipboard.readText()', text)
    const prompt = promptBindText(text, userInput)
    return prompt
}

// 绑定信息
const promptBindText = (bindText: string, userInput: string) => {
    const text = bindText.replace(/\s+/ig, ' ');
    userInput = userInput.trim();
    let prompt = {
        userInput,
        text: text
    }
    return prompt
}

// 提取文章信息
// query选择器
const extractArticle = (query = "") => {
    let documentClone: any = document.cloneNode(true);

    documentClone.querySelector('#' + (json.app + "_dom").replace(/\s/ig, '').trim())?.remove();

    if (window.location.hostname.match('mail.qq.com')) {
        // 针对qq邮箱的处理 
        const doc: any = document.querySelector('#mainFrameContainer iframe');
        if (doc) documentClone = doc.contentDocument.cloneNode(true)
        // console.log(doc.contentDocument.body)
    }

    let article: any = {};

    let divs: any = [...documentClone.body.children];
    // 如果有选择器
    if (query) {
        let targets = document.querySelectorAll(query);
        divs = [];
        if (targets.length > 0) {
            for (const target of targets) {
                divs.push(
                    target.cloneNode(true)
                );
            }
        }

    }

    divs = divs.filter((d: any) => !['script', 'style', 'iframe'].includes(d.tagName.toLowerCase()));
    // console.log('divs',divs)
    const textsTag = ['p', 'span', 'h1', 'section', 'a', 'button', 'div'];

    // const textContent = (Array.from(textsTag, e => Array.from(d.querySelectorAll(e), (t: any) => t.innerText.trim()).filter(f => f)).flat()).join("\n")


    let elements: any = [];

    for (const div of divs) {
        Array.from(
            textsTag,
            t => {
                elements = [...elements, ...div.querySelectorAll(t)]
                // 当div本身就是的时候
                if (div.tagName.toLowerCase() == t) {
                    elements.push(div)
                }
            })
    }


    elements = elements.flat().filter((f: any) => f);

    elements = Array.from(elements, (element: any, index) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.innerText.replace(/\s{2,}/ig, '').trim();
        const id = md5(text)
        return {
            id,
            element,
            text,
            html: `<${tagName} id='${id}'>${text}</${tagName}>`
        }
    }).flat().filter((d: any) => d.text);

    
    // 根据文本去重
    let newElements: any = {};
    for (const element of elements) {
        newElements[element.id] = element;
    }
    article.elements = Object.values(newElements);


    const textContent = Array.from(divs, (d: any) => d.innerText).join('\n');
    // 当精准定位的时候
    if (query) article.textContent = textContent;

    // console.log('divs', divs, article.elements, textContent)
    const updateTitleAndTextContent = (article: any) => {
        article.title = document.title;
        article.textContent = textContent;
        return article
    }

    try {
        article = { ...(new Readability(documentClone, { nbTopCandidates: 10, charThreshold: 800 }).parse()), ...article };
    } catch (error) {
        article = updateTitleAndTextContent(article)
    }
    // article = updateTitleAndTextContent(article)
    if (window.location.hostname.match('mail.qq.com')) {
        // 针对qq邮箱的处理 
        article = updateTitleAndTextContent(article)
    }

    // console.log(window.location.hostname.match("producthunt.com"), 'window.location.hostname.match("producthunt.com")')
    if (window.location.hostname.match("producthunt.com")) {
        article = updateTitleAndTextContent(article)
    }

    // 图片
    if (query) {
        let imgs: any = document.body.querySelectorAll(query);
        if (imgs.length > 0) {
            article.images = Array.from(imgs, (im: any) => im.src)
        }
    }

    console.log('_extractArticle', article)
    article.href = window.location.href.replace(/\?.*/ig, '');
    return article
}

// 绑定当前页面信息
const promptBindCurrentSite = (userInput: string, type = 'text', query: string) => {
    // 获取当前网页正文信息
    const { length, title, textContent, href, elements, images } = extractArticle(query);
    let prompt = {
        userInput: userInput.trim(),
        text: "",
        title: "",
        html: "",
        url: "",
        images: ""
    }

    if (type == 'text') {
        const text = textContent.trim().replace(/\s+/ig, ' ');
        prompt.text = cropText(text)
    } else if (type == 'title') {
        prompt.title = title
    } else if (type == 'html') {
        const html = Array.from(elements, (t: any) => t.html)
        prompt.title = title
        prompt.html = cropText(JSON.stringify(html).replace(/\s{2,}/ig, '').trim())
    } else if (type == 'url') {
        prompt.title = title
        prompt.url = href
    } else if (type == 'images') {
        prompt.images = Array.from(images, im => `<img src="${im}"/>`).join("")
    }
    return prompt
}

const promptBindTranslate = (userInput: string, type: string) => {
    let prompt = {
        userInput,
        translate: ""
    }
    if (type == 'translate-zh') {
        prompt.translate = i18n.t('prompt-translate-zh')
    } else if (type == 'translate-en') {
        prompt.translate = i18n.t('prompt-translate-en')
    }
    return prompt
}

const promptBindOutput = (userInput: string, type: string) => {
    let prompt = {
        userInput,
        output: ''
    }
    if (type == 'text' || type == 'default') {
        prompt.output = ''
    } else if (type == 'table') {
        prompt.output = i18n.t('prompt-table')
    } else if (type == 'markdown') {
        prompt.output = i18n.t('prompt-markdown')
    } else if (type == 'json') {
        prompt.output = i18n.t('prompt-json')
    } else if (type == 'list') {
        prompt.output = i18n.t('prompt-list')
    } else if (type == 'extract') {
        prompt.output = i18n.t('prompt-extract')
    };

    // prompt.output += `,只输出结果,不允许出现${delimiter("xxx")}`
    // prompt.output+=`,只输出结果,不允许出现这些:(${Array.from(Object.values(systemKeys),(k:any)=>`${delimiter}${k}:`).join(",")},${Array.from(Object.values(userKeys),(k:any)=>`${delimiter}${k}:`).join(",")})`;
    return prompt
}

// 拆解任务目标
const promptBindTasks = (userInput: string) => {
    // return `${userInput}<task>针对以上的任务目标，一步步思考如何完成，按照可行的步骤列出来</task>`
}

// 高亮信息
const promptBindHighlight = (userInput: string) => {
    // return `${userInput}<task>从以上html元素中选择最值得看的信息，返回top5的元素id号给我</task>`
}

/**
 * 
 * @returns element
 */
const extractDomElement = (query: string) => {
    // 获取当前网页正文信息
    const { elements } = extractArticle(query);
    return Array.from(elements, (t: any) => t.element)
}


const promptBindRole = (userInput: string, role: any) => {
    let prompt: any = {
        userInput,
        role: {
            text: '', name: '', merged: []
        }
    }
    if (role.text) {
        prompt.role.text = cropText(role.text);
    }
    if (role.name) {
        prompt.role.name = cropText(role.text);
    };



    if (role.merged && role.merged.length > 0) {
        let system = role.merged.filter((m: any) => m.role == 'system')[0];
        if (system && system.content) {
            system.content = cropText(system.content)
            prompt.role.merged = [system]
        }
    }

    return prompt
}

const promptUseLastTalk = (userInput: string, context: string) => {
    userInput = userInput.trim()
    context = cropText(context.trim())
    let prompt = {
        userInput,
        context
    }
    return prompt
}

export {
    bindUserInput,
    promptBindCurrentSite,
    promptBindUserSelection,
    userSelectionInit,
    promptBindUserClipboard,
    extractDomElement,
    promptBindTasks,
    promptBindHighlight,
    cropText,
    promptParse,
    promptUseLastTalk,
    promptBindTranslate,
    promptBindOutput,
    promptBindRole,
    checkClipboard
}