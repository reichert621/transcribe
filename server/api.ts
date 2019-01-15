import * as express from 'express';
import { users, recordings, aws } from './db/controllers';
import { auth, isAuthenticated } from './passport';

const { Router } = express;
const api = Router();

// For testing
api.get('/ping', (req, res) => res.json({ message: 'pong' }));
// User endpoints
api.post('/register', users.register);
api.post('/login', auth, users.login);
api.delete('/logout', users.logout);
// Recording endpoints
api.get('/recordings', isAuthenticated, recordings.fetch);
api.get('/recordings/:id', isAuthenticated, recordings.findById);
api.post('/recordings', isAuthenticated, recordings.create);
// AWS endpoints
api.get('/signed-url', isAuthenticated, aws.getSignedUrl);

export default api;
