import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
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
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-600 mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
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
                At Spriie, we're committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our content-first e-commerce platform.
              </p>
              <p className="text-gray-700">
                By using Spriie, you consent to the data practices described in this policy. If you do not agree, please do not access or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">2. Information We Collect</h2>
              <h3 className="font-medium text-gray-800 mb-2">Personal Information:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Account registration details (name, email, etc.)</li>
                <li>Payment and transaction information</li>
                <li>Communication records with sellers or support</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="font-medium text-gray-800 mb-2">Usage Data:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Content interaction metrics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and maintain our service</li>
                <li>To improve user experience and platform functionality</li>
                <li>To verify seller and buyer identities</li>
                <li>To calculate and display trust scores</li>
                <li>To communicate important notices</li>
                <li>To prevent fraud and ensure platform security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">4. Data Sharing & Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We value your trust and only share information when necessary:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>With Sellers:</strong> Only to complete transactions you initiate</li>
                <li><strong>Service Providers:</strong> Payment processors, hosting services, etc.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
              </ul>
              <p className="text-gray-700">
                We never sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">5. Content & Public Information</h2>
              <p className="text-gray-700 mb-4">
                As a content-first platform, please be aware:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Reviews and product content are publicly visible</li>
                <li>Seller trust scores and verification badges are public</li>
                <li>Profile information you choose to make public will be visible</li>
                <li>Timestamps on content cannot be removed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement robust security measures including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Encryption of sensitive data</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication protocols</li>
              </ul>
              <p className="text-gray-700">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but we strive to use commercially acceptable means to protect your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">7. Your Rights & Choices</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of certain data</li>
                <li><strong>Opt-out:</strong> Of marketing communications</li>
                <li><strong>Account Closure:</strong> You may deactivate your account</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at contact@spriie.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy periodically. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Significant changes will be communicated via email or platform notification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-emerald-700 mb-4">9. Contact Us</h2>
              <p className="text-gray-700">
                For questions about this Privacy Policy, please contact our Data Protection Officer at:<br />
                <span className="text-emerald-600">contact@spriie.com</span>
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