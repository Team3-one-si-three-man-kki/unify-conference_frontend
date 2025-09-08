import { useParams } from 'react-router-dom';
import { ControlPanel } from '../../components/features/loginCustomizer/ControlPanel';
import { PreviewPanel } from '../../components/features/loginCustomizer/PreviewPanel';
import { useLoginCustomizer } from '../../hooks/useLoginCustomizer';
import styles from './LoginCustomizer.module.css';

export const LoginCustomizer = () => {
    // Example: Fetches tenantId from URL like /customize/my-tenant
    const { tenantId } = useParams();

    const {
        customization,
        setCustomization,
        saveCustomization,
        loading,
        error,
    } = useLoginCustomizer(tenantId || 'basic'); // Default to 'basic' if no tenantId

    if (loading.initial) {
        return <div className={styles.centeredMessage}>Loading Customization Data...</div>;
    }

    if (error) {
        return <div className={`${styles.centeredMessage} ${styles.error}`}>Error: {error}</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            {/* Left Panel - Customization Controls */}
            <div className={styles.controlPanelWrapper}>
                <ControlPanel
                    customization={customization}
                    setCustomization={setCustomization}
                    onSave={saveCustomization}
                    isSaving={loading.save}
                />
            </div>

            {/* Right Panel - Preview */}
            <div className={styles.previewPanelWrapper}>
                <PreviewPanel customization={customization} />
            </div>
        </div>
    );
};
