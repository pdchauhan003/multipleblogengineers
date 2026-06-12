import mg from 'mongoose';

const blogSchema=new mg.Schema({
    title:{type:String,required:true},
    slug:{type:String,unique:true},
    htmlContent:{type:String,required:true},
    category:{type:String,required:true},
    coverImage:{type:String},
    excerpt:{type:String,required:true},
    seoKeywords:{type:String},
    status:{type:String,enum:['draft','published','paid'],default:'draft'},
    price:{type:Number,default:0},
    authorId:{type:mg.Schema.Types.ObjectId,ref:'User'},
    createdAt:{type:Date,default:Date.now},
})
// blogSchema.index({slug:1});

const Blog=mg.model('Blog',blogSchema);

export {Blog};