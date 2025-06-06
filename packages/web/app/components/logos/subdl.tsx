import type { SVGProps } from "react";

export function SubDLLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={54} height={40} fill="none" {...props}>
      <g clipPath="url(#a)">
        <path fill="#fff" d="M.75 0h52.5v40H.75V0Z" />
        <path
          fill="#000"
          d="M14.814 25.415H12.62v-1.137H9.981v1.137l4.833 4.911v3.377l-.866.758H8.673l-.886-.758v-2.24H9.98v1.12h2.638v-1.12l-4.832-4.928v-3.377l.886-.758h5.275l.866.758v2.257Zm6.59-3.015H23.6v11.32l-.866.741h-5.296l-.886-.74V22.4h2.195v10.183h2.658V22.4Zm10.98.758v4.532l-.865.74.866.742v4.531l-.866.758h-6.182V22.4h6.182l.866.758Zm-2.194 1.137h-2.638v3.395h2.638v-3.395Zm-2.638 8.271h2.638v-3.015h-2.638v3.015ZM40.324 22.4l.845.758v10.545l-.845.758H34.12V22.4h6.203Zm-1.35 10.183v-8.288h-2.638v8.288h2.638Zm6.127 0h3.906v1.878h-6.102V22.4H45.1l.001 10.183Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.75 0h52.5v40H.75z" />
        </clipPath>
      </defs>
    </svg>
  );
}
