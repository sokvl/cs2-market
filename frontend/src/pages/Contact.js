import React , { useState} from 'react'
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form'

function Contact() {

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors }
  } = useForm();
  const [disabled, setDisabled] = useState(false);

  const toastifySuccess = () => {
    toast.success('✅ Message sent successfully!', {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const onSubmit = async (data) => {
    setDisabled(true);
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));
    reset();
    toastifySuccess();
    setDisabled(false);
  };

  return (
    <>
      <div className="contact-page">
        {/* Animated Background */}
        <div className="contact-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        {/* Contact Content */}
        <div className="contact-container">
          <div className="contact-header">
            <div className="header-icon-wrapper">
              <i className="fa-solid fa-envelope header-icon"></i>
            </div>
            <h1 className="contact-title">Get In Touch</h1>
            <p className="contact-subtitle">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          <div className="contact-content">
            {/* Info Cards */}
            <div className="contact-info">
              <div className="info-card">
                <div className="info-icon-wrapper">
                  <i className="fa-solid fa-location-dot info-icon"></i>
                </div>
                <div className="info-content">
                  <h3 className="info-title">Location</h3>
                  <p className="info-text">Warsaw, Poland</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrapper">
                  <i className="fa-solid fa-phone info-icon"></i>
                </div>
                <div className="info-content">
                  <h3 className="info-title">Phone</h3>
                  <p className="info-text">+48 555 555 555</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrapper">
                  <i className="fa-solid fa-envelope info-icon"></i>
                </div>
                <div className="info-content">
                  <h3 className="info-title">Email</h3>
                  <p className="info-text">support@cs2market.com</p>
                </div>
              </div>

              <div className="info-card social-card">
                <div className="info-content">
                  <h3 className="info-title">Follow Us</h3>
                  <div className="social-links">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fa-brands fa-twitter"></i>
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fa-brands fa-facebook"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fa-brands fa-discord"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <i className="fa-solid fa-user"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="John Doe"
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                  />
                  {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <i className="fa-solid fa-envelope"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="john@example.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    <i className="fa-solid fa-tag"></i>
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className={`form-input ${errors.subject ? 'error' : ''}`}
                    placeholder="How can we help?"
                    {...register('subject', { 
                      required: 'Subject is required',
                      minLength: { value: 3, message: 'Subject must be at least 3 characters' }
                    })}
                  />
                  {errors.subject && <span className="error-message">{errors.subject.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    <i className="fa-solid fa-message"></i>
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="6"
                    className={`form-input form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="Tell us more about your inquiry..."
                    {...register('message', { 
                      required: 'Message is required',
                      minLength: { value: 10, message: 'Message must be at least 10 characters' }
                    })}
                  />
                  {errors.message && <span className="error-message">{errors.message.message}</span>}
                </div>

                <button type="submit" className="submit-btn" disabled={disabled}>
                  {disabled ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0f0a1a 100%);
          position: relative;
          overflow-x: hidden;
          padding: 6rem 2rem 4rem;
        }

        .contact-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: -10%;
          right: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -5%;
          left: -5%;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 40%;
          left: 50%;
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(40px, 10px) scale(1.05); }
        }

        .contact-container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .header-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          margin-bottom: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .header-icon {
          font-size: 2.5rem;
          color: white;
        }

        .contact-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .contact-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.75rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
          animation: slideInLeft 0.6s ease-out both;
        }

        .info-card:nth-child(1) { animation-delay: 0.1s; }
        .info-card:nth-child(2) { animation-delay: 0.2s; }
        .info-card:nth-child(3) { animation-delay: 0.3s; }
        .info-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .info-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.4);
          transform: translateY(-5px);
        }

        .info-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 14px;
          flex-shrink: 0;
        }

        .info-icon {
          font-size: 1.5rem;
          color: #667eea;
        }

        .info-content {
          flex: 1;
        }

        .info-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.5rem 0;
        }

        .info-text {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .social-card {
          flex-direction: column;
          align-items: stretch;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.25rem;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          transform: translateY(-3px);
        }

        .contact-form-wrapper {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          animation: slideInRight 0.6s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
        }

        .form-label i {
          color: #667eea;
          font-size: 1rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .error-message {
          font-size: 0.875rem;
          color: #ef4444;
          margin-top: -0.25rem;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem 2.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-btn i {
          font-size: 1.25rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .contact-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .contact-info {
            grid-template-columns: repeat(2, 1fr);
            display: grid;
          }

          .social-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .contact-page {
            padding: 5rem 1rem 3rem;
          }

          .contact-title {
            font-size: 2rem;
          }

          .contact-subtitle {
            font-size: 1rem;
          }

          .contact-info {
            grid-template-columns: 1fr;
          }

          .contact-form-wrapper {
            padding: 2rem;
          }

          .header-icon-wrapper {
            width: 64px;
            height: 64px;
          }

          .header-icon {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .contact-page {
            padding: 4rem 1rem 2rem;
          }

          .contact-header {
            margin-bottom: 2.5rem;
          }

          .contact-form-wrapper {
            padding: 1.5rem;
          }

          .form-input {
            padding: 0.875rem 1rem;
          }

          .submit-btn {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  )
}

export default Contact
