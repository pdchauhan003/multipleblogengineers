import { Metadata } from 'next';
import api from '@/api/axios';
import BlogDetailPage from '@/components/BlogDetailPage'; // move your current component here

//blod detail fetch function
async function getBlog(slug: string) {
  try {
    const res = await api.get(`/api/blog/${slug}`);
    return res.data.blog;
  } catch {
    return null;
  }
}

//this injects SEO into head
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
      description: 'This blog post does not exist.',
    };
  }

  return {
    title: blog.title,                    //  <title>
    description: blog.excerpt,            //  <meta name="description">
    keywords: blog.seoKeywords,           //  <meta name="keywords">
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
      type: 'article',
    },
  };
}

export default async function Page({params}: {params: Promise<{ slug: string }>}) {
  const { slug } = await params;
  return <BlogDetailPage slug={slug} />;
}