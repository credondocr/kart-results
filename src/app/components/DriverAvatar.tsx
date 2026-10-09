import Image from "next/image";
import type { Pilot } from "@/data/types";

interface DriverAvatarProps {
  pilot: Pilot;
  large?: boolean;
}

/**
 * Muestra la foto del piloto si existe; si no (placeholders de placehold.co),
 * renderiza una chapa de número estilo pit-board en vez de una imagen rota.
 */
const DriverAvatar: React.FC<DriverAvatarProps> = ({ pilot, large = false }) => {
  const hasPhoto = Boolean(pilot.profileUrl) && !pilot.profileUrl.includes("placehold.co");

  if (hasPhoto) {
    return (
      <Image
        src={pilot.profileUrl}
        alt={pilot.name}
        width={large ? 300 : 200}
        height={large ? 400 : 266}
        className={large ? "driver-photo large" : "driver-photo"}
      />
    );
  }

  return (
    <div className={large ? "number-plate large" : "number-plate"} aria-hidden="true">
      {pilot.kartNumber}
    </div>
  );
};

export default DriverAvatar;
