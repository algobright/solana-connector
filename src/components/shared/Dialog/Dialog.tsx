'use client';

import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import styles from './Dialog.module.css';
import clsx from 'clsx';

// 1. Root Components
const Dialog = BaseDialog.Root;
const DialogTrigger = BaseDialog.Trigger;
const DialogPortal = BaseDialog.Portal;
const DialogClose = BaseDialog.Close;

// 2. Backdrop
type DialogBackdropProps = React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>;
const DialogBackdrop = React.forwardRef<HTMLDivElement, DialogBackdropProps>(
    ({ className, ...props }, ref) => (
        <BaseDialog.Backdrop
            ref={ref}
            className={`${styles.backdrop} ${className || ''}`}
            {...props}
        />
    ),
);
DialogBackdrop.displayName = 'DialogBackdrop';

// 3. Content (The Modal Box)
type DialogContentProps = React.ComponentPropsWithoutRef<typeof BaseDialog.Popup> & {
    showCloseButton?: boolean;
    theme?: 'light' | 'dark';
};
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, theme, showCloseButton = true, ...props }, ref) => (
        <DialogPortal>
            <DialogBackdrop data-theme={theme} />
            <BaseDialog.Popup
                ref={ref}
                data-theme={theme}
                className={clsx(styles.content, className)}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogClose className={styles.closeButton}>
                        <X />
                    </DialogClose>
                )}
            </BaseDialog.Popup>
        </DialogPortal>
    )
);
DialogContent.displayName = 'DialogContent';

// 4. Header
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`${styles.header} ${className || ''}`} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

// 5. Footer
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`${styles.footer} ${className || ''}`} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

// 6. Title
const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof BaseDialog.Title>>(
    ({ className, ...props }, ref) => (
        <BaseDialog.Title
            ref={ref}
            className={`${styles.title} ${className || ''}`}
            {...props}
        />
    ),
);
DialogTitle.displayName = 'DialogTitle';

// 7. Description
const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.ComponentPropsWithoutRef<typeof BaseDialog.Description>
>(({ className, ...props }, ref) => (
    <BaseDialog.Description
        ref={ref}
        className={`${styles.description} ${className || ''}`}
        {...props}
    />
));
DialogDescription.displayName = 'DialogDescription';

export {
    Dialog,
    DialogPortal,
    DialogBackdrop,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};