import { LoginPagePreview } from './LoginPagePreview';

export const PreviewPanel = ({ customization }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
                flexShrink: 0
            }}>
                미리보기 - {customization.tenantName}
            </div>
            <div style={{ flexGrow: 1, minHeight: 0 }}>
                <LoginPagePreview customization={customization} />
            </div>
        </div>
    );
};
