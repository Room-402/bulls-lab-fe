export function SkeletonLine({ width = "100%", height = "0.8rem", style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
      backgroundSize: "200% 100%",
      animation: "sk-shimmer 1.4s infinite",
      borderRadius: "4px",
      ...style,
    }} />
  )
}

export function SkeletonBlock({ width = "100%", height = "2rem", style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
      backgroundSize: "200% 100%",
      animation: "sk-shimmer 1.4s infinite",
      borderRadius: "8px",
      ...style,
    }} />
  )
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "0.9rem 0.75rem", borderBottom: "1px solid #f3f4f6" }}>
          <SkeletonLine width={i === 0 ? "80%" : i === cols - 1 ? "60%" : "70%"} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard({ lines = 3, style = {} }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      ...style,
    }}>
      <SkeletonLine width="45%" height="0.6rem" />
      <SkeletonLine width="65%" height="1.3rem" />
      {lines > 2 && <SkeletonLine width="50%" height="0.65rem" />}
    </div>
  )
}

export const skeletonCSS = `@keyframes sk-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`
