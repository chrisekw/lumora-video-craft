import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-primary transition-smooth font-mono text-sm">
          Privacy Policy
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">Lumora – Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 font-mono text-sm">
            <p>We respect your privacy. This Privacy Policy explains how Lumora collects, uses, and protects your information.</p>

            <section>
              <h3 className="font-bold text-lg mb-2">1. Information We Collect</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account Data:</strong> Name, email, login credentials.</li>
                <li><strong>Usage Data:</strong> How you interact with Lumora (features used, activity logs).</li>
                <li><strong>Uploaded Content:</strong> Videos, text, and media you upload for processing.</li>
                <li><strong>Payment Data:</strong> Processed securely by third-party providers (we do not store full payment details).</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. How We Use Your Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide and improve Lumora's services.</li>
                <li>To personalize your experience (templates, recommendations).</li>
                <li>To communicate updates, support, and promotional offers.</li>
                <li>To comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. Sharing of Information</h3>
              <p>We do not sell your data. We may share limited data with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service providers (hosting, AI processing, payments).</li>
                <li>Legal authorities if required by law.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. Data Storage & Security</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your data is stored securely using encryption and industry best practices.</li>
                <li>We retain data only as long as necessary for service delivery.</li>
                <li>You may request deletion of your account and data at any time.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. User Rights</h3>
              <p>Depending on your location (GDPR/CCPA):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Right to access, correct, or delete your data.</li>
                <li>Right to withdraw consent to marketing.</li>
                <li>Right to data portability.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. Cookies & Tracking</h3>
              <p>We may use cookies and analytics tools to improve Lumora. You can manage cookies in your browser.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. Children's Privacy</h3>
              <p>Lumora is not intended for children under 13.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">8. Changes to This Policy</h3>
              <p>We may update this Privacy Policy. Continued use means you accept the changes.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">9. Contact Us</h3>
              <p>For any privacy concerns, please contact us through the support section.</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
