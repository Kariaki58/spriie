"use client";
import { ArrowLeft, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  terms: boolean;
}

export default function ContactUsForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: 'General inquiry',
    message: '',
    terms: false,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General inquiry',
        message: '',
        terms: false,
      });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link 
            href="/" 
            className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Contact Spriie</h1>
            <p className="text-sm text-gray-600 mt-1">We'd love to hear from you</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {submitSuccess ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-xl font-medium text-gray-900">Thank you for your message!</h2>
            <p className="mt-3 text-gray-500">
              We've received your inquiry and will get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-700 mb-6">Get in Touch</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-full">
                        <Mail className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900">Email us</h3>
                        <p className="text-gray-600 mt-1">
                          <a href="mailto:contact@spriie.com" className="text-emerald-600 hover:text-emerald-800">
                            contact@spriie.com
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-base font-medium text-gray-900">Our Mission</h3>
                        <p className="text-gray-600 mt-2">
                            At Spriie, we're on a mission to make online shopping more honest, transparent, and community-driven — 
                            powered by real content and real people.
                        </p>
                    </div>


                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-base font-medium text-gray-900">Response Time</h3>
                      <p className="text-gray-600 mt-1">
                        We typically respond to all inquiries within 24 hours during business days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-700 mb-6">Send us a message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          placeholder="Your name"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                          placeholder="you@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="mt-1 block w-full py-3 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      >
                        <option value="General inquiry">General inquiry</option>
                        <option value="Seller support">Seller support</option>
                        <option value="Trust & safety">Trust & safety</option>
                        <option value="Technical issues">Technical issues</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`block w-full px-3 py-3 border ${
                          errors.message ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                        placeholder="How can we help you?"
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={formData.terms}
                          onChange={handleChange}
                          className={`h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded ${
                            errors.terms ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-gray-700">
                          I agree to Spriie's <Link href="/privacy" className="text-emerald-600 hover:text-emerald-800">Privacy Policy</Link>
                        </label>
                        {errors.terms && (
                          <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
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