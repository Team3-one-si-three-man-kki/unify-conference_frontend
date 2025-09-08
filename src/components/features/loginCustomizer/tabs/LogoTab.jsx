import { Input } from '../../../ui/Input';
import { Slider } from '../../../ui/Slider';

export const LogoTab = ({ customization, setCustomization }) => {
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setCustomization(prev => ({ ...prev, logo: event.target.result }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>로고 이미지</label>
                <Input type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    로고 크기: {customization.logoSize}px
                </label>
                <Slider
                    min="40"
                    max="120"
                    step="1"
                    value={customization.logoSize}
                    onChange={(e) => setCustomization(prev => ({ ...prev, logoSize: e.target.value }))}
                />
            </div>
        </div>
    );
};
