var util = {
    decodeQuery: function(queryObj) { //URI 인코딩된 쿼리 문자열을 디코드
        let query = {};
        Object.keys(queryObj).forEach(key => {
            let val = queryObj[key];
            if (val != undefined && val != '')
                query[key] = decodeURIComponent(val);
        });
        return query;
    }
}

module.exports = util;