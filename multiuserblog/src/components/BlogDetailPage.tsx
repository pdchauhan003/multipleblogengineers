'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Clock, Tag, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { useSlug } from '@/hooks/useSlug';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export default function BlogDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch blog by slug
  const { data: blog, isLoading, error, } = useSlug(slug);

  const formattedDate = blog
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';

  // ── Auth / session loading ───────────────────────────────────────────────────
  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-400 mt-6 text-sm animate-pulse tracking-wide">Verifying session...</p>
      </div>
    );
  }

  const downloadPDF = (): void => {
    if (!blog) return;
    const pdf = new jsPDF();
    const parser = new DOMParser();
    const doc = parser.parseFromString(blog.htmlContent, 'text/html');
    let y = 20;
    pdf.setFontSize(18);
    pdf.text(blog.title, 10, y);
    y += 15;
    const paragraphs: HTMLElement[] = Array.from(
      doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li')
    );
    paragraphs.forEach((el: HTMLElement) => {
      const text = el.innerText.trim();
      if (!text) return;
      const lines = pdf.splitTextToSize(text, 180);
      if (y + lines.length * 7 > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines, 10, y);
      y += lines.length * 7 + 5;
    });
    pdf.save(`${blog.title}.pdf`);
  };

  // ── Blog content skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4 py-10">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-24 bg-white/10 rounded-full" />
          <div className="h-56 w-full bg-white/5 rounded-2xl" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
            <div className="h-4 w-1/2 bg-white/5 rounded-xl" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 bg-white/5 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error / 404 ──────────────────────────────────────────────────────────────
  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-400" size={30} />
          </div>
          <h2 className="text-xl font-bold">Blog not found</h2>
          <p className="text-gray-400 text-sm">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  // ── Blog detail ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">

      {/* Cover image hero */}
      {blog.coverImage && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            loading="eager"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Back button */}
        {/* <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 text-sm font-medium transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Feed
        </Link> */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-center" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          Back to Feed
        </div>

        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Tag size={10} />
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
          {blog.title}
        </h1>

        {/* Excerpt */}
        <p className="text-gray-400 text-base leading-relaxed mb-6 border-l-2 border-indigo-500/40 pl-4 italic">
          {blog.excerpt}
        </p>

        {/* Author & date row */}
        <div className="flex flex-wrap items-center gap-5 pb-6 mb-8 border-b border-white/10 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <UserIcon size={13} className="text-indigo-400" />
            </div>
            <span className="text-gray-300 font-medium cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => router.push(`/profile/${blog.authorId?.name}`)}>
              {blog.authorId?.name ?? 'Unknown Author'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* HTML content */}
        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.htmlContent }}
        />

        {/* SEO keywords / tags */}
        {blog.seoKeywords && (
          <div className="mt-10 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-widest mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {blog.seoKeywords.split(',').map((kw) => (
                <span
                  key={kw.trim()}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs"
                >
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium"
        >
          <Download size={16} />
          Download PDF
        </button>

        {/* Footer back button */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-center" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          Back to Feed

        </div>

      </div>
    </div>
  );
}
