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
    src="https://smile-tap.s3.ap-northeast-2.amazonaws.com/prod/system/images/SmileTap+LOGO_1_rectangle.jpg"
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
    스마일탭의 가입을환영합니다.<br />
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
  <a style="font-size: 14px;
  font-family: "NanumSquare", sans-serif;" href=""> 이메일 인증에 어려움이 있으신가요? </a
  ><br /><br />
  <a style="font-size: 14px;
  font-family: "NanumSquare", sans-serif;" href=""> 이메일 인증을 요청한 적이 없나요? </a>
  <br /><br />
  <hr />
  <div style="font-size: 14px;
  color: #848484;
  font-family: "NanumSquare", sans-serif;">
    본 메일은 발신전용이며, 문의에 대한 회신은 처리되지 않습니다. 스테이션제로샵
    관련하여 궁금하신 점이나 불편한 사항은 <a href="">도움말</a>을
    확인해보세요.(주)에코넥트 주식회사 | 대표 : 조민형 | 주소 : 서울특별시 마포구 백범로31길 21 서울창업허브 본관 803호
  </div>
</div>
`;
}
