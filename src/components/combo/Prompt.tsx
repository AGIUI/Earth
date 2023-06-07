import { Readability } from '@mozilla/readability'
import { encode, decode } from '@nem035/gpt-3-encoder'


// const str = '这是什么句子？'
// const encoded = encode(str)
// console.log('Encoded this string looks like: ', encoded)
// console.log('We can look at each token and what it represents')
// for(let token of encoded){
//   console.log({token, string: decode([token])})
// }
// const decoded = decode(encoded)
// console.log('We can decode it back into:\n', decoded)



import { md5, textSplitByLength } from '@components/Utils'

const MAX_LENGTH = 2800;

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
 * @param prompt 说明:
        <name>是扮演的角色名称
        <role>扮演的角色背景信息
        <title>当前网页标题
        <url>当前网页链接
        <text>当前网页正文
        <html>当前网页
        <task>具体的任务
        <context>上一次聊天信息
        <userInput>用户输入的信息
        请根据以上信息，完成<userInput>和<task>，输出结果`
 * @returns 
 */

function promptParse(prompt: string) {
    console.log('promptParse::::', prompt)
    let div = document.createElement('div');
    div.innerHTML = prompt;
    const str = (q: string) => {
        const n: any = div.querySelector(q);
        return n && n.innerText.trim();
    }

    const keys = Array.from(`name, role, title, url, text, html, task,translate, context,output,userInput`.split(','), k => k.trim()).filter(f => f);
    const desc: any = {
        name: "是扮演的角色名称",
        role: "扮演的角色背景信息",
        title: "当前网页标题",
        url: "当前网页链接",
        text: "当前网页正文",
        html: "当前网页",
        task: "具体的任务",
        context: "上一次聊天信息",
        userInput: "用户输入的信息",
        translate: "翻译",
        output: "输出格式"
    }

    const prompts: any = {};

    for (const key of keys) {
        let v = str(key);
        if (v) prompts[key] = v;
    }

    console.log('promptParse:::::', JSON.stringify(prompts, null, 2))

    let system = (prompts['name'] ? prompts['name'] + ',' : '') + prompts['role'];
    let promptNew = '';

    for (const key in prompts) {
        if (key != "userInput" && key != 'role' && key != 'name') {
            promptNew += `\n${key}:${prompts[key]}`
        }
    }

    prompt = `${promptNew ? promptNew + '\nuserInput:' : ''}${prompts['userInput']}`

    return { system, prompt }

}

const bindUserInput = (userInput: string) => {
    userInput = userInput.trim();
    return `<userInput>${cropText(userInput)}</userInput>`
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
    const userText = localStorage.getItem('___userSelection') || ''
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
    const prompt = `<text>${cropText(text)}</text>${userInput}`;
    return prompt
}

// 提取文章信息
// query选择器
const extractArticle = (query = "") => {
    let documentClone: any = document.cloneNode(true);

    documentClone.querySelector('._agi_ui')?.remove();

    if (window.location.hostname === 'mail.qq.com') {
        const doc: any = document.querySelector('#mainFrameContainer iframe');
        if (doc) documentClone = doc.contentDocument.cloneNode(true)
        // console.log(doc.contentDocument.body)
    }

    let article: any = {};

    let divs: any = [...documentClone.body.children];
    // 如果有选择器
    if (query) {
        let targets = document.querySelectorAll(query);
        if (targets.length > 0) {
            divs = [];
            for (const target of targets) {
                divs.push(
                    target.cloneNode(true)
                );
            }
        }
    }

    divs = divs.filter((d: any) => d.className != '_agi_ui')

    let elements = Array.from(divs, (div: any) => [
        ...div.querySelectorAll('p'),
        ...div.querySelectorAll('span'),
        ...div.querySelectorAll('h1'),
        ...div.querySelectorAll('section'),
    ].flat()).flat().filter((f: any) => f);

    article.elements = Array.from(elements, (element: any, index) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.innerText.trim();
        element.id = md5(element.innerText.trim())
        return {
            element,
            text,
            html: `<${tagName} id='${element.id}'>${text}</${tagName}>`
        }
    }).flat().filter((d: any) => d.text);
    // article.elements = Array.from(elements, (t: any) => t.element)

    try {
        article = { ...(new Readability(documentClone, { nbTopCandidates: 10, charThreshold: 800 }).parse()), ...article };
    } catch (error) {
        let d = document.createElement('div');
        d.innerHTML = Array.from(divs, (d: any) => d.innerHTML).join('');
        article.title = document.title;
        article.textContent = (Array.from(['p', 'span', 'h1', 'section'], e => Array.from(d.querySelectorAll(e), (t: any) => t.innerText.trim()).filter(f => f)).flat()).join("\n")
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
    let prompt = userInput.trim();

    if (type == 'text') {
        const text = textContent.trim().replace(/\s+/ig, ' ');
        const t = `<title>${title}</title><url>${href}</url>`
        if (prompt) {
            prompt = `${t}<text>${cropText(text)}</text>${prompt}`;
        } else {
            prompt = `${t}<text>${cropText(text)}</text>`;
        }

    } else if (type == 'html') {
        const htmls = Array.from(elements, (t: any) => t.html)
        if (prompt) {
            prompt = `<html>${cropText(JSON.stringify(htmls))}</html>${prompt}`;
        } else {
            prompt = `<html>${cropText(JSON.stringify(htmls))}</html>`;
        }

    } else if (type == 'url') {
        // const htmls = Array.from(elements, (t: any) => t.html)
        if (prompt) {
            prompt = `<title>${title}</title><url>${href}</url>${prompt}`;
        } else {
            prompt = `<title>${title}</title><url>${href}</url>`;
        }
    } else if (type == 'images') {
        if (prompt) {
            prompt = `${Array.from(images, im => `<img src="${im}"/>`).join("")}${prompt}`;
        } else {
            prompt = Array.from(images, im => `<img src="${im}"/>`).join("");
        }
    }
    return prompt
}

const promptBindTranslate = (userInput: string, type: string) => {
    if (type == 'translate-zh') {
        userInput = `<translate>翻译成中文</translate>${userInput}`
    } else if (type == 'translate-en') {
        userInput = `<translate>翻译成英文</translate>${userInput}`
    }
    return userInput
}

const promptBindOutput = (userInput: string, type: string) => {
    if (type == 'markdown') {
        userInput = `<output>按照markdown格式输出</output>${userInput}`
    } else if (type == 'json') {
        userInput = `<output>按照json格式输出</output>${userInput}`

    } else if (type == 'extract') {
        userInput = `<output>分析实体词，并分类</output>${userInput}`
    };
    return userInput
}

// 拆解任务目标
const promptBindTasks = (userInput: string) => {
    return `${userInput}<task>针对以上的任务目标，一步步思考如何完成，按照可行的步骤列出来</task>`
}

// 高亮信息
const promptBindHighlight = (userInput: string) => {
    return `${userInput}<task>从以上html元素中选择最值得看的信息，返回top5的元素id号给我</task>`
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
    let prompt = userInput
    if (role.text) {
        prompt = `<role>你的角色背景是${cropText(role.text)}</role>${prompt}`
    }
    if (role.name) {
        prompt = `<name>你的名字是${role.name}</name>${prompt}`
    };
    return prompt
}

const promptUseLastTalk = (prompt: string, context: string) => {
    prompt = prompt.trim()
    context = cropText(context.trim())
    if (context && prompt) {
        prompt = `<context>${context}</context>${prompt}`
    } else if (context) {
        prompt = `<context>${context}</context>`;
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