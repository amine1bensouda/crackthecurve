import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with ${SITE_NAME} - We'd love to hear from you`,
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-display mb-8 text-4xl font-semibold text-[#2c3c5e]">Contact Us</h1>

        <p className="mb-8 text-xl text-[#6b7180]">
          We&apos;d love to hear from you! Whether you have a question, feedback, or need support,
          our team is here to help.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
            <h3 className="font-display mb-4 text-xl font-semibold text-[#2c3c5e]">Get in Touch</h3>
            <div className="space-y-4 text-[#6b7180]">
              <div>
                <p className="mb-1 font-semibold text-[#2c3c5e]">Email</p>
                <p>
                  <a href="mailto:contact@sonaprep.com" className="underline hover:text-[#2c3c5e]">
                    contact@sonaprep.com
                  </a>
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[#2c3c5e]">Support</p>
                <p>
                  <a href="mailto:support@sonaprep.com" className="underline hover:text-[#2c3c5e]">
                    support@sonaprep.com
                  </a>
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-[#2c3c5e]">Business Hours</p>
                <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
            <h3 className="font-display mb-4 text-xl font-semibold text-[#2c3c5e]">Follow Us</h3>
            <p className="text-[#6b7180]">
              Stay connected with us on social media for updates, tips, and exam prep content.
            </p>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#eae2d2] bg-white p-8">
          <h2 className="font-display mb-6 text-2xl font-semibold text-[#2c3c5e]">Send us a Message</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="w-full resize-none rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="Your message..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-[#2c3c5e] py-3.5 font-semibold text-white transition hover:bg-[#1d2a45]"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
