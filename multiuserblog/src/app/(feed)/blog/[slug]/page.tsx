/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import api from '@/api/axios';
import BlogDetailPage from '@/components/BlogDetailPage'; // move your current component here

//blod detail fetch function
async function getBlog(slug: string) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();  // because req send server side then does not get cookie automatically by axios then we read and send manually

    const config: any = {};
    if (cookieHeader) {
      config.headers = {
        Cookie: cookieHeader,
      };
    }

    const res = await api.get(`/blog/${slug}`, config);
    return res.data.blog;
  } catch (err) {
    console.log('Metadata fetch error:', err);
    return null;
  }
}

//this injects SEO into head
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

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