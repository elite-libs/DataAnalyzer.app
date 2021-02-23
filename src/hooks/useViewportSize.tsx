import { throttle } from 'lodash';
import { useEffect, useState } from 'react';

/**
 * size.breakpoint is based on bootstrap 4's responsive design
 */
export interface IViewportSize {
  width: number;
  height: number;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
}
export default function useViewportSize(): IViewportSize {
  const [windowSize, setWindowSize] = useState<IViewportSize>({
    width: -1,
    height: -1,
  });
  useEffect(() => {
    function _handleResize() {
      const width = window.innerWidth;
      let breakpoint: IViewportSize['breakpoint'] = 'xs';
      if (width > 576) breakpoint = 'sm';
      if (width > 768) breakpoint = 'md';
      if (width > 992) breakpoint = 'lg';
      if (width > 1200) breakpoint = 'xl';
      setWindowSize({
        height: window.innerHeight,
        width: width,
        breakpoint,
      });
    }
    const handleResize = throttle(_handleResize, 60);

    // Call handler right away so state gets updated with initial window size
    handleResize();
    // window.ondeviceorientation
    window.addEventListener('resize', handleResize);
    window.addEventListener('deviceorientation', handleResize);
    return () =>
      void [
        window.removeEventListener('resize', handleResize),
        window.removeEventListener('deviceorientation', handleResize),
      ];
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
