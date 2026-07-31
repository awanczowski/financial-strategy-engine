import { useContext } from 'react';
import { StrategyContext } from './StrategyContext.js';

export function useStrategy() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategy must be used within a StrategyProvider');
  }
  return context;
}
