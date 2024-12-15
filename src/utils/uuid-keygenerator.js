import { v4 as uuid } from 'uuid';

export const generateKey = () => uuid().split('-').join('');
