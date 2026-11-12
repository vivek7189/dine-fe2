'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaChartBar,
  FaRocket,
  FaUsers,
  FaUtensils
} from 'react-icons/fa';

export default function BlogClient({ blogPost }) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/blog');
  };

  const handleShare = (platform) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blogPost?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl && typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Process content to add error handlers to images
  const processedContent = blogPost?.content ? blogPost.content.replace(
    /<img\s+([^>]*?)>/gi, 
    (match, attributes) => {
      if (match.includes('onerror=')) {
        return match;
      }
      return match.replace(/<img\s+/, '<img onerror="this.onerror=null; this.style.display=\'none\';" ');
    }
  ) : '';

  return (
    <>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            <FaArrowLeft size={14} />
            Back to Blog
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Share:</span>
            <button
              onClick={() => handleShare('facebook')}
              style={{
                padding: '8px',
                backgroundColor: '#1877f2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FaFacebook size={14} />
            </button>
            <button
              onClick={() => handleShare('twitter')}
              style={{
                padding: '8px',
                backgroundColor: '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FaTwitter size={14} />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              style={{
                padding: '8px',
                backgroundColor: '#0077b5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FaLinkedin size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Blog Content */}
      <main style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Blog Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: blogPost.categoryColor || '#ef4444',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              {blogPost.category === 'Featured' && <FaRocket size={14} />}
              {blogPost.category === 'Analytics' && <FaChartBar size={14} />}
              {blogPost.category === 'Success Story' && <FaUsers size={14} />}
              {blogPost.category}
            </div>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              {blogPost.title}
            </h1>
            
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              {blogPost.excerpt}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '20px 0',
              borderTop: '1px solid #e5e7eb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaUtensils color="#6b7280" size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                    {blogPost.author}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {blogPost.authorRole}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                <FaCalendarAlt size={14} />
                <span style={{ fontSize: '14px' }}>{blogPost.publishDate}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                <FaClock size={14} />
                <span style={{ fontSize: '14px' }}>{blogPost.readTime}</span>
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <article 
            id="blog-content"
            style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            lineHeight: '1.8',
            fontSize: '18px',
            color: '#374151'
          }}>
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          </article>

          {/* Tags */}
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div style={{ marginTop: '40px', padding: '20px 0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Tags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {blogPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Ready to Transform Your Restaurant?
          </h3>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            Join restaurants already using DineOpen to streamline their operations.
          </p>
          <Link
            href="/#pricing"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
            }}
          >
            Get Started Today
          </Link>
        </div>
      </footer>

      <style jsx>{`
        article h2 {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 32px 0 16px 0;
        }
        
        article h3 {
          font-size: 22px;
          font-weight: 600;
          color: #1f2937;
          margin: 24px 0 12px 0;
        }
        
        article p {
          margin-bottom: 16px;
        }
        
        article ul {
          margin: 16px 0;
          padding-left: 24px;
        }
        
        article li {
          margin-bottom: 8px;
        }
        
        article strong {
          color: #1f2937;
        }
      `}</style>
    </>
  );
}

