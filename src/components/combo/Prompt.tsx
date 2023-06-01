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



const userSelectionInit = () => {
    document.addEventListener("selectionchange", () => {
        const text = userSelection();
        if (text != '') localStorage.setItem('___userSelection', text)
        // console.log(text)
        return text
    });
}

const userSelection = () => {
    const selObj: any = window.getSelection();
    // let textContent = selObj.type !== 'None' ? (selObj.getRangeAt(0)).startContainer.textContent : '';
    let textContent = selObj.toString();
    return textContent.trim();
}

const promptBindText = (userText: string, prompt: string) => {
    const text = userText.replace(/\s+/ig, ' ');
    prompt = prompt.trim();
    prompt = `'''${cropText(text)}''',` + prompt;
    return prompt
}

const promptBindUserSelection = (prompt: string) => {
    const userText = localStorage.getItem('___userSelection') || ''
    prompt = promptBindText(userText, prompt)
    return prompt
}

const promptBindUserClipboard = async (prompt: string) => {
    let text = await navigator.clipboard.readText()
    // console.log('navigator.clipboard.readText()', text)
    prompt = promptBindText(text, prompt)
    return prompt
}

const extractArticle = () => {
    let documentClone: any = document.cloneNode(true);
    documentClone.querySelector('._agi_ui')?.remove();

    if (window.location.hostname === 'mail.qq.com') {
        const doc: any = document.querySelector('#mainFrameContainer iframe');
        if (doc) documentClone = doc.contentDocument.cloneNode(true)
        // console.log(doc.contentDocument.body)
    }

    let article: any = {};

    let divs: any = [...documentClone.body.children]
    divs = divs.filter((d: any) => d.className != '_agi_ui')

    let elements = Array.from(divs, (div: any) => [...div.querySelectorAll('p'), ...div.querySelectorAll('span'), ...div.querySelectorAll('h1'), ...div.querySelectorAll('section')].flat()).flat().filter((f: any) => f);

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
        article.textContent = (Array.from(['p', 'span', 'h1', 'section'], e => Array.from(d.querySelectorAll(e), (t: any) => t.innerText.trim()).filter(f => f)).flat()).join("")
    }
    console.log('_extractArticle', article)
    article.href = window.location.href.replace(/\?.*/ig, '');
    return article
}

const promptBindCurrentSite = (prompt: string, type = 'text') => {
    // 获取当前网页正文信息
    const { length, title, textContent, href, elements } = extractArticle();
    prompt = prompt.trim();

    if (type == 'text') {
        const text = textContent.trim().replace(/\s+/ig, ' ');
        const t = `'''title:${title},url:${href}'''`
        if (prompt) {
            prompt = `'''${t},content:${cropText(text)}''',` + prompt;
        } else {
            prompt = `'''${t},content:${cropText(text)}'''`;
        }

    } else if (type == 'html') {
        const htmls = Array.from(elements, (t: any) => t.html)
        if (prompt) {
            prompt = `'''${cropText(JSON.stringify(htmls))}''',` + prompt;
        } else {
            prompt = `'''${cropText(JSON.stringify(htmls))}'''`;
        }

    } else if (type == 'url') {
        // const htmls = Array.from(elements, (t: any) => t.html)
        if (prompt) {
            prompt = `'''title:${title},url:${href}''',` + prompt;
        } else {
            prompt = `'''title:${title},url:${href}'''`;
        }
    }
    return prompt
}

// 拆解任务目标
const promptBindTasks = (prompt: string) => {
    prompt = prompt.trim();
    return `'''${prompt}''',针对以上的任务目标，一步步思考如何完成，按照可行的步骤列出来：`
}

// 高亮信息
const promptBindHighlight = (prompt: string) => {
    prompt = prompt.trim();
    return `'''${prompt}''',从以上html元素中选择最值得看的信息，返回top5的元素id号给我`
}

/**
 * 
 * @returns element
 */
const extractDomElement = () => {
    // 获取当前网页正文信息
    const { elements } = extractArticle();
    return Array.from(elements, (t: any) => t.element)
}


const promptBindRole = (prompt: string, role: any) => {
    if (role.text) {
        prompt = `<role>你的角色背景是${role.text}</role>,${prompt}`
    }
    if (role.name) {
        prompt = `<name>你的名字是${role.name}</name>,${prompt}`
    };
    return prompt
}

const promptUseLastTalk = (prompt: string, lastTalk: string) => {
    prompt = prompt.trim()
    lastTalk = lastTalk.trim()
    if (lastTalk && prompt) {
        prompt = `<${lastTalk}>,[USER INPUT]${prompt}`
    } else if (lastTalk) {
        prompt = lastTalk;
    }
    return prompt
}

// type markdown/json
const promptParse = (prompt: string, type: string) => {
    prompt = cropText(prompt)
    if (type == 'markdown') {
        prompt = `${prompt},完成任务并按照markdown格式输出`
    } else if (type == 'json') {
        prompt = `${prompt},完成任务并按照json格式输出`
    } else if (type == 'translate-zh') {
        prompt = `${prompt},完成任务,翻译成中文`
    } else if (type == 'translate-en') {
        prompt = `${prompt},完成任务,翻译成英文`
    } else if (type == 'extract') {
        prompt = `完成这个任务：分析实体词，并分类。[USER INPUT]${prompt}`
    }
    return prompt
}


export {
    promptBindCurrentSite,
    promptBindUserSelection,
    userSelectionInit,
    promptBindUserClipboard,
    extractDomElement,
    promptBindTasks,
    promptBindHighlight,
    cropText, promptParse,
    promptUseLastTalk,
    promptBindRole
}