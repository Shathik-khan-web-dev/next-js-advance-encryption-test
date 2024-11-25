import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import User from "@/server/models/userModal";
import dbConnect from "@/server/config/dbConnect";
import sendEmail from "@/server/utils/sendEmail";
import config from "@/config";
import { _get } from "@/client/utils/apiClient";
import { encryptData, decryptData } from "@/client/utils/encryptDecrypt";
import { getIPLocation } from "@/client/utils/getIPLocation";

export const options = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      profile(profile) {
        let userRole = "visitor";
        if (profile?.email === "sathiksathik126@gmail.com") {
          userRole = "admin";
        }
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALLBACK_URL,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      redirectUri: process.env.GITHUB_CALLBACK_URL,
      profile(profile) {
        let userRole = "visitor";
        if (profile?.email === "sathiksathik126@gmail.com") {
          userRole = "admin";
        }
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
          role: userRole,
        };
      },
    }),
    FacebookProvider({
      profile(profile) {
        let userRole = "visitor";
        if (profile?.email === "sathiksathik126@gmail.com") {
          userRole = "admin";
        }
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture.data.url,
          role: userRole,
        };
      },
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      redirectUri: process.env.FACEBOOK_CALLBACK_URL,
    }),
  ],

  pages: {
    signIn: "/auth",
  },

  callbacks: {
    async signIn({ user }) {
      await dbConnect();

      try {
        const apiResponse = await _get("https://api.ipify.org?format=json");
 
        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        const ip = response.ip;

        const locationDetails = await getIPLocation(ip);

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // If the user doesn't exist, create a new user with IP details
          const newUser = new User({
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            ip,
            city: locationDetails.city,
            region: locationDetails.region,
            country: locationDetails.country,
            latitude: parseFloat(locationDetails.loc.split(",")[0]),
            longitude: parseFloat(locationDetails.loc.split(",")[1]),
          });

          await newUser.save();
          user._id = newUser._id;

          if (process.env.NODE_ENV === "production") {
            await sendEmail(
              user.email,
              "Welcome to Our Platform",
              `
                <h1>Account Successfully Created</h1>
                <p>Hi ${user.name},</p>
                <p>Your account has been successfully created using Google Sign-In.</p>
                <p>We're glad to have you on board!</p>
              `
            );
          }
        } else {
          // Update the user's IP and location details
          existingUser.ip = ip;
          existingUser.city = locationDetails.city;
          existingUser.region = locationDetails.region;
          existingUser.country = locationDetails.country;
          existingUser.latitude = parseFloat(locationDetails.loc.split(",")[0]);
          existingUser.longitude = parseFloat(
            locationDetails.loc.split(",")[1]
          );

          await existingUser.save();

          user._id = existingUser._id;
          user.role = existingUser.role;

          if (process.env.NODE_ENV === "production") {
            await sendEmail(
              user.email,
              "Successfully Logged In",
              `
                <h1>Welcome Back!</h1>
                <p>Hi ${user.name},</p>
                <p>You have successfully logged in using Google Sign-In.</p>
                <p>We hope you have a great experience!</p>
              `
            );
          }
        }
      } catch (error) {
        return false;
      }

      return true;
    },

    async session({ session, token }) {
      if (session?.user) {
        const decryptedData = decryptData(token.encryptedData);
        session.user = {
          ...session.user,
          id: decryptedData.id,
          name: decryptedData.name,
          email: decryptedData.email,
          image: decryptedData.image,
          role: decryptedData.role,
        };
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        const encryptedUserData = encryptData({
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        });
        token.encryptedData = encryptedUserData;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // Token valid for 24 hours
      }
      return token;
    },
  },

  session: {
    maxAge: 60 * 60 * 24,
    updateAge: 60 * 60,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
};

export default NextAuth(options);
