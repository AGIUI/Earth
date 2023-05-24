
// function getOutput() {
//     return [{ label: 'JSON格式', value: 'json' },
//     { label: 'MarkDown格式', value: 'markdown' },
//     { label: '中文', value: 'translate-zh' },
//     { label: '英文', value: 'translate-en' },
//     { label: '默认', value: 'defalut', checked: true }]
// }

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
    promptParse, promptUseLastTalk
}