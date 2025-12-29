import React from 'react';
import Layout from '@theme/Layout';
import { useForm, ValidationError } from '@formspree/react';
import styles from './contact.module.css';

function ContactForm() {
  const [state, handleSubmit] = useForm("xzzjlqzb");
  
  if (state.succeeded) {
    return (
      <div className={styles.successMessage}>
        <h2>🎉 Thank you for reaching out!</h2>
        <p>We've received your message and will get back to you soon.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className={styles.contactForm}>
      <div className={styles.formGroup}>
        <label htmlFor="name">
          Name <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          type="text" 
          name="name"
          required
          placeholder="Your name"
        />
        <ValidationError 
          prefix="Name" 
          field="name"
          errors={state.errors}
          className={styles.error}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">
          Email Address <span className={styles.required}>*</span>
        </label>
        <input
          id="email"
          type="email" 
          name="email"
          required
          placeholder="your@email.com"
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={state.errors}
          className={styles.error}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          type="text" 
          name="subject"
          placeholder="What's this about?"
        />
        <ValidationError 
          prefix="Subject" 
          field="subject"
          errors={state.errors}
          className={styles.error}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message">
          Message <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows="6"
          required
          placeholder="Tell us what's on your mind..."
        />
        <ValidationError 
          prefix="Message" 
          field="message"
          errors={state.errors}
          className={styles.error}
        />
      </div>

      <button 
        type="submit" 
        disabled={state.submitting}
        className={styles.submitButton}
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <Layout
      title="Contact Us"
      description="Get in touch with the Data Nadhi team">
      <div className={styles.contactPage}>
        <div className="container">
          <div className={styles.header}>
            <h1>Contact Us</h1>
            <p className={styles.subtitle}>
              Have questions, suggestions, or just want to say hello? We'd love to hear from you!
            </p>
          </div>

          <div className={styles.content}>
            <div className={styles.formSection}>
              <ContactForm />
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoCard}>
                <h3>💬 Community</h3>
                <p>Join our community channels for quick questions and discussions.</p>
                <ul>
                  <li>
                    <a href="https://github.com/search?q=topic%3Adata-nadhi+org%3AData-ARENA-Space&type=Repositories" target="_blank" rel="noopener noreferrer">
                      Data Nadhi Repositories
                    </a>
                  </li>
                  <li><a href='https://discord.gg/gMwdfGfnby'>Discord</a></li>
                </ul>
              </div>

              <div className={styles.infoCard}>
                <h3>🐛 Found a Bug?</h3>
                <p>Report issues in the relevant repository on our GitHub.</p>
                <a 
                  href="https://github.com/search?q=topic%3Adata-nadhi+org%3AData-ARENA-Space&type=Repositories" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Browse Repositories →
                </a>
              </div>

              <div className={styles.infoCard}>
                <h3>🤝 Want to Contribute?</h3>
                <p>Check out our contribution guidelines to get started.</p>
                <a href="/contributions" className={styles.link}>
                  View Guidelines →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
