import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserModel } from '../models/User';
import Locals from '../providers/Locals';
import { ApiController } from './ApiController';
import bcrypt from 'bcrypt-nodejs';
import { RoleType } from '../models/Role';
import { checkMaintenance } from '../util/maintenance';
import { UserLog } from '../models/UserLog';

export class AuthController extends ApiController {
  constructor() {
    super();
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.getUser = this.getUser.bind(this);
  }

  static token(user: any) {
    return jwt.sign(
      {
        username: user.username,
      },
      Locals.config().appSecret,
      {
        expiresIn: Locals.config().jwtExpiresIn,
      }
    );
  }

  async login(req: Request, res: Response): Promise<any> {
    try {
      const { logs, isDemo } = req.body;

      if (isDemo) {
        const dummyuser = await User.findOne({ isDemo: true });
        if (dummyuser) {
          req.body.username = dummyuser.username;
          req.body.password = '';
          const token = AuthController.token(dummyuser);
          dummyuser.sessionId = Date.now();
          await dummyuser.save();
          await UserLog.insertMany([{ logs, userId: dummyuser._id }]);
          return this.success(res, {
            token,
            refreshToken: dummyuser.refreshToken,
            username: dummyuser.username,
            role: dummyuser.role,
            _id: dummyuser._id,
            sessionId: dummyuser.sessionId,
            isDemo: dummyuser.isDemo,
          });
        } else {
          req.body.username = '';
          req.body.password = '';
        }
      }

      if (!req.body.username || !req.body.password) {
        return this.fail(res, 'Please, send your username and password.');
      }

      const user = await User.findOne({ username: req.body.username, role: RoleType.user });

      if (!user) {
        return this.fail(res, 'User does not exist!');
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent');
      }

      /* Check if the site is in maintenance mode */
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance();
        if (message) {
          return this.fail(res, message.message);
        }
      }

      return await user.comparePassword(req.body.password).then(async (isMatch) => {
        if (isMatch) {
          const token = AuthController.token(user);
          user.refreshToken = bcrypt.hashSync(user.username);
          user.sessionId = Date.now();
          await user.save();
          await UserLog.insertMany([{ logs, userId: user._id }]);
          return this.success(res, {
            token,
            refreshToken: user.refreshToken,
            username: user.username,
            role: user.role,
            _id: user._id,
            sessionId: user.sessionId,
          });
        }
        return this.fail(res, 'The email or password are incorrect!');
      });
    } catch (e: any) {
      return this.fail(res, e);
    }
  }

  loginAdmin = async (req: Request, res: Response): Promise<any> => {
    try {
      const { logs } = req.body;

      if (!req.body.username || !req.body.password) {
        return this.fail(res, 'Please, send your username and password.');
      }

      // Fetch the user where the role is not 'user'
      const user = await User.findOne({ username: req.body.username, role: { $ne: 'user' } });

      if (!user) {
        return this.fail(res, 'User does not exist!');
      }

      if (user.role !== RoleType.admin && !user.isLogin) {
        return this.fail(res, 'Your account is deactivated by your parent');
      }

      /* Check if the site is in maintenance mode */
      if (user.role !== RoleType.admin) {
        const message = checkMaintenance();
        if (message) {
          return this.fail(res, message.message);
        }
      }

      return await user.comparePassword(req.body.password).then(async (isMatch) => {
        if (isMatch) {
          const token = AuthController.token(user);
          user.refreshToken = bcrypt.hashSync(user.username);
          await user.save();
          await UserLog.insertMany([{ logs, userId: user._id }]);
          return this.success(res, {
            token,
            refreshToken: user.refreshToken,
            username: user.username,
            role: user.role,
            _id: user._id,
          });
        }
        return this.fail(res, 'The email or password are incorrect!');
      });
    } catch (e: any) {
      return this.fail(res, e);
    }
  };

  async getUser(req: Request, res: Response): Promise<Response> {
    return this.success(res, { user: req.user });
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const { token } = req.body;

    const user = await User.findOne({ refreshToken: token });

    if (!user) {
      return this.fail(res, 'User does not exist!');
    }

    const newToken = AuthController.token(user);

    return this.success(res, { newToken }, '');
  }

  updatePassword = async (req: Request, res: Response) => {
    try {
      const user: any = req.user;
      const { current_password, confirm_password, new_password } = req.body;
      if (confirm_password !== new_password) {
        return this.fail(res, 'Confirm Password not matched');
      }
      const userData: any = await User.findOne({ _id: user._id });

      return await userData.comparePassword(current_password).then(async (isMatch: any) => {
        if (!isMatch) {
          return this.fail(res, 'Current Password not matched');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(new_password, salt);
        await User.findOneAndUpdate({ _id: user._id }, { $set: { password: hash } });

        return this.success(res, { success: true }, 'Password updated successfully');
      });
    } catch (e: any) {
      return this.fail(res, e);
    }
  };

  addTransactionPassword = async (req: Request, res: Response) => {
    try {
      const user: any = req.user;
      const { txn_password, confirm_password, new_password } = req.body;
      if (confirm_password !== new_password) {
        return this.fail(res, 'Confirm Password not matched');
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(new_password, salt);
      const hashTransactionPassword = bcrypt.hashSync(txn_password, salt);
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            password: hash,
            transactionPassword: hashTransactionPassword,
            changePassAndTxn: true,
          },
        }
      );

      return this.success(res, { success: true }, 'Password updated successfully');
    } catch (e: any) {
      return this.fail(res, e);
    }
  };
}
