import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de cookies — TaboDis",
  description:
    "Información sobre las cookies que utiliza TaboDis y cómo puedes configurarlas o rechazarlas.",
};

export default function CookiesPage() {
  return (
    <>
      <h1>Política de cookies</h1>
      <p className="legal-meta">Última actualización: 17 de mayo de 2026</p>

      <p>
        Esta página explica qué cookies utiliza el sitio web de{" "}
        <strong>Tabodispain S.L.</strong> (&laquo;TaboDis&raquo;), con qué
        finalidad y cómo puedes gestionarlas. Se aplica la normativa
        española sobre cookies (art. 22.2 LSSI-CE) y el RGPD para las
        cookies no estrictamente necesarias.
      </p>

      <h2>1. ¿Qué es una cookie?</h2>
      <p>
        Una cookie es un pequeño fichero de texto que un sitio web guarda
        en tu navegador para recordar información sobre tu visita, como tu
        idioma preferido u opciones de privacidad. Las cookies pueden ser
        propias (gestionadas por TaboDis) o de terceros (gestionadas por
        otros proveedores en nuestro nombre).
      </p>

      <h2>2. Cookies que utilizamos</h2>

      <h3>Cookies técnicas (esenciales)</h3>
      <p>
        Son imprescindibles para el funcionamiento del sitio y se
        instalan sin necesidad de consentimiento, conforme al art. 22.2
        LSSI-CE.
      </p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>tabodis_lang</td>
            <td>Recordar el idioma elegido (es / uk / ru).</td>
            <td>1 año</td>
          </tr>
          <tr>
            <td>tabodis_cookie_consent</td>
            <td>Recordar tu elección sobre el banner de cookies.</td>
            <td>1 año</td>
          </tr>
          <tr>
            <td>sb-*</td>
            <td>
              Sesión de Supabase (solo en el área de administración cuando
              inicias sesión).
            </td>
            <td>Sesión</td>
          </tr>
        </tbody>
      </table>

      <h3>Cookies analíticas (opcionales)</h3>
      <p>
        Nos ayudan a entender cómo se utiliza el sitio para mejorarlo. Se
        instalan únicamente si das tu consentimiento expreso en el banner
        de cookies. No las utilizamos hoy, pero reservamos esta categoría
        para futuras integraciones (por ejemplo, Plausible o un servicio
        equivalente que respete la privacidad).
      </p>

      <h2>3. Cómo gestionar tu consentimiento</h2>
      <p>
        La primera vez que visitas el sitio, se muestra un banner que te
        permite aceptar todas las cookies o solo las esenciales. Puedes
        cambiar tu elección en cualquier momento eliminando la cookie{" "}
        <code>tabodis_cookie_consent</code> desde tu navegador; el banner
        volverá a aparecer en la siguiente visita.
      </p>
      <p>
        Además, la mayoría de navegadores te permite bloquear o eliminar
        cookies desde su configuración:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/es/kb/proteccion-antirrastreo-mejorada-en-firefox-para-c"
            target="_blank"
            rel="noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noreferrer"
          >
            Apple Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/es-es/microsoft-edge"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>4. Más información</h2>
      <p>
        Para cualquier duda sobre esta política, escríbenos a{" "}
        <a href="mailto:servicios@tabodis.com">servicios@tabodis.com</a>.
        Para más información sobre el tratamiento general de tus datos,
        consulta nuestra{" "}
        <a href="/legal/privacidad">Política de privacidad</a>.
      </p>
    </>
  );
}
