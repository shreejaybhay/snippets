export interface UserTypes {
  _id: string;
  username: string;
  email: string;
  profileURL?: string;
  bio?: string;
  following?: string[];
  followers?: string[];
  // Add any other user properties you need
}