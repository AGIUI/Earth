import * as React from "react";

import pptxgen from "pptxgenjs";
import { getNowDate } from "@src/components/Utils"

class PPT {
    constructor() { }
    _createTitle(slide: any, text: string) {
        let opts: any = {
            x: '10%',
            y: '5%',
            w: "80%",
            h: "20%",
            align: "left",
            color: "0088CC",
            fill: "F1F1F1",
            fontSize: 24,
            autoFit: true,
            fit: "resize",
            valign: "top"
        }
        slide.addText(text, opts);
        return slide
    }

    _createText(slide: any, text: string) {
        slide.addText(text, {
            x: '10%',
            y: '28%',
            w: "80%",
            h: "60%",
            align: "left",
            color: "0088CC",
            fill: "F1F1F1",
            fontSize: 14,
            // autoFit: true,
            // fit: "resize",
            valign: "top"
        });
        return slide
    }

    _createImage(slide: pptxgen.Slide, pos: any, base64: any) {
        const data: any = {
            x: pos.x,
            y: pos.y,
            w: pos.w,
            h: pos.h,

            sizing: { type: "contain", w: pos.w, h: pos.h }
        }
        if (!base64.match('base64,')) {
            data.path = base64;
        } else {
            data.data = base64;
        }
        slide.addImage(data);
        return slide
    }

    create(fileName: string, items: any = [{
        title: "BONJOUR - CIAO - GUTEN TAG - HELLO - HOLA - NAMASTE - 你好",
        images: [{
            title: '示例',
            base64: ''
        }]
    }]) {
        let pptx = new pptxgen();
        // pptx.layout = 'LAYOUT_16x9'; 
        // 10 x 5.625 inches
        let layoutW = 10, layoutH = 5.625;

        for (const item of items) {
            let slide = pptx.addSlide();

            if (item.title) {
                slide = this._createTitle(slide, item.title)
            }

            if (item.text) {
                slide = this._createText(slide, item.text)
            }

            if (item.images) {

                const getPos = (index: number) => {
                    let count = item.images.length;
                    let padding = 10;
                    let w = layoutW * 0.01 * (100 - padding) / count,
                        h = w,
                        x = layoutW * 0.01 * (index + 1) * (padding * 0.5 / count) + index * w,
                        y = (layoutH - w) / 2;

                    return {
                        x: x,
                        y: y,
                        w: w,
                        h: h
                    }
                }

                for (let index = 0; index < item.images.length; index++) {
                    let image = item.images[index];
                    slide = this._createImage(slide, getPos(index), image.base64)
                }
            }



        }


        return new Promise((res, rej) => {
            pptx.writeFile({ fileName: fileName }).then(fileName => {
                console.log(`created file: ${fileName}`);
                res(fileName)
            });
        })
    }


    createPPT(data: any) {
        // console.log('createPPT', data)

        let items: any = [];

        for (const d of data) {
            let div = document.createElement('div');
            const { type, html } = d;
            div.innerHTML = html;
            // div.querySelector('h1');

            if (div.querySelectorAll('img').length > 0) {
                items.push(
                    {
                        title: '',
                        images: Array.from(div.querySelectorAll('img'), im => {
                            return {
                                title: '',
                                base64: im.src
                            }
                        })
                    }
                );
            } else {
                if (div.innerText) items.push(
                    {
                        text: div.innerText,
                    }
                );
            }

        }

        console.log('createPPT', items)
        // const p = new PPT();
        return this.create(getNowDate(), items)

    }
}

export default PPT;