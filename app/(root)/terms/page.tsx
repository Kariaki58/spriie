import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link 
            href="/auth/register" 
            className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Registration
          </Link>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Spriie! These Terms of Service ("Terms") govern your use of our content-first e-commerce platform and all related services.
              </p>
              <p className="text-gray-700">
                By accessing or using Spriie, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part, you may not access the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You must provide accurate information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree not to engage in fraudulent, deceptive, or harmful activities</li>
                <li>Content you post must be truthful and comply with all applicable laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">3. Content Guidelines</h2>
              <p className="text-gray-700 mb-4">
                Spriie is built on trust and authentic content. When contributing content:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Reviews must reflect genuine experiences with products</li>
                <li>Timestamps must accurately reflect when content was created</li>
                <li>Disclose any material connections with sellers or brands</li>
                <li>Do not post misleading, defamatory, or offensive content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">4. Seller Terms</h2>
              <p className="text-gray-700 mb-4">
                Verified sellers on Spriie agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Maintain accurate product descriptions and pricing</li>
                <li>Respond promptly to customer inquiries</li>
                <li>Honor all return and refund policies</li>
                <li>Not engage in review manipulation or other trust-breaking behaviors</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">5. Trust Score System</h2>
              <p className="text-gray-700">
                Our peer-reviewed metrics are designed to reflect genuine user satisfaction. Spriie reserves the right to adjust trust scores based on verified community feedback and platform monitoring.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Spriie provides a platform for authentic commerce but does not guarantee:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The accuracy of user-generated content</li>
                <li>The quality or safety of products sold by third-party sellers</li>
                <li>Uninterrupted or error-free service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">7. Changes to Terms</h2>
              <p className="text-gray-700">
                We may modify these Terms at any time. Continued use after changes constitutes acceptance. We will notify users of significant changes through our platform or email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">8. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms, please contact us at contact@spriie.com.
              </p>
            </section>
          </div>

          {/* Footer with Back Button */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Registration
            </Link>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">&copy; {new Date().getFullYear()} Spriie. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}