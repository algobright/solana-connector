'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import styles from './Button.module.css';

// 1. Define Types
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

// 2. The Component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <BaseButton
                ref={ref}

                className={`${styles.button} ${className || ''}`}
                data-variant={variant}
                data-size={size}

                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export default Button;