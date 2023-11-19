import { ROLE } from "../database/enum/enum";

interface AccountSign {
  id: string;
  role: ROLE;
}

interface AccountDecode {
  id: string;
  role: ROLE;
  iat: number;
  exp: number;
}

export { AccountSign, AccountDecode };
