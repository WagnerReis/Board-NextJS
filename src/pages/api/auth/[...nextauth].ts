import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import firebase from '../../../services/firebaseConnection'

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

        const lastDonate = await firebase.firestore().collection('users')
        .doc(String(token.sub))
        .get()
        .then((snapshot) => {
          if(snapshot.exists) {
            return snapshot.data()?.lastDonate.toDate()
          } else {
            return null
          }
        })

        return {
          ...session,
          id: token.sub,
          vip: lastDonate ? true : false,
          lastDonate
        }
      } catch (err) {
        return {
          ...session,
          id: null,
          vip: false,
          lastDonate: null
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