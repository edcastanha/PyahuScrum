import { ReactNode } from 'react';
import { IconType } from 'react-icons';

export interface StatCardProps {
  icon: IconType | ReactNode;
  label: string;
  value: string;
  details?: string;
  iconBgColor?: string;
}
