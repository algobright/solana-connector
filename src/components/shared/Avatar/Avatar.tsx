import { useState } from 'react';
import styles from './Avatar.module.css';
import { Wallet } from 'lucide-react';
interface AvatarProps {
    height?: number | string;
    width?: number | string;
    src?: string;
    alt?: string;
    theme?: 'light' | 'dark';
}
export function Avatar({
    height,
    width,
    src,
    alt,
    theme = 'light',
}: AvatarProps) {
    const [hasError, setHasError] = useState(false);
    return (
        <div className={styles.avatar} data-theme={theme}>
            {src && !hasError ? (
                <img
                    height={height}
                    width={width}
                    src={src}
                    alt={alt || "Avatar"}
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className={styles.fallback} style={{ height, width }}>
                    <Wallet />
                </div>
            )}
        </div>
    );
}
