import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: June 18, 2026
      </p>

      <div className="mt-8 space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">1. Who We Are</h2>
          <p className="mt-2">
            OfferFu is operated by SalesFu AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). For any privacy-related inquiries, contact us at <a href="mailto:hello@salesfu.ai" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">hello@salesfu.ai</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">2. Information We Collect</h2>
          <p className="mt-2">We collect the following types of information:</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li><strong>Account information:</strong> Email address (when you sign up) and phone number (when you verify for full access).</li>
            <li><strong>Session data:</strong> All chat messages, prompts, and AI-generated content you create while using the Service.</li>
            <li><strong>Usage data:</strong> Number of sessions, timestamps, and feature usage patterns.</li>
            <li><strong>Device and browser data:</strong> IP address, browser type, and standard analytics collected by our hosting provider.</li>
            <li><strong>SMS communications:</strong> Phone numbers and message content for verification codes and follow-up messages.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">3. How We Use Your Information</h2>
          <p className="mt-2">We use your information to:</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Provide, operate, and maintain the Service</li>
            <li>Generate AI-powered value offers and call scripts</li>
            <li>Send verification codes via SMS</li>
            <li>Send marketing and follow-up communications (with your consent)</li>
            <li>Improve the Service, monitor usage patterns, and develop market insights</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">4. AI-Generated Content</h2>
          <p className="mt-2">
            Your chat messages and prompts are sent to third-party AI providers (such as OpenAI and OpenRouter) to generate responses. These providers may temporarily process your data according to their own privacy policies. We recommend not entering personally sensitive information (such as health, financial, or identity details) into the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">5. Data Sharing</h2>
          <p className="mt-2">We do not sell your personal information. We share data only in the following circumstances:</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li><strong>AI providers:</strong> Chat messages are sent to AI API providers to generate responses, as described above.</li>
            <li><strong>SMS providers:</strong> Phone numbers and verification codes are sent to our SMS delivery provider (Telnyx) to send messages.</li>
            <li><strong>Authentication providers:</strong> Email addresses are processed by Clerk, our authentication provider.</li>
            <li><strong>Legal requirements:</strong> We may disclose information when required by law, regulation, or legal process.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">6. Data Retention</h2>
          <p className="mt-2">
            We retain your account information and session data (including all chat messages and generated scripts) indefinitely unless you request deletion. You may request deletion of your data at any time by contacting us at <a href="mailto:hello@salesfu.ai" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">hello@salesfu.ai</a>. We will delete your data within 30 days of a verified request.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">7. Cookies and Tracking</h2>
          <p className="mt-2">
            We use essential cookies to maintain your session and authentication state. We use an anonymous session identifier (cookie) to track free-tier usage. We do not use third-party advertising cookies or trackers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">8. SMS Opt-Out</h2>
          <p className="mt-2">
            You may opt out of SMS marketing messages at any time by replying STOP to any message. Verification codes will still be sent when required for account security. To opt back in, reply START. Message and data rates may apply based on your mobile carrier plan.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">9. Data Security</h2>
          <p className="mt-2">
            We take reasonable measures to protect your data, including encryption in transit (HTTPS), encrypted password storage, and access controls. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">10. International Users</h2>
          <p className="mt-2">
            The Service is operated from Australia. If you access the Service from outside Australia, you acknowledge that your data may be transferred to and processed in Australia and other countries where our providers operate.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">11. Your Rights</h2>
          <p className="mt-2">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for SMS communications</li>
            <li>Lodge a complaint with a privacy regulator</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at <a href="mailto:hello@salesfu.ai" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">hello@salesfu.ai</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">12. Children&apos;s Privacy</h2>
          <p className="mt-2">
            The Service is not directed to children under 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">13. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will post the updated version on this page with a revised date. Your continued use of the Service after changes are posted constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">14. Contact</h2>
          <p className="mt-2">
            For any questions about this Privacy Policy or to exercise your data rights, contact:<br /><br />
            <strong>SalesFu AI</strong><br />
            Attn: Michael Fackerell<br />
            Email: <a href="mailto:hello@salesfu.ai" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">hello@salesfu.ai</a>
          </p>
        </section>
      </div>

      <div className="mt-10 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          By using the Service, you consent to the collection and use of your information as described in this Privacy Policy.
        </p>
        <div className="mt-3 flex gap-3">
          <Link href="/" className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100">Return to OfferFu</Link>
          <Link href="/terms-conditions" className="text-sm font-medium text-zinc-500 hover:underline dark:text-zinc-400">Terms &amp; Conditions</Link>
        </div>
      </div>
    </div>
  );
}