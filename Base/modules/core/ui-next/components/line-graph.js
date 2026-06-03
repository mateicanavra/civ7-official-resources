import { template, use, className } from '../../vendor/solid-js/web/dist/web.js';
import { onMount, onCleanup, createEffect, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { Layout } from '../../ui/utilities/utilities-layout.js';

var _tmpl$ = /* @__PURE__ */ template(`<canvas></canvas>`);
const LineGraph = (props) => {
  let myCanvas;
  let graph;
  let graphConfig = void 0;
  onMount(() => {
    if (myCanvas) {
      const canvasContext = myCanvas.getContext("2d");
      if (canvasContext) {
        graphConfig = {
          type: "line",
          data: {
            datasets: []
          },
          options: {
            animation: false,
            normalized: true,
            spanGaps: true,
            scales: {
              y: {
                grid: {
                  color: props.gridColorX ? props.gridColorX : "transparent"
                },
                type: "linear",
                title: {
                  display: props.axisLabelY != void 0,
                  text: props.axisLabelY,
                  color: props.axisLabelColor,
                  padding: 0
                },
                display: true,
                max: props.maxY
              },
              x: {
                grid: {
                  color: props.gridColorY ? props.gridColorY : "transparent"
                },
                type: "linear",
                title: {
                  display: props.axisLabelX != void 0,
                  text: props.axisLabelX,
                  color: props.axisLabelColor,
                  padding: {
                    top: 0,
                    bottom: 16
                  }
                },
                display: true,
                max: props.maxX
              }
            },
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: false
              },
              subtitle: {
                display: false
              },
              decimation: {
                enabled: true,
                algorithm: "lttb"
              },
              tooltip: {
                enabled: false
              }
            },
            elements: {
              point: {
                radius: props.pointRadius != void 0 ? props.pointRadius : 0
              }
            }
          }
        };
        const l = JSON.parse(JSON.stringify(props.lines));
        l.forEach((line) => {
          graphConfig.data.datasets.push({
            data: line.points,
            order: line.order,
            fill: false,
            backgroundColor: "#008000",
            borderColor: props.dashed ? "rgba(0, 0, 0, 0)" : line.color,
            borderWidth: props.width,
            tension: 0,
            spanGaps: true,
            scaleHack: false
          });
        });
        graphConfig.data.datasets.push({
          data: [{
            x: 0,
            y: 0
          }, {
            x: props.maxX ? props.maxX : 0,
            y: props.maxY ? props.maxY : 0
          }],
          fill: false,
          backgroundColor: "transparent",
          borderColor: "transparent",
          tension: 0,
          spanGaps: true,
          scaleHack: true
        });
        const currLocale = Locale.getCurrentDisplayLocale();
        let fontFamily = "BodyFont";
        switch (currLocale) {
          case "ko_KR":
            fontFamily = "BodyFont-KR";
            break;
          case "ja_JP":
            fontFamily = "BodyFont-JP";
            break;
          case "zh_Hans_CN":
            fontFamily = "BodyFont-SC";
            break;
          case "zh_Hant_HK":
            fontFamily = "BodyFont-TC";
            break;
        }
        if (typeof Chart != "undefined") {
          Chart.defaults.maintainAspectRatio = false;
          Chart.defaults.font.size = Layout.textSizeToScreenPixels("base");
          Chart.defaults.font.style = "normal";
          Chart.defaults.font.weight = "normal";
          Chart.defaults.font.family = fontFamily;
          Chart.defaults.color = props.axisNumberColor;
        }
        graph = new Chart(canvasContext, graphConfig);
        if (!graph) {
          console.error(`line-graph.tsx: chart.js failed to create graph`);
        }
        graph.update();
      }
    } else {
      console.error("line-graph.tsx: couldn't get canvas!");
    }
  });
  onCleanup(() => {
    if (graph) {
      graph.destroy();
      graph = void 0;
    }
  });
  createEffect(() => {
    if (myCanvas && graphConfig != void 0) {
      const canvasContext = myCanvas.getContext("2d");
      if (canvasContext) {
        graphConfig.options.scales.y.grid.color = props.gridColorX ? props.gridColorX : "transparent";
        graphConfig.options.scales.y.title.display = props.axisLabelY != void 0;
        graphConfig.options.scales.y.text = props.axisLabelY;
        graphConfig.options.scales.x.grid.color = props.gridColorY ? props.gridColorY : "transparent";
        graphConfig.options.scales.x.title.display = props.axisLabelX != void 0;
        graphConfig.options.scales.x.text = props.axisLabelX;
        graphConfig.options.elements.radius = props.pointRadius != void 0 ? props.pointRadius : 0;
        const l = JSON.parse(JSON.stringify(props.lines));
        l.forEach((line, index) => {
          const dataset = graphConfig.data.datasets[index];
          dataset.backgroundColor = line.color;
          dataset.order = line.order;
          dataset.borderColor = props.dashed ? "rgba(0, 0, 0, 0)" : line.color;
          dataset.borderWidth = props.width;
        });
        graph.update();
      }
    }
  });
  return (() => {
    var _el$ = _tmpl$();
    var _ref$ = myCanvas;
    typeof _ref$ === "function" ? use(_ref$, _el$) : myCanvas = _el$;
    createRenderEffect(() => className(_el$, props.class));
    return _el$;
  })();
};

export { LineGraph };
//# sourceMappingURL=line-graph.js.map
