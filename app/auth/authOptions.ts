import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // 1. Find user
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // 2. Compare password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

        // 3. Return user object
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // now TypeScript knows about role
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role; // now TypeScript knows about role
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
