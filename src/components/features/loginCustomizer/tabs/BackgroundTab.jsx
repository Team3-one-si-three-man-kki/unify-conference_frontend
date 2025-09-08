import { Input } from '../../../ui/Input';
import { Slider } from '../../../ui/Slider';

export const BackgroundTab = ({ customization, setCustomization }) => {

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setCustomization(prev => ({ ...prev, backgroundImage: event.target.result }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>배경 이미지</label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    오버레이 투명도: {customization.overlayOpacity}%
                </label>
                <Slider
                    min="0"
                    max="100"
                    value={customization.overlayOpacity}
                    onChange={(e) => setCustomization(prev => ({ ...prev, overlayOpacity: e.target.value }))}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>오버레이 색상</label>
                <Input
                    type="color"
                    value={customization.overlayColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, overlayColor: e.target.value }))}
                    style={{ height: '40px', padding: '4px' }}
                />
            </div>
        </div>
    );
};
