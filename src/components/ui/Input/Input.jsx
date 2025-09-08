export const Input = ({ type = 'text', value, onChange, style, ...props }) => {
    const baseStyle = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
    };
    return <input type={type} value={value} onChange={onChange} style={{...baseStyle, ...style}} {...props} />;
};
