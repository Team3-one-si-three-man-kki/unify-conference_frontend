import { Input } from '../../../ui/Input';
import { Spinner } from '../../../ui/Spinner';

const fontOptions = [
    { label: 'Thin', value: '100' },
    { label: 'Light', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi Bold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Black', value: '900' },
];

const TextSection = ({ title, idPrefix, customization, setCustomization }) => (
    <div style={{ paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ marginBottom: '12px', fontWeight: 600 }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input
                placeholder={title}
                value={customization[`${idPrefix}Title`]}
                onChange={(e) => setCustomization(prev => ({ ...prev, [`${idPrefix}Title`]: e.target.value }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>크기</label>
                    <Spinner
                        value={customization[`${idPrefix}TitleSize`]}
                        onChange={(newValue) => setCustomization(prev => ({ ...prev, [`${idPrefix}TitleSize`]: newValue }))}
                    />
                </div>
                 <div>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>색상</label>
                    <Input
                        type="color"
                        value={customization[`${idPrefix}TitleColor`]}
                        onChange={(e) => setCustomization(prev => ({ ...prev, [`${idPrefix}TitleColor`]: e.target.value }))}
                        style={{ height: '38px', padding: '4px' }}
                    />
                </div>
            </div>
            <select
                value={customization[`${idPrefix}TitleFont`]}
                onChange={(e) => setCustomization(prev => ({ ...prev, [`${idPrefix}TitleFont`]: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
                {fontOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    </div>
);


export const TextTab = ({ customization, setCustomization }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TextSection title="메인 제목" idPrefix="main" customization={customization} setCustomization={setCustomization} />
            <TextSection title="서브 제목" idPrefix="sub" customization={customization} setCustomization={setCustomization} />
            <TextSection title="추가 텍스트" idPrefix="extra" customization={customization} setCustomization={setCustomization} />
        </div>
    );
};
