import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';


export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
},
  { timestamps: true }
);


// Hash password before saving

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try{
    const salt = await bcrypt.genSalt(10);
    this.password =  await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

//Compare password method
userSchema.methods.comparePassword = async function (candidate: string): 
Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
}
export default mongoose.model('User', userSchema);