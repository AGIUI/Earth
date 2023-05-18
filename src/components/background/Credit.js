/**
 * 查询剩余额度
 */

const apis = {
    'api2d': 'https://openai.api2d.net/dashboard/billing/credit_grants'
}


const getPoints = (token, apiName) => {
    return fetch(apis[apiName], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }).then(r => r.json()).then(res => {
        const expireDate = new Date(res.expire_at)
        const points = res.total_available;
        return { expireDate, points }
    }).catch(e => {
        return e
    })
}

export default {
    getPoints
}