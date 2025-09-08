export const Button = ({ children, onClick, disabled, variant = 'primary', style, ...props }) => {
    const baseStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    };

    const variantStyle = {
        primary: {
            backgroundColor: '#2563eb',
            color: 'white',
        },
        secondary: {
            backgroundColor: '#e5e7eb',
            color: '#1f2937',
        }
    };

    const disabledStyle = {
        backgroundColor: '#d1d5db',
        color: '#6b7280',
        cursor: 'not-allowed',
    };

    const finalStyle = {
        ...baseStyle,
        ...(variantStyle[variant] || variantStyle.primary),
        ...(disabled ? disabledStyle : {}),
        ...style,
    };

    return (
        <button onClick={onClick} disabled={disabled} style={finalStyle} {...props}>
            {children}
        </button>
    );
};
