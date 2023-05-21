
const sleep = (t = 1000) => {
    return new Promise((res: any, rej) => {
        setTimeout(() => res(), t)
    })
}

// 解析字符串成json，并高亮信息
const highlightText = async (text = '', elements: any) => {
    let success = false;
    try {
        // let itemsIndex = JSON.parse(text);
        const target = [];
        for (const element of elements) {
            if (text.match(element.id)) {
                element.style = `background-color: #ffffbb;
            color: black;
            padding: 8px;`
                // console.log(element.id, element)
                target.push(element)
            }
        }

        for (const t of target) {
            t.scrollIntoView();
            await sleep(2000)
        }

        success = true;
    } catch (error) {

    }
    return success
}

// 知识星球自动发内容 https://wx.zsxq.com/dweb2/index/group/481225281248
const postTopicForZsxq = async (text: any) => {
    const h: any = document.querySelector('.post-topic-head');
    h.click();
    await sleep(1000)
    const inp: any = document.querySelector('.ql-editor');
    inp.innerText = text;
    await sleep(1000)
    const btn: any = document.querySelector('.submit-btn');
    btn.click()
}

export {
    highlightText,postTopicForZsxq
}