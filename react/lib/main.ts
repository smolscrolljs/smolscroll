import { Instance, smol } from "smolscroll";
import { createElement, useEffect, useRef } from "react";

export const useSmol = function (
  mount = true,
  options?: Parameters<typeof smol>[0]
) {
  const ref = useRef<Instance>();
  if (!ref.current) {
    ref.current = smol(options);
  }

  if (mount) {
    useEffect(function () {
      ref.current.mount();

      return ref.current.unmount;
    }, []);
  }

  return ref.current;
};

export const SmolItem = function ({
  transform,
  children,
  smol,
  ref = useRef<HTMLElement>(),
  tag = "div",
  className = "",
  ...rest
}) {
  if (!children.type) {
    console.error("Scroll only accepts one child!");
  }

  useEffect(
    function () {
      smol.add({ el: ref.current.firstChild, transform }, false);
    },
    [ref, transform]
  );

  return createElement(
    tag,
    { ref, className: "smol " + className, ...rest },
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
