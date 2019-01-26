import * as express from 'express';
import { users, recordings, aws, stripe, ny } from './db/controllers';
import { auth, isAuthenticated } from './passport';

const { Router } = express;
const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));
// User endpoints
api.post('/register', users.register);
api.post('/login', auth, users.login);
api.delete('/logout', users.logout);
api.get('/me', users.me);
// Recording endpoints
api.get('/recordings', isAuthenticated, recordings.fetch);
api.get('/recordings/:id', recordings.findById);
api.post('/recordings', isAuthenticated, recordings.create);
// AWS endpoints
api.get('/signed-url', isAuthenticated, aws.getSignedUrl);
api.get('/transcription-jobs', isAuthenticated, aws.listTranscriptionJobs);
// Stripe endpoints
api.post('/charges', stripe.charge);
api.get('/products', isAuthenticated, stripe.fetchProducts);
// Misc.
api.get('/scraper/audio', ny.getAudioUrl);

export default api;
