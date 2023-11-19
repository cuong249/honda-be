import * as jwt from "jsonwebtoken";
import { AccountSign } from "../type/accountJwt";

const JWT_SECRET =
  "e7a67e013369ba17e622af20aa523d116291245e41ce97d798723e8961118778";
const REFRESH_TOKEN_SECRET =
  "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5Nzk0NzYyNSwiaWF0IjoxNjk3OTQ3NjI1fQ.OzyZEOobmBMnjJfXfKmuGapymsz3qeMJh4dZ16Fn654";
const ACCESS_TOKEN_SECRET =
  "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY5Nzk0NzYyNSwiaWF0IjoxNjk3OTQ3NjI1fQ.OzyZEOobmBMnjJfXfKmuGapymsz3qeMJh4dZ16Fn654";
const REFRESH_EXPIRE_TIME = "30 days";
const ACCESS_EXPIRE_TIME = "1 days";

function sign_refresh(user: AccountSign) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRE_TIME,
  });
}

function sign_access(user: AccountSign) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRE_TIME,
  });
}

function decode_refresh(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

function decode_access(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export { sign_access, sign_refresh, decode_access, decode_refresh };
