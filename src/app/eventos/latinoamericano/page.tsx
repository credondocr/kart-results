

import Head from 'next/head';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Latinoamericano de Kartismo 2025",
    description: "Prepárate para el evento de kartismo más emocionante de este año! El Latinoamericano de Kartismo 2025.",
    openGraph: {
        title: "Latinoamericano de Kartismo 2025",
        description: "Prepárate para el evento de kartismo más emocionante de este año! El Latinoamericano de Kartismo 2025.",
        images: [
          {
            url: "/media/eventos/latinoamericano-kartismo-2025.jpeg", // Ruta de la imagen (puede ser pública o estática)
            width: 1200, // Ancho recomendado para Open Graph
            height: 630, // Alto recomendado para Open Graph
            alt: "Latinoamericano de Kartismo 2025",
          },
        ],
      },
      twitter: {
        card: "summary_large_image", // Tipo de tarjeta (grande para imágenes grandes)
        title: "Latinoamericano de Kartismo 2025",
        description: "Prepárate para el evento de kartismo más emocionante de este año! El Latinoamericano de Kartismo 2025.",
        images: ["/media/eventos/latinoamericano-kartismo-2025.jpeg"], // Ruta de la imagen
      },
};

export default async function Latinoamericano() {


    return (
        <>
             <Head>
            <title>Latinoamericano de Kartismo 2025</title>
            <meta name="description" content="Prepárate para el evento de kartismo más emocionante de este año! El Latinoamericano de Kartismo 2025" />
            <meta property="og:title" content="Latinoamericano de Kartismo 2025" />
            <meta property="og:description" content="Prepárate para el evento de kartismo más emocionante de este año! El Latinoamericano de Kartismo 2025" />
            <meta property="og:image" content="/media/eventos/latinoamericano-kartismo-2025.jpeg" />
            <meta property="og:url" content={`/eventos/latinoamericano`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Latinoamericano de Kartismo 2025" />
            <meta name="twitter:description" content="Prepárate para el evento de kartismo más emocionante de este año! El Latinoamericano de Kartismo 2025" />
            <meta name="twitter:image" content="/media/eventos/latinoamericano-kartismo-2025.jpeg" />
        </Head>

        <div className="max-w-6xl mx-auto p-8 bg-gray-50 shadow-lg rounded-lg mt-5 mb-5 prose text-gray-800 leading-relaxed">
            <h1 className="center">Latinoamericano de Kartismo 2025</h1>


            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <img
                    src="/media/eventos/latinoamericano-kartismo-2025.jpeg"
                    alt="Latinoamericano de Kartismo 2025"
                    style={{
                        width: "100%", 
                        height: "auto", 
                        borderRadius: "8px", 
                      }}
                    className="max-w-md max-h-md mt-6 rounded-xl shadow-md"
                />
            </div>

            <p>¡Prepárate para el evento de kartismo más emocionante de este año! El <strong>Latinoamericano de Kartismo 2025</strong> reunirá a los mejores pilotos de la región en una competencia llena de velocidad, adrenalina y técnica.</p>

            <h2>Detalles del Evento</h2>
            <ul>
                <li><strong>Fecha:</strong> 17 y 18 de mayo de 2025</li>
                <li><strong>Lugar:</strong> <a href="https://www.google.com/maps?q=P1+Speedway,+Costa+Rica">P1Speedway, Costa Rica</a></li>
                <li><strong>Categorías:</strong>
                    <ul>
                        <li>Micro Rok</li>
                        <li>Mini Rok</li>
                        <li>Tillotson 225</li>
                        <li>VLR Junior, Senior y Master </li>
                    </ul>
                </li>
                <li><strong>Link al Reglamento:</strong> <a href="/content/RP LATINOAMERICANO  VORTEX-TILLOTSON 2025.pdf" target="_blank">Consulta el reglamento oficial</a> </li>
            </ul>

            <hr />

            <h2>Ubicación</h2>
            <p>El evento se llevará a cabo en el reconocido circuito de kartismo <strong>P1Speedway</strong> en Costa Rica. Este es un circuito de alto nivel que promete desafiar tanto a pilotos experimentados como a los que están iniciando su carrera.</p>

            <div style={{ position: "relative", textAlign: "right", width: "100%", height: "400px" }}>
                <div style={{ overflow: "hidden", background: "none", width: "100%", height: "400px" }}>
                    <iframe
                        style={{ height: "400px" }}
                        width="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=p1 speedway&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                    ></iframe>
                    <a className="text-gray-800" href="https://ul.waze.com/ul?place=ChIJtyKZEAD7oI8RnLmXWgTxcbo&ll=9.96190520%2C-84.13386430&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location">Waze</a>
                </div>

            </div>
            <a className="text-gray-800" href="https://ul.waze.com/ul?place=ChIJtyKZEAD7oI8RnLmXWgTxcbo&ll=9.96190520%2C-84.13386430&navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location">Dirección por Waze</a>
            <h2>Apertura y Cierre de Inscripciones</h2>
            <ul>
                <li><strong>Apertura:</strong> 13 de mayo de 2025, 08:00 horas</li>
                <li><strong>Cierre:</strong> 22 de mayo de 2025, 24:00 horas</li>
            </ul>

            <h2>Formulario de inscripción:</h2>
            <p><a href="https://forms.gle/qFg6gFzcoSbFr8yL6">Pilotos Extranjeros</a></p>
            <p><a href="https://forms.gle/D5ahZ4t2qUoYmvuf7">Pilotos Nacionales</a></p>
            <p>El pagó se podrá realizar mediante transferencia electrónica (TEF) y/o depósito en cuenta y/o link de pago con tarjeta de crédito en caso de los competidores internacionales</p>
            <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
                <p>
                    <strong>Cuenta Corriente en dólares $ para realizar transferencias ó depósitos</strong>
                    <br />
                    Bac San José
                </p>
                <p>
                    <strong>ACEK Asociación de Corredores de Kartismo</strong>
                    <br />
                    Cédula Jurídica: No. 3-002-113687
                    <br />
                    Cuenta IBAN: CR100-102-0000-9495-7235-80
                    <br />
                    Cuenta BAC: 949572358
                </p>
            </div>
            <ul>
                <li><strong>Costo de inscripción:</strong> $300 todas las categorías (incluye IVA).</li>
                <li>En el depósito, TEF se deberá indicar el nombre y número de kart del Piloto.</li>
                <li>El piloto que no haya enviado el formulario digital y realizado el pago correspondiente a la inscripción en el tiempo regular de inscripciones deberá pagar un recargo del 10% del valor de la inscripción regular. Para inscripciones posteriores no se garantiza el espacio en la competencia.</li>
            </ul>

            <h2>Hoteles</h2>


            <div style={{ textAlign: 'center' }}>
                <iframe
                    src="https://www.booking.com/searchresults.html?label=New_English_EN_CR_27026962705-qO_JN7JldOP9Rp_ijffsBAS634117824138%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atidsa-64415617705%3Alp1003673%3Ali%3Adec%3Adm%3Aag27026962705%3Acmp400680265&aid=318615&ss=Parque+Diversiones&ssne=Parque+Diversiones&ssne_untouched=Parque+Diversiones&lang=en-us&src=searchresults&dest_id=900118799&dest_type=landmark&checkin=2025-03-20&checkout=2025-03-24&group_adults=2&no_rooms=1&group_children=0&nflt=distance%3D5000"
                    style={{
                        width: '100%',
                        height: '600px',
                        border: 'none',
                    }}
                    title="Booking.com"
                />
            </div>

        </div>
        </>
        
    );
}
