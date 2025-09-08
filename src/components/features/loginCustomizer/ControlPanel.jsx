import { useState } from 'react';
import { BackgroundTab } from './tabs/BackgroundTab';
import { TextTab } from './tabs/TextTab';
import { ColorTab } from './tabs/ColorTab';
import { LogoTab } from './tabs/LogoTab';
import { Button } from '../../ui/Button';

const tabs = [
    { id: 'background', label: '배경' },
    { id: 'text', label: '텍스트' },
    { id: 'color', label: '색' },
    { id: 'logo', label: '로고' },
];

export const ControlPanel = ({ customization, setCustomization, onSave, isSaving }) => {
    const [activeTab, setActiveTab] = useState('background');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'background':
                return <BackgroundTab customization={customization} setCustomization={setCustomization} />;
            case 'text':
                return <TextTab customization={customization} setCustomization={setCustomization} />;
            case 'color':
                return <ColorTab customization={customization} setCustomization={setCustomization} />;
            case 'logo':
                return <LogoTab customization={customization} setCustomization={setCustomization} />;
            default:
                return null;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>로그인 페이지 커스터마이징</h2>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>테넌트별 로그인 페이지를 디자인하세요</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: 500,
                            border: 'none',
                            background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                            color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                            borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ flexGrow: 1, padding: '24px', overflowY: 'auto' }}>
                {renderTabContent()}
            </div>

            {/* Save Button */}
            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <Button onClick={onSave} disabled={isSaving} variant="primary" style={{ width: '100%' }}>
                    {isSaving ? '저장 중...' : '변경사항 저장'}
                </Button>
            </div>
        </div>
    );
};
