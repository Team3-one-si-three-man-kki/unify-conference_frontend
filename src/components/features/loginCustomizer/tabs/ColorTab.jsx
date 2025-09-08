import { Input } from '../../../ui/Input';

export const ColorTab = ({ customization, setCustomization }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>메인 브랜드 색상 (버튼)</label>
                <Input
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                    style={{ height: '40px', padding: '4px' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>액센트 색상 (버튼 텍스트)</label>
                <Input
                    type="color"
                    value={customization.accentColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, accentColor: e.target.value }))}
                    style={{ height: '40px', padding: '4px' }}
                />
            </div>
        </div>
    );
};
