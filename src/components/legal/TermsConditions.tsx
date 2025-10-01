import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsConditions = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-primary transition-smooth font-mono text-sm">
          Terms of Service
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">Lumora – Terms & Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 font-mono text-sm">
            <p>Welcome to Lumora ("we," "our," or "us"). By accessing or using our platform, you agree to these Terms & Conditions ("Terms"). If you do not agree, you may not use Lumora.</p>

            <section>
              <h3 className="font-bold text-lg mb-2">1. Service Description</h3>
              <p>Lumora is a SaaS platform that allows users to generate, edit, and export videos using AI-powered tools, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Video cloning from uploaded samples</li>
                <li>Prompt-to-video generation</li>
                <li>UGC-style promotional videos</li>
                <li>Explainer videos with animations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. Eligibility</h3>
              <p>You must be at least 13 years old (or the age of digital consent in your country). If under 18, you must have parental/guardian permission.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. User Accounts</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate registration information.</li>
                <li>You are responsible for maintaining your account security.</li>
                <li>We may suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. Acceptable Use</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Upload illegal, harmful, or copyrighted content without permission.</li>
                <li>Use Lumora to create misleading, defamatory, or harmful media.</li>
                <li>Attempt to reverse engineer or abuse our services.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. Intellectual Property</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>User Content:</strong> You retain ownership of videos you create or upload. By using Lumora, you grant us a limited license to process and store your content for service delivery.</li>
                <li><strong>Lumora Content:</strong> Our software, branding, templates, and AI outputs remain our property or our licensors'.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. Subscriptions & Payments</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Premium features require a paid subscription.</li>
                <li>Payments are processed securely via third-party providers (e.g., Stripe).</li>
                <li>Subscription fees are non-refundable except where required by law.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. Limitation of Liability</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Lumora is provided "as is." We make no guarantees about uninterrupted or error-free service.</li>
                <li>To the maximum extent allowed by law, we are not liable for any damages resulting from your use of Lumora.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">8. Termination</h3>
              <p>We may suspend or terminate your account if you violate these Terms. You may cancel your account at any time through your settings.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">9. Governing Law</h3>
              <p>These Terms shall be governed by applicable laws in your jurisdiction.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">10. Changes</h3>
              <p>We may update these Terms at any time. We will notify you by email or in-app notice. Continued use constitutes acceptance.</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsConditions;
