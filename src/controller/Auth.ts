import { Request, Response } from "express";
import { Account } from "../database/models/Account";
import { ROLE, STATE } from "../database/enum/enum";
import { AccountSign } from "../type/accountJwt";
import { sign_access, sign_refresh } from "../utils/jwt";

async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    let account: Account | null;
    await Account.findOne({ where: { email: username } }).then(
      async (accEmail) => {
        if (accEmail) {
          account = accEmail;
        } else {
          await Account.findOne({ where: { phone: username } }).then(
            (accPhone) => {
              if (accPhone) {
                account = accPhone;
              } else {
                res.status(401);
                throw new Error("Email or phone does not exist");
              }
            }
          );
        }
      }
    );
    const existedAccount = account!;
    if (existedAccount.state === STATE.INACTIVE) {
      res.status(403);
      throw new Error("Inactive Account");
    }
    if (existedAccount.password == password) {
      const accountInfo: AccountSign = {
        id: existedAccount.id,
        role: existedAccount.role,
      };
      const accessToken = sign_access(accountInfo);
      const refreshToken = sign_refresh(accountInfo);
      existedAccount.set({
        token: refreshToken,
      });
      existedAccount.save();
      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .header("authorization", accessToken)
        .send({
          message: "Login successfully!",
          account: existedAccount,
        });
    } else {
      res.status(401);
      throw new Error("Incorrect password!");
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Login failed!",
      error: <Error>err.message,
    });
  }
}

async function logout(req: Request, res: Response) {
  try {
    const id = res.locals.id;
    const role = res.locals.role;
    const account: Account | null = await Account.findOne({
      where: { id: id },
    });
    if (!account) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    await account.set({
      token: null,
    });
    await account.save;
    res.status(200).json({
      message: "Logout successfully!",
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Logout failed",
      error: <Error>err.message,
    });
  }
}

async function auth(req: Request, res: Response) {
  try {
    const id = res.locals.id;
    const role = res.locals.role;
    if (!id || !role) {
      res.status(401);
      throw new Error("invalid id or role");
    }
    const account: Account | null = await Account.findOne({
      where: { id: id },
    });
    if (!account) {
      res.status(404);
      throw new Error("Id does not exist");
    }
    res.status(200).send({
      account: account,
    });
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode).json({
      message: "Authentication failed",
      error: <Error>err.message,
    });
  }
}

export { login, logout, auth };
