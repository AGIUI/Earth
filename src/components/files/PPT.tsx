import * as React from "react";

import pptxgen from "pptxgenjs";


class PPT{
    constructor() {}
    _createTitle(slide: any, text: string) {
        let opts: any = {
            x: 0,
            y: 1,
            w: "100%",
            h: 2,
            align: "center",
            color: "0088CC",
            fill: "F1F1F1",
            fontSize: 24,
        }
        slide.addText(text, opts);
        return slide
    }

    _createImage(slide: pptxgen.Slide, title: any, base64: any) {
        slide.addText(title, {
            x: 6.9,
            y: 0.6,
            w: 2.75,
            h: 2.5,
            margin: 4,
            fill: { color: "F1F1F1" },
            fontSize: 12,
            fontFace: "Segoe UI",
            color: "0088CC",
            valign: "top",
            align: "center",
        });
        slide.addImage({ x: 7.53, y: 1.1, w: 1.5, h: 1.5, data: base64 });
    }

    create(fileName: string, items: any = [{
        title: "BONJOUR - CIAO - GUTEN TAG - HELLO - HOLA - NAMASTE - 你好",
        images: [{
            title: '示例',
            base64: ''
        }]
    }]) {
        let pptx = new pptxgen();

        for (const item of items) {
            let slide = pptx.addSlide();
            this._createTitle(slide, item.title)
            if(item.images) for (const image of item.images) {
                this._createImage(slide, image.title, image.base64)
            }
        }


        pptx.writeFile({ fileName: fileName });

    }
}

export default PPT;