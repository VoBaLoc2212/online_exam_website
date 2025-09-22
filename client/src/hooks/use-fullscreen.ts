import { useState, useEffect, useCallback } from 'react';

interface FullscreenOptions {
  onFullscreenExit?: () => void;
  onFullscreenError?: (error: Error) => void;
}

export function useFullscreen(options: FullscreenOptions = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if fullscreen is supported
  useEffect(() => {
    const supported = !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );
    setIsSupported(supported);
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const newIsFullscreen = !!fullscreenElement;
      setIsFullscreen(newIsFullscreen);

      // If we exit fullscreen unexpectedly, call the callback
      if (!newIsFullscreen && isFullscreen && options.onFullscreenExit) {
        options.onFullscreenExit();
      }
    };

    // Add event listeners for different browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isFullscreen, options.onFullscreenExit]);

  const enterFullscreen = useCallback(async (element?: HTMLElement) => {
    if (!isSupported) {
      options.onFullscreenError?.(new Error('Fullscreen not supported'));
      return false;
    }

    try {
      const targetElement = element || document.documentElement;
      
      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen();
      } else if ((targetElement as any).webkitRequestFullscreen) {
        await (targetElement as any).webkitRequestFullscreen();
      } else if ((targetElement as any).mozRequestFullScreen) {
        await (targetElement as any).mozRequestFullScreen();
      } else if ((targetElement as any).msRequestFullscreen) {
        await (targetElement as any).msRequestFullscreen();
      }
      
      return true;
    } catch (error) {
      options.onFullscreenError?.(error as Error);
      return false;
    }
  }, [isSupported, options.onFullscreenError]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      return true;
    } catch (error) {
      options.onFullscreenError?.(error as Error);
      return false;
    }
  }, [options.onFullscreenError]);

  const toggleFullscreen = useCallback(async (element?: HTMLElement) => {
    if (isFullscreen) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen(element);
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}