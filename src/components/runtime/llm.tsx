import {
    promptBindCurrentSite,
    promptBindUserSelection,
    promptBindTasks,
    promptBindUserClipboard,
    userSelectionInit,
    extractDomElement,
    promptParse,
    promptUseLastTalk,
    promptBindRole,
    bindUserInput,
    promptBindTranslate,
    promptBindOutput
} from '@src/components/combo/Prompt'

function _temperature2BingStyle(temperature = 0.6) {
    let style = 'Balanced';
    if (temperature < 0.3) style = 'Creative'
    if (temperature > 0.7) style = 'Precise'
}


export function LLMRun(prompt: any, newTalk: boolean) {
    // console.log('this.state.chatBotStyle', this.state.chatBotStyle)
    const { temperature, model, text, type, merged, role } = prompt;

    let promptData;

    if (merged && merged.length > 0) {
        // 使用合成好的prompt
        promptData = merged;
        promptData = Array.from(promptData, (p: any) => {
            if (p.role == 'user' && prompt['context']) {
                p.content = p.content.replaceAll("${context}", prompt['context'])
            }
            if (p.role == 'system' && prompt['context']) {
                p.content = p.content.replaceAll("${context}", prompt['context'])
            }
            return p
        })
    } else {
        const { system, user, assistant } = promptParse(prompt);
        promptData = [system, user];
    }


    // role 合成好的处理
    if (role && role.merged && role.merged[0]) {
        promptData = Array.from(promptData, (p: any) => {
            if (p.role == 'system') {
                p = role.merged[0]
            }
            return p
        })
    }


    let chatBotType = model,
        style: any = temperature;


    // 增加一个Bing的转化
    if (model == "Bing" && typeof (temperature) == 'number' && temperature > -1) style = _temperature2BingStyle(temperature);


    console.log(`sendMessageToBackground['chat-bot-talk']`, style, chatBotType, promptData)

    const data = {
        prompt: promptData,
        type: chatBotType,
        style,
        newTalk: !!newTalk
    }
    return data

}