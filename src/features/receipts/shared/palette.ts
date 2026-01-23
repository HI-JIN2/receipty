export const PASTEL_COLORS = [
  { name: "화이트", value: "#ffffff" },
  { name: "베이지", value: "#fef7ed" },
  { name: "핑크", value: "#fce7f3" },
  { name: "라벤더", value: "#f3e8ff" },
  { name: "민트", value: "#d1fae5" },
  { name: "스카이", value: "#e0f2fe" },
  { name: "피치", value: "#ffe4d6" },
];

export function getPreviewBorderColor(bgColor: string) {
  const colorMap: Record<string, string> = {
    "#ffffff": "#1a1a1a",
    "#fef7ed": "#8b6914",
    "#fce7f3": "#c2185b",
    "#f3e8ff": "#7b2cbf",
    "#d1fae5": "#15803d",
    "#e0f2fe": "#0369a1",
    "#ffe4d6": "#ea580c",
  };
  return colorMap[bgColor] || "#1a1a1a";
}
