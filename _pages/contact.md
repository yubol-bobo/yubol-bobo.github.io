---
layout: page
title: Contact
permalink: /contact/
description:  
nav: true
nav_order: 8
---

<div class="contact-page-container">
  <!-- Contact Options Header -->
  <div class="contact-header" style="margin-bottom: 3rem; text-align: center;">
    <p style="font-size: 1.1rem; color: var(--global-text-color-light);">
      I'd love to hear from you! Choose the best way to connect:
    </p>
  </div>

  <!-- Two Column Layout for Contact Options -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">

    <!-- Send a Message Card -->
    <div id="message-card" class="contact-option-card" style="padding: 2rem; background-color: var(--global-bg-color); border: 1px solid var(--global-divider-color); border-radius: 8px; cursor: pointer;">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <i class="fas fa-envelope" style="font-size: 3rem; color: var(--global-theme-color);"></i>
        <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;">Send a Message</h3>
        <p style="color: var(--global-text-color-light); font-size: 0.9rem;">
          Questions about research or PhD programs at CMU? Just drop me a message!
        </p>
      </div>
      <div style="text-align: center;">
        <button class="btn btn-primary" style="width: 100%;">
          <i class="fas fa-paper-plane"></i> Write Message
        </button>
      </div>
    </div>

    <!-- Schedule a Meeting Card -->
    <div class="contact-option-card" style="padding: 2rem; background-color: var(--global-bg-color); border: 1px solid var(--global-divider-color); border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <i class="fas fa-calendar-alt" style="font-size: 3rem; color: var(--global-theme-color);"></i>
        <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;">Schedule a Meeting</h3>
        <p style="color: var(--global-text-color-light); font-size: 0.9rem;">
          Let's book a 15-30 mins meeting. The time isn’t guaranteed, but I’ll follow up with you very soon.
        </p>
      </div>
      <div style="text-align: center;">
        <button id="open-scheduler-btn" class="btn btn-primary" style="width: 100%;">
          <i class="fas fa-clock"></i> View Available Times
        </button>
      </div>
    </div>
  </div>

  <!-- Contact Form Section -->
  <div id="contact-form-section">
    {% include contact_form.liquid %}
  </div>

  <!-- Meeting Scheduler Modal -->
  <div id="scheduler-modal" class="scheduler-modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); overflow: auto;">
    <div class="scheduler-modal-content" style="background-color: var(--global-bg-color); margin: 2% auto; padding: 0; border: 1px solid var(--global-divider-color); border-radius: 8px; width: 90%; max-width: 1000px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
      <div class="scheduler-header" style="padding: 1.5rem; border-bottom: 1px solid var(--global-divider-color); display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">Schedule a Meeting</h3>
        <button id="close-scheduler-btn" class="close-btn" style="background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--global-text-color); line-height: 1;">
          &times;
        </button>
      </div>
      <div class="scheduler-body" style="flex: 1; overflow-y: auto; padding: 0;">
        <!-- Cal.com Embed -->
        <div id="scheduler-widget" style="height: 100%; min-height: 600px;">
          <iframe
            src="https://cal.com/yubo-li-r9afcr"
            style="width: 100%; height: 100%; min-height: 600px; border: none;"
            frameborder="0"
            allow="clipboard-write"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .contact-option-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .contact-option-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .scheduler-modal-content {
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .close-btn:hover {
    color: var(--global-theme-color);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .scheduler-modal-content {
      width: 95%;
      margin: 5% auto;
    }
  }
</style>

<!-- Cal.com embed script -->
<script type="text/javascript">
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", {origin:"https://cal.com"});
</script>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('open-scheduler-btn');
    const closeBtn = document.getElementById('close-scheduler-btn');
    const modal = document.getElementById('scheduler-modal');
    const messageCard = document.getElementById('message-card');
    const contactFormSection = document.getElementById('contact-form-section');

    // Handle "Send a Message" card click
    if (messageCard && contactFormSection) {
      messageCard.addEventListener('click', function() {
        contactFormSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Optional: Focus on the first input field after scrolling
        setTimeout(function() {
          const firstInput = contactFormSection.querySelector('input[type="text"]');
          if (firstInput) {
            firstInput.focus();
          }
        }, 500);
      });
    }

    // Handle "Schedule a Meeting" button click
    if (openBtn) {
      openBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  });
</script>
