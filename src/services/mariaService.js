const axios = require('axios');

// USUARI: uxia3
const MARIA_URL = 'http://localhost:11434';  // Túnel actiu!

class MariaService {
    async listModels() {
        try {
            const response = await axios.get(`${MARIA_URL}/api/tags`);
            return response.data;
        } catch (error) {
            console.error('❌ Error llistant models (uxia3):', error.message);
            throw error;
        }
    }

    async generate(model, prompt, options = {}) {
        try {
            const payload = {
                model,
                prompt,
                stream: false,
                ...options
            };
            const response = await axios.post(`${MARIA_URL}/api/generate`, payload);
            return response.data;
        } catch (error) {
            console.error('❌ Error generant (uxia3):', error.message);
            throw error;
        }
    }

    async chat(model, messages, options = {}) {
        try {
            const payload = {
                model,
                messages,
                stream: false,
                ...options
            };
            const response = await axios.post(`${MARIA_URL}/api/chat`, payload);
            return response.data;
        } catch (error) {
            console.error('❌ Error xat (uxia3):', error.message);
            throw error;
        }
    }
}

module.exports = new MariaService();