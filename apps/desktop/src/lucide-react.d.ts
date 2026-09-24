declare module 'lucide-react' {
  import * as React from 'react';
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
  }
  export function Puzzle(props: IconProps): React.ReactElement;
  export const Puzzle: React.FC<IconProps>;
}
