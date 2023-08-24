import store from "../vuex/store";
// Web Audio API 사용
const AudioContext =
  window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext;

export const hasWebAudioAPI = {
  data: !!AudioContext && location.protocol.indexOf("http") !== -1,
};

export const music = {};
(() => {
  if (!hasWebAudioAPI.data) {
    return;
  }
  const url = "./static/music.mp3";
  const context = new AudioContext();
  const req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "arraybuffer";

  req.onload = () => {
    context.decodeAudioData(
      req.response,
      (buf) => {
        // 가져온 오디오를 버퍼로 디코딩
        const getSource = () => {
          // 소스 생성
          const source = context.createBufferSource();
          source.buffer = buf;
          source.connect(context.destination);
          return source;
        };

        music.killStart = () => {
          // 게임 시작 음악은 한 번만 재생
          music.start = () => {};
        };

        music.start = () => {
          // 게임 시작
          music.killStart();
          if (!store.state.music) {
            return;
          }
          getSource().start(0, 3.7202, 3.6224);
        };

        music.clear = () => {
          // 블록 삭제 효과음
          if (!store.state.music) {
            return;
          }
          getSource().start(0, 0, 0.7675);
        };

        music.fall = () => {
          // 블록 빠르게 떨어지는 효과음
          if (!store.state.music) {
            return;
          }
          getSource().start(0, 1.2558, 0.3546);
        };

        music.gameover = () => {
          // 게임 종료 효과음
          if (!store.state.music) {
            return;
          }
          getSource().start(0, 8.1276, 1.1437);
        };

        music.rotate = () => {
          // 블록 회전 효과음
          if (!store.state.music) {
            return;
          }
          getSource().start(0, 2.2471, 0.0807);
        };

        music.move = () => {
          // 블록 이동 효과음
          if (!store.state.music) {
            return;
          }
          getSource().start(0, 2.9088, 0.1437);
        };
      },
      (error) => {
        if (window.console && window.console.error) {
          window.console.error(`오디오: ${url} 불러오기 오류`, error);
          hasWebAudioAPI.data = false;
        }
      }
    );
  };

  req.send();
})();
