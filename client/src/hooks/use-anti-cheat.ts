import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from './use-websocket';

export interface AntiCheatStats {
  tabSwitchCount: number;
  warningCount: number;
  isWindowFocused: boolean;
  lastActivity: Date | null;
}

export function useAntiCheat(sessionId?: string, isTestMode: boolean = false) {
  const [stats, setStats] = useState<AntiCheatStats>({
    tabSwitchCount: 0,
    warningCount: 0,
    isWindowFocused: true,
    lastActivity: null
  });
  
  const { sendAntiCheatEvent, lastMessage } = useWebSocket(sessionId);
  const blurStartTime = useRef<Date | null>(null);
  const activityTimer = useRef<NodeJS.Timeout>();
  
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
    };
    
    // Disable certain keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        e.preventDefault();
        sendAntiCheatEvent('shortcut_attempt', { 
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          timestamp: new Date()
        });
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
  
  return stats;
}
