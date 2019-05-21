const nonEmpty = data => {
    if (typeof data == 'number') {
        return true
    }

    if (typeof data == 'boolean') {
        return true
    }

    if (data && data.length > 0) {
        return true
    }

    return false
}

const verifyParams = async (data, ...params) => {
    let result = true

    params.forEach(item => {
        if (item === 'mobile_phone_or_email') {
            result = nonEmpty(data['mobile_phone']) || nonEmpty(data['email'])
        } else if (item === 'lv') {
            if (nonEmpty(data['lv'])) {
                if (parseInt(data['lv']) === 1 ||
                    parseInt(data['lv']) === 2) {
                    result = true
                } else {
                    result = false
                }
            } else {
                result = false
            }
        } else if (item === 'membership_expired') {
            if (nonEmpty(data['membership_expired'])) {
                if (parseInt(data['membership_expired']) === 30 ||
                    parseInt(data['membership_expired']) === 90 ||
                    parseInt(data['membership_expired']) === 180 ||
                    parseInt(data['membership_expired']) === 365) {
                    result = true
                } else {
                    result = false
                }
            } else {
                result = false
            }
        } else if (!nonEmpty(data[item])) {
            result = false
        }
    })

    return result
}

module.exports = verifyParams
