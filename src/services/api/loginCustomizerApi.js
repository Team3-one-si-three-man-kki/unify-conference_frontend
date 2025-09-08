import apiClient from './api'; // api.js에서 apiClient를 가져옵니다.

export const loginCustomizerApi = {
    /**
     * Fetches the login page customization JSON for a given tenant.
     * Corresponds to submission 'loadPreview' in login_custom.xml
     */
    fetchCustomization: async (tenantId) => {
        // The WebSquare submission sends both subDomain and mode.
        const payload = {
            subDomain: tenantId,
            mode: 'custom'
        };
        const response = await apiClient.post('/api/guest/login-customizer/config', payload);
        return response.data; // Assuming the data is directly in response.data
    },

    /**
     * Saves the login page customization JSON for a given tenant.
     * Corresponds to submission 'sbm_saveConfig' in login_custom.xml
     */
    saveCustomization: async (tenantId, configData) => {
        const payload = {
            tenantId: tenantId,
            configJson: JSON.stringify(configData),
        };
        const response = await apiClient.post('/api/guest/login-customizer/save', payload);
        return response.data;
    },
};
