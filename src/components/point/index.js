import { i18n, lan } from "../../unit/const";
const DF = i18n.point[lan];
const ZDF = i18n.highestScore[lan];
const SLDF = i18n.lastRound[lan];
let Point = {
  timeout: null,
};
import Number from "../number/index.vue";
export default {
  props: ["cur", "point", "max"],
  mounted() {
    this.onChange(this.$props);
  },
  components: {
    Number,
  },
  data() {
    return {
      label: "",
      number: 0,
    };
  },
  watch: {
    $props: {
      deep: true,
      handler(nextProps) {
        this.onChange(nextProps);
      },
    },
  },
  methods: {
    onChange({ cur, point, max }) {
      clearInterval(Point.timeout);
      if (cur) {
        // 게임 진행 중인 경우
        this.label = point >= max ? ZDF : DF;
        this.number = point;
      } else {
        // 게임 시작하지 않은 경우
        const toggle = () => {
          // 최고 점수와 마지막 라운드 점수가 교대로 나타납니다.
          this.label = SLDF;
          this.number = point;
          Point.timeout = setTimeout(() => {
            this.label = ZDF;
            this.number = max;
            Point.timeout = setTimeout(toggle, 3000);
          }, 3000);
        };

        if (point !== 0) {
          // 마지막 라운드를 하지 않았을 경우 알림을 띄우지 않습니다.
          toggle();
        } else {
          this.label = ZDF;
          this.number = max;
        }
      }
    },
  },
};
