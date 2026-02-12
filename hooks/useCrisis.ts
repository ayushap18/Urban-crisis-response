import { useContext } from 'react';
import { CrisisContext } from '../context/CrisisContext';

export const useCrisis = () => {
  const context = useContext(CrisisContext);
  if (context === undefined) {
    throw new Error('useCrisis must be used within a CrisisProvider');
  }
  return context;
};
