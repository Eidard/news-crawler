## 설정

- node.js 설치
> https://nodejs.org/ko/download/<br>

- dependency 
> $ git clone<br>
> $ cd news-crawler/<br>
> $ npm install<br>

- /private/config.json
```json
{
    "server": {
        "port": "50000"
    },
    "db": {
        "host": "db url",
        "port": "3306",
        "database": "newsdatas",
        "user": "username",
        "password": "password"
    },
    "s3": {
        "Bucket": "bucket url"
    }
}
```

- /private/credentials.json
```json
{
    "accessKeyId": "YOUR_ACCESS_KEY_ID",
    "secretAccessKey": "YOUR_SECRET_ACCESS_KEY",
    "region": "YOUR_REGION"
}
```


## 실행

- Launch
> $ npm start<br>
※ Launch on background
> $ sudo nohup npm start &<br>

- Check
> localhost:50000<br>


## 실행화면
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
      <img src='https://postfiles.pstatic.net/MjAxOTAzMTdfMTIy/MDAxNTUyNzcyMTIzNjY2.Env2rijKmDG6heWeLjjboqa9xY4LtX2Ec7fcybi6swsg.CYC6ACtJJbPYH2l1sTHyq9C_7rmJ2qfjBsUE-ADUi38g.PNG.dragon20002/SE-f1f8bb78-54c9-4237-9b3b-fbe142360839.png?type=w773'>
    </td>
    <td>
      <img src='https://postfiles.pstatic.net/MjAxOTAzMTdfMTc0/MDAxNTUyNzcyMTI5NTk1.Jk-u2BoFfKKXJR4wGWzp_nP7y_LN-p39gl_529aavwog.3iOZ-Ei-Bu9nAd-uHpEO-M4fxEh55qanafdRCe0UxoUg.PNG.dragon20002/SE-7896fc3e-6d87-4f7a-af6d-86285b9933d5.png?type=w773'>
    </td>
  </tr>
</table>
