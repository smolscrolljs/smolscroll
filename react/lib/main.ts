import { createElement, useEffect, useRef } from "react";

export const Scroll = function ({
  transform,
  children,
  smol,
  ref,
  tag = "div",
  className = "",
  ...rest
}) {
  if (!children.type) {
    console.error("Scroll only accepts one child!");
  }

  const _ref = ref || useRef();

  useEffect(
    function () {
      smol.add({ el: _ref.current.firstChild, transform }, false);
    },
    [ref, transform]
  );

  return createElement(
    tag,
    { ref: _ref, className: "smol " + className, ...rest },
    children
  );
};

export const useScrollMount = function (smol, ref = useRef()) {
  useEffect(function () {
    smol.mount(ref.current);

    return smol.unmount;
  }, []);

  return ref;
};
