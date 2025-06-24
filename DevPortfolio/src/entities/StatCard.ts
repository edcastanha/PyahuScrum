import { ReactNode, ElementType } from 'react';

export interface StatCardProps {
  icon: ElementType | ReactNode;
  label: string;
  value: string;
  details?: string;
  iconBgColor?: string;
}
