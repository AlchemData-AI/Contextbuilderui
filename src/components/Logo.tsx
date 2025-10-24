import logoImage from 'figma:asset/0919892ed4212a1af35b091e37f0f1cd65241ad0.png';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src={logoImage}
      alt="AlchemData AI"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
