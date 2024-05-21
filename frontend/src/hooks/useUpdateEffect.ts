import { DependencyList, EffectCallback, useEffect, useRef } from "react";

const useUpdateEffect = (effect: EffectCallback, deps: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useUpdateEffect;
