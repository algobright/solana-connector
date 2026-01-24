'use client';

import { useMemo, type ReactNode, type CSSProperties } from 'react';
import QRCodeUtil from 'qrcode';
import styles from './CustomQRCode.module.css';

/**
 * Generate QR code matrix from value
 */
function generateMatrix(value: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H') {
    const arr = Array.prototype.slice.call(QRCodeUtil.create(value, { errorCorrectionLevel }).modules.data, 0);
    const sqrt = Math.sqrt(arr.length);
    return arr.reduce(
        (rows: number[][], key: number, index: number) =>
            (index % sqrt === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows,
        [] as number[][],
    );
}

interface CustomQRCodeProps {
    value: string;
    size?: number;
    ecl?: 'L' | 'M' | 'Q' | 'H';
    clearArea?: boolean;
    image?: ReactNode;
    imageBackground?: string;
    dotColor?: string;
    backgroundColor?: string;
}

/**
 * QR Code SVG renderer
 */
function QRCodeSVG({
    value,
    size: sizeProp = 200,
    ecl = 'M',
    clearArea = false,
    dotColor = 'currentColor',
    backgroundColor = '#ffffff',
}: CustomQRCodeProps) {
    const logoSize = clearArea ? 76 : 0;
    const size = sizeProp - 10 * 2; // Account for padding

    const dots = useMemo(() => {
        const dots: ReactNode[] = [];
        const matrix = generateMatrix(value, ecl);
        const cellSize = size / matrix.length;

        // Finder pattern positions (3 corners)
        const qrList = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ];

        // Draw rounded finder patterns
        qrList.forEach(({ x, y }) => {
            const x1 = (matrix.length - 7) * cellSize * x;
            const y1 = (matrix.length - 7) * cellSize * y;
            for (let i = 0; i < 3; i++) {
                dots.push(
                    <rect
                        key={`finder-${i}-${x}-${y}`}
                        fill={i % 2 !== 0 ? backgroundColor : dotColor}
                        rx={(i - 2) * -5 + (i === 0 ? 2 : 3)}
                        ry={(i - 2) * -5 + (i === 0 ? 2 : 3)}
                        width={cellSize * (7 - i * 2)}
                        height={cellSize * (7 - i * 2)}
                        x={x1 + cellSize * i}
                        y={y1 + cellSize * i}
                    />,
                );
            }
        });

        // Calculate center clear area
        const clearArenaSize = Math.floor((logoSize + 25) / cellSize);
        const matrixMiddleStart = matrix.length / 2 - clearArenaSize / 2;
        const matrixMiddleEnd = matrix.length / 2 + clearArenaSize / 2 - 1;

        // Draw circular dots for data modules
        matrix.forEach((row: number[], i: number) => {
            row.forEach((_: number, j: number) => {
                if (matrix[i][j]) {
                    // Skip dots under finder patterns
                    if (!((i < 7 && j < 7) || (i > matrix.length - 8 && j < 7) || (i < 7 && j > matrix.length - 8))) {
                        // Skip center area if clearArea is true
                        if (
                            !clearArea ||
                            !(
                                i > matrixMiddleStart &&
                                i < matrixMiddleEnd &&
                                j > matrixMiddleStart &&
                                j < matrixMiddleEnd
                            )
                        ) {
                            dots.push(
                                <circle
                                    key={`dot-${i}-${j}`}
                                    cx={j * cellSize + cellSize / 2}
                                    cy={i * cellSize + cellSize / 2}
                                    fill={dotColor}
                                    r={cellSize / 3}
                                />,
                            );
                        }
                    }
                }
            });
        });

        return dots;
    }, [value, ecl, size, clearArea, logoSize, dotColor, backgroundColor]);

    return (
        <svg
            height={size}
            width={size}
            viewBox={`0 0 ${size} ${size}`}
            className={styles.svgFull}
            style={{ maxWidth: size, maxHeight: size }}
        >
            <rect fill="transparent" height={size} width={size} />
            {dots}
        </svg>
    );
}

/**
 * Viewfinder corner brackets SVG
 */
function ViewfinderFrame({
    size,
    color = '#2D2D2D',
    opacity = 0.01,
}: {
    size: number;
    color?: string;
    opacity?: number;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 283 283"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.viewfinder}
        >
            <path
                d="M3.5 264.06C3.5 272.587 10.4127 279.5 18.9399 279.5H32.8799C33.7083 279.5 34.3799 280.172 34.3799 281V281C34.3799 281.828 33.7083 282.5 32.8799 282.5H17.4399C8.08427 282.5 0.5 274.916 0.5 265.56V250.12C0.5 249.292 1.17157 248.62 2 248.62V248.62C2.82843 248.62 3.5 249.292 3.5 250.12V264.06ZM282.5 266.058C282.5 275.139 275.139 282.5 266.058 282.5H251.116C250.288 282.5 249.616 281.828 249.616 281V281C249.616 280.172 250.288 279.5 251.116 279.5H264.558C272.81 279.5 279.5 272.81 279.5 264.558V250.12C279.5 249.292 280.172 248.62 281 248.62V248.62C281.828 248.62 282.5 249.292 282.5 250.12V266.058ZM34.3799 2C34.3799 2.82843 33.7083 3.5 32.8799 3.5H18.9399C10.4127 3.5 3.5 10.4127 3.5 18.9399V32.8799C3.5 33.7083 2.82843 34.3799 2 34.3799V34.3799C1.17157 34.3799 0.5 33.7083 0.5 32.8799V17.4399C0.5 8.08427 8.08427 0.5 17.4399 0.5H32.8799C33.7083 0.5 34.3799 1.17157 34.3799 2V2ZM282.5 32.8799C282.5 33.7083 281.828 34.3799 281 34.3799V34.3799C280.172 34.3799 279.5 33.7083 279.5 32.8799V18.4419C279.5 10.1897 272.81 3.5 264.558 3.5H251.116C250.288 3.5 249.616 2.82843 249.616 2V2C249.616 1.17157 250.288 0.5 251.116 0.5H266.058C275.139 0.5 282.5 7.86129 282.5 16.9419V32.8799Z"
                fill={color}
                fillOpacity={opacity}
            />
        </svg>
    );
}

interface CustomQRCodeContainerProps extends CustomQRCodeProps {
    image?: ReactNode;
    imageBackground?: string;
    className?: string;
    style?: CSSProperties;
    loading?: boolean;
    scanning?: boolean;
    error?: boolean;
    frameColor?: string;
}

export function CustomQRCode({
    value,
    size = 280,
    ecl = 'M',
    clearArea = false,
    image,
    imageBackground = 'transparent',
    dotColor,
    backgroundColor,
    className,
    style,
    loading = false,
    scanning = true,
    error = false,
    frameColor,
}: CustomQRCodeContainerProps) {
    const showPlaceholder = loading || !value;

    const resolvedBackground = backgroundColor || '#ffffff';
    const resolvedDotColor = dotColor || '#000000';
    const resolvedFrameColor = error ? '#FF0000' : frameColor || '#2D2D2D';
    const frameOpacity = error ? 0.56 : 0.01;

    return (
        <div
            className={`${styles.container} ${className || ''}`}
            style={{
                width: size,
                height: size,
                ...style,
            }}
        >
            {/* Viewfinder corner brackets */}
            <ViewfinderFrame size={size} color={resolvedFrameColor} opacity={frameOpacity} />

            {/* QR Content Area */}
            <div
                className={styles.contentArea}
                style={{ background: resolvedBackground }}
                data-error={error}
            >
                {/* Gradient glow background */}
                <div className={styles.glow} data-error={error} />

                {/* Shine scanning effect */}
                {scanning && !showPlaceholder && !error && (
                    <div className={styles.shine} />
                )}

                {/* QR Code or placeholder */}
                <div className={styles.qrWrapper}>
                    {showPlaceholder ? (
                        <QRPlaceholder size={size} dotColor={resolvedDotColor} backgroundColor={resolvedBackground} />
                    ) : (
                        <>
                            <QRCodeSVG
                                value={value}
                                size={size - 40}
                                ecl={ecl}
                                clearArea={clearArea || !!image}
                                dotColor={resolvedDotColor}
                                backgroundColor={resolvedBackground}
                            />
                            {image && (
                                <div
                                    className={styles.logoWrapper}
                                    style={{
                                        width: '28%',
                                        height: '28%',
                                        background: imageBackground || resolvedBackground,
                                    }}
                                >
                                    {image}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function QRPlaceholder({
    size,
    dotColor,
    backgroundColor,
}: {
    size: number;
    dotColor: string;
    backgroundColor: string;
}) {
    return (
        <div className={styles.placeholderContainer} style={{ width: size - 40, height: size - 40 }}>
            {/* Dot pattern background */}
            <div
                className={styles.placeholderPattern}
                style={{
                    backgroundImage: `radial-gradient(${dotColor} 41%, transparent 41%)`,
                }}
            />

            {/* Corner finder pattern placeholders */}
            {[
                { top: 0, left: 0 },
                { top: 0, right: 0 },
                { bottom: 0, left: 0 },
            ].map((pos, i) => (
                <span
                    key={i}
                    className={styles.cornerSquare}
                    style={{
                        ...pos,
                        background: dotColor,
                    }}
                />
            ))}

            {/* Center area */}
            <div
                className={styles.centerArea}
                style={{
                    background: backgroundColor,
                    boxShadow: `0 0 0 7px ${backgroundColor}`,
                }}
            />

            {/* Loading spinner */}
            <div className={styles.loaderWrapper}>
                <div
                    className={styles.spinner}
                    style={{ color: `${dotColor}40` }}
                />
                <span className={styles.loadingText} style={{ color: `${dotColor}70` }}>
                    Generating QR code...
                </span>
            </div>
        </div>
    );
}

CustomQRCode.displayName = 'CustomQRCode';