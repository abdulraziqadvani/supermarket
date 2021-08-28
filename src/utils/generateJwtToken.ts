import jwt from 'jsonwebtoken';
import config from 'config';

function generateJwtToken({ id }): string {
  return jwt.sign({ id }, config.get('secretKey'));
}

export default generateJwtToken;
