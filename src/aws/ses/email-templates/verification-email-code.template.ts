export function verificationEmailCodeTemplate(code: string) {
  return `<style>
  .logo-stationzeroshop {
    width: 250px;
    height: auto;
    margin-bottom: 60px;
  }
  .template-main {
    width: 100%;
    height: auto;
    padding-top: 60px;
    padding-bottom: 60px;
    padding-left: 20px;
    padding-right: 20px;
    background-color: white;
  }
  .text-big {
    font-size: 28px;
    font-weight: 600;
    color: black;
    font-family: "NanumSquare", sans-serif;
    margin-bottom: 30px;
  }
  .text-normal {
    font-size: 14px;
    color: black;
    font-family: "NanumSquare", sans-serif;
    margin-bottom: 30px;
  }
  .text-info {
    font-size: 14px;
    color: #848484;
    font-family: "NanumSquare", sans-serif;
  }
  .code-area {
    width: 100%;
    letter-spacing: 2px;
    padding: 12px;
    font-size: 38px;
    font-weight: 400;
    color: #2e2e2e;
    background-color: #f2f2f2;
    align-items: left;
    margin-bottom: 30px;
  }
  .text-guide {
    font-size: 14px;
    font-family: "NanumSquare", sans-serif;
  }
</style>
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css"
/>

<div style="width: 100%;
height: auto;
padding-top: 60px;
padding-bottom: 60px;
padding-left: 20px;
padding-right: 20px;
background-color: white;">
  <img
    style="width: 250px;
    height: auto;
    margin-bottom: 60px;"
    src="https://artinfo.s3.ap-northeast-2.amazonaws.com/ART.png"
  />
  <div style="font-size: 28px;
  font-weight: 600;
  color: black;
  font-family: "NanumSquare", sans-serif;
  margin-bottom: 30px;">이메일 인증코드</div><br><br>
  <div style="font-size: 14px;
  color: black;
  font-family: "NanumSquare", sans-serif;
  margin-bottom: 30px;">
    아트인포의 가입을환영합니다.<br />
    아래의 인증코드를 입력하시면 가입을 정상적으로 진행하실 수 있습니다.
  </div><br><br>
  <div style="width: 100%;
  letter-spacing: 2px;
  padding: 12px;
  font-size: 38px;
  font-weight: 400;
  color: #2e2e2e;
  background-color: #f2f2f2;
  align-items: left;
  margin-bottom: 30px;">${code}</div>
  <div style="color: #bdbdbd; font-size: 14px;
  color: black;
  font-family: "NanumSquare", sans-serif;
  margin-bottom: 30px;">
    인증 코드는 일정시간 내에서만 유효하며, 그 이후 인증코드는 무효화됩니다.<br />인증
    코드가 무효화되었을 경우, 새롭게 인증 코드를 요청하십시오.
  </div><br><br>
</div>
`;
}
