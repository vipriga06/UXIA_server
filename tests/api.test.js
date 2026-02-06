const request = require('supertest');
const app = require('../../server');

describe('API Endpoints Tests', () => {
    let apiKey;
    let userId;
    let petitionId;

    // Test de Usuarios
    describe('Users Endpoints', () => {
        test('POST /api/users/login - Registrar nuevo usuario', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    nickname: 'TestUser',
                    email: `test_${Date.now()}@example.com`,
                    telefon: '+34 600 000 000'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('OK');
            expect(res.body.data).toHaveProperty('api_key');
            
            apiKey = res.body.data.api_key;
        });

        test('POST /api/users/login - Email duplicado debe retornar 409', async () => {
            const email = `test_duplicate_${Date.now()}@example.com`;
            
            await request(app)
                .post('/api/users/login')
                .send({
                    nickname: 'TestUser1',
                    email: email,
                    telefon: '+34 600 000 000'
                });

            const res = await request(app)
                .post('/api/users/login')
                .send({
                    nickname: 'TestUser2',
                    email: email,
                    telefon: '+34 600 000 001'
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.status).toBe('ERROR');
        });

        test('GET /api/users - Obtener todos los usuarios', async () => {
            const res = await request(app)
                .get('/api/users');

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // Test de Peticiones
    describe('Petitions Endpoints', () => {
        test('POST /api/petitions - Crear petición sin API Key debe retornar 401', async () => {
            const res = await request(app)
                .post('/api/petitions')
                .send({
                    prompt: 'Test prompt',
                    model: 'test-model'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.status).toBe('ERROR');
        });

        test('POST /api/petitions - Crear petición con API Key válida', async () => {
            if (!apiKey) this.skip();

            const res = await request(app)
                .post('/api/petitions')
                .set('X-API-Key', apiKey)
                .send({
                    prompt: 'Genera una imagen de prueba',
                    model: 'stable-diffusion',
                    images: null
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('OK');
            expect(res.body.data).toHaveProperty('id');
            
            petitionId = res.body.data.id;
        });

        test('POST /api/petitions - Falta campo obligatorio debe retornar 400', async () => {
            if (!apiKey) this.skip();

            const res = await request(app)
                .post('/api/petitions')
                .set('X-API-Key', apiKey)
                .send({
                    prompt: 'Test prompt'
                    // Falta el campo model
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('ERROR');
        });

        test('GET /api/petitions - Obtener todas las peticiones', async () => {
            const res = await request(app)
                .get('/api/petitions?page=1&limit=10');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body).toHaveProperty('pagination');
        });

        test('GET /api/petitions/me - Obtener mis peticiones sin API Key debe retornar 401', async () => {
            const res = await request(app)
                .get('/api/petitions/me');

            expect(res.statusCode).toBe(401);
        });

        test('GET /api/petitions/me - Obtener mis peticiones con API Key', async () => {
            if (!apiKey) this.skip();

            const res = await request(app)
                .get('/api/petitions/me?page=1&limit=10')
                .set('X-API-Key', apiKey);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body).toHaveProperty('pagination');
        });

        test('GET /api/petitions/:id - Obtener petición por ID', async () => {
            if (!petitionId) this.skip();

            const res = await request(app)
                .get(`/api/petitions/${petitionId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body.data.id).toBe(petitionId);
        });

        test('GET /api/petitions/:id - Petición no encontrada debe retornar 404', async () => {
            const res = await request(app)
                .get('/api/petitions/99999');

            expect(res.statusCode).toBe(404);
            expect(res.body.status).toBe('ERROR');
        });

        test('PUT /api/petitions/:id - Actualizar petición', async () => {
            if (!apiKey || !petitionId) this.skip();

            const res = await request(app)
                .put(`/api/petitions/${petitionId}`)
                .set('X-API-Key', apiKey)
                .send({
                    prompt: 'Prompt actualizado',
                    model: 'dall-e-3'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body.data.prompt).toBe('Prompt actualizado');
        });
    });

    // Test de Respuestas
    describe('Responses Endpoints', () => {
        test('POST /api/responses/petition/:id - Crear respuesta sin API Key debe retornar 401', async () => {
            if (!petitionId) this.skip();

            const res = await request(app)
                .post(`/api/responses/petition/${petitionId}`)
                .send({
                    status: 'completed',
                    message: 'Test response'
                });

            expect(res.statusCode).toBe(401);
        });

        test('POST /api/responses/petition/:id - Crear respuesta con API Key', async () => {
            if (!apiKey || !petitionId) this.skip();

            const res = await request(app)
                .post(`/api/responses/petition/${petitionId}`)
                .set('X-API-Key', apiKey)
                .send({
                    status: 'completed',
                    message: 'Respuesta de prueba',
                    data: { imageUrl: 'https://example.com/image.png' }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('OK');
            expect(res.body.data.status).toBe('completed');
        });

        test('POST /api/responses/petition/:id - Respuesta duplicada debe retornar 409', async () => {
            if (!apiKey || !petitionId) this.skip();

            const res = await request(app)
                .post(`/api/responses/petition/${petitionId}`)
                .set('X-API-Key', apiKey)
                .send({
                    status: 'completed',
                    message: 'Segunda respuesta'
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.status).toBe('ERROR');
        });

        test('GET /api/responses/petition/:id - Obtener respuesta', async () => {
            if (!petitionId) this.skip();

            const res = await request(app)
                .get(`/api/responses/petition/${petitionId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body.data.petitionId).toBe(petitionId);
        });

        test('PUT /api/responses/petition/:id - Actualizar respuesta', async () => {
            if (!apiKey || !petitionId) this.skip();

            const res = await request(app)
                .put(`/api/responses/petition/${petitionId}`)
                .set('X-API-Key', apiKey)
                .send({
                    status: 'pending',
                    message: 'Respuesta actualizada'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
            expect(res.body.data.status).toBe('pending');
        });

        test('DELETE /api/responses/petition/:id - Eliminar respuesta', async () => {
            if (!apiKey || !petitionId) this.skip();

            const res = await request(app)
                .delete(`/api/responses/petition/${petitionId}`)
                .set('X-API-Key', apiKey);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    // Test de Health Check
    describe('Health Check Endpoints', () => {
        test('GET /health - Health check general', async () => {
            const res = await request(app)
                .get('/health');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
        });

        test('GET /health/db - Database health check', async () => {
            const res = await request(app)
                .get('/health/db');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    // Cleanup - Eliminar la petición de prueba
    afterAll(async () => {
        if (apiKey && petitionId) {
            await request(app)
                .delete(`/api/petitions/${petitionId}`)
                .set('X-API-Key', apiKey);
        }
    });
});
