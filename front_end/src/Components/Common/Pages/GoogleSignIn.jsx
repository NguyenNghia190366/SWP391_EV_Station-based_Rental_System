import React, { useEffect, useRef } from 'react';

// A tiny Google Identity button loader that avoids using @react-oauth/google
// Props:
// - clientId: string (optional, will read from Vite env if not provided)
// - onCredential: function(credentialString) called when Google returns an id_token
export default function GoogleSignIn({ clientId, onCredential, buttonId = 'google-signin-btn' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const id = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) {
      console.warn('GoogleSignIn: no client id provided (VITE_GOOGLE_CLIENT_ID)');
      return;
    }

    let mounted = true;

    const renderButton = () => {
      try {
        /* global google */
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
          console.warn('Google Identity SDK not available');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: id,
          callback: (resp) => {
            if (!mounted) return;
            const credential = resp?.credential;
            if (credential && typeof onCredential === 'function') onCredential(credential);
          },
        });

        // render button into container
        const el = containerRef.current;
        if (el) {
          // clear previous
          el.innerHTML = '';
          window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large' });
          // optionally prompt for one-tap
          // window.google.accounts.id.prompt();
        }
      } catch (err) {
        console.error('GoogleSignIn render error', err);
      }
    };

    // load script if missing
    const scriptId = 'google-identity-js';
    const existing = document.getElementById(scriptId);
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.onload = () => {
        setTimeout(renderButton, 50);
      };
      script.onerror = (e) => console.error('Failed loading Google Identity script', e);
      document.head.appendChild(script);
    } else {
      // script already present
      setTimeout(renderButton, 50);
    }

    return () => {
      mounted = false;
      // do not remove script (shared)
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [clientId, onCredential]);

  return <div id={buttonId} ref={containerRef} />;
}
