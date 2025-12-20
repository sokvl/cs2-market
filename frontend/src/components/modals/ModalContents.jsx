import React from 'react';

export const HowItWorksContent = () => (
  <div className="modal-content-wrapper">
    <div className="content-section">
      <div className="step-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <h3>Create an Account</h3>
          <p>Sign in securely using your Steam account. We use Steam's official authentication system to ensure your account safety. No passwords needed - just one click and you're in!</p>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <h3>Browse the Market</h3>
          <p>Explore thousands of CS2 skins from pistols to knives. Use our advanced filters to find exactly what you're looking for - filter by weapon type, condition, price range, and more.</p>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <h3>Add Funds to Your Wallet</h3>
          <p>Deposit money into your secure CS2Market wallet using various payment methods including credit cards, PayPal, and cryptocurrency. All transactions are encrypted and protected.</p>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">4</div>
        <div className="step-content">
          <h3>Purchase Items</h3>
          <p>Found the perfect skin? Buy it instantly with one click. Your purchase is protected by our buyer protection program, ensuring safe and secure transactions every time.</p>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">5</div>
        <div className="step-content">
          <h3>Receive Your Items</h3>
          <p>Items are delivered directly to your Steam inventory via trade offer. The process is automated and typically takes just a few minutes. Track your delivery status in real-time.</p>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">6</div>
        <div className="step-content">
          <h3>Sell Your Own Skins</h3>
          <p>Want to sell? List your CS2 items on our marketplace, set your price, and reach thousands of potential buyers. Withdraw your earnings anytime to your preferred payment method.</p>
        </div>
      </div>
    </div>

    <div className="info-box">
      <i className="fa-solid fa-shield-halved"></i>
      <div>
        <h4>Safe & Secure Trading</h4>
        <p>All trades are protected by our escrow system and monitored 24/7 to prevent fraud.</p>
      </div>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .content-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .step-card {
        display: flex;
        gap: 1.5rem;
        padding: 1.75rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        transition: all 0.3s ease;
      }

      .step-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(102, 126, 234, 0.3);
        transform: translateX(5px);
      }

      .step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 14px;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
      }

      .step-content h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 0.75rem 0;
      }

      .step-content p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.7;
      }

      .info-box {
        display: flex;
        align-items: flex-start;
        gap: 1.25rem;
        padding: 1.5rem;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 16px;
      }

      .info-box i {
        font-size: 2rem;
        color: #10b981;
        flex-shrink: 0;
      }

      .info-box h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #10b981;
        margin: 0 0 0.5rem 0;
      }

      .info-box p {
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
      }

      @media (max-width: 768px) {
        .step-card {
          flex-direction: column;
          padding: 1.5rem;
        }

        .step-number {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        }
      }
    `}</style>
  </div>
);

export const FAQContent = () => (
  <div className="modal-content-wrapper">
    <div className="faq-list">
      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> How do I buy items on CS2Market?</h3>
        <p>Simply browse our marketplace, find an item you like, and click "Buy Now". Add funds to your wallet if needed, confirm the purchase, and the item will be sent to your Steam inventory via trade offer within minutes.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> Is CS2Market safe and legitimate?</h3>
        <p>Yes! We use Steam's official authentication system and all trades are protected by our escrow system. We've processed over 100,000 transactions with a 99.9% satisfaction rate. All payments are encrypted and secure.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> How long does delivery take?</h3>
        <p>Most items are delivered within 1-5 minutes after purchase. In rare cases, it may take up to 24 hours due to Steam trade restrictions. You can track your order status in your dashboard.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> What payment methods do you accept?</h3>
        <p>We accept credit/debit cards (Visa, Mastercard, American Express), PayPal, cryptocurrencies (Bitcoin, Ethereum, USDT), and various local payment methods depending on your region.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> Can I sell my CS2 skins on this platform?</h3>
        <p>Absolutely! Go to your inventory, select the items you want to sell, set your desired price, and list them on the marketplace. You'll receive payment directly to your wallet once sold.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> How do I withdraw my funds?</h3>
        <p>Navigate to your wallet, click "Withdraw", choose your preferred payment method, and enter the amount. Withdrawals are processed within 24-48 hours. Minimum withdrawal amount is $5.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> What if I receive the wrong item?</h3>
        <p>Contact our support team immediately through the dashboard. We'll investigate and either send the correct item or issue a full refund. All purchases are covered by our buyer protection program.</p>
      </div>

      <div className="faq-item">
        <h3><i className="fa-solid fa-circle-question"></i> Are there any fees?</h3>
        <p>We charge a small 5% marketplace fee on sales to cover operational costs. Buyers don't pay any additional fees - the price you see is the price you pay. No hidden charges.</p>
      </div>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .faq-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .faq-item {
        padding: 1.75rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        transition: all 0.3s ease;
      }

      .faq-item:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(102, 126, 234, 0.3);
      }

      .faq-item h3 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1rem 0;
      }

      .faq-item h3 i {
        color: #667eea;
        font-size: 1.25rem;
      }

      .faq-item p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.7;
      }
    `}</style>
  </div>
);

export const PrivacyPolicyContent = () => (
  <div className="modal-content-wrapper">
    <div className="legal-section">
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, including your Steam account details, email address, payment information, and transaction history. We also automatically collect certain information about your device and how you interact with our platform.</p>
    </div>

    <div className="legal-section">
      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and protect against fraud and abuse.</p>
    </div>

    <div className="legal-section">
      <h3>3. Information Sharing</h3>
      <p>We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as payment processing and data analysis, only to the extent necessary to perform these services.</p>
    </div>

    <div className="legal-section">
      <h3>4. Data Security</h3>
      <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment information is encrypted using SSL technology.</p>
    </div>

    <div className="legal-section">
      <h3>5. Your Rights</h3>
      <p>You have the right to access, update, or delete your personal information at any time. You can manage your account settings in your dashboard or contact our support team for assistance.</p>
    </div>

    <div className="legal-section">
      <h3>6. Cookies</h3>
      <p>We use cookies and similar tracking technologies to collect information about your browsing activities and to provide personalized content. You can control cookies through your browser settings.</p>
    </div>

    <div className="legal-section">
      <h3>7. Changes to This Policy</h3>
      <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
    </div>

    <div className="legal-footer">
      <p><strong>Last Updated:</strong> November 28, 2025</p>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@cs2market.com</p>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .legal-section {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-left: 3px solid #667eea;
        border-radius: 8px;
      }

      .legal-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1rem 0;
      }

      .legal-section p {
        margin: 0;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.8;
      }

      .legal-footer {
        padding: 1.5rem;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 12px;
        text-align: center;
      }

      .legal-footer p {
        margin: 0.5rem 0;
        color: rgba(255, 255, 255, 0.8);
      }

      .legal-footer strong {
        color: #667eea;
      }
    `}</style>
  </div>
);

export const TermsOfServiceContent = () => (
  <div className="modal-content-wrapper">
    <div className="legal-section">
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and using CS2Market, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
    </div>

    <div className="legal-section">
      <h3>2. Account Registration</h3>
      <p>You must be at least 18 years old to use CS2Market. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to provide accurate and complete information.</p>
    </div>

    <div className="legal-section">
      <h3>3. Trading Rules</h3>
      <p>All trades must comply with Steam's Terms of Service and CS2's game rules. We prohibit fraudulent activities, chargebacks, money laundering, and any form of scamming. Violation of these rules may result in account suspension or termination.</p>
    </div>

    <div className="legal-section">
      <h3>4. Fees and Payments</h3>
      <p>We charge a 5% marketplace fee on all sales. All fees are clearly displayed before you confirm any transaction. Prices are listed in USD and may be subject to currency conversion fees depending on your payment method.</p>
    </div>

    <div className="legal-section">
      <h3>5. Item Delivery</h3>
      <p>We strive to deliver items within 1-5 minutes of purchase. However, delivery times may vary due to Steam's trade restrictions or technical issues. We are not responsible for delays caused by Steam or the user's account restrictions.</p>
    </div>

    <div className="legal-section">
      <h3>6. Refunds and Disputes</h3>
      <p>All sales are final unless there is a proven error on our part. Disputes must be reported within 24 hours of the transaction. We reserve the right to investigate and resolve disputes at our discretion.</p>
    </div>

    <div className="legal-section">
      <h3>7. Prohibited Activities</h3>
      <p>Users are prohibited from: using bots or automated tools, manipulating prices, engaging in wash trading, creating multiple accounts to abuse promotions, or attempting to exploit vulnerabilities in our system.</p>
    </div>

    <div className="legal-section">
      <h3>8. Limitation of Liability</h3>
      <p>CS2Market is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount of fees paid by you in the past 12 months.</p>
    </div>

    <div className="legal-section">
      <h3>9. Termination</h3>
      <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion. Upon termination, you may withdraw any remaining balance in your wallet.</p>
    </div>

    <div className="legal-footer">
      <p><strong>Last Updated:</strong> November 28, 2025</p>
      <p>For questions regarding these terms, contact us at legal@cs2market.com</p>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .legal-section {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-left: 3px solid #667eea;
        border-radius: 8px;
      }

      .legal-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1rem 0;
      }

      .legal-section p {
        margin: 0;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.8;
      }

      .legal-footer {
        padding: 1.5rem;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 12px;
        text-align: center;
      }

      .legal-footer p {
        margin: 0.5rem 0;
        color: rgba(255, 255, 255, 0.8);
      }

      .legal-footer strong {
        color: #667eea;
      }
    `}</style>
  </div>
);

export const CookiePolicyContent = () => (
  <div className="modal-content-wrapper">
    <div className="legal-section">
      <h3>What Are Cookies?</h3>
      <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.</p>
    </div>

    <div className="legal-section">
      <h3>Types of Cookies We Use</h3>
      <p><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
      <p><strong>Analytics Cookies:</strong> We use these cookies to understand how visitors interact with our website, helping us improve our services.</p>
      <p><strong>Functionality Cookies:</strong> These cookies remember your preferences and choices to provide enhanced, personalized features.</p>
    </div>

    <div className="legal-section">
      <h3>Managing Cookies</h3>
      <p>You can control and manage cookies through your browser settings. However, please note that disabling certain cookies may affect the functionality of our website and limit your user experience.</p>
    </div>

    <div className="legal-section">
      <h3>Third-Party Cookies</h3>
      <p>We may use third-party services such as Google Analytics and payment processors that may set their own cookies. These third parties have their own privacy policies governing the use of such cookies.</p>
    </div>

    <div className="legal-footer">
      <p><strong>Last Updated:</strong> November 28, 2025</p>
      <p>For more information, contact us at privacy@cs2market.com</p>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .legal-section {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.03);
        border-left: 3px solid #667eea;
        border-radius: 8px;
      }

      .legal-section h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1rem 0;
      }

      .legal-section p {
        margin: 0.75rem 0;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.8;
      }

      .legal-section strong {
        color: white;
      }

      .legal-footer {
        padding: 1.5rem;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 12px;
        text-align: center;
      }

      .legal-footer p {
        margin: 0.5rem 0;
        color: rgba(255, 255, 255, 0.8);
      }

      .legal-footer strong {
        color: #667eea;
      }
    `}</style>
  </div>
);

export const SecurityContent = () => (
  <div className="modal-content-wrapper">
    <div className="security-header">
      <i className="fa-solid fa-shield-halved"></i>
      <p>Your security is our top priority. We implement industry-leading security measures to protect your account and transactions.</p>
    </div>

    <div className="security-feature">
      <div className="feature-icon">
        <i className="fa-solid fa-lock"></i>
      </div>
      <div>
        <h3>SSL Encryption</h3>
        <p>All data transmitted between your browser and our servers is encrypted using 256-bit SSL technology, the same level of security used by banks.</p>
      </div>
    </div>

    <div className="security-feature">
      <div className="feature-icon">
        <i className="fa-brands fa-steam"></i>
      </div>
      <div>
        <h3>Steam Authentication</h3>
        <p>We use Steam's official OAuth 2.0 authentication system. We never ask for your Steam password or store sensitive Steam account information.</p>
      </div>
    </div>

    <div className="security-feature">
      <div className="feature-icon">
        <i className="fa-solid fa-user-shield"></i>
      </div>
      <div>
        <h3>Two-Factor Authentication</h3>
        <p>Enable 2FA on your account for an additional layer of security. We recommend using Steam Guard Mobile Authenticator for enhanced protection.</p>
      </div>
    </div>

    <div className="security-feature">
      <div className="feature-icon">
        <i className="fa-solid fa-database"></i>
      </div>
      <div>
        <h3>Secure Payment Processing</h3>
        <p>All payments are processed through PCI-DSS compliant payment gateways. We never store your credit card information on our servers.</p>
      </div>
    </div>

    <div className="security-feature">
      <div className="feature-icon">
        <i className="fa-solid fa-eye"></i>
      </div>
      <div>
        <h3>24/7 Monitoring</h3>
        <p>Our security team monitors all transactions 24/7 to detect and prevent fraudulent activities. Suspicious transactions are flagged and reviewed immediately.</p>
      </div>
    </div>

    <div className="security-feature">
      <div className="feature-icon">
        <i className="fa-solid fa-handshake"></i>
      </div>
      <div>
        <h3>Escrow System</h3>
        <p>All trades are protected by our escrow system. Items and funds are held securely until both parties confirm the transaction is complete.</p>
      </div>
    </div>

    <div className="security-tips">
      <h3><i className="fa-solid fa-lightbulb"></i> Security Tips</h3>
      <ul>
        <li>Never share your account credentials with anyone</li>
        <li>Enable Steam Guard Mobile Authenticator</li>
        <li>Use a strong, unique password for your Steam account</li>
        <li>Be cautious of phishing attempts and suspicious links</li>
        <li>Regularly review your transaction history</li>
        <li>Contact support immediately if you notice suspicious activity</li>
      </ul>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .security-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2rem;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 16px;
        text-align: center;
      }

      .security-header i {
        font-size: 3rem;
        color: #10b981;
      }

      .security-header p {
        margin: 0;
        font-size: 1.125rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.7;
      }

      .security-feature {
        display: flex;
        gap: 1.5rem;
        padding: 1.75rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        transition: all 0.3s ease;
      }

      .security-feature:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(102, 126, 234, 0.3);
      }

      .feature-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 14px;
      }

      .feature-icon i {
        font-size: 1.5rem;
        color: #667eea;
      }

      .security-feature h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 0.75rem 0;
      }

      .security-feature p {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.7;
      }

      .security-tips {
        padding: 2rem;
        background: rgba(251, 191, 36, 0.1);
        border: 1px solid rgba(251, 191, 36, 0.3);
        border-radius: 16px;
      }

      .security-tips h3 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: #fbbf24;
        margin: 0 0 1.25rem 0;
      }

      .security-tips ul {
        margin: 0;
        padding-left: 1.5rem;
        color: rgba(255, 255, 255, 0.8);
        line-height: 2;
      }

      .security-tips li {
        margin-bottom: 0.5rem;
      }
    `}</style>
  </div>
);

export const SupportContent = () => (
  <div className="modal-content-wrapper">
    <div className="support-intro">
      <h3>Need Help? We're Here for You!</h3>
      <p>Our support team is available 24/7 to assist you with any questions or issues you may have.</p>
    </div>

    <div className="support-options">
      <div className="support-option">
        <div className="option-icon">
          <i className="fa-solid fa-comments"></i>
        </div>
        <h3>Live Chat</h3>
        <p>Get instant help from our support team through live chat. Average response time: 2 minutes.</p>
        <button className="support-btn">
          <i className="fa-solid fa-message"></i>
          Start Chat
        </button>
      </div>

      <div className="support-option">
        <div className="option-icon">
          <i className="fa-solid fa-envelope"></i>
        </div>
        <h3>Email Support</h3>
        <p>Send us a detailed message and we'll respond within 24 hours.</p>
        <button className="support-btn">
          <i className="fa-solid fa-paper-plane"></i>
          Send Email
        </button>
      </div>

      <div className="support-option">
        <div className="option-icon">
          <i className="fa-brands fa-discord"></i>
        </div>
        <h3>Discord Community</h3>
        <p>Join our Discord server to connect with other traders and get community support.</p>
        <button className="support-btn">
          <i className="fa-brands fa-discord"></i>
          Join Discord
        </button>
      </div>
    </div>

    <div className="common-issues">
      <h3>Common Issues</h3>
      <div className="issue-list">
        <div className="issue-item">
          <i className="fa-solid fa-circle-check"></i>
          <span>Trade not received? Check your Steam trade offers.</span>
        </div>
        <div className="issue-item">
          <i className="fa-solid fa-circle-check"></i>
          <span>Payment failed? Verify your payment method and try again.</span>
        </div>
        <div className="issue-item">
          <i className="fa-solid fa-circle-check"></i>
          <span>Can't withdraw? Ensure you meet the minimum withdrawal amount.</span>
        </div>
        <div className="issue-item">
          <i className="fa-solid fa-circle-check"></i>
          <span>Account issues? Contact support with your Steam ID.</span>
        </div>
      </div>
    </div>

    <style jsx>{`
      .modal-content-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      .support-intro {
        text-align: center;
        padding: 2rem;
        background: rgba(102, 126, 234, 0.1);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 16px;
      }

      .support-intro h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1rem 0;
      }

      .support-intro p {
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.0625rem;
      }

      .support-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .support-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        transition: all 0.3s ease;
      }

      .support-option:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(102, 126, 234, 0.3);
        transform: translateY(-5px);
      }

      .option-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 18px;
        margin-bottom: 1.5rem;
      }

      .option-icon i {
        font-size: 2rem;
        color: white;
      }

      .support-option h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 0.75rem 0;
      }

      .support-option p {
        margin: 0 0 1.5rem 0;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
      }

      .support-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.625rem;
        padding: 0.75rem 1.5rem;
        background: rgba(102, 126, 234, 0.2);
        border: 1px solid rgba(102, 126, 234, 0.4);
        border-radius: 10px;
        color: #667eea;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .support-btn:hover {
        background: rgba(102, 126, 234, 0.3);
        border-color: rgba(102, 126, 234, 0.6);
        color: white;
        transform: scale(1.05);
      }

      .common-issues {
        padding: 2rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
      }

      .common-issues h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1.5rem 0;
      }

      .issue-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .issue-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .issue-item i {
        color: #10b981;
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .support-options {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  </div>
);
