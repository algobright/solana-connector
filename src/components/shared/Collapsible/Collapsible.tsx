'use client';

import * as React from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import styles from './Collapsible.module.css';

const Collapsible = BaseCollapsible.Root;
const CollapsibleTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger>
>(({ className, ...props }, ref) => (
    <BaseCollapsible.Trigger
        ref={ref}
        className={`${styles.trigger} ${className || ''}`}
        {...props}
    />
));
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof BaseCollapsible.Panel>
>(({ className, ...props }, ref) => (
    <BaseCollapsible.Panel
        ref={ref}
        className={`${styles.content} ${className || ''}`}
        {...props}
    />
));
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };