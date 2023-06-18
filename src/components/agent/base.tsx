

function addHighlight(dom: any) {
    if (dom) dom.style.border = "1px solid yellow"
}


async function inputByQueryBase(query: string, text: string) {
    const inp: any = document.querySelector(query);
    if (inp) {
        inp.innerText = text;
        inp.value = text;
        inp.focus()
        inp.select()
        document.execCommand("insertText", false, text)
        addHighlight(inp)
    }

}

function clickByQueryBase(query: string) {
    const dom: any = document.querySelector(query);
    if (dom) {
        dom.click();
        addHighlight(dom)
    }
}

export {
    inputByQueryBase,
    clickByQueryBase
}