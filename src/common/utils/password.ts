import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, saltOrRounds);
};

export const hashPasswordSync = (password: string): string => {
  return bcrypt.hashSync(password, saltOrRounds);
};

export const matchHashedPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
