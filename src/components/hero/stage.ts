// All cover coordinates are in the original 1920×1080 image space.
export const STAGE_W = 1920
export const STAGE_H = 1080

export type Rect = [x: number, y: number, w: number, h: number]

export const pct = ([x, y, w, h]: Rect, parent: Rect = [0, 0, STAGE_W, STAGE_H]): React.CSSProperties => ({
  position: 'absolute',
  left: `${((x - parent[0]) / parent[2]) * 100}%`,
  top: `${((y - parent[1]) / parent[3]) * 100}%`,
  width: `${(w / parent[2]) * 100}%`,
  height: `${(h / parent[3]) * 100}%`,
})

export const SCREEN: Rect = [556, 200, 810, 476]

export const SCREEN_LAYERS = {
  frame: [556, 200, 810, 476] as Rect,
  cn: [621, 300, 675, 182] as Rect,
  en: [640, 478, 336, 128] as Rect,
  year: [978, 500, 212, 74] as Rect,
  cursor: [1202, 518, 64, 74] as Rect,
}

/** Monitor + stand + keyboard silhouette; background effects are masked out here. */
export const MONITOR_POLY: [number, number][] = [
  [460, 173], [496, 133], [603, 123], [607, 107], [807, 107], [811, 125], [1420, 131], [1483, 167],
  [1533, 220], [1536, 740], [1480, 797], [1427, 853], [1587, 860], [1593, 993], [387, 993], [387, 860],
  [813, 860], [816, 837], [917, 800], [917, 773], [507, 747], [460, 720],
]
