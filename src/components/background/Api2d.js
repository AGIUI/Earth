const getPoints = (token) => {
    return fetch('https://openai.api2d.net/dashboard/billing/credit_grants', {
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