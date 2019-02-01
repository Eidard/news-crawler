## 환경구축

- node.js 설치

- npm 설치

- news/package.json 에 있는 dependency 설치
> news.zip 압축 풀기<br>
> $ cd news/<br>
> $ npm install<br>


## 배포

- Set PORT
> news/main.js 15번 줄에서 배포할 포트를 설정<br>

- Launch
> $ npm start<br>

- (Option) Launch as daemon
> 백그라운드에서 실행할 경우 npm start를 nohup 명령어를 통해 실행한다.<br>
> $ sudo nohup npm start &<br>

- Check
> 브라우저에서 ip: 설정한 포트 입력하여 배포 확인<br>
> localhost:50000<br>


## 웹페이지
![웹페이지](https://postfiles.pstatic.net/MjAxOTAyMDFfODkg/MDAxNTQ4OTk5MDk5NDc2.986er7T690fgAGlO-QdLZ3WxK5o7Z2ycIgGpFwwRWJMg.rfc-SXXR3aupMQq5UWgzlWN3EaKBHUuew6fHzSPKyxEg.PNG.dragon20002/news-crawler.png?type=w580)
