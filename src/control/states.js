import store from "../vuex/store";
import { want, isClear, isOver } from "../unit/";
import {
  speeds,
  blankLine,
  blankMatrix,
  clearPoints,
  eachLines,
} from "../unit/const";
import { music } from "../unit/music";

const getStartMatrix = (startLines) => {
  // 시작 라인 생성
  const getLine = (min, max) => {
    // min에서 max까지의 강조된 블록 수를 가진 한 줄을 반환 (포함)
    const count = parseInt((max - min + 1) * Math.random() + min, 10);
    const line = [];
    for (let i = 0; i < count; i++) {
      // 강조된 블록 삽입
      line.push(1);
    }
    for (let i = 0, len = 10 - count; i < len; i++) {
      // 무작위 위치에 회색 블록 삽입
      const index = parseInt((line.length + 1) * Math.random(), 10);
      line.splice(index, 0, 0);
    }

    return line;
  };
  let startMatrix = [];

  for (let i = 0; i < startLines; i++) {
    if (i <= 2) {
      // 0-3
      startMatrix.push(getLine(5, 8));
    } else if (i <= 6) {
      // 4-6
      startMatrix.push(getLine(4, 9));
    } else {
      // 7-9
      startMatrix.push(getLine(3, 9));
    }
  }
  for (let i = 0, len = 20 - startLines; i < len; i++) {
    // 상단에 회색 블록 삽입
    startMatrix.unshift(blankLine);
  }
  return startMatrix;
};

const states = {
  // 자동 하강 setTimeout 변수
  fallInterval: null,

  // 게임 시작
  start: () => {
    if (music.start) {
      music.start();
    }
    const state = store.state;
    states.dispatchPoints(0);
    store.commit("speedRun", state.speedStart);
    const startLines = state.startLines;
    const startMatrix = getStartMatrix(startLines);
    store.commit("matrix", startMatrix);
    store.commit("moveBlock", { type: state.next });
    store.commit("nextBlock", "");
    states.auto();
  },

  // 자동 하강
  auto: (timeout) => {
    const out = timeout < 0 ? 0 : timeout;
    let state = store.state;
    let cur = state.cur;
    const fall = () => {
      state = store.state;
      cur = state.cur;
      const next = cur.fall();
      if (want(next, state.matrix)) {
        store.commit("moveBlock", next);
        states.fallInterval = setTimeout(fall, speeds[state.speedRun - 1]);
      } else {
        let matrix = JSON.parse(JSON.stringify(state.matrix));
        const shape = cur && cur.shape;
        const xy = cur && cur.xy;
        shape.forEach((m, k1) =>
          m.forEach((n, k2) => {
            if (n && xy[0] + k1 >= 0) {
              // 세로 좌표가 음수일 수 있음
              let line = matrix[xy[0] + k1];
              line[xy[1] + k2] = 1;
              matrix[xy[0] + k1] = line;
            }
          })
        );
        states.nextAround(matrix);
      }
    };
    clearTimeout(states.fallInterval);
    states.fallInterval = setTimeout(
      fall,
      out === undefined ? speeds[state.speedRun - 1] : out
    );
  },

  // 블록 종료 후 다음 블록 호출
  nextAround: (matrix, stopDownTrigger) => {
    clearTimeout(states.fallInterval);
    store.commit("lock", true);
    store.commit("matrix", matrix);
    if (typeof stopDownTrigger === "function") {
      stopDownTrigger();
    }

    const addPoints = store.state.points + 10 + (store.state.speedRun - 1) * 2; // 속도가 빠를수록 높은 점수 부여

    states.dispatchPoints(addPoints);

    if (isClear(matrix)) {
      if (music.clear) {
        music.clear();
      }
      return;
    }
    if (isOver(matrix)) {
      if (music.gameover) {
        music.gameover();
      }
      states.overStart();
      return;
    }
    setTimeout(() => {
      store.commit("lock", false);
      store.commit("moveBlock", { type: store.state.next });
      store.commit("nextBlock", "");
      states.auto();
    }, 100);
  },

  // 페이지 포커스 변환
  focus: (isFocus) => {
    store.commit("focus", isFocus);
    if (!isFocus) {
      clearTimeout(states.fallInterval);
      return;
    }
    const state = store.state;
    if (state.cur && !state.reset && !state.pause) {
      states.auto();
    }
  },

  // 일시 정지
  pause: (isPause) => {
    store.commit("pause", isPause);
    if (isPause) {
      clearTimeout(states.fallInterval);
      return;
    }
    states.auto();
  },

  // 줄 삭제
  clearLines: (matrix, lines) => {
    const state = store.state;
    let newMatrix = JSON.parse(JSON.stringify(matrix));
    lines.forEach((n) => {
      newMatrix.splice(n, 1);
      // newMatrix = newMatrix.unshift(List(blankLine))
      newMatrix.unshift(blankLine);
    });
    store.commit("matrix", newMatrix);
    store.commit("moveBlock", { type: state.next });
    store.commit("nextBlock", "");
    states.auto();
    store.commit("lock", false);
    const clearLines = state.clearLines + lines.length;
    store.commit("clearLines", clearLines);

    const addPoints = store.state.points + clearPoints[lines.length - 1]; // 한 번에 삭제하는 줄이 많을수록 더 많은 점수 부여
    states.dispatchPoints(addPoints);

    const speedAdd = Math.floor(clearLines / eachLines); // 삭제된 줄 수에 따른 속도 증가
    let speedNow = state.speedStart + speedAdd;
    speedNow = speedNow > 6 ? 6 : speedNow;
    store.commit("speedRun", speedNow);
  },

  // 게임 종료, 애니메이션 시작
  overStart: () => {
    clearTimeout(states.fallInterval);
    store.commit("lock", true);
    store.commit("reset", true);
    store.commit("pause", false);
  },

  // 게임 종료 애니메이션 완료
  overEnd: () => {
    store.commit("matrix", blankMatrix);
    store.commit("moveBlock", { reset: true });
    store.commit("reset", false);
    store.commit("lock", false);
    store.commit("clearLines", 0);
  },

  // 점수 입력
  dispatchPoints: (point) => {
    // 점수 입력 및 최고 점수를 생성하는지 확인
    store.commit("points", point);
    if (point > 0 && point > store.state.max) {
      store.commit("max", point);
    }
  },
};

export default states;
