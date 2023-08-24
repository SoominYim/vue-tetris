import Vbutton from "./button/index.vue";
import { i18n, lan } from "../../unit/const";
import store from "../../vuex/store";
import todo from "../../control/todo";
export default {
  props: ["filling"],
  data() {
    return {
      fillingNum: 0,
    };
  },
  watch: {
    $props: {
      deep: true,
      handler(nextProps) {
        this.fillingNum = nextProps.filling + 20;
      },
    },
  },
  computed: {
    keyboard() {
      return this.$store.state.keyboard;
    },
    rotation: () => i18n.rotation[lan],
    labelLeft: () => i18n.left[lan],
    labelRight: () => i18n.right[lan],
    labelDown: () => i18n.down[lan],
    labelDropSpace: () => `${i18n.drop[lan]} (SPACE)`,
    labelResetR: () => `${i18n.reset[lan]}(R)`,
    labelSoundS: () => `${i18n.sound[lan]}(S)`,
    labelPauseP: () => `${i18n.pause[lan]}(P)`,
  },
  mounted() {
    const touchEventCatch = {}; // 모바일 조작에 대한 처리: touchstart 이벤트 발생 시 기록을 남기고, 그 후의 마우스 이벤트는 무시

    // 마우스 이벤트 중 mousedown이 발생했을 때, 해당 요소가 사라져도 mouseup을 발생시키지 않을 수 있습니다.
    // 이에 대한 처리를 하기 위해 mouseout을 이용해 마우스 이벤트와 관련된 상황을 처리합니다.
    const mouseDownEventCatch = {};
    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.preventDefault) {
          e.preventDefault();
        }
      },
      true
    );
    document.addEventListener(
      "touchend",
      (e) => {
        if (e.preventDefault) {
          e.preventDefault();
        }
      },
      true
    );

    // 더블 핑거 확대 제스처 막기
    document.addEventListener("gesturestart", (event) => {
      event.preventDefault();
    });

    document.addEventListener(
      "mousedown",
      (e) => {
        if (e.preventDefault) {
          e.preventDefault();
        }
      },
      true
    );
    Object.keys(todo).forEach((key) => {
      this.$refs[`dom_${key}`].$el.addEventListener(
        "mousedown",
        () => {
          if (touchEventCatch[key] === true) {
            return;
          }
          todo[key].down(store);
          mouseDownEventCatch[key] = true;
        },
        true
      );
      this.$refs[`dom_${key}`].$el.addEventListener(
        "mouseup",
        () => {
          if (touchEventCatch[key] === true) {
            touchEventCatch[key] = false;
            return;
          }
          todo[key].up(store);
          mouseDownEventCatch[key] = false;
        },
        true
      );
      this.$refs[`dom_${key}`].$el.addEventListener(
        "mouseout",
        () => {
          if (mouseDownEventCatch[key] === true) {
            todo[key].up(store);
          }
        },
        true
      );
      this.$refs[`dom_${key}`].$el.addEventListener(
        "touchstart",
        () => {
          touchEventCatch[key] = true;
          todo[key].down(store);
        },
        true
      );
      this.$refs[`dom_${key}`].$el.addEventListener(
        "touchend",
        () => {
          todo[key].up(store);
        },
        true
      );
    });
  },
  components: {
    Vbutton,
  },
};
