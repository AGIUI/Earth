import { Readability } from '@mozilla/readability'

const userInputTypes: any = {
    FIXED_VALUE: 1,
    CURRENT_PAGE_CONTENT: 2,
    CURRENT_PAGE_URL: 3,
    CODE_JAVASCRIPT:4
}


const createPrompt = (inp: any) => {
    const { type, data } = inp;
    console.log('createPrompt',inp)
    const ut: number = userInputTypes[type] || 0;
    let result = "";
    switch (ut) {
        case 1:
            result = data.value;
            break;

        case 2:

            break;

        case 3:
            result = getUrl();
            break;
        case 4:
            result = injectCode(data.url,data.value);
            break;
        default:
            break;
    }

    return result
}

const extractArticle = () => {
    const documentClone: any = document.cloneNode(true);
    const article: any = new Readability(documentClone, { nbTopCandidates: 2 }).parse();
    article.href = window.location.href.replace(/\?.*/ig, '');
    const { length, title, textContent, href } = article;
    return { length, title, textContent, href }
}

const getContent = () => {
    const { title, textContent, length } = extractArticle();
    if (length < 1500) return `标题:${title},正文:${textContent}`
    return `标题:${title}`
}
const getUrl = () => {
    const { href } = extractArticle();
    return `链接:${href}`
}

const injectCode=(url: any,code: any)=>{
    console.log('injectCode',code)
    return ''
}


export default {
    getContent, getUrl, createPrompt
}