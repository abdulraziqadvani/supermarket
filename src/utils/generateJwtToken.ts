import jwt from 'jsonwebtoken';
import config from 'config';

function generateJwtToken({ id }) {
  return jwt.sign(
    {
      data: { id },
    },
    config.get('secretKey'),
  );
}

export default generateJwtToken;
