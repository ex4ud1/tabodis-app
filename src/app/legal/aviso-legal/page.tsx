import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal — TaboDis",
  description:
    "Información legal del sitio web TaboDis, conforme a la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE).",
};

export default function AvisoLegalPage() {
  return (
    <>
      <h1>Aviso legal</h1>
      <p className="legal-meta">Última actualización: 17 de mayo de 2026</p>

      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio,
        de Servicios de la Sociedad de la Información y de Comercio
        Electrónico (LSSI-CE), se ofrece la siguiente información del
        titular del sitio web{" "}
        <a href="https://tabodis.com">tabodis.com</a>:
      </p>

      <h2>1. Titular del sitio web</h2>
      <ul>
        <li>
          <strong>Razón social:</strong> Tabodispain S.L.
        </li>
        <li>
          <strong>Nombre comercial:</strong> TaboDis
        </li>
        <li>
          <strong>CIF:</strong> B-_______ (pendiente de completar)
        </li>
        <li>
          <strong>Domicilio social:</strong> Av. de la Estación, 12 — 03003
          Alicante, España
        </li>
        <li>
          <strong>Datos registrales:</strong> Inscrita en el Registro
          Mercantil de Alicante, Tomo ___, Folio ___, Hoja A-_______
          (pendiente de completar).
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href="mailto:servicios@tabodis.com">servicios@tabodis.com</a>
        </li>
      </ul>

      <h2>2. Objeto del sitio</h2>
      <p>
        El sitio tiene como finalidad presentar los servicios de
        consultoría inmobiliaria, extranjería y gestión integral que
        ofrece Tabodispain S.L. a particulares y empresas con interés en
        establecerse en España, así como facilitar el contacto con la
        compañía.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y la navegación por el sitio implican la aceptación de
        las condiciones que se reflejan en este aviso legal. El usuario se
        compromete a hacer un uso adecuado de los contenidos y servicios,
        absteniéndose de utilizarlos para incurrir en actividades
        ilícitas, lesivas para los derechos de terceros, o que dañen,
        inutilicen o sobrecarguen el sitio.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del sitio (textos, fotografías, gráficos,
        logotipos, código fuente y demás elementos) son titularidad de
        Tabodispain S.L. o de terceros que han autorizado su uso.
        Cualquier reproducción, distribución o transformación sin
        autorización expresa por escrito está prohibida y será perseguida
        conforme a la legislación aplicable.
      </p>

      <h2>5. Enlaces a sitios de terceros</h2>
      <p>
        El sitio puede contener enlaces a páginas externas. Tabodispain
        S.L. no asume responsabilidad sobre los contenidos, políticas o
        prácticas de dichas páginas: la inclusión de un enlace no implica
        relación, recomendación o aprobación.
      </p>

      <h2>6. Exclusión de responsabilidad</h2>
      <p>
        Tabodispain S.L. trabaja para que la información publicada sea
        veraz y esté actualizada, pero no garantiza la inexistencia de
        errores u omisiones. La compañía no será responsable de daños
        derivados de la indisponibilidad temporal del servicio ni de un
        uso indebido por parte del usuario.
      </p>

      <h2>7. Protección de datos</h2>
      <p>
        El tratamiento de los datos personales recabados a través del
        sitio se regula en nuestra{" "}
        <a href="/legal/privacidad">Política de privacidad</a> y en
        nuestra <a href="/legal/cookies">Política de cookies</a>.
      </p>

      <h2>8. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para la
        resolución de cualquier controversia, las partes se someten a los
        Juzgados y Tribunales de Alicante, con renuncia expresa a
        cualquier otro fuero que pudiera corresponderles, salvo que la
        normativa aplicable disponga otra cosa.
      </p>
    </>
  );
}
