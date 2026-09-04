import { CheckCircle, Send } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent, FormEvent, JSX } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";

const CONTACT_EMAIL = "hello@learndari.com";

interface FeedbackForm {
  name: string;
  email: string;
  category: string;
  message: string;
}

const EMPTY_FORM: FeedbackForm = {
  name: "",
  email: "",
  category: "suggestion",
  message: "",
};

export default function Feedback(): JSX.Element {
  const [formData, setFormData] = useState<FeedbackForm>(EMPTY_FORM);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault();

    // No feedback backend exists, so hand the message to the visitor's email
    // client — this works wherever the site is hosted.
    const subject = `[${formData.category}] LearnDari feedback`;
    const body = [
      formData.name && `Name: ${formData.name}`,
      formData.email && `Email: ${formData.email}`,
      "",
      formData.message,
    ]
      .filter((line) => line !== undefined && line !== false)
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData(EMPTY_FORM);
    }, 4000);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Feedback &amp; Contact
          </h1>
          <p className="text-xl text-gray-600">
            Help us improve LearnDari with your suggestions
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-12 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
            <h2 className="mb-2 text-3xl font-bold text-green-900">Thank You!</h2>
            <p className="text-lg text-green-700">
              Your email app should have opened with your feedback ready to send. We appreciate
              your input!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Your name"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="your.email@example.com"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-teal-600 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Only needed if you&apos;d like us to respond
                </p>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-teal-600 focus:outline-none"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="content">Content Request</option>
                  <option value="question">Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={2000}
                  rows={6}
                  placeholder="Share your thoughts, report an issue, or suggest a feature..."
                  className="w-full resize-none rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-teal-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-teal-700"
              >
                <Send className="h-5 w-5" />
                Submit Feedback
              </button>
            </form>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
