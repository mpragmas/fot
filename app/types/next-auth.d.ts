import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: "FAN" | "REPORTER" | "ADMIN" | "SUPER_ADMIN"; // add role here
    };
  }

  interface User {
    role: "FAN" | "REPORTER" | "ADMIN" | "SUPER_ADMIN"; // add role here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "FAN" | "REPORTER" | "ADMIN" | "SUPER_ADMIN"; // add role here
  }
}
