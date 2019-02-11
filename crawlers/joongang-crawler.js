const cheerio = require('cheerio'); //html 페이지 크롤링

const Crawler = require('./crawler');


class JoongangCrawler extends Crawler {

    constructor(newsCategory, newsDivision, startDate, endDate) {
        super("joongang", newsCategory, newsDivision, startDate, endDate);
        this.categoryIds = {
            'National': '03',
            'Business': '05',
            'Opinion': '01',
            'Culture ': '02',
            'Sports': '07',
            'Foreign community': '04'
        };

        this.divisionIds = {
            'National': {
                'Politics': '0101',
                'Social affairs': '0201',
                'Education': '0301',
                'People': '0401',
                'Special Series': '0501'
            },
            'Business': {
                'Economy': '0101',
                'Finance': '0201',
                'Industry': '0301',
                'Stock Market': '0401',
                'Special Series': '0601',
                'Sponsored Report': '0607'
            },
            'Opinion': {
                'Editorials': '0101',
                'Columns': '0201',
                'Fountain': '0301',
                'Cartoons': '0401',
                'Letters': '0501'
            },
            'Culture ': {
                'Features': '0101',
                'Arts': '0201',
                'Entertainment': '0301',
                'Style & Travel': '0401',
                'Movie': '0901',
                'Korean Heritage': '0801',
                'Ticket': '0601',
                'Music & Performance': '1001'
            },
            'Sports': {
                'Domestic': '0101',
                'International': '0201',
                'Special Series': '0301'
            },
            'Foreign community': {
                'Activities': '0101',
                // 'Events': '',
                // 'Diplomatic Pouch': '',
                'Special Series': '0401'
            }
        };
    }

    getNewsBoardUrl(newsCategory, newsDivision, page) {
        let categoryId = this.categoryIds[newsCategory];
        let divisionId = this.divisionIds[newsCategory][newsDivision];
        return "http://koreajoongangdaily.joins.com/news/list/List.aspx?gCat=" + categoryId + divisionId + "&pgi=" + page;
    }

    parsePage(body, page) {
        let $ = cheerio.load(body);
        let rows = [];

        for (let i = 0; i < 10; i++) {
            let newsTitle = $('.title_cr').eq(i).text().trim();
            let newsUrl = 'http://koreajoongangdaily.joins.com' + $('.title_cr').eq(i).attr("href");
            let newsDate = this.formatDate($('.date').eq(i).text().trim());
            rows.push([newsTitle, newsUrl, newsDate]);
        }

        return rows;
    }

    parseNewsText(body) {
        let $ = cheerio.load(body);
	let $text = $('div#articlebody');
        $text.find('br').replaceWith('\n');
	return $text.text().replace(/\n\n+/gi, '\r\n').trim();
    }

    formatDate(date) {
        let month = date.substring(0, 3);
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
        let buf = date.split(" ");
        let day = buf[1].substring(0, 2);
        let year = buf[1].substring(3);
        return `${year}-${month}-${day}`;
    }
}


module.exports = JoongangCrawler;
