## 환경구축

- node.js 설치

- news/package.json 에 있는 dependency 설치
> news.zip 압축 풀기<br>
> $ cd news/<br>
> $ npm install<br>


## 배포

- Set PORT
> /main.js 19번 줄에서 배포할 포트를 설정<br>
```javascript
18  // 서버 실행
19  var server = app.listen(50000, function() {
20    console.log('server running ...');
21  });
```

- Launch
> $ npm start<br>
※ Launch on background
> $ sudo nohup npm start &<br>

- Check
> localhost:50000<br>


## 웹페이지
![홈](https://postfiles.pstatic.net/MjAxOTAzMDNfMjE5/MDAxNTUxNTUxNzU5NDMw.pGKWoK33YAyQ84EBn48yzoiXxn8QOQEWzznkpGxAW8Mg.kJQ80ZdV4vFVtXORbnXRQ1ueX3sMHMR1UK_9TUcQV5Eg.PNG.dragon20002/SE-560ad40a-736b-4e52-9aea-abba832f75a5.png?type=w773)

![corpus](https://postfiles.pstatic.net/MjAxOTAzMDNfMTYx/MDAxNTUxNTUxNzU4ODE3.wpRGmRuL0_tUWpxGvYWyJuiWrtPz-1oYJuKkDJEn1x0g.rL0Ci_UGkcYIEk6JareBj9TWOkk72QdDe_dhQWBfowgg.PNG.dragon20002/SE-1462d350-be55-44a6-aa64-a7e433b13e35.png?type=w773)
