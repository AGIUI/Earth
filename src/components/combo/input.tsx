import { Readability } from '@mozilla/readability'

const MAX_LENGTH = 2000;

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

const promptBindUserSelection = (prompt: string) => {
    const userText = localStorage.getItem('___userSelection') || ''
    if (prompt && userText) {
        const text = userText.replace(/\s+/ig, ' ');
        prompt = prompt.trim();
        const count = prompt.length;
        prompt = `'''${MAX_LENGTH - count > 0 ? text.slice(0, MAX_LENGTH - count) : ''}''',` + prompt;
    }
    return prompt
}


const extractArticle = () => {
    const documentClone: any = document.cloneNode(true);
    let article: any = {};

    let divs: any = [...document.body.children]
    divs = divs.filter((d: any) => d.className != '_agi_ui')

    article.elements = Array.from(divs, (div: any) => [...div.querySelectorAll('p')].flat()).flat().filter((f: any) => f);

    try {
        article = { ...(new Readability(documentClone, { nbTopCandidates: 10, charThreshold: 800 }).parse()), ...article };
    } catch (error) {
        let d = document.createElement('div');
        d.innerHTML = Array.from(divs, (d: any) => d.innerHTML).join('');
        article.title = document.title;
        article.textContent = (Array.from(['p', 'span'], e => Array.from(d.querySelectorAll(e), (t: any) => t.innerText.trim()).filter(f => f)).flat()).join("")
    }
    console.log('_extractArticle', article)
    article.href = window.location.href.replace(/\?.*/ig, '');
    return article
}

const promptBindCurrentSite = (prompt: string, type = 'text') => {
    // 获取当前网页正文信息
    const { length, title, textContent, href, elements } = extractArticle();

    if (prompt && type == 'text') {
        const text = textContent.trim().replace(/\s+/ig, ' ');
        prompt = prompt.trim();
        const t = `标题:${title},网址:${href}`
        const count = prompt.length + t.length;
        prompt = `<tag>${t}${MAX_LENGTH - count > 0 ? `,正文:${text.slice(0, MAX_LENGTH - count)}` : ''}</tag>,` + prompt;
    } else if (prompt && type == 'html') {
        const texts = Array.from(elements, (e: any, index) => [{ index, text: e.innerText.trim() }]).filter((d: any) => d.text);
        prompt = `<tag>${JSON.stringify(texts)}</tag>,` + prompt;
    }
    return prompt
}


export {
    promptBindCurrentSite, promptBindUserSelection, userSelectionInit
}