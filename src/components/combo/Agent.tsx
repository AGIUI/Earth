
// 解析字符串成json，并高亮信息
const parseJSONAndHighlightText = (text = '', elements: any) => {
    let success = false;
    try {
        let itemsIndex = JSON.parse(text);
        for (const item of itemsIndex) {
            if (elements[item]) elements[item].style = `background-color: #ffffbb;
            color: black;
            padding: 8px;`
        }
        success = true;
    } catch (error) {

    }
    return success
}

export {
    parseJSONAndHighlightText
}