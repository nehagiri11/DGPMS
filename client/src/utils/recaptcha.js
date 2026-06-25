let scriptLoaded = false;

const SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function loadRecaptchaScript() {

  return new Promise((resolve, reject) => {

    if (
      window.grecaptcha &&
      window.grecaptcha.execute
    ) {
      resolve();
      return;
    }

    if (scriptLoaded) {

      const timer = setInterval(() => {

        if (
          window.grecaptcha &&
          window.grecaptcha.execute
        ) {
          clearInterval(timer);
          resolve();
        }

      }, 100);

      return;

    }

    scriptLoaded = true;

    const script =
      document.createElement("script");

    script.src =
      `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;

    script.async = true;
    script.defer = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          "Unable to load Google reCAPTCHA."
        )
      );

    document.body.appendChild(script);

  });

}

export async function executeRecaptcha(action) {

  if (!SITE_KEY) {

    throw new Error(
      "VITE_RECAPTCHA_SITE_KEY is missing."
    );

  }

  await loadRecaptchaScript();

  return new Promise((resolve) => {

    window.grecaptcha.ready(async () => {

      const token =
        await window.grecaptcha.execute(
          SITE_KEY,
          {
            action
          }
        );

      resolve(token);

    });

  });

}