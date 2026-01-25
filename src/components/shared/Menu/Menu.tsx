'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import styles from './Menu.module.css';
import { ComponentPropsWithoutRef, forwardRef } from 'react';


const Menu = BaseMenu.Root;
const MenuPortal = BaseMenu.Portal;
const MenuGroup = BaseMenu.Group;

// Trigger 
type MenuTriggerProps = ComponentPropsWithoutRef<typeof BaseMenu.Trigger> & {
    render: React.ReactElement;
};
const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
    ({ className, ...props }, ref) => (
        <BaseMenu.Trigger
            ref={ref}
            className={`${className || ''}`}
            {...props}
        />
    )
);
MenuTrigger.displayName = 'MenuTrigger';

// Position of the Popup
type MenuPositionerProps = ComponentPropsWithoutRef<typeof BaseMenu.Positioner>;
const MenuPositioner = forwardRef<HTMLDivElement, MenuPositionerProps>(
    ({ sideOffset = 8, ...props }, ref) => (
        <BaseMenu.Positioner ref={ref} sideOffset={sideOffset} {...props} />
    )
);
MenuPositioner.displayName = 'MenuPositioner';

// Popup
type MenuPopupProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup> & {
    theme?: 'light' | 'dark';
};
const MenuPopup = forwardRef<HTMLDivElement, MenuPopupProps>(
    ({ className, theme, ...props }, ref) => (
        <BaseMenu.Popup
            ref={ref}
            data-theme={theme}
            className={`${styles.popup} ${className || ''}`}
            {...props}
        />
    )
);
MenuPopup.displayName = 'MenuPopup';

// Item
type MenuItemProps = ComponentPropsWithoutRef<typeof BaseMenu.Item>;
const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
    ({ className, ...props }, ref) => (
        <BaseMenu.Item
            ref={ref}
            className={`${styles.item} ${className || ''}`}
            {...props}
        />
    )
);
MenuItem.displayName = 'MenuItem';

// Separator
type MenuSeparatorProps = ComponentPropsWithoutRef<typeof BaseMenu.Separator>;
const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
    ({ className, ...props }, ref) => (
        <BaseMenu.Separator ref={ref} className={`${styles.separator} ${className || ''}`} {...props} />
    )
);
MenuSeparator.displayName = 'MenuSeparator';

// Group Label
type MenuGroupLabelProps = ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>;
const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>(
    ({ className, ...props }, ref) => (
        <BaseMenu.GroupLabel ref={ref} className={`${styles.groupLabel} ${className || ''}`} {...props} />
    )
);
MenuGroupLabel.displayName = 'MenuGroupLabel';

export { Menu, MenuTrigger, MenuPortal, MenuPositioner, MenuPopup, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel };