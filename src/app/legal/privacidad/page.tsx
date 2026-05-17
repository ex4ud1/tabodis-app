import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad — TaboDis",
  description:
    "Información sobre el tratamiento de datos personales por Tabodispain S.L. conforme al RGPD y la LOPDGDD.",
};

export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p className="legal-meta">Última actualización: 17 de mayo de 2026</p>

      <p>
        En <strong>Tabodispain S.L.</strong> (en adelante, &laquo;TaboDis&raquo;)
        respetamos tu privacidad y nos comprometemos a tratar tus datos
        personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley
        Orgánica 3/2018, de Protección de Datos Personales y garantía de los
        derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Razón social:</strong> Tabodispain S.L.
        </li>
        <li>
          <strong>CIF:</strong> B-_______ (pendiente de completar)
        </li>
        <li>
          <strong>Domicilio:</strong> Av. de la Estación, 12 — 03003 Alicante,
          España
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href="mailto:servicios@tabodis.com">servicios@tabodis.com</a>
        </li>
      </ul>

      <h2>2. Datos que tratamos</h2>
      <p>
        Tratamos únicamente los datos personales que tú nos proporcionas de
        forma voluntaria, o los que se recogen de manera automática al navegar
        por la web:
      </p>
      <ul>
        <li>
          <strong>Datos de contacto:</strong> nombre, correo electrónico,
          teléfono y mensaje que introduces en el formulario de contacto o en
          el formulario de reseñas.
        </li>
        <li>
          <strong>Datos de navegación:</strong> dirección IP, tipo de
          navegador, idioma, páginas visitadas y referrer (a través de
          cookies analíticas — véase nuestra{" "}
          <a href="/legal/cookies">Política de cookies</a>).
        </li>
      </ul>

      <h2>3. Finalidad y base jurídica</h2>
      <ul>
        <li>
          <strong>Atender tus solicitudes</strong> de información sobre
          inmuebles, extranjería o gestión &mdash; base jurídica: ejecución de
          medidas precontractuales (art. 6.1.b RGPD).
        </li>
        <li>
          <strong>Publicar tu reseña</strong> en la sección de testimonios
          &mdash; base jurídica: tu consentimiento expreso al enviar el
          formulario (art. 6.1.a RGPD).
        </li>
        <li>
          <strong>Mejorar el sitio</strong> mediante estadísticas agregadas y
          anónimas &mdash; base jurídica: tu consentimiento, recogido en el
          banner de cookies (art. 6.1.a RGPD).
        </li>
        <li>
          <strong>Cumplir obligaciones legales</strong> de carácter fiscal,
          contable o de prevención del blanqueo de capitales (art. 6.1.c
          RGPD).
        </li>
      </ul>

      <h2>4. Conservación de los datos</h2>
      <p>
        Conservaremos tus datos durante el tiempo necesario para cumplir la
        finalidad para la que fueron recogidos y, una vez finalizada,
        durante los plazos legales aplicables (en general, 5 años para
        documentación contractual y fiscal). Las reseñas se conservan
        mientras estén publicadas o hasta que solicites su retirada.
      </p>

      <h2>5. Destinatarios y transferencias internacionales</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Utilizamos
        encargados del tratamiento (proveedores de hosting y herramientas
        técnicas) ubicados en la Unión Europea o que ofrecen garantías
        equivalentes (decisiones de adecuación, cláusulas contractuales
        tipo).
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer en cualquier momento los derechos de acceso,
        rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad, así como retirar tu consentimiento, escribiéndonos a{" "}
        <a href="mailto:servicios@tabodis.com">servicios@tabodis.com</a> con
        copia de tu DNI o documento equivalente.
      </p>
      <p>
        Si consideras que tus derechos no han sido atendidos correctamente,
        puedes presentar una reclamación ante la Agencia Española de
        Protección de Datos (AEPD), C/ Jorge Juan, 6 — 28001 Madrid o a
        través de{" "}
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          www.aepd.es
        </a>
        .
      </p>

      <h2>7. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger
        tus datos frente a accesos no autorizados, pérdidas o alteraciones,
        de acuerdo con el estado de la técnica.
      </p>

      <h2>8. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios normativos o
        en nuestros servicios. La versión vigente es siempre la publicada en
        esta página, indicando la fecha de la última actualización.
      </p>
    </>
  );
}
