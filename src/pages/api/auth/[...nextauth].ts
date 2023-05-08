import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      try {
        return {
          ...session,
          id: token.sub
        }
      } catch (err) {
        return {
          ...session,
          id: null
        }
      }
    },
    async signIn({ user, account, profile }) {
      const { email } = user;
      try {
        return true;
      } catch (err) {
        console.log('Deu erro: ', err);
        return false;
      }
    }
  }
})