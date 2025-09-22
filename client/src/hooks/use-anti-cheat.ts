import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from './use-websocket';
import { useFullscreen } from './use-fullscreen';

export interface AntiCheatStats {
  tabSwitchCount: number;
  warningCount: number;
  isWindowFocused: boolean;
  lastActivity: Date | null;
  fullscreenViolations: number;
  isFullscreenRequired: boolean;
}

export interface AntiCheatConfig {
  requireFullscreen?: boolean;
  onViolation?: (violationType: string, details?: any) => void;
  onTestTermination?: (reason: string) => void;
}

export function useAntiCheat(
  sessionId?: string, 
  isTestMode: boolean = false,
  config: AntiCheatConfig = {}
) {
  const [stats, setStats] = useState<AntiCheatStats>({
    tabSwitchCount: 0,
    warningCount: 0,
    isWindowFocused: true,
    lastActivity: null,
    fullscreenViolations: 0,
    isFullscreenRequired: config.requireFullscreen || false
  });
  
  const { sendAntiCheatEvent, lastMessage } = useWebSocket(sessionId);
  const blurStartTime = useRef<Date | null>(null);
  const activityTimer = useRef<NodeJS.Timeout>();
  
  // Initialize fullscreen hook
  const {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isSupported: isFullscreenSupported
  } = useFullscreen({
    onFullscreenExit: () => {
      if (config.requireFullscreen && isTestMode) {
        // Fullscreen violation detected
        setStats(prev => ({
          ...prev,
          fullscreenViolations: prev.fullscreenViolations + 1
        }));
        
        sendAntiCheatEvent('fullscreen_violation', {
          timestamp: new Date(),
          violationType: 'exit_fullscreen'
        });
        
        config.onViolation?.('fullscreen_exit', { timestamp: new Date() });
        
        // Terminate test if configured
        if (config.onTestTermination) {
          config.onTestTermination('Fullscreen violation: Test terminated due to exiting fullscreen mode');
        }
      }
    },
    onFullscreenError: (error) => {
      console.error('Fullscreen error:', error);
      sendAntiCheatEvent('fullscreen_error', {
        error: error.message,
        timestamp: new Date()
      });
    }
  });
  
  // Auto-enter fullscreen when test starts
  useEffect(() => {
    if (isTestMode && config.requireFullscreen && isFullscreenSupported && !isFullscreen) {
      enterFullscreen();
    }
  }, [isTestMode, config.requireFullscreen, isFullscreenSupported, isFullscreen, enterFullscreen]);
  
  useEffect(() => {
    if (!isTestMode) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurStartTime.current = new Date();
        setStats(prev => ({
          ...prev,
          isWindowFocused: false,
          tabSwitchCount: prev.tabSwitchCount + 1
        }));
        
        sendAntiCheatEvent('tab_switch', {
          timestamp: new Date(),
          previouslyFocused: true
        });
        
        config.onViolation?.('tab_switch', { timestamp: new Date() });
        
        // If fullscreen is required and tab switching detected, terminate test
        if (config.requireFullscreen) {
          config.onTestTermination?.('Tab switching violation: Test terminated due to switching tabs while in test mode');
        }
      } else {
        const blurDuration = blurStartTime.current 
          ? new Date().getTime() - blurStartTime.current.getTime()
          : 0;
          
        setStats(prev => ({
          ...prev,
          isWindowFocused: true,
          lastActivity: new Date()
        }));
        
        if (blurDuration > 1000) { // More than 1 second
          sendAntiCheatEvent('window_blur', {
            duration: blurDuration,
            timestamp: new Date()
          });
          
          config.onViolation?.('window_blur', { 
            duration: blurDuration, 
            timestamp: new Date() 
          });
        }
        
        blurStartTime.current = null;
      }
    };
    
    const handleWindowBlur = () => {
      if (!document.hidden) {
        blurStartTime.current = new Date();
        setStats(prev => ({
          ...prev,
          isWindowFocused: false
        }));
      }
    };
    
    const handleWindowFocus = () => {
      if (!document.hidden) {
        const blurDuration = blurStartTime.current 
          ? new Date().getTime() - blurStartTime.current.getTime()
          : 0;
          
        setStats(prev => ({
          ...prev,
          isWindowFocused: true,
          lastActivity: new Date()
        }));
        
        if (blurDuration > 500) {
          sendAntiCheatEvent('window_blur', {
            duration: blurDuration,
            timestamp: new Date()
          });
          
          config.onViolation?.('window_blur', { 
            duration: blurDuration, 
            timestamp: new Date() 
          });
        }
        
        blurStartTime.current = null;
      }
    };
    
    const handleMouseMove = () => {
      setStats(prev => ({ ...prev, lastActivity: new Date() }));
    };
    
    const handleKeyPress = () => {
      setStats(prev => ({ ...prev, lastActivity: new Date() }));
    };
    
    // Activity timeout checker
    const checkActivity = () => {
      const now = new Date();
      setStats(prev => {
        if (prev.lastActivity && (now.getTime() - prev.lastActivity.getTime()) > 60000) {
          sendAntiCheatEvent('inactivity', {
            duration: now.getTime() - prev.lastActivity.getTime(),
            timestamp: now
          });
        }
        return prev;
      });
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);
    
    activityTimer.current = setInterval(checkActivity, 10000); // Check every 10 seconds
    
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      sendAntiCheatEvent('context_menu_attempt', { timestamp: new Date() });
      config.onViolation?.('context_menu', { timestamp: new Date() });
    };
    
    // Disable certain keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.key === 'Escape' && config.requireFullscreen) // Prevent ESC key in fullscreen mode
      ) {
        e.preventDefault();
        sendAntiCheatEvent('shortcut_attempt', { 
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          timestamp: new Date()
        });
        
        config.onViolation?.('keyboard_shortcut', {
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          timestamp: new Date()
        });
        
        // Terminate test for critical shortcuts in test mode
        if (config.requireFullscreen && (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I'))) {
          config.onTestTermination?.('Developer tools violation: Test terminated due to attempting to open developer tools');
        }
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (activityTimer.current) {
        clearInterval(activityTimer.current);
      }
    };
  }, [isTestMode, sessionId, sendAntiCheatEvent]);
  
  // Handle server messages
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'warning') {
        setStats(prev => ({
          ...prev,
          warningCount: prev.warningCount + 1
        }));
        
        // Show warning to user
        alert(lastMessage.message || 'Suspicious activity detected. Your session is being monitored.');
      }
    }
  }, [lastMessage]);
  
  return {
    ...stats,
    fullscreen: {
      isFullscreen,
      isSupported: isFullscreenSupported,
      enter: enterFullscreen,
      exit: exitFullscreen,
      toggle: toggleFullscreen
    }
  };
}
