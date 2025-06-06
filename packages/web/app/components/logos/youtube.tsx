export function YouTubeLogo({
  size = 24,
  className,
  playerClassName,
}: { size?: number; className?: string; playerClassName?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 29 20" className={className}>
      <path d="M14.485 20s9.085 0 11.338-.6a3.622 3.622 0 0 0 2.558-2.53C29 14.65 29 9.98 29 9.98s0-4.64-.62-6.84A3.554 3.554 0 0 0 25.824.61C23.57 0 14.485 0 14.485 0S5.42 0 3.177.61A3.65 3.65 0 0 0 .6 3.14C0 5.34 0 9.98 0 9.98s0 4.67.599 6.89a3.723 3.723 0 0 0 2.578 2.53c2.243.6 11.308.6 11.308.6Z" />
      <path d="m19 10-7.5-4.25v8.5L19 10Z" className={playerClassName} />
    </svg>
  );
}
