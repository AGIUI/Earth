/**
 * copilots news prompts
 */

class Base {
    data: any;
    items: any;
    keys: string[];

    constructor(items = {}) {

        /**
         * { key: string, parseData: any, onUpdate: any}}
         */

        this.keys = Object.keys(items);

        this.items = items;

        let data: any = {};

        for (const key in this.items) {
            // 本地缓存用来加速
            const d = localStorage.getItem('_' + key) || '[]';
            data[key] = JSON.parse(d);
        }
        this.data = data;

        // console.log('base',this.data)

        // 当有数据更新时
        chrome.runtime.onMessage.addListener(async (
            request,
            sender,
            sendResponse
        ) => {
            if (request.cmd == 'get-data-from-notion-result') {
                const { results, type } = request.data;
                const item = this.items[type];
                
                if (item) {
                    if (request.success && results && results.length > 0) {
                        if (item.parseData) {
                            const d = item.parseData(results);
                            localStorage.setItem('_' + type, JSON.stringify(d));
                            this.data[type] = d;
                            if (item.onUpdate) item.onUpdate(this.data)
                        }

                    } else {
                        setTimeout(() => this.getData([type]), 3000)
                    }
                }
            }
        })

        this.getData(this.keys);

    }

    getData(keys: any) {

        for (const key of keys) {
            chrome.runtime.sendMessage({
                cmd: 'get-data-from-notion',
                data: {
                    type: key,
                    expirationTime: 1000 * 60 * 60 * 12 // 12小时
                }
            },
                response => {
                    console.log("Received response", response);
                    if (!response) setTimeout(() => this.getData([key]), 3000)
                }
            )
        }

    }
    get() {
        return this.data;
    }
}

export default Base;