let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, "passive", {
    get() {
      supportsPassive = true;
    },
  });
  (window as any).addEventListener("test", null, opts);
  (window as any).removeEventListener("test", null, opts);
} catch (e) {}

export type Screen = {
  x: number;
  xEnd: number;
  y: number;
  yEnd: number;
  width: number;
  height: number;
  viewWidth: number;
  viewHeight: number;
  viewX: number;
  viewXEnd: number;
  viewY: number;
  viewYEnd: number;
};

type PublicItemConfig = {
  el: HTMLElement;
  transform: (item: ScrollItem, screen: Screen) => void;
};

export type ScrollItem = PublicItemConfig & {
  prevItem: null | ScrollItem;
  memoized: boolean;
  outerEl: HTMLElement;
  width: number;
  height: number;
  x: number;
  xEnd: number;
  y: number;
  yEnd: number;
};

export const debounce = function (fn, timeout) {
  let id;

  return function () {
    if (id) {
      clearTimeout(id);
    }
    id = setTimeout(fn, timeout);
  };
};

const processExists = typeof process != "undefined";
const fakeFn = () => {};

export type Instance = {
  unmount: () => void;
  mount: (container?: HTMLElement | Document) => void;
  add: (config: PublicItemConfig, createOuterEl?: boolean) => ScrollItem;
  addWithSelector: (
    selector: string,
    config: Omit<PublicItemConfig, "el">
  ) => void;
  memoItem: (item: ScrollItem) => void;
  scroll: () => void;
};

export const smol = function ({
  ssr = processExists,
  beforeScroll,
  afterScroll,
  viewOffset = 2,
  viewXOffset = viewOffset,
  viewYOffset = viewOffset,
}: {
  ssr?: boolean;
  viewOffset?: number;
  viewYOffset?: number;
  viewXOffset?: number;
  beforeScroll?: (screen: Screen) => void;
  afterScroll?: (screen: Screen) => void;
} = {}): Instance {
  if (ssr) {
    return {
      mount: fakeFn,
      unmount: fakeFn,
      add: () => {
        return {};
      },
      addWithSelector: fakeFn,
      memoItem: fakeFn,
      scroll: fakeFn,
    } as any;
  }

  let mounted = false;
  let container: HTMLElement | Document;
  let containerIsDocument = false;
  let positionEl: HTMLElement;
  let halfViewWidthOffset = 0;
  let halfViewHeightOffset = 0;

  let cache = true;
  let tick = false;

  const screen = {} as Screen;

  let rootItem: null | ScrollItem = null;

  const memoContainer = function () {
    screen.x = positionEl.scrollLeft;
    screen.y = positionEl.scrollTop;
    screen.width = positionEl.offsetWidth;
    screen.height = positionEl.offsetHeight;
    screen.viewWidth = screen.width * viewXOffset;
    halfViewWidthOffset = (screen.width + screen.viewWidth) / 2;
    screen.viewHeight = screen.height * viewYOffset;
    halfViewHeightOffset = (screen.height + screen.viewHeight) / 2;
  };

  const memoItem = function (item: ScrollItem) {
    const element = item.el;
    const rect = item.outerEl.getBoundingClientRect();

    item.width = element.offsetWidth;
    item.height = element.offsetHeight;
    item.x = rect.left;
    item.y = rect.top;

    if (!containerIsDocument) {
      const containerRect = positionEl.getBoundingClientRect();
      item.x -= containerRect.left;
      item.y -= containerRect.top;
    } else {
      item.x += screen.x;
      item.y += screen.y;
    }

    item.xEnd = item.x + item.width;
    item.yEnd = item.y + item.height;

    item.memoized = true;
  };

  const transformItem = function (item: ScrollItem) {
    if (!item.memoized || !cache) {
      memoItem(item);
    }

    const inViewY = item.y >= screen.viewY && item.yEnd <= screen.viewYEnd;
    const inViewX = item.x >= screen.viewX && item.xEnd <= screen.viewXEnd;
    if (viewOffset && (!inViewY || !inViewX)) {
      return;
    }

    item.transform(item, screen);
  };

  const passiveScroll = function () {
    if (beforeScroll) beforeScroll(screen);

    let nextItem = rootItem;
    let lastItem;
    while (nextItem) {
      const item = nextItem;
      nextItem = item.prevItem;

      if (!item.el.isConnected) {
        if (lastItem) {
          lastItem.prevItem = nextItem;
        } else {
          rootItem = nextItem;
        }

        continue;
      }

      lastItem = item;
      transformItem(item);
    }

    if (afterScroll) afterScroll(screen);

    tick = false;
  };

  const scroll = function () {
    screen.x = positionEl.scrollLeft;
    screen.y = positionEl.scrollTop;

    screen.xEnd = screen.x + screen.width;
    screen.yEnd = screen.y + screen.height;
    screen.viewX = screen.x - halfViewWidthOffset;
    screen.viewXEnd = screen.xEnd + halfViewWidthOffset;
    screen.viewY = screen.y - halfViewHeightOffset;
    screen.viewYEnd = screen.yEnd + halfViewHeightOffset;

    if (tick) {
      return;
    }

    tick = true;
    requestAnimationFrame(passiveScroll);
  };

  const resize = function () {
    memoContainer();
    cache = false;
    tick = true;
    passiveScroll();
    cache = true;
  };

  const lazyResize = debounce(resize, 300);

  const mount = function (_container = document) {
    if (mounted) return;

    mounted = true;

    container = _container;
    containerIsDocument = container == document;
    positionEl = containerIsDocument
      ? (container as any).documentElement
      : container;

    memoContainer();

    scroll();
    container!.addEventListener(
      "scroll",
      scroll,
      supportsPassive ? { passive: true } : false
    );
    window.addEventListener("resize", lazyResize, true);
  };

  const add: Instance["add"] = function (config, createOuterEl = true) {
    let outerEl = config.el.parentElement;
    const outerElIsValid = outerEl && outerEl.classList.contains("smol");

    if (!outerElIsValid) {
      if (!createOuterEl) {
        console.error(
          "Element does not have a smol scroll parent, did you forget it?",
          config.el
        );

        return {} as ScrollItem;
      } else {
        outerEl = document.createElement("div");
        outerEl.classList.add("smol");
        config.el.replaceWith(outerEl);
        outerEl.appendChild(config.el);
      }
    }

    const item = {
      memoized: false,
      prevItem: rootItem,
      outerEl: outerEl as HTMLElement,
      width: 0,
      height: 0,
      x: 0,
      xEnd: 0,
      y: 0,
      yEnd: 0,
      ...config,
    };
    rootItem = item;

    if (mounted) {
      transformItem(item);
    }

    return item;
  };

  const addWithSelector: Instance["addWithSelector"] = function (
    selector,
    config,
    createOuterEl = true
  ) {
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      add(
        {
          ...config,
          el,
        },
        createOuterEl
      );
    }
  };

  const unmount: Instance["unmount"] = function () {
    rootItem = null;
    container!.removeEventListener(
      "scroll",
      scroll,
      supportsPassive ? ({ passive: true } as any) : false
    );
    window.removeEventListener("resize", lazyResize, true);
  };

  return { scroll, add, addWithSelector, memoItem, mount, unmount };
};
