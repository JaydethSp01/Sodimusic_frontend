import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as {
          token: string;
          user: { id: string; email: string };
        };
        return {
          id: data.user.id,
          email: data.user.email,
          name: "Admin Sodimusic",
          accessToken: data.token,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    jwt({ token, user }) {
      if (user && "accessToken" in user && typeof user.accessToken === "string") {
        token.accessToken = user.accessToken;
      }
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  trustHost: true,
});
