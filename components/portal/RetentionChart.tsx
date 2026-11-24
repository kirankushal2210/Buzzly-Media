import { HOOK_THRESHOLD_SECONDS, analytics } from "@/data/portal-mock";

const { retentionCurve } = analytics;

const W = 640;
const H = 280;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const MAX_SECONDS = 30;
const HOOK_SECOND = HOOK_THRESHOLD_SECONDS;

const x = (second: number) => PAD.left + (second / MAX_SECONDS) * (W - PAD.left - PAD.right);
const y = (percent: number) => PAD.top + (1 - percent / 100) * (H - PAD.top - PAD.bottom);
const line = (key: "current" | "previous") => retentionCurve.map(point => `${x(point.second).toFixed(1)},${y(point[key]).toFixed(1)}`).join(" ");

/** Zero-dependency SVG retention curve, 0–30s, with the 3-second hook marked. */
export function RetentionChart() {
  const hook = retentionCurve.find(point => point.second === HOOK_SECOND)!;
  const end = retentionCurve[retentionCurve.length - 1];
  return (
    <figure className="retention-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="retention-chart-title retention-chart-desc">
        <title id="retention-chart-title">Viewer retention, 0 to 30 seconds</title>
        <desc id="retention-chart-desc">{`This period ${hook.current}% of viewers are still watching at 3 seconds and ${end.current}% at 30 seconds, compared with ${hook.previous}% and ${end.previous}% in the previous period.`}</desc>
        <rect className="rc-hook-zone" x={x(0)} y={PAD.top} width={x(HOOK_SECOND) - x(0)} height={H - PAD.top - PAD.bottom} />
        {[0, 25, 50, 75, 100].map(value => (
          <g key={value}>
            <line className="rc-grid" x1={PAD.left} x2={W - PAD.right} y1={y(value)} y2={y(value)} />
            <text className="rc-axis" x={PAD.left - 8} y={y(value) + 4} textAnchor="end">{value}%</text>
          </g>
        ))}
        {[0, 3, 5, 10, 15, 20, 25, 30].map(second => (
          <text key={second} className={`rc-axis${second === HOOK_SECOND ? " is-hook" : ""}`} x={x(second)} y={H - 12} textAnchor="middle">{second}s</text>
        ))}
        <polyline className="rc-previous" points={line("previous")} />
        <polyline className="rc-current" points={line("current")} />
        <line className="rc-hook-line" x1={x(HOOK_SECOND)} x2={x(HOOK_SECOND)} y1={PAD.top} y2={H - PAD.bottom} />
        <circle className="rc-hook-dot" cx={x(HOOK_SECOND)} cy={y(hook.current)} r={5} />
        <text className="rc-hook-label" x={x(HOOK_SECOND) + 10} y={y(hook.current) - 10}>{hook.current}% hold at 3s</text>
      </svg>
      <figcaption className="retention-legend">
        <span><i className="is-current" />Last 7 days</span>
        <span><i className="is-previous" />Previous 7 days</span>
        <span><i className="is-hook" />3-second hook window</span>
      </figcaption>
    </figure>
  );
}
