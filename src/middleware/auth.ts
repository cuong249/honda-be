import { NextFunction, Request, Response } from "express";
import { decode_access, decode_refresh, sign_access } from "../utils/jwt";
import { AccountDecode, AccountSign } from "../type/accountJwt";
import { Account } from "../database/models/Account";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = req.headers["authorization"];
    const refreshToken = req.cookies["refreshToken"];

    if (accessToken) {
      try {
        const decode = <AccountDecode>decode_access(accessToken);
        res.locals.id = decode.id;
        res.locals.role = decode.role;
        next();
      } catch (err: any) {
        if (!refreshToken) {
          res.status(401);
          throw new Error("Access denied. No token provided");
        }
        try {
          const decode = <AccountDecode>decode_refresh(refreshToken);
          const accountSign: AccountSign = <AccountSign>{
            id: decode.id,
            role: decode.role,
          };
          const account: Account | null = await Account.findOne({
            where: { id: decode.id },
          });
          if (!account) {
            res.status(401);
            throw new Error("Invalid refresh token");
          }
          if (account.token != refreshToken) {
            res.status(401);
            throw new Error("Invalid refresh token");
          }
          const accessToken = sign_access(accountSign);
          res
            .cookie("refreshToken", refreshToken, {
              httpOnly: true,
              sameSite: "strict",
            })
            .header("authorization", accessToken)
            .send({ message: "Refresh token successfully" });
        } catch (err: any) {
          res.status(400).json({
            message: "Invalid Token",
            error: <Error>err.message,
          });
        }
      }
    } else {
      if (!refreshToken) {
        res.status(401);
        throw new Error("Access denied. No token provided");
      }
      try {
        const decode = <AccountDecode>decode_refresh(refreshToken);
        const accountSign: AccountSign = <AccountSign>{
          id: decode.id,
          role: decode.role,
        };
        const accessToken = sign_access(accountSign);
        res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
          })
          .header("authorization", accessToken)
          .send({ message: "Refresh token successfully" });
      } catch (err: any) {
        res.status(400).json({
          message: "Invalid Token",
          error: <Error>err.message,
        });
      }
    }
  } catch (err: any) {
    var statusCode = res.statusCode == 200 ? null : res.statusCode;
    statusCode = statusCode || 404;
    res.status(statusCode!).json({
      message: "Could not validate token",
      error: <Error>err.message,
    });
  }
}

export { authenticate };
