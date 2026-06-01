import bcrypt from "bcryptjs";

async function test() {
  const pass = "admin321";
  const hash = "$2a$12$3AVRIDN/wCIhWyMSUinbkuGV/b/0ua1yfFg/3lke.xwALpCsu7Z/m";
  const match = await bcrypt.compare(pass, hash);
  console.log("Password match:", match);
}

test();
