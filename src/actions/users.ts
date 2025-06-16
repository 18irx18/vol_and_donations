'use server' 

import { connectDB } from "@/db/config";
import UserModel from "@/models/user-model";
import { currentUser } from "@clerk/nextjs/server";

export const handleNewUserRegistration = async (user: {
  id: string;
  username: string | null;
  email: string;
  imageUrl: string;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  try {
    console.log("Starting handleNewUserRegistration for user ID:", user.id);
    await connectDB();

    console.log("Checking for existing user with clerkUserId:", user.id);
    const existingUser = await UserModel.findOne({ clerkUserId: user.id });

    if (existingUser) {
      console.log("Existing user found:", existingUser.userName);
      return existingUser;
    }

    let username = user.username;
    if (!username || username.trim() === '') {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
      username = fullName || user.email.split('@')[0];
      console.log("Generated username:", username);
    }

    const newUser = new UserModel({
      clerkUserId: user.id,
      userName: username,
      email: user.email,
      profilePic: user.imageUrl,
    });

    console.log("Attempting to save new user:", newUser.userName);
    let user_created = await newUser.save();
    if (!user_created) {
      throw new Error("Failed to create new user in the database.");
    }
    console.log("New user saved successfully to DB!");
    return newUser;
  } catch (error: any) {
    console.error("Error in handleNewUserRegistration:", error.message);
    return { error: error.message };
  }
};


export const getCurrentUserFromDB = async () => {
  try {
    console.log("Starting getCurrentUserFromDB.");
    await connectDB();

    console.log("Fetching logged in user data from Clerk...");
    const loggedInUserData = await currentUser();

    if (!loggedInUserData) {
      console.log("No logged in user data found from Clerk.");
      return { data: null, error: "No logged in user" };
    }

    console.log("Looking for MongoDB user with Clerk ID:", loggedInUserData.id);
    const mongoUser = await UserModel.findOne({
      clerkUserId: loggedInUserData?.id,
    });

    if (!mongoUser) {
      console.log("No MongoDB user found for Clerk ID:", loggedInUserData.id);
      const newUserRegistrationResult = await handleNewUserRegistration({
        id: loggedInUserData.id,
        username: loggedInUserData.username || null,
        email: loggedInUserData.emailAddresses[0]?.emailAddress || "",
        imageUrl: loggedInUserData.imageUrl || "",
        firstName: loggedInUserData.firstName || null,
        lastName: loggedInUserData.lastName || null,
      });

      if (newUserRegistrationResult && 'error' in newUserRegistrationResult) {
        return { data: null, error: newUserRegistrationResult.error };
      } else if (newUserRegistrationResult) {
        console.log("Newly registered user:", (newUserRegistrationResult as any).userName);
        return { data: JSON.parse(JSON.stringify(newUserRegistrationResult)) };
      } else {
        return { data: null, error: "User registration initiated but no user or error returned." };
      }
    } else {
      console.log("Found MongoDB user:", mongoUser.userName);
      return {
        data: JSON.parse(JSON.stringify(mongoUser)),
      };
    }
  } catch (error: any) {
    console.error("Error in getCurrentUserFromDB:", error.message);
    return {
      data: null,
      error: error.message,
    };
  }
};