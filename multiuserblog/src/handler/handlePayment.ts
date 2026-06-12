/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api/axios"
import { loadScript } from "@/services/razorpayScript"

export const handlePayment=async(blogId:any)=>{
    try {
        await loadScript();
        
        const orderRes=await api.post('/payment/create-order',{amount:500})
        const order=orderRes.data;
        await api.post('/payment/createpayment',{orderId:order.id,blogId:blogId})
        const option={
            key:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount:order.amount,
            currency:order.currency,
            order_id:order.id,
            name:'My app Pd1',
            description:'Premium Plan Blog',
            handler:async function(response:any){
                console.log('handler function response',response);
                const verify=await api.post('/payment/verify',response);
                if(verify){
                    alert('Payment Success');
                }
            },
        };
        const paymentObj = new (window as any).Razorpay(option);
        paymentObj.open();
    } catch (error: any) {
        console.error("Payment error:", error);
        alert(error.response?.data?.message || error.message || "Failed to initiate payment. Please make sure you are logged in.");
    }
}