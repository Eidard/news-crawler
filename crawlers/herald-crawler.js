const cheerio = require('cheerio'); //html 페이지 크롤링

const Crawler = require('./crawler');

class HeraldCrawler extends Crawler {

    constructor(newsCategory, newsDivision, startDate, endDate, sessionId) {
        super("herald", newsCategory, newsDivision, startDate, endDate, sessionId);
        this.categoryIds = {
            'National': '01',
            'Business': '02',
            'Finance' : '19',
            'Life&Style': '03',
            'Entertainment': '04',
            'Sports': '05',
            'World': '12'
        };

        this.divisionIds = {
            'National': {
                'Politics': '01000000',
                'Social Affairs': '02000000',
                'Foreign Affairs': '03000000',
                'Defense': '06000000',
                'North Korea': '04000000',
                'Science': '07000000',
                'Diplomatic Circuit': '12000000',
                'Education': '09000000'
            },
            'Business': {
                //'Economy': '01000000', moved to Category-Finance
                //'Finance': '02000000', changed as Category
                'Industry': '03000000',
                'Technology': '06000000',
                'Automode': '05000000', // named changed. current name is 'Transport'
                'Retail' : '10000000'
            },
            'Finance' : {
                'Economy' : '01000000',
                'Market' : '02000000',
                'Money' : '03000000'
            },
            'Life&Style': {
                'Culture': '07000000',
                'Travel': '01000000',
                'Fashion': '02000000',
                'Food&Beverage': '03000000',
                'Books': '04000000',
                'People': '05000000',
                'Expat Living': '06000000',
                'Arts&Design': '08000000',
                'Health': '09000000'
            },
            'Entertainment': {
                'Film': '01000000',
                'Television': '02000000',
                'Music': '03000000',
                'Theater': '04000000',
                'K-pop' : '09000000'
            },
            'Sports': {
                'Soccer': '01000000',
                'Baseball': '02000000',
                'Golf': '03000000',
                'More Sports': '04000000'
            },
            'World': {
                'World News': '01000000',
                'World Business': '02000000',
                'Asia News Network': '04000000'
            }
        };
    }

    getNewsBoardUrl(newsCategory, newsDivision, page) {
        let categoryId = this.categoryIds[newsCategory];
        if (categoryId == undefined)
            return null;
        let divisionId = this.divisionIds[newsCategory][newsDivision];
        if (divisionId == undefined)
            return null;
        return "http://www.koreaherald.com/list.php?ct=02"
            + categoryId + divisionId + "&ctv=0&np=" + page;
    }

    parsePage(body, page) {
        let $ = cheerio.load(body);
        let rows = [];

        let s = 0, e = 15;

        /*
        let s = 1, e = 15;
        if (page == 1) {
            s = 0, e = 14;
            let newsTitle = $('.main_l_t1').eq(1).text().trim();
            let newsUrl = 'http://www.koreaherald.com' + $('.main_sec_li > li>a').eq(1).attr("href");
            let newsDate = this.formatDate(newsUrl.substring(39, 47));
            if (newsDate != null)
                rows.push([newsTitle, newsUrl, newsDate]);
        }
         */
        for (let i = s; i < e; i++) {
            let newsTitle = $('.main_l_t1').eq(i).text().trim();
            let newsUrl = 'http://www.koreaherald.com' + $('.main_sec_li > li>a').eq(i).attr("href");
            let newsDate = this.formatDate(newsUrl.substring(39, 47));
            if (newsDate != null)
                rows.push([newsTitle, newsUrl, newsDate]);
        }

        return rows;
    }

    parseNewsText(body) {
        let $ = cheerio.load(body);
        let $text = $('div#articleText');
        $text.find('br').replaceWith('\n');
        return $text.text().replace(/\n\n+/gi, '\r\n').trim();
    }
    
    formatDate(date) {
        if (date == '') return null;
        let year = date.substring(0, 4);
        let month = date.substring(4, 6);
        let day = date.substring(6, 8);
        if (year == '' || month == '' || day == '')
            return null;

        return `${year}-${month}-${day}`;
    }
}


module.exports = HeraldCrawler;
