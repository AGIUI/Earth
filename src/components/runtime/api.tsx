export function ApiRun(prompt: any, combo: any) {

    let { url, init, protocol } = prompt.api;

    if (url && !url.match('//')) url = `${protocol}${url}`;
    // console.log(api, init.body)

    if (init.body && typeof (init.body) == 'object') init.body = JSON.stringify(init.body);

    let prePromptText: any = "";
    if (prompt.input == "nodeInput") {
        prePromptText = prompt.context;
    }

    if (init.body && typeof (init.body) == 'string' && prePromptText) {
        // 替换${context} 表示从上一个节点传递来的text
        // prePromptText = prePromptText.replaceAll('"', '')
        // prePromptText = prePromptText.replaceAll("'", '')
        // prePromptText = prePromptText.replace(/\n/ig, '')
        init.body = init.body.replaceAll('${context}', prePromptText)
    }

    return {
        url, init, combo, promptId: prompt.id, prePromptText
    }

}
