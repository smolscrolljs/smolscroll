import type { ScrollItem, Screen } from "smolscroll";

export * from "d3-ease";

export const maxMin = function (val, max, min = 0) {
  if (val > max) {
    return max;
  }

  if (val < min) {
    return min;
  }

  return val;
};

export const timeToCenterHalf = function (
  y: boolean,
  item: ScrollItem,
  screen: Screen,
  offset = 0,
  distance = y ? screen.height : screen.width
) {
  offset += (y ? item.height : item.width) / 2;
  return timeToHalf(y, item, screen, offset, distance);
};

export const timeToCenter = function (
  y: boolean,
  item: ScrollItem,
  screen: Screen,
  offset = 0,
  distance = y ? screen.height : screen.width
) {
  offset += (y ? item.height : item.width) / 2;
  return time(y, item, screen, offset, distance);
};

export const timeToHalf = function (
  y: boolean,
  item: ScrollItem,
  screen: Screen,
  offset = 0,
  distance = y ? screen.height : screen.width
) {
  offset += distance / 2;
  return time(y, item, screen, offset, distance);
};

export const time = function (
  y: boolean,
  item: ScrollItem,
  screen: Screen,
  offset = 0,
  distance = y ? screen.height : screen.width
) {
  const start = y ? screen.y : screen.x;

  return (
    (1 / distance) *
    maxMin(distance + (start - (y ? item.y : item.x) - offset), distance)
  );
};

export const invertTime = function (time) {
  return 1 - time;
};

export const inOutTime = function (time) {
  const extRatio = time * 2;

  if (extRatio >= 1) {
    return 2 - extRatio;
  }

  return extRatio;
};
