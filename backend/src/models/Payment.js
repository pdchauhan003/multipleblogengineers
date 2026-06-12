
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,
    },
    amount: {type: Number,required: true,
    },
    currency: {type: String,default: "INR",
    },
    orderId: {type: String,required: true,unique: true,
    },
    paymentId: {type: String,default: null,
    },
    razorpaySignature: {type: String,default: null,
    },
    status: {type: String,enum: ["created","paid","failed","refunded",],default: "created",
    },
    paymentMethod: {type: String,default: null,
    },
    isVerified: {type: Boolean,default: false,
    },
    receipt: {type: String,default:null
    },
    paidAt: {type: Date,default: null,
    },
    refundedAt: {type: Date,default: null,
    },
    refundId: {type: String,default: null,
    },
    blogId: {type: mongoose.Schema.Types.ObjectId,ref: "Blog",
    }
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({user:1,paymentId:1,orderId:1})

const Payment = mongoose.model("Payment", paymentSchema);

export {Payment};