const cheerio = require('cheerio'); //html 페이지 크롤링

const Crawler = require('./crawler');


class ReutersCrawler extends Crawler {

    constructor(newsCategory, newsDivision, startDate, endDate, sessionId) {
        super("reuters", newsCategory, newsDivision, startDate, endDate, sessionId);
        this.categoryIds = {
            'Banks': 'banks',
            'Business News': 'businessNews',
            'Politics': 'politicsNews',
            'Supreme Court': 'supreme-court',
            'U.S': 'domesticNews'
        }
    }

    getNewsBoardUrl(newsCategory, newsDivision, page) {
        let categoryId = this.categoryIds[newsCategory];
        if (categoryId == undefined)
            return null;
        return "https://www.reuters.com/news/archive/" + categoryId + "?view=page&page=" + page + "&pageSize=10";
    }

    parsePage(body, page) {
        let $ = cheerio.load(body);
        let rows = [];

        for (let i = 0; i < 10; i++) {
            let newsTitle = $('.story-title').eq(i).text().trim();
            let newsUrl = 'https://www.reuters.com' + $('.story-photo').eq(i).find('a').attr("href");
            let newsDate = this.formatDate($('.timestamp').eq(i).text().trim());
            rows.push([newsTitle, newsUrl, newsDate]);
        }

        return rows;
    }

    parseNewsText(body) {
        let $ = cheerio.load(body);
        let pTags = $('div').find(".StandardArticleBody_body").find('p');
        let n = pTags.length;
        let text = "";
        for (let i = 0; i < n; i++) {
            text += pTags.eq(i).text().trim() + "\r\n";
        }
        return text.trim();
    }

    formatDate(date) {
        let buf = date.split(" ");
        let year, month, day;
        if (buf.length == 2) { // ex. 2:41AM EST
            let today = new Date();
            year = today.getFullYear();
            month = today.getMonth() + 1;
            day = today.getDate();
        } else { // ex. DEC 21 2018
            buf = date.split(" ");
            month = buf[0];
            switch (month) {
                case "Jan": month = "01"; break;
                case "Feb": month = "02"; break;
                case "Mar": month = "03"; break;
                case "Apr": month = "04"; break;
                case "May": month = "05"; break;
                case "Jun": month = "06"; break;
                case "Jul": month = "07"; break;
                case "Aug": month = "08"; break;
                case "Sep": month = "09"; break;
                case "Oct": month = "10"; break;
                case "Nov": month = "11"; break;
                case "Dec": month = "12"; break;
            }
            day = buf[1];
            year = buf[2];
        }
        return `${year}-${month}-${day}`;
    }
}


module.exports = ReutersCrawler;
