import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ContentGuidelines = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-primary transition-smooth font-mono text-sm">
          Content Guidelines
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl">Lumora – User Content Guidelines</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 font-mono text-sm">
            <p>These User Content Guidelines ("Guidelines") are part of Lumora's Terms of Service and apply to all content uploaded, generated, or shared on Lumora. By using Lumora, you agree to follow these Guidelines.</p>

            <section>
              <h3 className="font-bold text-lg mb-2">1. General Principles</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You are responsible for all content you create, upload, or share through Lumora.</li>
                <li>Content must respect applicable laws, intellectual property rights, and community standards.</li>
                <li>Lumora reserves the right to remove or restrict any content that violates these Guidelines.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. Prohibited Content</h3>
              <p>The following types of content are not allowed on Lumora:</p>
              
              <div className="space-y-3 mt-2">
                <div>
                  <h4 className="font-semibold">A. Illegal Content</h4>
                  <ul className="list-disc pl-6">
                    <li>Content that violates local, national, or international laws.</li>
                    <li>Content related to terrorism, organized crime, or illegal activities.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">B. Harmful & Abusive Content</h4>
                  <ul className="list-disc pl-6">
                    <li>Hate speech, harassment, bullying, or targeted abuse.</li>
                    <li>Threats of violence or encouragement of self-harm.</li>
                    <li>Content that promotes discrimination based on race, ethnicity, gender, religion, disability, sexual orientation, or other protected groups.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">C. Sexual or Adult Content</h4>
                  <ul className="list-disc pl-6">
                    <li>Pornography or sexually explicit material.</li>
                    <li>Sexualization of minors or non-consensual sexual content.</li>
                    <li>Suggestive content designed primarily for sexual gratification.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">D. Violence & Graphic Content</h4>
                  <ul className="list-disc pl-6">
                    <li>Extremely violent or gory content.</li>
                    <li>Content that glorifies abuse, torture, or animal cruelty.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">E. Misleading or Harmful Information</h4>
                  <ul className="list-disc pl-6">
                    <li>False or misleading claims (e.g., health misinformation, scams).</li>
                    <li>Content that promotes dangerous activities or self-destructive behavior.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">F. Intellectual Property Violations</h4>
                  <ul className="list-disc pl-6">
                    <li>Content you do not own or have rights to use (e.g., copyrighted videos, logos, or music).</li>
                    <li>Impersonation of individuals, companies, or organizations.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">G. Spam & Malicious Activity</h4>
                  <ul className="list-disc pl-6">
                    <li>Spam, fraudulent schemes, or deceptive marketing.</li>
                    <li>Content that contains malware, viruses, or phishing links.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. AI-Generated Content</h3>
              <p>When using Lumora's AI tools to generate videos, images, or other media, you must ensure that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Content complies with these Guidelines and applicable laws.</li>
                <li>Content does not impersonate real people without consent.</li>
                <li>Deepfakes or synthetic media must be clearly labeled as AI-generated.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. User Responsibility</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must own or have permission to use any media you upload.</li>
                <li>You are responsible for securing necessary licenses (e.g., music, logos, third-party assets).</li>
                <li>You must not use Lumora to harass, exploit, or deceive others.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. Enforcement & Consequences</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Lumora may remove content that violates these Guidelines.</li>
                <li>Repeat or severe violations may lead to account suspension or permanent ban.</li>
                <li>In cases involving illegal activity, Lumora may cooperate with law enforcement.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. Reporting Content</h3>
              <p>If you see content that violates these Guidelines, you can report it through the in-app reporting feature or by contacting Lumora's support team.</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ContentGuidelines;
