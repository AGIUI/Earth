//@ts-ignore
// import pdfjsLib from '@lib/pdf.min.js'
// //@ts-ignore
// import PdfjsWorker from "@lib/pdf.worker.min.js"
// //@ts-ignore
// import { PDFViewer } from '@lib/pdf_viewer.min.js'
// import '@lib/pdf_viewer.min.css'
// pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker()


const PDF_PATH = "https://arxiv.org/pdf/2305.11175.pdf";
const PAGE_NUMBER = 1;
const PAGE_SCALE = 1.5;
const SVG_NS = "http://www.w3.org/2000/svg";

// async function pageLoaded() {
//     console.log('pdf',PDF_PATH)
//     // Loading document and page text content
//     const loadingTask = pdfjsLib.getDocument({ url:PDF_PATH });
//     const pdfDocument = await loadingTask.promise;
//     const page = await pdfDocument.getPage(PAGE_NUMBER);
//     const viewport = page.getViewport({ scale: PAGE_SCALE });
//     const textContent = await page.getTextContent();
//     // building SVG and adding that to the DOM
//     console.log('pdf',textContent)
//     // Release page resources.
//     page.cleanup();
//   }




import * as React from "react";

type PropType = {
    name: string;
    [propName: string]: any;
}

type StateType = {
    name: string;
}

interface PDF {
    state: StateType;
    props: PropType
}

class PDF extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            name: this.props.name || 'PDF'
        }
        // pageLoaded()
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: { name: string; }, prevState: any) {
        if (
            this.props.name !== prevProps.name 
        ) {
            // this.destroyConnection();
            // this.setupConnection();
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }
    
    render() {
        return (
            <div className="test">
                <div>
                    <span>hello world ~ ${this.state.name}</span>
                </div>
            </div>
        );
    }
}

export default PDF;