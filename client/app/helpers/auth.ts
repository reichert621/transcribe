import * as request from 'superagent';

export type User = {
  id: number;
  email: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export const register = (credentials: Credentials): Promise<User> => {
  return request
    .post('/api/register')
    .send(credentials)
    .then(res => res.body);
};

export const login = (credentials: Credentials): Promise<User> => {
  return request
    .post('/api/login')
    .send(credentials)
    .then(res => res.body);
};

export const logout = (): Promise<any> => {
  return request.del('/api/logout');
};
