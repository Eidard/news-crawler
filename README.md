## 설정

- node.js 설치
> https://nodejs.org/ko/download/<br>
> CentOS : curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -<br>
> Ubuntu : curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -<br>

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

- /private/credentials.json<br>
** aws configure 안해도 됨
```json
{
    "accessKeyId": "YOUR_ACCESS_KEY_ID",
    "secretAccessKey": "YOUR_SECRET_ACCESS_KEY",
    "region": "YOUR_REGION"
}
```

- DB (mysql)
테이블 생성
```sql
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(511) NOT NULL,
  `newspaper` varchar(15) NOT NULL,
  `category` varchar(31) NOT NULL,
  `division` varchar(31) NOT NULL,
  `date` varchar(15) NOT NULL,
  `title` varchar(255) NOT NULL,
  `texturl` varchar(1023) NOT NULL,
  `textsize` int(11) NOT NULL,
  `textwc` int(11) NOT NULL,
  `textsc` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_UNIQUE` (`url`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```


- AWS S3
1. AWS Console S3에서 사용할 S3 버켓 선택 -> 상단 탭 '권한' -> 'CORS 구성' -> 아래 소스 붙여넣고 사이트 배포할 URL로 수정한 다음 '저장'<br>
**  http://13.209.193.98:50000는 배포할 사이트 URL<br>
*** http://localhost:50000는 테스트용
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>http://13.209.193.98:50000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
</CORSRule>
<CORSRule>
    <AllowedOrigin>http://localhost:50000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
</CORSRule>
</CORSConfiguration>
```

2. AWS Console S3에서 사용할 S3 버켓 선택 -> 상단 탭 '권한' -> '버킷정책' -> [정책생성기](https://awspolicygen.s3.amazonaws.com/policygen.html)에서 아래처럼 GetObject에 대해 허용하는 소스를 생성하여 입력하고 '저장'<br>
** arn:aws:s3:::<bucket_name>/* 사용하는 ARN
```json
{
  "Id": "Policy1552798068293",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1552798062234",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::<bucket_name>/*",
      "Principal": "*"
    }
  ]
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
