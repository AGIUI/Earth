import objectHash from 'object-hash'

async function chromeStorageGet(k) {
    return new Promise((res, rej) => {
        chrome.storage.local.get(k, r => {
            res(r)
        })
    })
}
// 标记来源
async function getDataFromStorage(k, expirationTime) {
    let d = await chromeStorageGet(k)
    if (
        d[k] &&
        Object.values(d[k]) &&
        Object.values(d[k]).length > 0 &&
        d[k]._date &&
        d[k].results &&
        d[k].results.length > 0
    ) {
        // console.log(d[k], Object.values(d[k]))
        if (new Date().getTime() - d[k]._date > expirationTime) return
        d[k]._from = 'storage'
        d[k]._id = k
        return d[k]
    }
    return
}

function chromeStorageSet(id, json) {
    if (json && Object.keys(json) && Object.keys(json).length > 0) {
        json = {
            _date: new Date().getTime(),
            ...json
        }
        let d = {}
        d[id] = json
        chrome.storage.local.set(d)
    }
}

function createId(json) {
    let id = objectHash(json)
    return 'n_' + id
}

//
async function getData(url = '', headers, expirationTime) {
    // 查询是否有缓存
    let id = createId({ url, headers })
    let data = await getDataFromStorage(id, expirationTime)
    if (data) {
        return data
    }

    // Default options are marked with *
    const response = await fetch(url, {
        method: 'GET',
        headers
    })
    let res = await response.json();

    // 缓存下来
    if (res.results && res.results.length > 0) res.status = 200
    if (res.status == 200) chromeStorageSet(id, res);

    return res // parses JSON response into native JavaScript objects
}

// 
async function postData(url = '', json = {}, headers, expirationTime) {
    // 查询是否有缓存
    let id = createId({ url, headers, json })
    let data = await getDataFromStorage(id, expirationTime)
    if (data) {
        return data
    }

    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: headers,
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(json) // body data type must match "Content-Type" header
    })
    let res = await response.json()
        // 缓存下来
    if (res.results && res.results.length > 0) res.status = 200
    if (res.status == 200) chromeStorageSet(id, res);

    return res
}

class Notion {
    constructor(toke) {
        this.NOTION_API_KEY = toke
    }
    getBlockChildren(block_id, expirationTime) {
        let url = `https://api.notion.com/v1/blocks/${block_id}/children?page_size=100`

        let token = this.NOTION_API_KEY
        return new Promise((res, rej) => {
            getData(
                url, {
                    Authorization: `Bearer ${token}`,
                    accept: 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                expirationTime
            ).then(rs => {
                res(rs)
            })
        })
    }

    getBlock(block_id, expirationTime) {
        let url = `https://api.notion.com/v1/blocks/${block_id}`
        let token = this.NOTION_API_KEY
        return new Promise((res, rej) => {
            getData(
                url, {
                    Authorization: `Bearer ${token}`,
                    accept: 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                expirationTime
            ).then(rs => {
                res(rs)
            })
        })
    }

    queryDatabase(database_id, expirationTime) {
        let token = this.NOTION_API_KEY
        const url = `https://api.notion.com/v1/databases/${database_id}/query`,
            payload = { page_size: 100 },
            headers = {
                accept: 'application/json',
                'Notion-Version': '2022-06-28',
                'content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }

        return new Promise((res, rej) => {
            postData(url, payload, headers, expirationTime).then(rs => {
                res(rs)
            })
        })
    }
}

export default Notion