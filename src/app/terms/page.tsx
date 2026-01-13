import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card-solid p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: January 2024</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using LearnQuest (&quot;the Service&quot;), you agree to be bound by these Terms of Service
                (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Description of Service</h2>
              <p className="text-gray-700">
                LearnQuest is a learning management system that provides educational tools and services including
                course management, assignment submission, grading, communication features, and gamified learning
                experiences for students, teachers, and parents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. User Accounts</h2>
              <p className="text-gray-700 mb-3">To use the Service, you must:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Create an account with accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be at least 13 years old (or have parental consent)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. User Roles and Responsibilities</h2>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Students</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Submit original work and maintain academic integrity</li>
                <li>Participate respectfully in discussions and communications</li>
                <li>Complete assignments by specified deadlines</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Teachers</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Provide accurate course content and assessments</li>
                <li>Grade assignments fairly and provide constructive feedback</li>
                <li>Maintain student privacy and confidentiality</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Parents</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Monitor their children&apos;s progress appropriately</li>
                <li>Communicate respectfully with teachers and staff</li>
                <li>Maintain the confidentiality of their children&apos;s information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Acceptable Use</h2>
              <p className="text-gray-700 mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Share your account credentials with others</li>
                <li>Upload malicious software or harmful content</li>
                <li>Harass, bully, or discriminate against other users</li>
                <li>Submit plagiarized or fraudulent content</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with the proper functioning of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Intellectual Property</h2>
              <p className="text-gray-700">
                The Service and its original content (excluding user-generated content) are owned by LearnQuest
                and are protected by copyright, trademark, and other intellectual property laws. User-generated
                content remains the property of the respective users, but you grant us a license to use, display,
                and distribute such content within the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Gamification and XP System</h2>
              <p className="text-gray-700">
                Our gamification features (XP, levels, achievements, streaks) are designed to enhance engagement
                and do not have monetary value. We reserve the right to modify the gamification system at any time.
                XP and achievements cannot be transferred or exchanged.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we
                believe violates these Terms or is harmful to other users, us, or third parties. Upon termination,
                your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10. Limitation of Liability</h2>
              <p className="text-gray-700">
                IN NO EVENT SHALL LEARNQUEST BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">11. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will provide notice of significant
                changes through the Service or via email. Your continued use of the Service after changes
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
                in which LearnQuest operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 mt-2">
                Email: legal@learnquest.edu<br />
                Address: 123 Learning Lane, Education City, EC 12345
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" className="text-[#00a8cc] font-medium hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
