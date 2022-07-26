const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  static async register(req, res) {
    const {
      name, email, phone, password, confirmpassword,
    } = req.body;

    // validations
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório' });
      return;
    }
    if (!email) {
      res.status(422).json({ message: 'O email é obrigatório' });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: 'O telefone é obrigatório' });
      return;
    }
    if (!password) {
      res.status(422).json({ message: 'A senha é obrigatória' });
      return;
    }
    if (!confirmpassword) {
      res.status(422).json({ message: 'Confirme sua senha' });
      return;
    }
    if (password !== confirmpassword) {
      res.status(422).json({ message: 'A senha e a confirmação de senha precisam ser iguais' });
    }

    // check if user exists
    const userExist = await User.findOne({ email });

    if (userExist) {
      res.status(422).json({ message: 'Por favor, insira outro e-mail' });
      return;
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
    // método mongoose
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(422).json({ message: 'O e-mail é obrigatório' });
      return;
    }

    if (!password) {
      res.status(422).json({ message: 'A senha é obrigatória' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(422).json({ message: 'Não há usuário cadastrado com este e-mail' });
      return;
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({ message: 'Senha incorreta' });
      return;
    }
    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);
      const decode = jwt.verify(token, 'nossosecret');

      currentUser = await User.findById(decode.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).json(currentUser);
  }

  static async getUserById(req, res) {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json(user);
  }

  static async editUser(req, res) {
    // const { id } = req.params;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    const {
      name, email, phone, password, confirmpassword,
    } = req.body;

    // const image = '';

    // validations
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório' });
      return;
    }

    user.name = name;

    if (!email) {
      res.status(422).json({ message: 'O email é obrigatório' });
      return;
    }

    // check if email has already been used
    const userExist = await User.findOne({ email });
    if (userExist && user.email !== email) {
      res.status(422).json({ message: 'Por favor, insira outro e-mail' });
      return;
    }

    user.email = email;

    if (!phone) {
      res.status(422).json({ message: 'O telefone é obrigatório' });
      return;
    }

    user.phone = phone;

    if (password !== confirmpassword) {
      res.status(422).json({ message: 'A senha e a confirmação de senha precisam ser iguais' });
      return;
    } if (password === confirmpassword && password != null) {
      // create a password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    try {
      // retur user updated data
      await User.findOneAndUpdate(
        // eslint-disable-next-line no-underscore-dangle
        { id: user._id },
        { $set: user },
        { new: true },
      );

      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // create image
};
