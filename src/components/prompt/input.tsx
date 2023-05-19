
import { Readability } from '@mozilla/readability'



const userSelectionInit=()=>{
    document.addEventListener("selectionchange", () => {
        const text = userSelection();
        if(text!='') localStorage.setItem('___userSelection', text)
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
        prompt = `'''${1920 - count > 0 ? text.slice(0, 1920 - count) : ''}''',` + prompt;
    }
    return prompt
}


const extractArticle = () => {
    const documentClone: any = document.cloneNode(true);
    const article: any = new Readability(documentClone, { nbTopCandidates: 10, charThreshold: 800 }).parse();
    console.log('_extractArticle', article)
    article.href = window.location.href.replace(/\?.*/ig, '');
    return article
}

const promptBindCurrentSite = (prompt: string) => {
    // 获取当前网页正文信息
    const { length, title, textContent, href } = extractArticle();
    if (prompt) {
        const text = textContent.trim().replace(/\s+/ig, ' ');
        prompt = prompt.trim();
        const t = `标题:${title},网址:${href}`
        const count = prompt.length + t.length;
        prompt = `<tag>${t}${1920 - count > 0 ? `,正文:${text.slice(0, 1920 - count)}` : ''}</tag>,` + prompt;
    }
    return prompt
}


export {
    promptBindCurrentSite, promptBindUserSelection,userSelectionInit
}