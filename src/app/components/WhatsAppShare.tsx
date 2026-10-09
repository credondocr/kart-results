"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface WhatsAppShareProps {
  text?: string;
  label?: string;
}

const WhatsAppShare: React.FC<WhatsAppShareProps> = ({ text, label = "Compartir" }) => {
  const handleShare = () => {
    const url = window.location.href;
    const payload = text ? `${text}\n${url}` : url;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(payload)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <button type="button" className="share-btn" onClick={handleShare}>
      <FontAwesomeIcon icon={faWhatsapp} width={14} aria-hidden="true" />
      {label}
    </button>
  );
};

export default WhatsAppShare;
