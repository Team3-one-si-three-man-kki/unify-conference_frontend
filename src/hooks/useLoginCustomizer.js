import { useState, useEffect, useCallback } from 'react';
import { loginCustomizerApi } from '../services/api';

// Default data structure, translated from scwin.defaultData function
const getDefaultData = (tenantName) => ({
    backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    logo: '',
    logoSize: 60,
    mainTitle: '비즈니스의 새로운 시작을 환영합니다.',
    mainTitleSize: 36,
    mainTitleColor: '#ffffff',
    mainTitleFont: '600', // font-semibold
    subTitle: '안전하고 효율적인 비즈니스 솔루션',
    subTitleSize: 18,
    subTitleColor: '#e5e7eb',
    subTitleFont: '400', // font-normal
    extraTitle: '안전하고 신뢰할 수 있는 플랫폼으로 더 나은 비즈니스를 위한 첫걸음을 시작하세요',
    extraTitleSize: 16,
    extraTitleColor: '#d1d5db',
    extraTitleFont: '300', // font-light
    overlayOpacity: 35,
    overlayColor: '#1f2937',
    primaryColor: '#3b82f6',
    accentColor: '#ffffff', // Default for button text
    tenantName: tenantName || 'Default Tenant',
});


export const useLoginCustomizer = (tenantId) => {
    const [customization, setCustomization] = useState(null);
    const [loading, setLoading] = useState({ initial: true, save: false });
    const [error, setError] = useState(null);

    // Fetch initial customization data
    useEffect(() => {
        if (!tenantId) return;

        const fetchData = async () => {
            setLoading({ initial: true, save: false });
            setError(null);
            try {
                const data = await loginCustomizerApi.fetchCustomization(tenantId);
                // WebSquare logic: if only tenantName is returned, use default data
                if (data && Object.keys(data).length <= 1 && data.tenantName) {
                    setCustomization(getDefaultData(data.tenantName));
                } else {
                    setCustomization(data);
                }
            } catch (err) {
                setError(err.message || 'Failed to load customization data.');
                // On error, load default data to allow customization
                setCustomization(getDefaultData(tenantId));
            } finally {
                setLoading(prev => ({ ...prev, initial: false }));
            }
        };

        fetchData();
    }, [tenantId]);

    // Save customization data
    const saveCustomization = useCallback(async () => {
        if (!tenantId || !customization) return;

        setLoading({ initial: false, save: true });
        setError(null);
        try {
            await loginCustomizerApi.saveCustomization(tenantId, customization);
            alert('변경사항이 성공적으로 저장되었습니다.'); // Simple feedback
        } catch (err) {
            setError(err.message || 'Failed to save changes.');
            alert(`저장 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setLoading(prev => ({ ...prev, save: false }));
        }
    }, [tenantId, customization]);

    return {
        customization,
        setCustomization,
        saveCustomization,
        loading,
        error,
    };
};
