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


## 
<table>
  <tr>
    <td>
<img src='https://postfiles.pstatic.net/MjAxOTAzMDNfMjE5/MDAxNTUxNTUxNzU5NDMw.pGKWoK33YAyQ84EBn48yzoiXxn8QOQEWzznkpGxAW8Mg.kJQ80ZdV4vFVtXORbnXRQ1ueX3sMHMR1UK_9TUcQV5Eg.PNG.dragon20002/SE-560ad40a-736b-4e52-9aea-abba832f75a5.png?type=w773'>
    </td>
    <td>
      <img src='https://postfiles.pstatic.net/MjAxOTAzMDVfMTc4/MDAxNTUxNzEyMzUzNDc5.uDEHbwkfRbH_k-XPiXizhCR1PnN2JXEU9OBDvN6EXUIg.nkG9_3SGyNXbW9bBaqekQ7EXp3oTS8p7gPG0ivFmYF8g.PNG.dragon20002/3.PNG?type=w773'>
    </td>
  </tr>
  <tr>
    <td>
      <img src='https://postfiles.pstatic.net/MjAxOTAzMDVfMjgw/MDAxNTUxNzEyMzUzNDg0.JTllVKissqld4c4tGl5UXXtMW4hvzIL5kcvxML8s4U8g.4dQLPbit5PI5Rq2N9C87EZ7TMWLVcbaN4fs6oza53l0g.PNG.dragon20002/1.PNG?type=w773'>
    </td>
    <td>
      <img src='https://postfiles.pstatic.net/MjAxOTAzMDVfMjgz/MDAxNTUxNzEyMzUzNDgz.ma6F_kBBO7XrV5DCSYXTbrXyx2FheBInVYM8H-JmA9Ug.Qq1iTK3LM_pK33TpWy2GJuE47mTR2JI9hgUpT9Vr1Okg.PNG.dragon20002/2.PNG?type=w773'>
    </td>
  </tr>
</table>
