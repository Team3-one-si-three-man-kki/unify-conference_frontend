// A simple numeric input spinner
export const Spinner = ({ value, onChange }) => {
    const handleChange = (e) => {
        const numValue = e.target.value === '' ? '' : parseInt(e.target.value, 10);
        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    };
    return <input type="number" value={value} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }} />;
};
