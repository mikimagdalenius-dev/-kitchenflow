type DayData = { date: Date; count: number };

export function AttendanceChart({ data }: { data: DayData[] }) {
  if (data.length === 0 || data.every((d) => d.count === 0)) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 600;
  const H = 110;
  const PAD_X = 6;
  const PAD_TOP = 8;
  const PAD_BOT = 22;
  const chartH = H - PAD_TOP - PAD_BOT;
  const slotW = (W - PAD_X * 2) / data.length;
  const barW = Math.max(3, slotW - 2);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} aria-hidden>
        <line
          x1={PAD_X} y1={PAD_TOP}
          x2={W - PAD_X} y2={PAD_TOP}
          stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3"
        />
        {data.map((d, i) => {
          const dayOfWeek = d.date.getUTCDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const barH = d.count === 0 ? 2 : Math.max(4, (d.count / max) * chartH);
          const x = PAD_X + i * slotW + (slotW - barW) / 2;
          const y = PAD_TOP + chartH - barH;
          const dayNum = d.date.getUTCDate();

          return (
            <g key={i}>
              <rect
                x={x} y={y}
                width={barW} height={barH}
                rx={2}
                fill={isWeekend ? "#94a3b8" : "#3b82f6"}
                opacity={d.count === 0 ? 0.18 : 0.82}
              >
                <title>{`Día ${dayNum}: ${d.count} fichaje${d.count !== 1 ? "s" : ""}`}</title>
              </rect>
              {(dayNum === 1 || dayNum % 5 === 0) && (
                <text
                  x={x + barW / 2}
                  y={H - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#94a3b8"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {dayNum}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-slate-400 px-1 mt-1">
        <span>Días laborables</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#3b82f6", opacity: 0.82 }} />
            Laborable
          </span>
          <span className="flex items-center gap-1">
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#94a3b8", opacity: 0.82 }} />
            Fin de semana
          </span>
        </div>
      </div>
    </div>
  );
}
