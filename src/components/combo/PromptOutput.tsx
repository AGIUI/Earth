
// function getOutput() {
//     return [{ label: 'JSON格式', value: 'json' },
//     { label: 'MarkDown格式', value: 'markdown' },
//     { label: '中文', value: 'translate-zh' },
//     { label: '英文', value: 'translate-en' },
//     { label: '默认', value: 'defalut', checked: true }]
// }

const promptUseLastTalk = (prompt: string, laskTalk: string) => {
    if (prompt && laskTalk) prompt = `${laskTalk ? '```背景信息：' + laskTalk.trim() + '```,' : ''}${prompt.trim()}`
    return prompt
}

// type markdown/json
const promptParse = (prompt: string, type: string) => {
    if (type == 'markdown') {
        prompt = `${prompt},完成任务并按照markdown格式，只输出结果`
    } else if (type == 'json') {
        prompt = `${prompt},完成任务并按照json格式，只输出结果`
    } else if (type == 'translate-zh') {
        prompt = `${prompt},完成任务并翻译成中文，只输出翻译结果`
    } else if (type == 'translate-en') {
        prompt = `${prompt},完成任务并翻译成英文，只输出翻译结果`
    }
    return prompt
}


export {
    promptParse, promptUseLastTalk
}