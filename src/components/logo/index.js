import { i18n, lan } from "../../unit/const";
let Logo = {
  timeout: null,
};
export default {
  props: ["cur", "reset"],
  data() {
    return {
      style: "r1",
      display: "none",
    };
  },
  watch: {
    $props: {
      deep: true,
      handler(nextProps, oldProps) {
        this.animate(nextProps);
        if (
          // 게임이 시작되거나 종료될 때만 변화를 발생시킴
          ([oldProps.cur, nextProps.cur].indexOf(false) !== -1 &&
            oldProps.cur !== nextProps.cur) ||
          oldProps.reset !== nextProps.reset
        ) {
          this.animate(nextProps);
        }
      },
    },
  },
  computed: {
    titleCenter() {
      return i18n.titleCenter[lan];
    },
  },
  beforeMount() {
    this.animate(this.$props);
  },
  methods: {
    animate({ cur, reset }) {
      clearTimeout(Logo.timeout);
      this.style = "r1";
      this.display = "none";
      if (cur || reset) {
        this.display = "none";
        return;
      }

      let m = "r"; // 방향
      let count = 0;

      const set = (func, delay) => {
        if (!func) {
          return;
        }
        Logo.timeout = setTimeout(func, delay);
      };

      const show = (func) => {
        // 나타나기
        set(() => {
          this.display = "block";
          if (func) {
            func();
          }
        }, 150);
      };

      const hide = (func) => {
        // 사라지기
        set(() => {
          this.display = "none";
          if (func) {
            func();
          }
        }, 150);
      };

      const eyes = (func, delay1, delay2) => {
        // 눈 깜박임
        set(() => {
          this.style = m + 2;
          set(() => {
            this.style = m + 1;
            if (func) {
              func();
            }
          }, delay2);
        }, delay1);
      };

      const run = (func) => {
        // 뛰기 시작!
        set(() => {
          this.style = m + 4;
          set(() => {
            this.style = m + 3;
            count++;
            if (count === 10 || count === 20 || count === 30) {
              m = m === "r" ? "l" : "r";
            }
            if (count < 40) {
              run(func);
              return;
            }
            this.style = m + 1;
            if (func) {
              set(func, 4000);
            }
          }, 100);
        }, 100);
      };

      const dra = () => {
        count = 0;
        eyes(
          () => {
            eyes(
              () => {
                eyes(
                  () => {
                    this.style = m + 2;
                    run(dra);
                  },
                  150,
                  150
                );
              },
              150,
              150
            );
          },
          1000,
          1500
        );
      };

      show(() => {
        // 깜빡임 효과
        hide(() => {
          show(() => {
            hide(() => {
              show(() => {
                dra(); // 뛰기 시작
              });
            });
          });
        });
      });
    },
  },
};
