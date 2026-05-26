const http = require('http');
const https = require('https');
const url = require('url');

const clientId = 'pIhvAZ5EwoMLZqIwURIU';
const clientSecret = 'hUG1EI9cAw';
const redirectURI = encodeURIComponent('http://localhost:3000/callback');
const state = "RANDOM_STATE";

const api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=' + redirectURI + '&state=' + state;

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === '/') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(`
      <h1>네이버 블로그 봇 권한 인증</h1>
      <p>아래 버튼을 클릭하여 대표님 네이버 계정으로 로그인해주세요.</p>
      <p style="color:red; font-weight:bold;">※ 반드시 블로그 포스팅을 올릴 대표님 계정으로 로그인하셔야 합니다!</p>
      <a href="${api_url}" style="display:inline-block; padding:10px 20px; background:#03c75a; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">네이버 로그인하기</a>
    `);
  } else if (reqUrl.pathname === '/callback') {
    const code = reqUrl.query.code;
    const state = reqUrl.query.state;
    
    if(!code) {
      res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
      return res.end('<h1>오류: 코드를 받지 못했습니다.</h1>');
    }

    const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURI}&code=${code}&state=${state}`;

    https.get(tokenUrl, (tokenRes) => {
      let body = '';
      tokenRes.on('data', chunk => body += chunk);
      tokenRes.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.access_token) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(`
              <h1>🎉 인증 완료!</h1>
              <p>토큰 발급이 성공했습니다.</p>
              <p>원래 있던 터미널(VSCode 등) 화면으로 돌아가 진행 상황을 확인해주세요.</p>
              <script>setTimeout(() => window.close(), 3000);</script>
            `);
            console.log("\n=======================================================");
            console.log("✅ 네이버 Access Token 발급 성공!");
            console.log("Access Token:", result.access_token);
            console.log("=======================================================\n");
            
            // Execute firebase command to set secret automatically
            const { exec } = require('child_process');
            console.log("👉 Firebase 보안 저장소에 자동으로 키를 등록 중입니다. (잠시만 기다려주세요...)");
            
            // Create a temporary file to pipe into firebase functions:secrets:set
            const fs = require('fs');
            const path = require('path');
            const tempFilePath = path.join(process.cwd(), 'temp_access_token.txt');
            fs.writeFileSync(tempFilePath, result.access_token);

            exec('npx firebase-tools functions:secrets:set NAVER_ACCESS_TOKEN --data-file ' + tempFilePath, (error, stdout, stderr) => {
              if (error) {
                console.error("❌ Firebase 등록 실패! 수동으로 등록해주세요.");
                console.error(error.message);
              } else {
                console.log("✅ Firebase에 NAVER_ACCESS_TOKEN 등록 완료!");
              }
              if(fs.existsSync(tempFilePath)) {
                  fs.unlinkSync(tempFilePath);
              }
              console.log("\n모든 작업이 완료되었습니다! 터미널 창에서 [Ctrl + C]를 눌러 서버를 종료하세요.");
              process.exit(0);
            });

          } else {
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('Token 발급 실패: ' + body);
            console.error('Token 발급 실패:', body);
          }
        } catch(e) {
          console.error("JSON 파싱 에러:", e);
        }
      });
    }).on('error', (e) => {
      console.error(e);
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('----------------------------------------------------');
  console.log('🚀 아래 주소를 [Ctrl + 클릭] 해서 인증을 진행해주세요!');
  console.log('👉 http://localhost:3000');
  console.log('----------------------------------------------------');
});
