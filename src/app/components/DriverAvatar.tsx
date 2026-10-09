import Image from "next/image";
import type { Pilot } from "@/data/types";
import { findPilotPhoto } from "@/app/utils/pilotPhotos";

interface DriverAvatarProps {
  pilot: Pilot;
  large?: boolean;
}

/**
 * Foto del piloto: primero la imagen normalizada (public/pilotos), luego
 * profileUrl si no es placeholder; si no hay foto, chapa de número
 * estilo pit-board.
 */
const DriverAvatar: React.FC<DriverAvatarProps> = ({ pilot, large = false }) => {
  const normalizedPhoto = findPilotPhoto(pilot.name);
  const hasProfilePhoto =
    Boolean(pilot.profileUrl) && !pilot.profileUrl.includes("placehold.co");
  const photo = normalizedPhoto ?? (hasProfilePhoto ? pilot.profileUrl : null);

  if (photo) {
    return (
      <Image
        src={photo}
        alt={pilot.name}
        width={400}
        height={520}
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
