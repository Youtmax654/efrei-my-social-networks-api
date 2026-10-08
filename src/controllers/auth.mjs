import validator from 'validator';
import userService from '../services/auth.mjs';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};

    if (!validator.isEmail(email)) {
      const error = new Error("L'adresse email n'est pas valide");
      error.status = 400;
      throw error;
    }

    if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      const error = new Error("Le mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un symbole");
      error.status = 400;
      throw error;
    }

    if (!firstName || !lastName || !email || !password) {
      const error = new Error("Tous les champs obligatoires doivent être renseignés");
      error.status = 400;
      throw error;
    }

    const newUser = await userService.registerUser({ firstName, lastName, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      const error = new Error("L'email et le mot de passe sont requis");
      error.status = 400;
      throw error;
    }

    const token = await userService.login({ email, password });
    res.status(200).json({ token });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
}