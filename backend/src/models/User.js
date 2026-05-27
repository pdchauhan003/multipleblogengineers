import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['visitor', 'creator'], default: 'visitor' },
    createdAt:{type:Date,default:Date.now},
    otp:{type:String},
    otpExpiry: { type: Date },
    otpRequestCount: { type: Number, default: 0 },
    otpLastRequest: { type: Date },
    refreshToken: { type: String } // Store refresh token for rotation/revocation
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export {User}