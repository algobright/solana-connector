const Spinner = () => (
    <svg
        width="1em"
        height="1em"
        viewBox="0 0 50 50"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="90, 150"
            strokeLinecap="round"
        >
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="0.8s"
                repeatCount="indefinite"
            />
        </circle>
    </svg>
);
export default Spinner